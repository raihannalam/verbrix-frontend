import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, TitleCasePipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators';
import { Navbar } from '../layout/navbar'; 
import { ClientService } from '../../core/services/client.service';

// --- Interfaces ---
export interface LanguageAbility {
  language: string;
  proficiency: string;
}

export interface InterpreterAuthenticatedProfile {
  id: number;
  firstName: string;
  lastName: string;
  bio: string;
  profilePictureUrl?: string;
  introVideoUrl?: string;
  experienceYears: number;
  experienceMonths: number;
  specializations: string[];
  languages: LanguageAbility[];
  consultationFees: number;
  rating: number;
  ratingCount: number;
  online: boolean;      
  available: boolean;   
  lastSeenAt?: string;  
}

@Component({
  selector: 'app-interpreter-details',
  standalone: true,
  imports: [CommonModule, Navbar, CurrencyPipe, TitleCasePipe, DatePipe, FormsModule],
  template: `
    <app-navbar class="fixed top-0 left-0 w-full z-50"></app-navbar>

    <div class="min-h-screen bg-slate-50 dark:bg-[#0f1115] pt-[100px] pb-12 px-4 md:px-8 transition-colors duration-300 font-sans text-sm">
      
      @if (loading()) {
        <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
           <div class="lg:col-span-2 space-y-6">
              <div class="h-[400px] bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
              <div class="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
           </div>
           <div class="h-[500px] bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        </div>
      } 
      
      @else if (profile(); as interpreter) {
        <div class="max-w-6xl mx-auto animate-fade-in">
          
          <button (click)="goBack()" class="group mb-6 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-wide cursor-pointer">
            <i class="ri-arrow-left-line group-hover:-translate-x-1 transition-transform"></i> Back to Directory
          </button>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div class="lg:col-span-2 space-y-8">
              
              <div class="bg-white dark:bg-[#181a1f] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                 
                 <div class="w-full bg-black relative group overflow-hidden">
                    <div class="aspect-video w-full relative flex items-center justify-center">
                    
                        @if (interpreter.introVideoUrl) {
                          
                          @if (videoType() === 'youtube') {
                             <iframe 
                               [src]="safeVideoUrl()" 
                               class="w-full h-full absolute inset-0" 
                               frameborder="0" 
                               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                               allowfullscreen>
                             </iframe>
                          } 
                          
                          @else if (videoType() === 'native') {
                             <video 
                               [src]="interpreter.introVideoUrl" 
                               controls 
                               playsinline 
                               webkit-playsinline 
                               preload="metadata"
                               class="w-full h-full object-contain bg-black">
                             </video>
                          }

                        } @else {
                          <div class="absolute inset-0 bg-slate-900/10 dark:bg-slate-900/50"></div>
                          <img [src]="interpreter.profilePictureUrl || 'assets/default-avatar.png'" class="w-full h-full object-cover blur-sm opacity-60">
                          <div class="absolute z-10 flex flex-col items-center gap-4">
                             <div class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-xl">
                                <i class="ri-vidicon-off-line text-3xl ml-1"></i>
                             </div>
                             <span class="text-white font-bold text-shadow text-lg">No Introduction Video</span>
                          </div>
                        }
                    </div>
                 </div>

                 @if (videoType() === 'youtube') {
                    <div class="bg-slate-100 dark:bg-slate-900/50 py-2 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                       <span class="text-xs text-slate-500 dark:text-slate-400">Video not playing?</span>
                       <a [href]="interpreter.introVideoUrl" target="_blank" class="text-xs font-bold text-red-600 hover:text-red-500 flex items-center gap-1">
                          <i class="ri-youtube-fill text-lg"></i> Watch on YouTube
                       </a>
                    </div>
                 }

                 <div class="p-6 md:p-8 relative">
                    <div class="flex flex-col md:flex-row gap-6 items-start">
                       <div class="shrink-0 relative -mt-16 md:-mt-20 z-10">
                          <img [src]="interpreter.profilePictureUrl || 'assets/default-avatar.png'" 
                               class="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-white dark:border-[#181a1f] shadow-lg bg-slate-200">
                          
                          <div class="absolute bottom-1 right-1 flex items-center justify-center" 
                               [title]="interpreter.online ? 'Online' : 'Offline'">
                             <span class="relative flex h-5 w-5">
                               <span *ngIf="interpreter.online" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                               <span class="relative inline-flex rounded-full h-5 w-5 border-4 border-white dark:border-[#181a1f]"
                                     [ngClass]="interpreter.online ? 'bg-green-500' : 'bg-slate-400'"></span>
                             </span>
                          </div>
                       </div>
                       
                       <div class="flex-1 w-full">
                          <div class="flex flex-col sm:flex-row justify-between items-start gap-2">
                             <div>
                                <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                  {{ interpreter.firstName }} {{ interpreter.lastName }}
                                  <i class="ri-verified-badge-fill text-blue-500 text-xl" title="Verified Professional"></i>
                                </h1>
                                <p class="text-slate-500 dark:text-slate-400 font-medium mt-1 flex items-center gap-2">
                                   <span>Certified Interpreter</span>
                                   <span class="text-slate-300 dark:text-slate-700">•</span>
                                   <span class="text-xs" [ngClass]="interpreter.available ? 'text-green-600 dark:text-green-400' : 'text-red-500'">
                                      {{ interpreter.available ? 'Accepting Connections' : 'Currently Unavailable' }}
                                   </span>
                                </p>
                             </div>
                             <div class="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                                <i class="ri-star-fill text-yellow-400"></i>
                                <span class="font-bold text-slate-900 dark:text-white">{{ interpreter.rating }}</span>
                                <span class="text-xs text-slate-400">({{ interpreter.ratingCount }})</span>
                             </div>
                          </div>

                          <div class="flex flex-wrap gap-2 mt-4">
                             @for (spec of interpreter.specializations; track spec) {
                               <span class="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold uppercase tracking-wide border border-blue-100 dark:border-blue-800/50">
                                  {{ spec }}
                               </span>
                             }
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div class="bg-white dark:bg-[#181a1f] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
                 <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">About Me</h2>
                 <p class="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-base">
                    {{ interpreter.bio || 'No biography provided.' }}
                 </p>
              </div>

              <div class="bg-white dark:bg-[#181a1f] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
                 <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-6">Languages & Proficiency</h2>
                 <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    @for (lang of interpreter.languages; track lang.language) {
                       <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#131519] rounded-xl border border-slate-100 dark:border-slate-800">
                          <div class="flex items-center gap-3">
                             <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <i class="ri-translate-2"></i>
                             </div>
                             <span class="font-bold text-slate-700 dark:text-slate-200">{{ lang.language | titlecase }}</span>
                          </div>
                          <span class="text-xs font-bold uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-800/30">
                             {{ lang.proficiency }}
                          </span>
                       </div>
                    }
                 </div>
              </div>
            </div>

            <div class="lg:col-span-1 relative">
               <div class="sticky top-28 space-y-6">
                 
                 <div class="bg-white dark:bg-[#181a1f] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    
                    <div class="flex items-center justify-between mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                       <div>
                          <p class="text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wider">Session Rate</p>
                          <div class="flex items-baseline gap-1 mt-1">
                             <span class="text-3xl font-extrabold text-slate-900 dark:text-white">
                                {{ interpreter.consultationFees | currency }}
                             </span>
                          </div>
                       </div>
                       <div class="text-right">
                          <span class="block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300">
                            50 Mins
                          </span>
                       </div>
                    </div>

                    <div class="space-y-4">
                       @if(!messageSent()) {
                          <div class="relative">
                             <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1 uppercase">
                                Request Connection
                             </label>
                             <textarea 
                                [(ngModel)]="initialMessage"
                                rows="3"
                                placeholder="Hi, I need help with a medical consultation..."
                                class="w-full bg-slate-50 dark:bg-[#131519] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none dark:text-white transition-all"
                             ></textarea>
                          </div>

                          <button (click)="connectToInterpreter()" 
                                  [disabled]="!interpreter.available || isConnecting() || !initialMessage.trim()"
                                  class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none">
                             @if(isConnecting()) {
                                 <i class="ri-loader-4-line animate-spin text-lg"></i> Sending...
                             } @else {
                                 <i class="ri-user-add-line text-lg"></i>
                                 {{ interpreter.available ? 'Request Connection' : 'Unavailable' }}
                             }
                          </button>
                       } @else {
                          <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center animate-fade-in">
                             <div class="w-12 h-12 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 rounded-full flex items-center justify-center mx-auto mb-3">
                                <i class="ri-check-line text-2xl"></i>
                             </div>
                             <h4 class="font-bold text-green-700 dark:text-green-400 text-lg">Request Sent!</h4>
                             <p class="text-sm text-green-600 dark:text-green-500 mt-1">
                                Waiting for acceptance.
                             </p>
                          </div>
                       }
                    </div>

                    @if(errorMessage()) {
                       <div class="mt-4 p-3 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 flex items-start gap-2 animate-fade-in">
                          <i class="ri-error-warning-fill mt-0.5"></i>
                          <span>{{ errorMessage() }}</span>
                       </div>
                    }
                    
                    <div class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
                       <i class="ri-shield-check-line text-green-500 text-base"></i>
                       <span>No charge until booking confirmed</span>
                    </div>
                 </div>

                 <div class="bg-white dark:bg-[#181a1f] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    <h3 class="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wide opacity-70">Details</h3>
                    <div class="space-y-4">
                       <div class="flex items-center justify-between text-sm">
                          <span class="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                             <i class="ri-briefcase-4-line"></i> Experience
                          </span>
                          <span class="font-bold text-slate-900 dark:text-white">
                             {{ interpreter.experienceYears }} Yrs 
                             @if(interpreter.experienceMonths > 0) { {{ interpreter.experienceMonths }} Mos }
                          </span>
                       </div>
                       <div class="flex items-center justify-between text-sm">
                          <span class="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                             <i class="ri-time-line"></i> Last Active
                          </span>
                          <span class="font-bold text-slate-900 dark:text-white">
                             @if(interpreter.lastSeenAt) {
                                {{ interpreter.lastSeenAt | date:'shortDate' }}
                             } @else {
                                Recently
                             }
                          </span>
                       </div>
                       <div class="flex items-center justify-between text-sm">
                          <span class="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                             <i class="ri-chat-history-line"></i> Sessions
                          </span>
                          <span class="font-bold text-slate-900 dark:text-white">{{ interpreter.ratingCount }} completed</span>
                       </div>
                    </div>
                 </div>

               </div>
            </div>

          </div>
        </div>
      } 
      
      @else {
         <div class="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
            <div class="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-400">
               <i class="ri-user-unfollow-line text-4xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Interpreter Not Found</h2>
            <button (click)="goBack()" class="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity mt-8 shadow-lg">
               Browse All Interpreters
            </button>
         </div>
      }
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .text-shadow { text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
  `]
})
export class InterpreterDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientService = inject(ClientService);
  private sanitizer = inject(DomSanitizer);

  profile = signal<InterpreterAuthenticatedProfile | null>(null);
  loading = signal(true);
  
  // Video State
  videoType = signal<'youtube' | 'native' | 'none'>('none');
  safeVideoUrl = signal<SafeResourceUrl | string | null>(null);
  
  // Connection Form
  isConnecting = signal(false);
  messageSent = signal(false);
  errorMessage = signal<string | null>(null);
  initialMessage = '';

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.fetchInterpreter(id);
      else this.loading.set(false);
    });
  }

  fetchInterpreter(id: string) {
    this.loading.set(true);
    this.clientService.getInterpreterById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data: any) => {
          this.profile.set(data);
          this.processVideoUrl(data.introVideoUrl);
        },
        error: (err) => console.error(err)
      });
  }

  // --- Robust Video URL Processing ---
  private processVideoUrl(url: string | undefined) {
    if (!url) {
      this.videoType.set('none');
      return;
    }

    if (this.isYouTubeUrl(url)) {
      this.videoType.set('youtube');
      this.safeVideoUrl.set(this.getSafeYouTubeUrl(url));
    } else {
      this.videoType.set('native');
      this.safeVideoUrl.set(url);
    }
  }

  private isYouTubeUrl(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  private getSafeYouTubeUrl(url: string): SafeResourceUrl {
    let videoId = '';
    // Regex covers standard, embed, shorts, and youtu.be
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (match && match[1]) videoId = match[1];
    
    // Switch to youtube-nocookie.com for better mobile compatibility
    const origin = window.location.origin;
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1&modestbranding=1&origin=${origin}`; 
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  // --- Connection Logic ---
  connectToInterpreter() {
    const interpreter = this.profile();
    if (!interpreter || !this.initialMessage.trim()) return;

    this.isConnecting.set(true);
    this.errorMessage.set(null);

    const payload = {
      interpreterProfileId: interpreter.id, 
      initialMessage: this.initialMessage
    };

    this.clientService.connectToInterpreter(payload)
      .pipe(finalize(() => this.isConnecting.set(false)))
      .subscribe({
        next: (res: any) => {
          this.messageSent.set(true);
          setTimeout(() => {
            this.router.navigate(['/messages'], { 
              queryParams: { 
                relationshipId: res.relationshipId,
                recipientId: interpreter.id
              } 
            });
          }, 1500);
        },
        error: (error: HttpErrorResponse) => {
          let msg = 'Failed to connect.';
          if (error.status === 409) msg = error.error?.message || 'Connection already exists.';
          this.errorMessage.set(msg);
        }
      });
  }

  goBack() {
    this.router.navigate(['/interpreters/browse']);
  }
}