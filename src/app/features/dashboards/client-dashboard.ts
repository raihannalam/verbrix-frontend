import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, of, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Navbar } from '../../features/layout/navbar';
import { RealtimeService } from '../../core/realtime/realtime.service'; 

// --- Interfaces ---

interface ApplicationStatusResponse {
  applicationId: string;
  // FIXED: Added CHANGES_REQUESTED to match backend
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

    <div class="min-h-screen bg-gray-50 dark:bg-[#0f1115] pt-24 pb-12 px-4 sm:px-6 transition-colors duration-300">
      <div class="max-w-6xl mx-auto space-y-10">
        
        <div class="animate-fade-in">
          <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
            Client Dashboard
          </h1>
          <p class="text-gray-500 dark:text-gray-400 text-lg">
            Manage your medical team and professional profile.
          </p>
        </div>

        <div class="animate-slide-up" [style.animation-delay]="'100ms'">
            
            @if (loadingApp()) {
                <div class="h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
            }
            
            @else if (application(); as app) {
              <div class="bg-white dark:bg-[#181a1f] rounded-2xl border p-6 shadow-sm transition-all"
                   [ngClass]="{
                     'border-yellow-400/50 bg-yellow-50/10': app.status === 'PENDING',
                     'border-blue-400/50 bg-blue-50/10': app.status === 'UNDER_REVIEW',
                     'border-orange-400/50 bg-orange-50/10': app.status === 'CHANGES_REQUESTED',
                     'border-red-400/50 bg-red-50/10': app.status === 'REJECTED',
                     'border-green-400/50 bg-green-50/10': app.status === 'APPROVED'
                   }">
                
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div class="space-y-3 w-full md:w-auto">
                    <div class="flex items-center gap-3">
                      <h2 class="text-lg font-bold text-gray-900 dark:text-white">Interpreter Application</h2>
                      <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                            [ngClass]="{
                              'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400': app.status === 'PENDING',
                              'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400': app.status === 'UNDER_REVIEW',
                              'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400': app.status === 'CHANGES_REQUESTED',
                              'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400': app.status === 'REJECTED',
                              'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400': app.status === 'APPROVED'
                            }">
                        {{ app.status.replace('_', ' ') }}
                      </span>
                    </div>
                    
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      Submitted on <span class="font-semibold">{{ app.submittedAt | date:'mediumDate' }}</span>
                    </p>

                    @if ((app.status === 'REJECTED' || app.status === 'CHANGES_REQUESTED') && app.rejectionReason) {
                      <div class="mt-3 p-4 rounded-lg border flex items-start gap-3 max-w-2xl"
                           [ngClass]="{
                             'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800/30': app.status === 'REJECTED',
                             'bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:border-orange-800/30': app.status === 'CHANGES_REQUESTED'
                           }">
                        <i class="mt-0.5 text-lg" 
                           [ngClass]="{
                             'ri-error-warning-fill text-red-500': app.status === 'REJECTED',
                             'ri-alert-fill text-orange-500': app.status === 'CHANGES_REQUESTED'
                           }"></i>
                        <div>
                           <span class="block text-xs font-bold uppercase mb-1"
                                 [ngClass]="{
                                   'text-red-700 dark:text-red-400': app.status === 'REJECTED',
                                   'text-orange-700 dark:text-orange-400': app.status === 'CHANGES_REQUESTED'
                                 }">
                                 Reviewer Feedback
                           </span>
                           <span class="text-sm text-gray-800 dark:text-gray-200 leading-relaxed block">
                             {{ app.rejectionReason }}
                           </span>
                        </div>
                      </div>
                    }
                  </div>

                  <div class="flex items-center gap-3 self-end md:self-center mt-2 md:mt-0">
                    
                    @if (app.status === 'CHANGES_REQUESTED') {
                      <button [routerLink]="['/interpreters/apply']" 
                              class="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-600/20 transition-all flex items-center gap-2">
                        <i class="ri-edit-2-line"></i> Update & Resubmit
                      </button>
                    } 
                    
                    @else if (app.status === 'REJECTED') {
                      <button [routerLink]="['/interpreters/apply']" 
                              class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all flex items-center gap-2">
                        <i class="ri-refresh-line"></i> Apply Again
                      </button>
                    } 
                    
                    @else if (app.status === 'APPROVED') {
                      <button (click)="handleSwitchToInterpreter()" 
                              class="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-600/20 transition-all flex items-center gap-2">
                        Switch Dashboard <i class="ri-arrow-right-line"></i>
                      </button>
                    }

                  </div>
                </div>
              </div>
            } 
            
            @else {
              <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-xl p-8 group">
                <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 transition-transform group-hover:scale-110 duration-700"></div>
                
                <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3 border border-white/10">
                      <i class="ri-translate-2"></i> Join the Team
                    </div>
                    <h2 class="text-2xl font-bold mb-2">Become a Verbrix Interpreter</h2>
                    <p class="text-blue-100 max-w-lg">
                      Are you fluent in multiple languages? Apply now to start accepting consultation requests and earning on your own schedule.
                    </p>
                  </div>
                  <button [routerLink]="['/interpreters/apply']" 
                          class="px-6 py-3 bg-white text-blue-700 rounded-xl font-bold shadow-lg hover:bg-blue-50 hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap">
                    Start Application <i class="ri-arrow-right-line"></i>
                  </button>
                </div>
              </div>
            }
        </div>

        <div class="border-t border-gray-200 dark:border-gray-800"></div>

        <div class="animate-slide-up" [style.animation-delay]="'200ms'">
           <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">My Interpreters</h2>
              <button routerLink="/interpreters/find" 
                      class="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                 Find New <i class="ri-arrow-right-line"></i>
              </button>
           </div>

           @if (loadingRels()) {
             <div class="space-y-4">
               <div class="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
               <div class="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
             </div>
           } @else {
             <div class="space-y-4">
               @for (rel of myRelationships(); track rel.id) {
                 <div class="group bg-white dark:bg-[#181a1f] border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-center gap-5">
                   
                   <div class="relative shrink-0">
                      <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/20 flex items-center justify-center text-blue-600 dark:text-blue-300 text-xl font-bold border border-white dark:border-gray-700 shadow-sm">
                        {{ rel.interpreterName.charAt(0) }}
                      </div>
                      <div class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#181a1f]"
                           [ngClass]="{
                             'bg-green-500': rel.status === 'CONSULTATION_ACTIVE' || rel.status === 'AGREEMENT_ACTIVE',
                             'bg-yellow-400': rel.status === 'REQUESTED',
                             'bg-blue-500': rel.status === 'REQUEST_ACCEPTED',
                             'bg-gray-400': rel.status === 'TERMINATED'
                           }">
                      </div>
                   </div>

                   <div class="flex-1 text-center md:text-left min-w-0">
                     <div class="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                       <h3 class="text-lg font-bold text-gray-900 dark:text-white truncate">
                         {{ rel.interpreterName }}
                       </h3>
                       <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border w-fit mx-auto md:mx-0"
                             [ngClass]="getStatusStyles(rel.status)">
                         {{ rel.status.replace('_', ' ') }}
                       </span>
                     </div>
                     <p class="text-gray-500 dark:text-gray-400 text-xs mt-1">
                       Connected: {{ rel.createdAt | date:'mediumDate' }}
                     </p>
                   </div>

                   <div class="flex items-center gap-2 w-full md:w-auto">
                     <button routerLink="/messages" 
                             [queryParams]="{ recipientId: rel.id }"
                             class="flex-1 md:flex-none px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 font-semibold rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-1.5">
                       <i class="ri-message-3-line"></i> Chat
                     </button>
                     
                     @if(rel.status === 'AGREEMENT_ACTIVE' || rel.status === 'CONSULTATION_ACTIVE') {
                         <button class="flex-1 md:flex-none px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-1.5">
                           <i class="ri-calendar-event-line"></i> Book
                         </button>
                     }
                   </div>
                 </div>
               }

               @if (myRelationships().length === 0) {
                 <div class="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center bg-gray-50/50 dark:bg-gray-900/50">
                    <div class="w-12 h-12 mx-auto bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mb-3 shadow-sm">
                      <i class="ri-user-search-line text-xl"></i>
                    </div>
                    <h3 class="text-base font-bold text-gray-900 dark:text-white">No active interpreters</h3>
                    <p class="text-gray-500 dark:text-gray-400 text-sm mt-1 mb-4">
                      Find a specialist to help with your medical consultations.
                    </p>
                    <button routerLink="/interpreters/find" class="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                      Browse Interpreters
                    </button>
                 </div>
               }
             </div>
           }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ClientDashboard implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private realtime = inject(RealtimeService); 
  private readonly API_URL = environment.apiUrl;
  private realtimeSub?: Subscription;

  application = signal<ApplicationStatusResponse | null>(null);
  myRelationships = signal<Relationship[]>([]);
  
  loadingApp = signal(true);
  loadingRels = signal(true);

  ngOnInit(): void {
    this.fetchApplicationStatus();
    this.fetchRelationships();
    this.subscribeToRealtime();
  }

  ngOnDestroy(): void {
    this.realtimeSub?.unsubscribe();
  }

  fetchApplicationStatus() {
    this.loadingApp.set(true);
    this.http.get<ApplicationStatusResponse>(`${this.API_URL}/interpreters/me/status`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (data) => {
          this.application.set(data);
          this.loadingApp.set(false);
        },
        error: (err) => {
          this.application.set(null);
          this.loadingApp.set(false);
        }
      });
  }

  fetchRelationships(): void {
    this.loadingRels.set(true);
    this.http.get<Relationship[]>(`${this.API_URL}/relationships/mine`, { headers: this.getAuthHeaders() })
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
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
      case 'REQUEST_ACCEPTED': 
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
      case 'CONSULTATION_ACTIVE': 
      case 'AGREEMENT_ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  }

  handleSwitchToInterpreter() {
    window.location.reload(); 
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

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