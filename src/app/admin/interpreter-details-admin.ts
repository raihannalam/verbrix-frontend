import { Component, inject, OnInit, signal, computed, Pipe, PipeTransform } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { AdminService } from '../../app/core/services/admin.service';
import {
  InterpreterDetailResponse,
  SPECIALIZATION_LABELS,
  LANGUAGE_LABELS
} from '../admin/models/admin.models';

// --- 1. ROBUST VIDEO PIPE (Auto-converts YouTube/Vimeo links) ---
@Pipe({ name: 'safeVideoUrl', standalone: true })
export class SafeVideoUrlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(url: string | undefined): SafeResourceUrl {
    if (!url) return '';
    let finalUrl = url;

    // Handle YouTube (watch?v= -> embed/)
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      if (videoId) finalUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    // Handle YouTube Short links (youtu.be/)
    else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) finalUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    // Handle Vimeo
    else if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      // Check if it's not already a player link
      if (!url.includes('player.vimeo.com')) {
        finalUrl = `https://player.vimeo.com/video/${videoId}`;
      }
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
  }
}

// --- Action State Interface ---
interface ActionState {
  isOpen: boolean;
  type: 'APPROVE_APP' | 'REJECT_APP' | 'REQUEST_CHANGES' | 'REJECT_CERT' | 'VERIFY_CERT' | null;
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
  template: `
    <div class="min-h-screen bg-[#f3f4f6] dark:bg-[#0b0c0f] pb-32 lg:pb-10 font-sans">
      
      <header class="bg-white dark:bg-[#181a1f] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-opacity-95">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <a routerLink="/dashboard/admin/home" 
               class="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium">
               <i class="ri-arrow-left-line text-xl"></i> <span class="hidden sm:inline">Back</span>
            </a>
            <div class="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2 hidden sm:block"></div>
            <div class="flex items-center gap-3">
              <span class="text-xs sm:text-sm text-gray-500 font-mono">App #{{ data()?.id }}</span>
              @if(data()?.status === 'VERIFIED') {
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">Verified</span>
              } @else if(data()?.status === 'PENDING') {
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Pending Review</span>
              }
            </div>
          </div>
          <div class="hidden md:flex items-center gap-3">
            <button (click)="openActionModal('REJECT_APP')" class="px-4 py-2 text-sm font-bold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50">Reject</button>
            <button (click)="openActionModal('REQUEST_CHANGES')" class="px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Request Changes</button>
            <button (click)="openActionModal('APPROVE_APP')" [disabled]="!allCertsVerified()" class="px-5 py-2 text-sm font-bold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50">Approve & Activate</button>
          </div>
        </div>
      </header>

      @if (data(); as interpreter) {
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div class="lg:col-span-4 space-y-6">
              <div class="sticky top-24 space-y-6">
                <div class="bg-white dark:bg-[#181a1f] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 relative overflow-hidden">
                  <div class="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-10"></div>
                  <div class="relative flex flex-col items-center">
                    <img [src]="interpreter.profilePictureUrl || 'assets/placeholder.png'" class="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg mb-4 bg-white">
                    <h1 class="text-xl font-bold text-gray-900 dark:text-white text-center">{{ interpreter.firstName }} {{ interpreter.lastName }}</h1>
                    <p class="text-sm text-gray-500 mb-6 flex items-center gap-1"><i class="ri-mail-line"></i> {{ interpreter.email }}</p>
                    <div class="w-full grid grid-cols-2 gap-3">
                      <div class="p-3 bg-gray-50 dark:bg-[#20232a] rounded-xl text-center border border-gray-100">
                        <div class="text-[10px] text-gray-400 uppercase font-bold mb-1">Experience</div>
                        <div class="text-lg font-bold text-gray-900 dark:text-white">{{ interpreter.experienceYears }} <span class="text-xs font-normal text-gray-500">yrs</span></div>
                      </div>
                      <div class="p-3 bg-gray-50 dark:bg-[#20232a] rounded-xl text-center border border-gray-100">
                        <div class="text-[10px] text-gray-400 uppercase font-bold mb-1">Rate</div>
                        <div class="text-lg font-bold text-green-600">{{ interpreter.consultationFee | currency }}<span class="text-xs font-normal text-gray-500">/min</span></div>
                      </div>
                    </div>
                  </div>
                </div>
                <a [href]="interpreter.governmentIdUrl" target="_blank" class="flex items-center gap-4 p-4 bg-white rounded-xl border border-blue-100 hover:shadow-md transition-all group">
                   <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform"><i class="ri-passport-line text-xl"></i></div>
                   <div class="flex-1">
                     <div class="font-bold text-gray-900 text-sm">Government ID</div>
                     <div class="text-xs text-blue-600 group-hover:underline">Click to view document</div>
                   </div>
                   <i class="ri-external-link-line text-gray-400"></i>
                </a>
              </div>
            </div>

            <div class="lg:col-span-8 space-y-8">
              
              <div class="bg-white dark:bg-[#181a1f] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div class="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#20232a]">
                  <h3 class="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide flex items-center gap-2">
                    <i class="ri-video-line"></i> Introduction Video
                  </h3>
                  <a [href]="interpreter.introVideoUrl" target="_blank" class="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                    Direct Link <i class="ri-external-link-line"></i>
                  </a>
                </div>
                
                <div class="relative w-full bg-black group flex items-center justify-center" style="aspect-ratio: 16/9; min-height: 300px;">
                  
                  @if (isVideoFile(interpreter.introVideoUrl)) {
                    <video controls class="w-full h-full object-contain" controlsList="nodownload">
                      <source [src]="interpreter.introVideoUrl" type="video/mp4">
                      <p class="text-white text-sm p-4">Your browser does not support the video tag.</p>
                    </video>
                  } @else {
                    <iframe [src]="interpreter.introVideoUrl | safeVideoUrl" 
                            class="w-full h-full" 
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
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                  <div>
                    <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><i class="ri-translate-2"></i> Languages</h4>
                    <div class="flex flex-col gap-2">
                      @for (lang of interpreter.languageAbilities; track lang.language) {
                        <div class="p-2 rounded-lg bg-gray-50 text-sm flex items-center justify-between border border-gray-100">
                          <span class="text-gray-900 font-bold">{{ getLanguageLabel(lang.language) }}</span>
                          <span class="text-xs px-2 py-1 bg-white rounded text-gray-500 font-medium border border-gray-200">{{ lang.proficiency }}</span>
                        </div>
                      }
                    </div>
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><i class="ri-stethoscope-line"></i> Specializations</h4>
                    <div class="flex flex-wrap gap-2">
                      @for (spec of interpreter.specializations; track spec) {
                        <span class="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 font-medium">{{ getSpecLabel(spec) }}</span>
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <h3 class="font-bold text-gray-900 dark:text-white flex items-center gap-2"><i class="ri-award-line"></i> Certifications</h3>
                @for (cert of interpreter.certifications; track cert.id) {
                  <div class="bg-white p-5 rounded-2xl border shadow-sm transition-all relative overflow-hidden group"
                       [ngClass]="{
                         'border-green-400 bg-green-50/30': cert.status === 'VERIFIED',
                         'border-red-300 bg-red-50/30': cert.status === 'REJECTED',
                         'border-gray-200': cert.status === 'PENDING'
                       }">
                    @if(cert.status === 'VERIFIED') { <div class="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">VERIFIED</div> }
                    
                    <div class="flex flex-col sm:flex-row gap-5">
                      <div class="hidden sm:flex w-14 h-14 rounded-xl bg-gray-50 items-center justify-center text-gray-400 flex-shrink-0 border border-gray-100"><i class="ri-file-text-line text-2xl"></i></div>
                      <div class="flex-1">
                         <h4 class="font-bold text-gray-900 text-base">{{ cert.name }}</h4>
                         <p class="text-sm text-gray-500 font-medium mb-2">{{ cert.issuingOrganization }}</p>
                         @if (cert.rejectionReason) {
                           <div class="mt-3 text-xs bg-red-50 text-red-700 p-3 rounded-lg border border-red-100"><strong>Rejection Reason:</strong> {{ cert.rejectionReason }}</div>
                         }
                      </div>
                      <div class="flex flex-row sm:flex-col items-center sm:items-end gap-2 justify-between border-t sm:border-0 border-gray-100 pt-3 sm:pt-0 mt-2">
                         <a [href]="cert.fileUrl" target="_blank" class="px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 flex items-center gap-2"><span>PDF</span> <i class="ri-external-link-line"></i></a>
                         @if (cert.status === 'PENDING') {
                           <div class="flex gap-2">
                             <button (click)="openActionModal('REJECT_CERT', cert.id)" class="w-9 h-9 flex items-center justify-center text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg shadow-sm"><i class="ri-close-line text-lg"></i></button>
                             <button (click)="openActionModal('VERIFY_CERT', cert.id)" class="w-9 h-9 flex items-center justify-center text-green-600 bg-white border border-green-200 hover:bg-green-50 rounded-lg shadow-sm"><i class="ri-check-line text-lg"></i></button>
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

      <div class="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#181a1f] border-t border-gray-200 dark:border-gray-800 md:hidden z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex gap-3">
        <button (click)="openActionModal('REJECT_APP')" class="flex-1 py-3 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100">Reject</button>
        <button (click)="openActionModal('REQUEST_CHANGES')" class="flex-1 py-3 text-sm font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100">Changes</button>
        <button (click)="openActionModal('APPROVE_APP')" [disabled]="!allCertsVerified()" class="flex-[1.5] py-3 text-sm font-bold text-white bg-green-600 rounded-xl shadow-lg disabled:opacity-50">Approve</button>
      </div>

      @if (actionModal().isOpen) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" (click)="closeModal()"></div>
          <div class="relative w-full max-w-lg bg-white dark:bg-[#181a1f] rounded-2xl shadow-2xl overflow-hidden animate-scale-in border border-gray-100">
             <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 class="font-bold text-lg text-gray-900">{{ actionModal().title }}</h3>
               <button (click)="closeModal()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400"><i class="ri-close-line text-xl"></i></button>
             </div>
             <div class="p-6">
                <p class="text-gray-600 text-sm mb-5 leading-relaxed">{{ actionModal().description }}</p>
                @if (actionModal().needsInput) {
                  <div class="space-y-2 mb-6">
                    <label class="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Reason / Feedback <span class="text-red-500">*</span></label>
                    <textarea [(ngModel)]="reasonText" rows="4" class="w-full p-4 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none shadow-sm" [placeholder]="actionModal().type === 'REQUEST_CHANGES' ? 'E.g., Please upload a clearer photo...' : 'Reason for rejection...'"></textarea>
                  </div>
                }
                <div class="flex gap-3">
                   <button (click)="closeModal()" class="flex-1 py-3 px-4 font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">Cancel</button>
                   <button (click)="confirmAction()" 
                           [disabled]="isSubmitting() || (actionModal().needsInput && !reasonText().trim())"
                           class="flex-1 py-3 px-4 font-bold text-sm text-white rounded-xl shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
                           [ngClass]="{
                             'bg-red-600 hover:bg-red-700': actionModal().confirmColor === 'red',
                             'bg-green-600 hover:bg-green-700': actionModal().confirmColor === 'green',
                             'bg-blue-600 hover:bg-blue-700': actionModal().confirmColor === 'blue'
                           }">
                      @if(isSubmitting()) { <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> }
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
    @keyframes scaleIn { from { transform: scale(0.95) translateY(10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class InterpreterDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminService = inject(AdminService);

  data = signal<InterpreterDetailResponse | null>(null);

  actionModal = signal<ActionState>({
    isOpen: false, type: null, title: '', description: '', needsInput: false, confirmLabel: '', confirmColor: 'blue'
  });
  reasonText = signal('');
  isSubmitting = signal(false);

  allCertsVerified = computed(() => {
    const d = this.data();
    return d ? d.certifications.length > 0 && d.certifications.every(c => c.status === 'VERIFIED') : false;
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) this.loadData(id);
    });
  }

  loadData(id: number) {
    this.adminService.getInterpreterDetails(id).subscribe({
      next: (res) => this.data.set(res),
      error: () => this.router.navigate(['/dashboard/admin/home'])
    });
  }

  // --- 3. UPDATED FILE CHECKER (Handles Signed URLs like file.mp4?token=123) ---
  isVideoFile(url: string | undefined): boolean {
    if (!url) return false;
    // Remove query parameters before checking extension
    const cleanUrl = url.split(/[?#]/)[0];
    const extension = cleanUrl.split('.').pop()?.toLowerCase();
    return ['mp4', 'webm', 'ogg', 'mov', 'm4v'].includes(extension || '');
  }

  openActionModal(type: ActionState['type'], targetId?: number) {
    this.reasonText.set('');
    const config: Partial<ActionState> = { isOpen: true, type, targetId };

    // Config logic same as before...
    switch (type) {
      case 'REQUEST_CHANGES':
        config.title = 'Request Changes'; config.description = 'Please describe the changes required.'; config.needsInput = true; config.confirmLabel = 'Send Request'; config.confirmColor = 'blue'; break;
      case 'APPROVE_APP':
        config.title = 'Approve Interpreter'; config.description = 'They will be visible immediately.'; config.needsInput = false; config.confirmLabel = 'Approve & Activate'; config.confirmColor = 'green'; break;
      case 'REJECT_APP':
        config.title = 'Reject Application'; config.description = 'Permanent action.'; config.needsInput = true; config.confirmLabel = 'Reject Permanently'; config.confirmColor = 'red'; break;
      case 'VERIFY_CERT':
        config.title = 'Verify Document'; config.description = 'Mark this document as verified?'; config.needsInput = false; config.confirmLabel = 'Verify'; config.confirmColor = 'green'; break;
      case 'REJECT_CERT':
        config.title = 'Reject Document'; config.description = 'Reason for rejection?'; config.needsInput = true; config.confirmLabel = 'Reject'; config.confirmColor = 'red'; break;
    }
    this.actionModal.set(config as ActionState);
  }

  closeModal() { this.actionModal.update(s => ({ ...s, isOpen: false })); }

  confirmAction() {
    if (!this.data() || this.isSubmitting()) return;
    this.isSubmitting.set(true);

    const { type, targetId } = this.actionModal();
    const id = this.data()!.id;
    const reason = this.reasonText();
    let obs$: Observable<any> | undefined;

    switch (type) {
      case 'APPROVE_APP': obs$ = this.adminService.approveInterpreter(id); break;
      case 'REJECT_APP': obs$ = this.adminService.rejectPermanently(id, reason); break;
      case 'REQUEST_CHANGES': obs$ = this.adminService.requestChanges(id, reason); break;
      case 'VERIFY_CERT': if (targetId) obs$ = this.adminService.verifyCertification(targetId); break;
      case 'REJECT_CERT': if (targetId) obs$ = this.adminService.rejectCertification(targetId, reason); break;
    }

    if (obs$) {
      obs$.subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          if (['APPROVE_APP', 'REJECT_APP', 'REQUEST_CHANGES'].includes(type!)) {
            this.router.navigate(['/dashboard/admin/home']);
          } else {
            this.loadData(id);
          }
        },
        error: () => this.isSubmitting.set(false)
      });
    } else { this.isSubmitting.set(false); }
  }

  getSpecLabel(key: string) { return SPECIALIZATION_LABELS[key] || key; }
  getLanguageLabel(key: string) { return LANGUAGE_LABELS[key] || key; }
}