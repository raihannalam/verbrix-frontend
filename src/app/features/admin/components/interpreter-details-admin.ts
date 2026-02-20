import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  Pipe,
  PipeTransform,
  HostListener,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, finalize } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';
import { MetadataService } from '../../../core/services/metadata.service';
// Ensure your InterpreterDetailResponse interface in admin.models.ts is updated to include:
// governmentIdType: string; governmentIdDetails: string;
import { InterpreterDetailResponse } from '../models/admin.models';

// --- 1. ROBUST VIDEO PIPE ---
@Pipe({ name: 'safeVideoUrl', standalone: true })
export class SafeVideoUrlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(url: string | undefined): SafeResourceUrl {
    if (!url) return '';
    let finalUrl = url;
    const cleanUrl = url.split('?')[0];

    try {
      if (cleanUrl.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const videoId = urlParams.get('v');
        if (videoId) finalUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (cleanUrl.includes('youtu.be/')) {
        const videoId = cleanUrl.split('youtu.be/')[1];
        if (videoId) finalUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (cleanUrl.includes('vimeo.com/')) {
        const parts = cleanUrl.split('/');
        const videoId = parts[parts.length - 1];
        if (videoId && !cleanUrl.includes('player.vimeo.com')) {
          finalUrl = `https://player.vimeo.com/video/${videoId}`;
        }
      }
    } catch (e) {
      console.warn('Error parsing video URL', e);
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
  }
}

// --- Action Types ---
type ActionType = 'APPROVE_APP' | 'REJECT_APP' | 'REQUEST_CHANGES' | 'REJECT_CERT' | 'VERIFY_CERT' | null;

interface ActionState {
  isOpen: boolean;
  type: ActionType;
  title: string;
  description: string;
  needsInput: boolean;
  targetId?: number;
  confirmLabel: string;
  confirmColor: 'red' | 'green' | 'blue';
}

@Component({
  selector: 'app-interpreter-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, FormsModule, SafeVideoUrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-[#0b0c0f] font-sans transition-colors duration-300">

      @if (isLoading()) {
        <div class="flex items-center justify-center h-screen">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      }

      @else if (data(); as interpreter) {
        <header class="bg-white/90 dark:bg-[#181a1f]/90 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 shadow-sm backdrop-blur-lg">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center gap-3 sm:gap-4">
              <a routerLink="/dashboard/admin/home"
                 class="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                <i class="ri-arrow-left-line text-xl"></i>
              </a>

              <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span class="text-xs sm:text-sm text-gray-500 font-mono font-medium">#{{ interpreter.id }}</span>
                @if(interpreter.status === 'VERIFIED') {
                  <span class="inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800">
                    Verified
                  </span>
                } @else if(interpreter.status === 'PENDING') {
                  <span class="inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    Pending Review
                  </span>
                } @else {
                  <span class="inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800">
                    {{ interpreter.status }}
                  </span>
                }
              </div>
            </div>

            <div class="hidden md:flex items-center gap-3">
              <button (click)="openActionModal('REJECT_APP')"
                      class="px-4 py-2 text-sm font-bold text-red-600 bg-white dark:bg-transparent border border-red-200 dark:border-red-900/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                Reject
              </button>
              <button (click)="openActionModal('REQUEST_CHANGES')"
                      class="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Request Changes
              </button>
              <button (click)="openActionModal('APPROVE_APP')"
                      [disabled]="!allCertsVerified()"
                      class="px-5 py-2 text-sm font-bold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95">
                Approve & Activate
              </button>
            </div>
          </div>
        </header>

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 animate-fade-in pb-32 md:pb-10">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

            <div class="lg:col-span-4 space-y-6">
              <div class="lg:sticky lg:top-24 space-y-6">

                <div class="bg-white dark:bg-[#181a1f] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden">
                  <div class="absolute top-0 left-0 w-full h-24 bg-linear-to-br from-blue-600 to-indigo-700 opacity-10 dark:opacity-20"></div>
                  <div class="relative flex flex-col items-center">
                    <div class="relative">
                      <img [src]="interpreter.profilePictureUrl || 'assets/placeholder.png'"
                           class="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-[#181a1f] shadow-lg mb-4 bg-gray-100 dark:bg-gray-800">
                      @if(interpreter.status === 'VERIFIED') {
                        <div class="absolute bottom-4 right-0 bg-green-500 border-2 border-white dark:border-[#181a1f] rounded-full p-1 w-6 h-6 flex items-center justify-center">
                          <i class="ri-check-line text-white text-xs"></i>
                        </div>
                      }
                    </div>

                    <h1 class="text-xl font-bold text-gray-900 dark:text-white text-center break-words max-w-full">
                      {{ interpreter.firstName }} {{ interpreter.lastName }}
                    </h1>

                    <a [href]="'mailto:' + interpreter.email" class="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-1 hover:text-blue-600 transition-colors">
                      <i class="ri-mail-line"></i> {{ interpreter.email }}
                    </a>

                    <div class="w-full grid grid-cols-2 gap-3">
                      <div class="p-3 bg-gray-50 dark:bg-[#20232a] rounded-xl text-center border border-gray-100 dark:border-gray-800">
                        <div class="text-[10px] text-gray-400 uppercase font-bold mb-1">Experience</div>
                        <div class="text-lg font-bold text-gray-900 dark:text-white">
                          {{ interpreter.experienceYears }} <span class="text-xs font-normal text-gray-500">yrs</span>
                        </div>
                      </div>
                      <div class="p-3 bg-gray-50 dark:bg-[#20232a] rounded-xl text-center border border-gray-100 dark:border-gray-800">
                        <div class="text-[10px] text-gray-400 uppercase font-bold mb-1">Rate</div>
                        <div class="text-lg font-bold text-green-600 dark:text-green-400">
                          {{ interpreter.consultationFee | currency:'INR':'symbol':'1.0-0' }}<span class="text-xs font-normal text-gray-500">/hr</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="bg-white dark:bg-[#181a1f] rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                      <i class="ri-shield-user-line text-blue-500"></i> Identity Verification
                    </h3>
                  </div>

                  <div class="flex items-start gap-4 p-4 bg-gray-50 dark:bg-[#20232a] rounded-xl border border-gray-100 dark:border-gray-700">
                    <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <i class="ri-id-card-line text-xl"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="font-bold text-gray-900 dark:text-white text-sm truncate">
                        {{ formatEnumLabel(interpreter.governmentIdType) }}
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-mono bg-white dark:bg-[#181a1f] px-2.5 py-1 rounded inline-block border border-gray-200 dark:border-gray-600 shadow-sm">
                        {{ interpreter.governmentIdDetails || 'No details provided' }}
                      </div>
                    </div>
                  </div>

                  <a [href]="interpreter.governmentIdUrl" target="_blank"
                     class="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all group">
                    <span>View Original Document</span>
                    <i class="ri-external-link-line group-hover:translate-x-0.5 transition-transform"></i>
                  </a>
                </div>

              </div>
            </div>

            <div class="lg:col-span-8 space-y-6 lg:space-y-8">

              <div class="bg-white dark:bg-[#181a1f] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div class="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#20232a]">
                  <h3 class="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide flex items-center gap-2">
                    <i class="ri-video-line"></i> Introduction
                  </h3>
                  <a [href]="interpreter.introVideoUrl" target="_blank" class="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    Direct Link <i class="ri-external-link-line"></i>
                  </a>
                </div>

                <div class="relative w-full bg-black group aspect-video">
                  @if (isVideoFile(interpreter.introVideoUrl)) {
                    <video controls class="w-full h-full object-contain" controlsList="nodownload">
                      <source [src]="interpreter.introVideoUrl" type="video/mp4">
                      Your browser does not support the video tag.
                    </video>
                  } @else {
                    <iframe [src]="interpreter.introVideoUrl | safeVideoUrl"
                            class="w-full h-full absolute inset-0"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen>
                    </iframe>
                  }
                </div>
              </div>

              <div class="bg-white dark:bg-[#181a1f] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                <div class="mb-8">
                  <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-3">About</h3>
                  <p class="text-gray-600 dark:text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">{{ interpreter.bio }}</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <i class="ri-translate-2"></i> Languages
                    </h4>
                    <div class="flex flex-col gap-2">
                      @for (lang of interpreter.languageAbilities; track lang.language) {
                        <div class="p-2.5 rounded-lg bg-gray-50 dark:bg-[#20232a] text-sm flex items-center justify-between border border-gray-100 dark:border-gray-800">
                          <span class="text-gray-900 dark:text-gray-100 font-bold">{{ metadata.getLanguageName(lang.language) }}</span>
                          <span class="text-[10px] uppercase px-2 py-0.5 bg-white dark:bg-gray-800 rounded text-gray-500 font-bold border border-gray-200 dark:border-gray-700 tracking-wide">
                            {{ lang.proficiency }}
                          </span>
                        </div>
                      }
                    </div>
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <i class="ri-stethoscope-line"></i> Specializations
                    </h4>
                    <div class="flex flex-wrap gap-2">
                      @for (spec of interpreter.specializations; track spec) {
                        <span class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#20232a] text-sm text-gray-600 dark:text-gray-300 font-medium">
                          {{ metadata.getSpecializationName(spec) }}
                        </span>
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2 px-1">
                  <i class="ri-award-line"></i> Professional Certifications
                </h3>

                @for (cert of interpreter.certifications; track cert.id) {
                  <div class="bg-white dark:bg-[#181a1f] p-5 rounded-2xl border shadow-sm transition-all relative overflow-hidden group"
                       [ngClass]="{
                         'border-green-400 bg-green-50/30 dark:border-green-800 dark:bg-green-900/10': cert.status === 'VERIFIED',
                         'border-red-300 bg-red-50/30 dark:border-red-800 dark:bg-red-900/10': cert.status === 'REJECTED',
                         'border-gray-200 dark:border-gray-800': cert.status === 'PENDING'
                       }">

                    @if(cert.status === 'VERIFIED') {
                      <div class="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 shadow-sm">
                        VERIFIED
                      </div>
                    }

                    <div class="flex flex-col sm:flex-row gap-5">
                      <div class="hidden sm:flex w-14 h-14 rounded-xl bg-gray-50 dark:bg-[#20232a] items-center justify-center text-gray-400 flex-shrink-0 border border-gray-100 dark:border-gray-700">
                        <i class="ri-file-text-line text-2xl"></i>
                      </div>

                      <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-gray-900 dark:text-white text-base truncate pr-8">{{ cert.name }}</h4>
                        <p class="text-sm text-gray-500 font-medium mb-2">{{ cert.issuingOrganization }}</p>

                        @if (cert.rejectionReason) {
                          <div class="mt-3 text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                            <strong>Rejection Reason:</strong> {{ cert.rejectionReason }}
                          </div>
                        }
                      </div>

                      <div class="flex flex-row sm:flex-col items-center sm:items-end gap-2 justify-between border-t sm:border-0 border-gray-100 dark:border-gray-700 pt-3 sm:pt-0 mt-2 sm:mt-0">
                        <a [href]="cert.fileUrl" target="_blank"
                           class="px-3 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 flex items-center gap-2 transition-colors">
                          <span>View PDF</span> <i class="ri-external-link-line"></i>
                        </a>

                        @if (cert.status === 'PENDING') {
                          <div class="flex gap-2">
                            <button (click)="openActionModal('REJECT_CERT', cert.id)"
                                    class="w-9 h-9 flex items-center justify-center text-red-600 dark:text-red-400 bg-white dark:bg-[#20232a] border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg shadow-sm transition-colors"
                                    title="Reject Certification">
                              <i class="ri-close-line text-lg"></i>
                            </button>
                            <button (click)="openActionModal('VERIFY_CERT', cert.id)"
                                    class="w-9 h-9 flex items-center justify-center text-green-600 dark:text-green-400 bg-white dark:bg-[#20232a] border border-green-200 dark:border-green-900/50 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg shadow-sm transition-colors"
                                    title="Verify Certification">
                              <i class="ri-check-line text-lg"></i>
                            </button>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </main>
      }

      <div class="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-[#181a1f]/95 border-t border-gray-200 dark:border-gray-800 md:hidden z-40 backdrop-blur-md shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex gap-3 safe-area-pb">
        <button (click)="openActionModal('REJECT_APP')" class="flex-1 py-3 text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl active:scale-95 transition-transform">Reject</button>
        <button (click)="openActionModal('REQUEST_CHANGES')" class="flex-1 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl active:scale-95 transition-transform">Changes</button>
        <button (click)="openActionModal('APPROVE_APP')" [disabled]="!allCertsVerified()" class="flex-[1.5] py-3 text-sm font-bold text-white bg-green-600 dark:bg-green-700 rounded-xl shadow-lg disabled:opacity-50 disabled:grayscale active:scale-95 transition-transform">Approve</button>
      </div>

      @if (actionModal().isOpen) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
          <div class="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity" (click)="closeModal()"></div>

          <div class="relative w-full max-w-lg bg-white dark:bg-[#181a1f] rounded-2xl shadow-2xl overflow-hidden animate-scale-in border border-gray-100 dark:border-gray-700 flex flex-col max-h-[90vh]">
            <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#20232a]">
              <h3 class="font-bold text-lg text-gray-900 dark:text-white">{{ actionModal().title }}</h3>
              <button (click)="closeModal()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 transition-colors">
                <i class="ri-close-line text-xl"></i>
              </button>
            </div>

            <div class="p-6 overflow-y-auto">
              <p class="text-gray-600 dark:text-gray-300 text-sm mb-5 leading-relaxed">{{ actionModal().description }}</p>

              @if (actionModal().needsInput) {
                <div class="space-y-2 mb-6">
                  <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                    Reason / Feedback <span class="text-red-500">*</span>
                  </label>
                  <textarea [(ngModel)]="reasonText"
                            rows="4"
                            class="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121418] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none shadow-sm placeholder:text-gray-400 transition-shadow"
                            [placeholder]="actionModal().type === 'REQUEST_CHANGES' ? 'E.g., Please upload a clearer photo of your ID...' : 'Please provide a reason for rejection...'">
                    </textarea>
                </div>
              }

              <div class="flex flex-col-reverse sm:flex-row gap-3">
                <button (click)="closeModal()"
                        class="w-full sm:flex-1 py-3 px-4 font-bold text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
                  Cancel
                </button>
                <button (click)="confirmAction()"
                        [disabled]="isSubmitting() || (actionModal().needsInput && !reasonText().trim())"
                        class="w-full sm:flex-1 py-3 px-4 font-bold text-sm text-white rounded-xl shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        [ngClass]="{
                             'bg-red-600 hover:bg-red-700': actionModal().confirmColor === 'red',
                             'bg-green-600 hover:bg-green-700': actionModal().confirmColor === 'green',
                             'bg-blue-600 hover:bg-blue-700': actionModal().confirmColor === 'blue'
                           }">
                  @if(isSubmitting()) {
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  }
                  {{ actionModal().confirmLabel }}
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-scale-in { animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }

    /* Support for Safe Area on iPhone X+ */
    .safe-area-pb { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }

    @keyframes scaleIn {
      from { transform: scale(0.95) translateY(10px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class InterpreterDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminService = inject(AdminService);
  metadata = inject(MetadataService);

  // Signals
  data = signal<InterpreterDetailResponse | null>(null);
  isLoading = signal<boolean>(true);

  actionModal = signal<ActionState>({
    isOpen: false,
    type: null,
    title: '',
    description: '',
    needsInput: false,
    confirmLabel: '',
    confirmColor: 'blue'
  });

  reasonText = signal('');
  isSubmitting = signal(false);

  // Computed State
  allCertsVerified = computed(() => {
    const d = this.data();
    if (!d) return false;
    return d.certifications.length > 0 && d.certifications.every(c => c.status === 'VERIFIED');
  });

  // Handle Escape key to close modal
  @HostListener('window:keydown.escape')
  handleEscape() {
    if (this.actionModal().isOpen) {
      this.closeModal();
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadData(id);
      } else {
        this.router.navigate(['/dashboard/admin/home']);
      }
    });
  }

  loadData(id: number) {
    this.isLoading.set(true);
    this.adminService.getInterpreterDetails(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => this.data.set(res),
        error: (err) => {
          console.error('Failed to load interpreter', err);
          this.router.navigate(['/dashboard/admin/home']);
        }
      });
  }

  isVideoFile(url: string | undefined): boolean {
    if (!url) return false;
    const cleanUrl = url.split(/[?#]/)[0];
    const extension = cleanUrl.split('.').pop()?.toLowerCase();
    return ['mp4', 'webm', 'ogg', 'mov', 'm4v'].includes(extension || '');
  }

  // --- Helper to beautifully format raw Java Enums (e.g. DRIVERS_LICENSE -> Driver's License) ---
  formatEnumLabel(enumValue: string | undefined): string {
    if (!enumValue) return 'Unknown Document';
    return enumValue
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  openActionModal(type: ActionType, targetId?: number) {
    this.reasonText.set('');

    const baseState: ActionState = {
      isOpen: true,
      type,
      targetId,
      needsInput: false,
      title: '',
      description: '',
      confirmLabel: 'Confirm',
      confirmColor: 'blue'
    };

    switch (type) {
      case 'REQUEST_CHANGES':
        baseState.title = 'Request Changes';
        baseState.description = 'The interpreter will be notified to update their profile. Please specify what needs to be changed.';
        baseState.needsInput = true;
        baseState.confirmLabel = 'Send Request';
        baseState.confirmColor = 'blue';
        break;
      case 'APPROVE_APP':
        baseState.title = 'Approve Interpreter';
        baseState.description = 'This interpreter will be visible to clients immediately. Ensure all documents are verified.';
        baseState.confirmLabel = 'Approve & Activate';
        baseState.confirmColor = 'green';
        break;
      case 'REJECT_APP':
        baseState.title = 'Reject Application';
        baseState.description = 'This action is permanent and cannot be undone. The user will be notified.';
        baseState.needsInput = true;
        baseState.confirmLabel = 'Reject Permanently';
        baseState.confirmColor = 'red';
        break;
      case 'VERIFY_CERT':
        baseState.title = 'Verify Document';
        baseState.description = 'Are you sure you want to mark this document as legitimate and verified?';
        baseState.confirmLabel = 'Verify Document';
        baseState.confirmColor = 'green';
        break;
      case 'REJECT_CERT':
        baseState.title = 'Reject Document';
        baseState.description = 'Please provide a reason why this document is being rejected.';
        baseState.needsInput = true;
        baseState.confirmLabel = 'Reject Document';
        baseState.confirmColor = 'red';
        break;
    }

    this.actionModal.set(baseState);
  }

  closeModal() {
    this.actionModal.update(s => ({ ...s, isOpen: false }));
  }

  confirmAction() {
    if (!this.data() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    const { type, targetId } = this.actionModal();
    const id = this.data()!.id;
    const reason = this.reasonText();

    let action$: Observable<any> | undefined;

    switch (type) {
      case 'APPROVE_APP':
        action$ = this.adminService.approveInterpreter(id);
        break;
      case 'REJECT_APP':
        action$ = this.adminService.rejectPermanently(id, reason);
        break;
      case 'REQUEST_CHANGES':
        action$ = this.adminService.requestChanges(id, reason);
        break;
      case 'VERIFY_CERT':
        if (targetId) action$ = this.adminService.verifyCertification(targetId);
        break;
      case 'REJECT_CERT':
        if (targetId) action$ = this.adminService.rejectCertification(targetId, reason);
        break;
    }

    if (action$) {
      action$.pipe(
        finalize(() => this.isSubmitting.set(false))
      ).subscribe({
        next: () => {
          this.closeModal();
          if (['APPROVE_APP', 'REJECT_APP', 'REQUEST_CHANGES'].includes(type!)) {
            this.router.navigate(['/dashboard/admin/home']);
          } else {
            this.loadData(id);
          }
        },
        error: (err) => {
          console.error('Action failed', err);
        }
      });
    } else {
      this.isSubmitting.set(false);
    }
  }
}
