import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; // 1. Import Router
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { Navbar } from '../layout/navbar'; 
import { ClientService, InterpreterProfile } from '../../core/services/client.service';

@Component({
  selector: 'app-interpreter-details',
  standalone: true,
  imports: [CommonModule, Navbar],
  template: `
    <app-navbar class="fixed top-0 left-0 w-full z-50"></app-navbar>

    <div class="min-h-screen bg-gray-50/50 dark:bg-[#0f1115] pt-[100px] pb-12 px-4 md:px-8 transition-colors duration-300 font-sans text-sm">
      
      @if (loading()) {
        <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
           <div class="lg:col-span-2 h-[500px] bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
           <div class="h-[400px] bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
      } 
      
      @else if (profile(); as interpreter) {
        <div class="max-w-6xl mx-auto animate-fade-in">
          
          <button (click)="goBack()" class="group mb-6 flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-wide cursor-pointer">
            <i class="ri-arrow-left-line group-hover:-translate-x-1 transition-transform"></i> Back to Search
          </button>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div class="lg:col-span-8 space-y-6">
              <div class="bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm relative overflow-hidden">
                 <div class="absolute top-6 right-6 flex items-center gap-2">
                    <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border"
                          [ngClass]="interpreter.available ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'">
                       <span class="w-1.5 h-1.5 rounded-full inline-block mr-1" [ngClass]="interpreter.available ? 'bg-green-500' : 'bg-gray-400'"></span>
                       {{ interpreter.available ? 'Available Now' : 'Unavailable' }}
                    </span>
                 </div>

                 <div class="flex flex-col md:flex-row gap-8 items-start relative z-10">
                    <div class="shrink-0">
                       <img [src]="interpreter.profilePictureUrl || 'assets/default-avatar.png'" class="w-32 h-32 rounded-2xl object-cover border-4 border-white dark:border-[#131519] shadow-lg bg-gray-200">
                    </div>
                    <div class="flex-1 min-w-0 pt-2">
                       <h1 class="text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
                          {{ interpreter.firstName }} {{ interpreter.lastName }}
                       </h1>
                       <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-5">
                          @if(interpreter.experienceYears) {
                            <span class="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                              <i class="ri-briefcase-line text-blue-500"></i> {{ interpreter.experienceYears }} Years Exp
                            </span>
                          }
                          <span class="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                             <i class="ri-star-fill text-yellow-400"></i> {{ interpreter.rating || 'New' }} Rating
                          </span>
                       </div>
                       <div class="flex flex-wrap gap-2">
                          @for (spec of interpreter.specializations; track spec) {
                             <span class="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-[11px] font-bold uppercase tracking-wide border border-blue-100 dark:border-blue-800/50">
                                {{ spec }}
                             </span>
                          }
                       </div>
                    </div>
                 </div>
              </div>

              <div class="bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-3xl p-8">
                 <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <i class="ri-user-smile-line text-blue-500"></i> About Me
                 </h2>
                 <p class="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm">
                    {{ interpreter.bio || 'No biography provided.' }}
                 </p>
                 <div class="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                    <h3 class="font-bold text-gray-900 dark:text-white mb-4 text-sm">Languages</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       @for (lang of interpreter.languages; track lang.language) {
                          <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#131519] rounded-xl border border-gray-100 dark:border-gray-800">
                             <span class="font-medium text-gray-700 dark:text-gray-200">{{ lang.language | titlecase }}</span>
                             <span class="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                                {{ lang.proficiency }}
                             </span>
                          </div>
                       }
                    </div>
                 </div>
              </div>
            </div>

            <div class="lg:col-span-4 relative">
               <div class="sticky top-28 space-y-4">
                 
                 <div class="bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none">
                    <div class="text-center mb-6">
                       <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Consultation Fee</p>
                       <div class="text-4xl font-extrabold text-gray-900 dark:text-white">
                          {{ (interpreter.consultationFees ?? interpreter.consultationFee ?? 0) | currency }}
                       </div>
                       <p class="text-xs text-gray-500 mt-1">per session</p>
                    </div>

                    <div class="space-y-3">
                       <button (click)="connectToInterpreter()" 
                               [disabled]="!interpreter.available || isConnecting()"
                               class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                          
                          @if(isConnecting()) {
                              <i class="ri-loader-4-line animate-spin text-lg"></i> Sending...
                          } @else {
                              <i class="ri-message-3-line text-lg"></i>
                              {{ interpreter.available ? 'Connect & Chat' : 'Unavailable' }}
                          }
                       </button>
                    </div>

                    @if(connectionStatus()) {
                        <div class="mt-4 p-4 rounded-xl text-xs font-medium border animate-fade-in"
                             [ngClass]="{
                                'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400': connectionStatus()?.type === 'success',
                                'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400': connectionStatus()?.type === 'error'
                             }">
                            <div class="flex items-start gap-2">
                                <i [class]="connectionStatus()?.type === 'success' ? 'ri-checkbox-circle-fill text-base' : 'ri-error-warning-fill text-base'"></i>
                                <span>{{ connectionStatus()?.message }}</span>
                            </div>
                        </div>
                    }

                    <div class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                       <div class="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <i class="ri-shield-check-line text-green-500"></i>
                          <span>Verified Professional</span>
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
            <div class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
               <i class="ri-user-forbid-line text-3xl"></i>
            </div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Interpreter Not Found</h2>
            <button (click)="goBack()" class="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity mt-4 cursor-pointer">
               Back to Directory
            </button>
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
  private router = inject(Router); // 2. Inject Router
  private location = inject(Location);
  private clientService = inject(ClientService);

  profile = signal<InterpreterProfile | null>(null);
  loading = signal(true);
  
  isConnecting = signal(false);
  connectionStatus = signal<{type: 'success' | 'error', message: string} | null>(null);

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
        next: (data) => this.profile.set(data),
        error: (err) => console.error(err)
      });
  }

  connectToInterpreter() {
    const interpreter = this.profile();
    if (!interpreter) return;

    // Prompt for the initial message
    const message = window.prompt(
      `Send connection request to ${interpreter.firstName}?`, 
      "Hi, I'd like to discuss a project."
    );

    if (!message) return;

    this.isConnecting.set(true);
    this.connectionStatus.set(null);

    // Payload
    const payload = {
      interpreterProfileId: interpreter.id, 
      initialMessage: message
    };

    this.clientService.connectToInterpreter(payload)
      .pipe(finalize(() => this.isConnecting.set(false)))
      .subscribe({
        next: (res: any) => {
          this.connectionStatus.set({
             type: 'success', 
             message: 'Connected! Redirecting to chat...'
          });

          // 3. AUTO-REDIRECT LOGIC
          // The backend returns a RelationshipResponse containing the relationshipId.
          // We immediately send the user to the messages page with that ID.
          setTimeout(() => {
            this.router.navigate(['/messages'], { 
              queryParams: { 
                relationshipId: res.relationshipId,
                recipientId: interpreter.id // Assuming profile has id field
              } 
            });
          }, 1000); // Small delay so they see the "Success" message
        },
        error: (error: HttpErrorResponse) => {
          console.error('Connection Error:', error);
          let msg = 'Failed to connect. Please try again.';
          
          if (error.status === 409) {
             msg = error.error?.message || 'You are already connected.';
             // Optional: If already connected, maybe offer to redirect to chat?
          } else if (error.status === 401) {
             msg = 'Please log in to connect.';
          }

          this.connectionStatus.set({ type: 'error', message: msg });
        }
      });
  }

  goBack() {
    this.location.back();
  }
}