import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, of, Subscription } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Navbar } from '../layout/navbar';
import { FindInterpreterComponent } from '../components/find-interpreter';
import { ChatLayoutComponent } from '../components/chat-layout';
import { RealtimeService } from '../../core/realtime/realtime.service';

interface Relationship {
  id: number;
  clientName: string;
  interpreterName: string;
  status: 'REQUESTED' | 'REQUEST_ACCEPTED' | 'CONSULTATION_ACTIVE' | 'AGREEMENT_ACTIVE' | 'TERMINATED';
  initialMessage?: string;
  createdAt: string;
}

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    Navbar,
    CommonModule,
    RouterLink,
    FindInterpreterComponent,
    ChatLayoutComponent
  ],
  template: `
    <app-navbar class="fixed top-0 left-0 h-[72px] w-full z-50"></app-navbar>

    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-[90px] px-4 md:px-8 pb-12 transition-colors duration-300">
      <div class="max-w-6xl mx-auto space-y-8">

        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Patient Dashboard</h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">Manage your medical interpretation services</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex w-full md:w-auto">
            <button
              (click)="viewMode.set('dashboard')"
              [class]="viewMode() === 'dashboard'
                ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-900/40 dark:text-blue-300'
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50'"
              class="flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2">
              <i class="ri-dashboard-line text-lg"></i> Overview
            </button>

            <button
              (click)="viewMode.set('chat')"
              [class]="viewMode() === 'chat'
                ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-900/40 dark:text-blue-300'
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50'"
              class="flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 relative">
              <i class="ri-message-3-line text-lg"></i> Messages
              @if (activeRelationship()) {
                <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
              }
            </button>
          </div>
        </div>

        @if (loading()) {
          <div class="animate-pulse space-y-8">
            <div class="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div class="lg:col-span-2 h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
              <div class="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
            </div>
          </div>
        } @else {
          
          @if (viewMode() === 'dashboard') {
            <div class="animate-fade-in space-y-8">

              @if (activeRelationship(); as rel) {
                <div class="bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-8 shadow-sm relative overflow-hidden animate-slide-down transition-colors">
                  <div class="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none"></div>
                  
                  <div class="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div class="flex items-center gap-5 w-full md:w-auto">
                      <div class="w-16 h-16 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-300 text-2xl font-bold border-2 border-white dark:border-gray-700 shadow-sm">
                        {{ rel.interpreterName.charAt(0) || '?' }}
                      </div>
                      
                      <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-3 mb-1">
                          <h2 class="text-xl font-bold text-gray-900 dark:text-white truncate">
                            Your Interpreter: {{ rel.interpreterName }}
                          </h2>
                          <span [class]="getStatusColor(rel.status)" class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-current/10 shrink-0">
                            {{ rel.status.replace('_', ' ') }}
                          </span>
                        </div>
                        <p class="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
                          <i class="ri-calendar-check-line"></i> Connected since {{ rel.createdAt | date:'mediumDate' }}
                        </p>
                      </div>
                    </div>

                    <div class="flex gap-3 w-full md:w-auto">
                      <button (click)="viewMode.set('chat')" class="flex-1 md:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2">
                        <i class="ri-chat-3-line"></i> Open Chat
                      </button>
                    </div>
                  </div>

                  <div class="mt-6 p-4 bg-gray-50/80 dark:bg-gray-700/30 backdrop-blur rounded-xl border border-gray-100 dark:border-gray-700/50 text-sm text-gray-600 dark:text-gray-300 flex gap-3 items-start">
                    <i class="ri-information-fill text-blue-500 text-lg mt-0.5 shrink-0"></i>
                    <span class="font-medium leading-relaxed">
                      @switch (rel.status) {
                        @case ('REQUESTED') { Your request is pending. You will be notified once the interpreter accepts. }
                        @case ('REQUEST_ACCEPTED') { Request accepted! Please proceed to payment in the Messages tab to start the consultation. }
                        @case ('CONSULTATION_ACTIVE') { Consultation in progress. All messages and calls are secure and private. }
                        @default { Your connection is active. }
                      }
                    </span>
                  </div>
                </div>
              }

              @else {
                <div class="bg-gradient-to-br from-indigo-600 to-blue-700 dark:from-indigo-900 dark:to-blue-900 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden animate-slide-up">
                  <div class="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                  <div class="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 opacity-20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

                  <div class="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                    <div class="space-y-6">
                      <div class="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider border border-white/30">
                        ✨ Connect with professionals
                      </div>
                      <h2 class="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
                        Find your medical <br/> interpreter today.
                      </h2>
                      <p class="text-blue-100 text-lg max-w-md font-medium leading-relaxed">
                        Bridge the language gap. Search our network of certified interpreters to ensure you get the care you understand and deserve.
                      </p>
                      
                      <div class="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-2xl max-w-lg transform transition-all duration-300">
                         <app-find-interpreter></app-find-interpreter>
                      </div>
                    </div>

                    <div class="hidden lg:block relative pointer-events-none select-none">
                        <div class="grid grid-cols-2 gap-4">
                           <div class="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                              <div class="text-3xl font-bold">24/7</div>
                              <div class="text-sm opacity-80 font-medium">Availability</div>
                           </div>
                           <div class="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 translate-y-8">
                              <div class="text-3xl font-bold">100%</div>
                              <div class="text-sm opacity-80 font-medium">Verified Pros</div>
                           </div>
                        </div>
                    </div>
                  </div>
                </div>
              }

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group cursor-default">
                     <div class="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Appointments</div>
                     <div class="text-3xl font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">0</div>
                  </div>
                  <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group cursor-default">
                     <div class="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Documents</div>
                     <div class="text-3xl font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">0</div>
                  </div>
                  <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group cursor-default">
                     <div class="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Invoices</div>
                     <div class="text-3xl font-extrabold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">0</div>
                  </div>
                </div>

                <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex flex-col justify-between hover:border-gray-300 dark:hover:border-gray-600 transition-colors shadow-sm">
                  <div>
                     <h3 class="font-bold text-gray-900 dark:text-white">Become an Interpreter</h3>
                     <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Join our network of professionals.</p>
                  </div>
                  <div class="mt-4">
                     @if (appStatus()) {
                       <div class="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 text-center border border-gray-200 dark:border-gray-600">
                         Status: <span class="uppercase text-blue-600 dark:text-blue-400">{{ appStatus()?.status }}</span>
                       </div>
                     } @else {
                       <a routerLink="/interpreters/apply" class="block w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-center rounded-xl text-sm font-bold hover:bg-black dark:hover:bg-gray-200 transition-all shadow-lg shadow-gray-900/20 dark:shadow-white/10 active:scale-95">
                         Apply Now
                       </a>
                     }
                  </div>
                </div>
              </div>

            </div>
          } 
          
          @else {
            <app-chat-layout class="block h-[calc(100vh-140px)] animate-fade-in border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden"></app-chat-layout>
          }
        }

      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    .animate-slide-down { animation: slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
    .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ClientDashboard implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private realtime = inject(RealtimeService);
  private readonly API_URL = environment.apiUrl;
  private realtimeSub?: Subscription;

  // Signals
  viewMode = signal<'dashboard' | 'chat'>('dashboard');
  appStatus = signal<any>(null);
  activeRelationship = signal<Relationship | null>(null);
  
  // Start loading true, handled safely in fetchData
  loading = signal(true);

  ngOnInit(): void {
    this.fetchData();
    this.subscribeToRealtime();
  }

  ngOnDestroy(): void {
    this.realtimeSub?.unsubscribe();
  }

  fetchData(): void {
    this.loading.set(true);
    
    // 1. Fetch Application Status (for sidebar widget)
    this.http.get(`${this.API_URL}/interpreters/me/status`)
      .pipe(catchError(() => of(null)))
      .subscribe(status => this.appStatus.set(status));

    // 2. Fetch Active Relationships
    this.http.get<Relationship[]>(`${this.API_URL}/relationships/mine`)
      .pipe(
        // Handle errors gracefully and ensure stream continues
        catchError((err) => {
          console.error('Failed to fetch relationships:', err);
          return of([]); // Return empty array to keep type safety
        }),
        // Ensure loading is turned off regardless of success or failure
        finalize(() => this.loading.set(false))
      )
      .subscribe(rels => {
        // Safe check for array existence and length
        if (rels && Array.isArray(rels) && rels.length > 0) {
          this.activeRelationship.set(rels[0]);
        } else {
          this.activeRelationship.set(null);
        }
      });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'REQUESTED': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
      case 'REQUEST_ACCEPTED': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      case 'CONSULTATION_ACTIVE': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  }

  private subscribeToRealtime(): void {
    this.realtimeSub = this.realtime.events$.subscribe(event => {
      if (!event) return;
      
      const refreshEvents = [
        'RELATIONSHIP_REQUEST_RESPONSE', 
        'CONSULTATION_STARTED', 
        'AGREEMENT_ACTIVATED'
      ];

      if (refreshEvents.includes(event.type)) {
        this.fetchData();
      }
    });
  }
}