import { Component, inject, OnInit, OnDestroy, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { catchError, finalize, of, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Navbar } from '../../features/layout/navbar';
import { RealtimeService } from '../../core/realtime/realtime.service'; 
import { AuthService } from '../../core/auth/auth.service';

// --- Interfaces ---
interface ApplicationStatusResponse {
  applicationId: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

interface Relationship {
  id: number;
  clientName: string;
  interpreterName: string;
  interpreterAvatar?: string;
  status: 'REQUESTED' | 'REQUEST_ACCEPTED' | 'CONSULTATION_ACTIVE' | 'AGREEMENT_ACTIVE' | 'TERMINATED';
  lastActivity?: string;
  createdAt: string;
}

@Component({
  selector: 'app-client-home',
  standalone: true,
  imports: [CommonModule, Navbar, RouterLink, DatePipe],
  template: `
    <app-navbar></app-navbar>

    <div class="min-h-screen bg-[#f3f4f6] dark:bg-[#0b0c0f] pt-24 pb-12 px-4 sm:px-6 transition-colors duration-300">
      <div class="max-w-7xl mx-auto">
        
        <div class="mb-8 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Client Portal
            </h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">
              Manage your medical interpretation team.
            </p>
          </div>
          
          <button routerLink="/interpreters/find" 
                  class="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-sm hover:opacity-90 transition-all flex items-center gap-2">
             <i class="ri-search-line"></i> Find Interpreter
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div class="lg:col-span-2 space-y-6 animate-slide-up">
             
             <div class="flex items-center justify-between">
                <h2 class="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                   <i class="ri-team-line text-blue-500"></i> Active Connections
                   <span class="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">{{ myRelationships().length }}</span>
                </h2>
             </div>

             @if (loadingRels()) {
                <div class="space-y-4">
                   @for(i of [1,2,3]; track i) {
                      <div class="h-28 bg-white dark:bg-[#181a1f] rounded-2xl animate-pulse border border-gray-100 dark:border-gray-800"></div>
                   }
                </div>
             } 
             
             @else {
                <div class="space-y-4">
                   @for (rel of myRelationships(); track rel.id) {
                      <div class="group bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 hover:border-blue-400 dark:hover:border-blue-700 transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden">
                          
                          <div class="absolute left-0 top-0 bottom-0 w-1" [ngClass]="getStatusBorder(rel.status)"></div>

                          <div class="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                             <div class="relative shrink-0">
                                <div class="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xl font-bold border border-gray-100 dark:border-gray-700">
                                   {{ rel.interpreterName.charAt(0) }}
                                </div>
                                <div class="absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white dark:border-[#181a1f] rounded-full bg-green-500"></div>
                             </div>

                             <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                   <h3 class="text-lg font-bold text-gray-900 dark:text-white truncate">
                                      {{ rel.interpreterName }}
                                   </h3>
                                   <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border"
                                         [ngClass]="getStatusStyles(rel.status)">
                                      {{ rel.status.replace('_', ' ') }}
                                   </span>
                                </div>
                                <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-4">
                                   <span><i class="ri-calendar-check-line mr-1"></i> Added {{ rel.createdAt | date:'mediumDate' }}</span>
                                </p>
                             </div>

                             <div class="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                <button routerLink="/messages" 
                                        [queryParams]="{ recipientId: rel.id }"
                                        class="flex-1 sm:flex-none px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 font-bold rounded-xl text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                                   Chat
                                </button>
                                <button class="flex-1 sm:flex-none px-3 py-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                   <i class="ri-more-2-fill text-xl"></i>
                                </button>
                             </div>
                          </div>
                      </div>
                   }

                   @if (myRelationships().length === 0) {
                      <div class="bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-2xl p-10 text-center">
                         <div class="w-16 h-16 mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-500 mb-4">
                            <i class="ri-user-add-line text-2xl"></i>
                         </div>
                         <h3 class="text-lg font-bold text-gray-900 dark:text-white">Build your team</h3>
                         <p class="text-gray-500 dark:text-gray-400 text-sm mt-1 mb-6 max-w-md mx-auto">
                            Connect with certified medical interpreters to ensure clear communication with your patients.
                         </p>
                         <button routerLink="/interpreters/find" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all">
                            Browse Directory
                         </button>
                      </div>
                   }
                </div>
             }
          </div>

          <div class="space-y-6">
             
             @if (!loadingApp() && application(); as app) {
                <div class="bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm animate-fade-in">
                   <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Professional Profile</h3>
                   
                   <div class="flex items-start gap-3 mb-4">
                      <div class="mt-1">
                         <i class="ri-file-user-line text-xl" 
                            [ngClass]="{
                               'text-yellow-500': app.status === 'PENDING',
                               'text-blue-500': app.status === 'UNDER_REVIEW',
                               'text-green-500': app.status === 'APPROVED',
                               'text-red-500': app.status === 'REJECTED'
                            }"></i>
                      </div>
                      <div>
                         <p class="font-bold text-gray-900 dark:text-white text-sm">Interpreter Application</p>
                         <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Status: <span class="font-semibold" 
                                          [ngClass]="{
                                             'text-yellow-600 dark:text-yellow-400': app.status === 'PENDING',
                                             'text-blue-600 dark:text-blue-400': app.status === 'UNDER_REVIEW',
                                             'text-green-600 dark:text-green-400': app.status === 'APPROVED',
                                             'text-red-600 dark:text-red-400': app.status === 'REJECTED'
                                          }">{{ app.status.replace('_', ' ') }}</span>
                         </p>
                      </div>
                   </div>

                   @if (app.status === 'APPROVED') {
                      <button (click)="handleSwitchToInterpreter()" class="w-full py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-xs font-bold rounded-lg transition-colors">
                         Switch to Interpreter View
                      </button>
                   }
                   
                   @else if (app.status === 'REJECTED') {
                      @if (!rejectionDismissed()) {
                        <div class="relative bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-4 mb-2 animate-fade-in">
                           <button (click)="dismissRejection()" 
                                   class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                   title="Dismiss">
                              <i class="ri-close-line"></i>
                           </button>
                           
                           <div class="flex flex-col gap-2">
                              <span class="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                                 <i class="ri-prohibited-line"></i> Not Eligible
                              </span>
                              <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                 Unfortunately, you are not eligible for the interpreter role at this time.
                              </p>
                              @if (app.rejectionReason) {
                                 <div class="text-[11px] bg-white/50 dark:bg-black/20 p-2 rounded text-red-700 dark:text-red-300">
                                    <strong>Reason:</strong> {{ app.rejectionReason }}
                                 </div>
                              }
                           </div>
                        </div>
                      }
                   }

                   @else if (app.status === 'CHANGES_REQUESTED') {
                      <div class="text-xs bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg text-yellow-700 dark:text-yellow-400 mb-3 border border-yellow-100 dark:border-yellow-900/30">
                         <strong>Action Required:</strong> {{ app.rejectionReason || 'Please review requested changes.' }}
                      </div>
                      <button [routerLink]="['/interpreters/apply']" class="w-full py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-xs font-bold rounded-lg transition-colors">
                         Update Application
                      </button>
                   }
                </div>
             } 
             @else if (!loadingApp() && !application()) {
                <div class="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group">
                   <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                   <h3 class="font-bold text-lg relative z-10">Are you an Interpreter?</h3>
                   <p class="text-indigo-200 text-xs mt-2 relative z-10 mb-4 leading-relaxed">
                      Join Verbrix to offer your services to other medical professionals.
                   </p>
                   <button [routerLink]="['/interpreters/apply']" class="relative z-10 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
                      Apply Now <i class="ri-arrow-right-line"></i>
                   </button>
                </div>
             }

             <div class="bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                   <i class="ri-lightbulb-flash-line text-yellow-500"></i> Client Tips
                </h3>
                <ul class="space-y-3">
                   <li class="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                      <div class="w-1 h-1 bg-gray-400 rounded-full mt-1.5"></div>
                      <span>Ensure payment methods are up to date before booking.</span>
                   </li>
                   <li class="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                      <div class="w-1 h-1 bg-gray-400 rounded-full mt-1.5"></div>
                      <span>Consultations are billed per minute after connection.</span>
                   </li>
                </ul>
             </div>

          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ClientDashboard implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private realtime = inject(RealtimeService); 
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private readonly API_URL = environment.apiBaseUrl;
  private realtimeSub?: Subscription;

  application = signal<ApplicationStatusResponse | null>(null);
  myRelationships = signal<Relationship[]>([]);
  
  loadingApp = signal(true);
  loadingRels = signal(true);
  rejectionDismissed = signal(false);

  ngOnInit(): void {
    if (!this.authService.getAccessToken()) {
        console.warn('Dashboard initialized without token. Waiting...');
        return; 
    }

    this.fetchApplicationStatus();
    this.fetchRelationships();
    this.subscribeToRealtime();
  }

  ngOnDestroy(): void {
    this.realtimeSub?.unsubscribe();
  }

  fetchApplicationStatus() {
    this.loadingApp.set(true);
    
    this.http.get<ApplicationStatusResponse>(`${this.API_URL}/api/v1/interpreters/me/status`)
      .subscribe({
        next: (data) => {
          this.application.set(data);
          if (data && data.status === 'REJECTED') {
            this.checkRejectionDismissal(data.applicationId);
          }
          this.loadingApp.set(false);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 404) {
            this.application.set(null);
          } else {
            console.error('Failed to fetch application status', err);
            this.application.set(null);
          }
          this.loadingApp.set(false);
        }
      });
  }

  fetchRelationships(): void {
    this.loadingRels.set(true);
    
    this.http.get<Relationship[]>(`${this.API_URL}/api/v1/relationships/mine`)
      .pipe(
        catchError((err) => {
          console.error('Error fetching relationships:', err);
          return of([]);
        }),
        finalize(() => this.loadingRels.set(false))
      )
      .subscribe(rels => {
        this.myRelationships.set(rels || []);
      });
  }

  getStatusStyles(status: string): string {
    switch (status) {
      case 'REQUESTED': 
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'REQUEST_ACCEPTED': 
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'CONSULTATION_ACTIVE': 
      case 'AGREEMENT_ACTIVE':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      default: 
        return 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  }

  getStatusBorder(status: string): string {
    switch (status) {
      case 'REQUESTED': return 'bg-yellow-400';
      case 'REQUEST_ACCEPTED': return 'bg-blue-500';
      case 'CONSULTATION_ACTIVE': 
      case 'AGREEMENT_ACTIVE': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  }

  handleSwitchToInterpreter() {
    window.location.reload(); 
  }

  // --- Rejection Dismissal Logic ---

  checkRejectionDismissal(appId: string) {
    if (isPlatformBrowser(this.platformId)) {
        const dismissed = localStorage.getItem(`verbrix_rejection_dismissed_${appId}`);
        this.rejectionDismissed.set(!!dismissed);
    }
  }

  dismissRejection() {
    const app = this.application();
    if (app && isPlatformBrowser(this.platformId)) {
        localStorage.setItem(`verbrix_rejection_dismissed_${app.applicationId}`, 'true');
        this.rejectionDismissed.set(true);
    }
  }

  // ---------------------------------

  private subscribeToRealtime(): void {
    this.realtimeSub = this.realtime.events$.subscribe(event => {
      if (!event) return;
      
      const refreshEvents = [
        'RELATIONSHIP_REQUEST_RESPONSE', 
        'CONSULTATION_STARTED', 
        'AGREEMENT_ACTIVATED',
        'RELATIONSHIP_TERMINATED',
        'APPLICATION_STATUS_CHANGED' 
      ];

      if (refreshEvents.includes(event.type)) {
        this.fetchRelationships();
        if (event.type === 'APPLICATION_STATUS_CHANGED') {
           this.fetchApplicationStatus();
        }
      }
    });
  }
}