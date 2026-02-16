import { Component, inject, OnInit, signal, computed } from '@angular/core';
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

// FIXED: Made experienceMonths optional to match the Service's return type
export interface InterpreterAuthenticatedProfile {
   id: number;
   firstName: string;
   lastName: string;
   bio: string;
   profilePictureUrl?: string;
   introVideoUrl?: string;
   experienceYears: number;
   experienceMonths?: number; // <--- Changed to optional (?)
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
   imports: [CommonModule, Navbar, CurrencyPipe, TitleCasePipe, FormsModule],
   template: `
    <app-navbar class="fixed top-0 left-0 w-full z-50"></app-navbar>

    <div class="min-h-screen bg-[#f8f9fa] dark:bg-[#0b0c0f] pt-[80px] pb-12 px-4 md:px-8 font-sans transition-colors duration-300">
      
      @if (loading()) {
        <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse mt-8">
           <div class="lg:col-span-2 space-y-6">
              <div class="h-[400px] bg-gray-200 dark:bg-gray-800 rounded-3xl w-full"></div>
              <div class="h-40 bg-gray-200 dark:bg-gray-800 rounded-3xl w-full"></div>
           </div>
           <div class="h-[500px] bg-gray-200 dark:bg-gray-800 rounded-3xl w-full hidden lg:block"></div>
        </div>
      } 
      
      @else if (!profile() && !loading()) {
        <div class="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
           <div class="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 text-gray-400">
              <i class="ri-user-unfollow-line text-4xl"></i>
           </div>
           <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Interpreter Not Found</h2>
           <p class="text-gray-500 mb-8">The profile you are looking for is unavailable or has been removed.</p>
           <button (click)="goBack()" class="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-lg">
              Browse All Interpreters
           </button>
        </div>
      }

      @else if (profile(); as interpreter) {
        <div class="max-w-6xl mx-auto animate-fade-in mt-6">
          
          <button (click)="goBack()" class="group mb-6 flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-wide">
            <i class="ri-arrow-left-line group-hover:-translate-x-1 transition-transform"></i> Back to Directory
          </button>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div class="lg:col-span-8 space-y-8">
              
              <div class="bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
                 
                 <div class="w-full bg-black relative group aspect-video">
                    @if (safeVideoUrl()) {
                      @if (videoType() === 'iframe') {
                         <iframe 
                           [src]="safeVideoUrl()" 
                           class="w-full h-full absolute inset-0" 
                           frameborder="0" 
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                           allowfullscreen>
                         </iframe>
                      } @else {
                         <video 
                           [src]="interpreter.introVideoUrl" 
                           controls 
                           playsinline 
                           class="w-full h-full object-contain bg-black">
                         </video>
                      }
                    } @else {
                      <div class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"></div>
                      <img [src]="interpreter.profilePictureUrl || 'assets/default-avatar.png'" class="w-full h-full object-cover opacity-50">
                      <div class="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
                         <div class="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-3">
                           <i class="ri-vidicon-line text-3xl"></i>
                         </div>
                         <span class="font-bold">No Introduction Video</span>
                      </div>
                    }
                 </div>

                 <div class="p-6 md:p-8 relative">
                    <div class="flex flex-col sm:flex-row gap-6 items-start">
                       <div class="shrink-0 relative -mt-16 sm:-mt-20 z-10">
                          <img [src]="interpreter.profilePictureUrl || 'assets/default-avatar.png'" 
                               class="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white dark:border-[#181a1f] shadow-lg bg-gray-200">
                          
                          <div class="absolute bottom-1 right-1 flex items-center justify-center" [title]="interpreter.online ? 'Online' : 'Offline'">
                             <span class="relative flex h-5 w-5">
                               <span *ngIf="interpreter.online" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                               <span class="relative inline-flex rounded-full h-5 w-5 border-4 border-white dark:border-[#181a1f]"
                                     [ngClass]="interpreter.online ? 'bg-green-500' : 'bg-gray-400'"></span>
                             </span>
                          </div>
                       </div>
                       
                       <div class="flex-1 w-full">
                          <div class="flex flex-col sm:flex-row justify-between items-start gap-2">
                             <div>
                                <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                  {{ interpreter.firstName }} {{ interpreter.lastName }}
                                  <i class="ri-verified-badge-fill text-blue-500 text-xl" title="Verified Professional"></i>
                                </h1>
                                <p class="text-gray-500 dark:text-gray-400 font-medium mt-1 flex items-center gap-2 text-sm">
                                   <span>Medical Interpreter</span>
                                   <span class="text-gray-300 dark:text-gray-700">•</span>
                                   <span>{{ interpreter.experienceYears }} Yrs Exp.</span>
                                </p>
                             </div>
                             
                             <div class="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                                <i class="ri-star-fill text-yellow-400"></i>
                                <span class="font-bold text-gray-900 dark:text-white">{{ interpreter.rating }}</span>
                                <span class="text-xs text-gray-400">({{ interpreter.ratingCount }})</span>
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

              <div class="bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm">
                 <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                   <i class="ri-user-smile-line"></i> About Me
                 </h2>
                 <p class="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line text-base">
                    {{ interpreter.bio || 'No biography provided.' }}
                 </p>
              </div>

              <div class="bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm">
                 <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <i class="ri-translate-2"></i> Languages & Proficiency
                 </h2>
                 <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    @for (lang of interpreter.languages; track lang.language) {
                       <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#131519] rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                          <div class="flex items-center gap-3">
                             <div class="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                                <span class="text-xs font-bold">{{ lang.language.substring(0,2).toUpperCase() }}</span>
                             </div>
                             <span class="font-bold text-gray-700 dark:text-gray-200">{{ lang.language | titlecase }}</span>
                          </div>
                          <span class="text-xs font-bold uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-800/30">
                             {{ lang.proficiency }}
                          </span>
                       </div>
                    }
                 </div>
              </div>
            </div>

            <div class="lg:col-span-4 relative">
               <div class="sticky top-24 space-y-6">
                 
                 <div class="bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none">
                    
                    <div class="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                       <div>
                          <p class="text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wider">Session Rate</p>
                          <div class="flex items-baseline gap-1 mt-1">
                             <span class="text-3xl font-extrabold text-gray-900 dark:text-white">
                                {{ interpreter.consultationFees | currency }}
                             </span>
                          </div>
                       </div>
                       <div class="text-right">
                          <span class="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300">
                            Per Minute
                          </span>
                       </div>
                    </div>

                    <div class="space-y-4">
                       @if(!messageSent()) {
                          <div class="relative">
                             <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1 uppercase">
                                Request Connection
                             </label>
                             <textarea 
                                 [(ngModel)]="initialMessage"
                                 rows="3"
                                 [placeholder]="'Hi ' + interpreter.firstName + ', I would like to book a medical interpretation session...'"
                                 class="w-full bg-gray-50 dark:bg-[#131519] border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none dark:text-white transition-all placeholder:text-gray-400"
                             ></textarea>
                          </div>

                          <button (click)="connectToInterpreter()" 
                                  [disabled]="!interpreter.available || isConnecting() || !initialMessage.trim()"
                                  class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none">
                             @if(isConnecting()) {
                                  <i class="ri-loader-4-line animate-spin text-lg"></i> Sending Request...
                             } @else {
                                  <i class="ri-user-add-line text-lg"></i>
                                  {{ interpreter.available ? 'Connect & Chat' : 'Currently Unavailable' }}
                             }
                          </button>
                       } @else {
                          <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center animate-fade-in">
                             <div class="w-12 h-12 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 rounded-full flex items-center justify-center mx-auto mb-3">
                                <i class="ri-check-line text-2xl"></i>
                             </div>
                             <h4 class="font-bold text-green-700 dark:text-green-400 text-lg">Request Sent!</h4>
                             <p class="text-sm text-green-600 dark:text-green-500 mt-1">
                                Redirecting to messages...
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
                    
                    <div class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2 text-xs text-gray-400 text-center">
                       <p><i class="ri-shield-check-line text-green-500 mr-1"></i> Verified Interpreter</p>
                       <p>Response time: usually within 2 hours</p>
                    </div>
                 </div>

               </div>
            </div>

          </div>
        </div>
      } 
    </div>
  `,
   styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
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
   videoType = signal<'iframe' | 'native' | 'none'>('none');
   safeVideoUrl = signal<SafeResourceUrl | null>(null);

   // Connection Form
   isConnecting = signal(false);
   messageSent = signal(false);
   errorMessage = signal<string | null>(null);
   initialMessage = '';

   ngOnInit() {
      this.route.paramMap.subscribe(params => {
         const id = params.get('id');
         if (id) {
            this.fetchInterpreter(id);
         } else {
            this.loading.set(false);
         }
      });
   }

   fetchInterpreter(id: string) {
      this.loading.set(true);
      this.clientService.getInterpreterById(id)
         .pipe(finalize(() => this.loading.set(false)))
         .subscribe({
            // FIXED: Using 'any' cast to prevent strict mismatch if API types vary
            next: (data: any) => {
               this.profile.set(data as InterpreterAuthenticatedProfile);
               this.processVideoUrl(data.introVideoUrl);
            },
            error: (err) => {
               console.error('Error fetching interpreter', err);
            }
         });
   }

   // --- Robust Video URL Processing ---
   private processVideoUrl(url: string | undefined) {
      if (!url) {
         this.videoType.set('none');
         return;
      }

      // 1. Handle YouTube (Watch, Embed, Shorts, Youtu.be)
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
         const videoId = this.extractYouTubeId(url);
         if (videoId) {
            this.videoType.set('iframe');
            // Use no-cookie domain for better privacy/compatibility
            const embed = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
            this.safeVideoUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(embed));
            return;
         }
      }

      // 2. Handle Vimeo
      if (url.includes('vimeo.com')) {
         const videoId = this.extractVimeoId(url);
         if (videoId) {
            this.videoType.set('iframe');
            const embed = `https://player.vimeo.com/video/${videoId}`;
            this.safeVideoUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(embed));
            return;
         }
      }

      // 3. Handle Native Files (mp4, webm, etc.)
      this.videoType.set('native');
      this.safeVideoUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
   }

   private extractYouTubeId(url: string): string | null {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
   }

   private extractVimeoId(url: string): string | null {
      const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
      const match = url.match(regExp);
      return match ? match[1] : null;
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
               // Redirect to messages after a brief success animation
               setTimeout(() => {
                  this.router.navigate(['/messages'], {
                     queryParams: {
                        conversationId: res.id || res.conversationId // Adjust based on your API response
                     }
                  });
               }, 1500);
            },
            error: (error: HttpErrorResponse) => {
               let msg = 'Failed to send request. Please try again.';
               if (error.status === 409) msg = 'You already have a pending or active connection with this interpreter.';
               if (error.status === 401) msg = 'Please log in to connect with interpreters.';
               this.errorMessage.set(msg);
            }
         });
   }

   goBack() {
      this.router.navigate(['/interpreters/browse']);
   }
}