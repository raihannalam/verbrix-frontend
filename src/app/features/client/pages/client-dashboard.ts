import { Component, inject, OnInit, OnDestroy, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { catchError, finalize, of, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Navbar } from '../../../layout/navbar/navbar';
import { RealtimeService } from '../../../core/services/realtime.service';
import { AuthService } from '../../../core/auth/auth.service';

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

    <div class="min-h-screen bg-[#f8fafc] dark:bg-[#0b0c0f] pt-24 pb-12 px-4 sm:px-6 transition-colors duration-300">
      <div class="max-w-7xl mx-auto">

        <div class="mb-8 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Client Portal
            </h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Manage your medical consultations and interpreter connections.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div class="lg:col-span-2 space-y-6 animate-slide-up">

            <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <i class="ri-heart-pulse-line text-blue-500"></i> Active Consultations
                <span class="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
                     {{ myRelationships().length }}
                   </span>
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
                    <div class="absolute left-0 top-0 bottom-0 w-1.5" [ngClass]="getStatusBorder(rel.status)"></div>

                    <div class="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                      <div class="relative shrink-0">
                        <div class="w-16 h-16 rounded-full bg-blue-50 dark:bg-gray-800 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xl font-bold border border-blue-100 dark:border-gray-700">
                          {{ rel.interpreterName.charAt(0) }}
                        </div>
                        <div class="absolute bottom-0 right-0 w-4 h-4 border-2 border-white dark:border-[#181a1f] rounded-full bg-green-500"></div>
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
                        <p class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <i class="ri-calendar-check-line"></i> Connected {{ rel.createdAt | date:'mediumDate' }}
                        </p>
                      </div>

                      <div class="flex items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                        <button routerLink="/messages"
                                [queryParams]="{ recipientId: rel.id }"
                                class="flex-1 sm:flex-none px-5 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                          <i class="ri-chat-3-line"></i> Message
                        </button>
                      </div>
                    </div>
                  </div>
                }

                @if (myRelationships().length === 0) {
                  <div class="bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-3xl p-10 text-center shadow-sm">
                    <div class="w-20 h-20 mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-500 mb-5">
                      <i class="ri-stethoscope-line text-4xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">Require a Medical Interpreter?</h3>
                    <p class="text-gray-500 dark:text-gray-400 text-sm mt-2 mb-8 max-w-md mx-auto leading-relaxed">
                      Connect instantly with certified medical interpreters to bridge language gaps and ensure optimal patient care.
                    </p>
                    <button routerLink="/interpreters/find" class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mx-auto">
                      <i class="ri-search-line"></i> Find an Interpreter
                    </button>
                  </div>
                }
              </div>
            }
          </div>

          <div class="space-y-6">

            @if (!loadingApp() && application(); as app) {
              <div class="bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm animate-fade-in">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Professional Profile</h3>

                <div class="flex items-start gap-3 mb-5">
                  <div class="mt-0.5 p-2 rounded-lg"
                       [ngClass]="{
                               'bg-yellow-50 dark:bg-yellow-900/20': app.status === 'PENDING',
                               'bg-blue-50 dark:bg-blue-900/20': app.status === 'UNDER_REVIEW',
                               'bg-green-50 dark:bg-green-900/20': app.status === 'APPROVED',
                               'bg-red-50 dark:bg-red-900/20': app.status === 'REJECTED'
                           }">
                    <i class="ri-file-user-line text-xl"
                       [ngClass]="{
                               'text-yellow-600 dark:text-yellow-400': app.status === 'PENDING',
                               'text-blue-600 dark:text-blue-400': app.status === 'UNDER_REVIEW',
                               'text-green-600 dark:text-green-400': app.status === 'APPROVED',
                               'text-red-600 dark:text-red-400': app.status === 'REJECTED'
                            }"></i>
                  </div>
                  <div>
                    <p class="font-bold text-gray-900 dark:text-white">Interpreter Status</p>
                    <p class="text-sm font-semibold mt-1"
                       [ngClass]="{
                               'text-yellow-600 dark:text-yellow-400': app.status === 'PENDING',
                               'text-blue-600 dark:text-blue-400': app.status === 'UNDER_REVIEW',
                               'text-green-600 dark:text-green-400': app.status === 'APPROVED',
                               'text-red-600 dark:text-red-400': app.status === 'REJECTED'
                            }">{{ app.status.replace('_', ' ') }}</p>
                  </div>
                </div>

                @if (app.status === 'APPROVED') {
                  <button (click)="handleSwitchToInterpreter()" class="w-full py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm font-bold rounded-xl transition-colors shadow-sm">
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
                              <span class="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                                 <i class="ri-prohibited-line"></i> Not Eligible
                              </span>
                        <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          Unfortunately, you are not eligible for the interpreter role at this time.
                        </p>
                        @if (app.rejectionReason) {
                          <div class="text-[11px] bg-white/50 dark:bg-black/20 p-2.5 rounded-lg text-red-700 dark:text-red-300 mt-1 border border-red-100 dark:border-red-900/20">
                            <strong>Reason:</strong> {{ app.rejectionReason }}
                          </div>
                        }
                      </div>
                    </div>
                  }
                }
                @else if (app.status === 'CHANGES_REQUESTED') {
                  <div class="text-xs bg-yellow-50 dark:bg-yellow-900/10 p-3.5 rounded-xl text-yellow-700 dark:text-yellow-400 mb-4 border border-yellow-200 dark:border-yellow-900/30">
                    <strong>Action Required:</strong> {{ app.rejectionReason || 'Please review requested changes.' }}
                  </div>
                  <button [routerLink]="['/interpreters/apply']" class="w-full py-2.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600 text-sm font-bold rounded-xl transition-colors">
                    Update Application
                  </button>
                }
              </div>
            }
            @else if (!loadingApp() && !application()) {
              <div class="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <h3 class="font-bold text-lg relative z-10 flex items-center gap-2">
                  <i class="ri-translate-2 text-blue-300"></i> Are you an Interpreter?
                </h3>
                <p class="text-blue-100 text-sm mt-2 relative z-10 mb-5 leading-relaxed">
                  Provide certified medical interpretation services on Verbrix.
                </p>
                <button [routerLink]="['/interpreters/apply']" class="relative z-10 w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                  Apply Now <i class="ri-arrow-right-line"></i>
                </button>
              </div>
            }

            <div class="bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <i class="ri-information-line text-blue-500 text-lg"></i> Medical Guidelines
              </h3>
              <ul class="space-y-4">
                <li class="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div class="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 shrink-0"></div>
                  <span class="leading-relaxed">Verify patient consent before initiating an interpreted consultation.</span>
                </li>
                <li class="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div class="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 shrink-0"></div>
                  <span class="leading-relaxed">All medical interpretation sessions are strictly confidential and HIPAA-compliant.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
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
          if (err.status !== 404) {
            console.error('Failed to fetch application status', err);
          }
          this.application.set(null);
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
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800';
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
      case 'REQUEST_ACCEPTED': return 'bg-indigo-500';
      case 'CONSULTATION_ACTIVE':
      case 'AGREEMENT_ACTIVE': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  }

  handleSwitchToInterpreter() {
    window.location.reload();
  }

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
