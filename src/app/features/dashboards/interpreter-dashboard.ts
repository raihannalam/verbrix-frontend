import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Navbar } from "../layout/navbar";
import { HttpClient } from '@angular/common/http';
import { RealtimeService } from '../../core/realtime/realtime.service';
import { Subscription, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RouterLink } from '@angular/router'; // <--- 1. Import RouterLink

// Interface matching your Java DTO exactly
export interface RelationshipResponse {
  relationshipId: number;
  clientId: number;         // Needed for chat targeting
  clientName: string;
  interpreterId: number;
  interpreterName: string; 
  status: 'REQUESTED' | 'REQUEST_ACCEPTED' | 'CONSULTATION_ACTIVE' | 'AGREEMENT_ACTIVE' | 'TERMINATED';
  initialMessage?: string; 
  createdAt: string;
}

@Component({
  selector: 'app-interpreter-dashboard',
  standalone: true,
  imports: [Navbar, CommonModule, DatePipe, RouterLink], // <--- 2. Add to imports
  template: `
    <app-navbar></app-navbar>

    <div class="min-h-screen bg-gray-50/50 dark:bg-[#0f1115] pt-24 md:pt-36 px-4 md:px-8 pb-12 transition-colors duration-300">
      
      <div class="max-w-5xl mx-auto">
        
        <div class="mb-10 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
              Interpreter Portal
            </h1>
            <p class="text-gray-500 dark:text-gray-400 text-lg">
              Manage incoming requests and active client connections.
            </p>
          </div>

          <div class="px-4 py-2 bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-xl flex items-center gap-3 shadow-sm">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span class="text-sm font-bold text-gray-700 dark:text-gray-300">Online for Work</span>
          </div>
        </div>

        <div class="mb-8 flex p-1 bg-gray-200/50 dark:bg-gray-800/50 rounded-xl w-fit animate-fade-in">
          <button (click)="viewMode.set('requests')"
                  [class]="viewMode() === 'requests' 
                    ? 'bg-white dark:bg-[#181a1f] text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
                  class="px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
            Incoming Requests
            @if (incomingRequests().length > 0) {
              <span class="bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                {{ incomingRequests().length }}
              </span>
            }
          </button>
          <button (click)="viewMode.set('active')"
                  [class]="viewMode() === 'active' 
                    ? 'bg-white dark:bg-[#181a1f] text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
                  class="px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
            Active Clients
          </button>
        </div>

        @if (viewMode() === 'requests') {
          <div class="space-y-4 animate-slide-up">
            
            <div class="flex justify-between items-center mb-2">
               <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider">
                 Queue ({{ incomingRequests().length }})
               </h3>
               <button (click)="loadIncomingRequests()" class="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <i class="ri-refresh-line"></i> Refresh
               </button>
            </div>

            @if (isLoading()) {
              <div class="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
            } @else if (incomingRequests().length === 0) {
              <div class="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
                <div class="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mb-4">
                  <i class="ri-inbox-line text-2xl"></i>
                </div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">No Pending Requests</h3>
              </div>
            } @else {
              @for (req of incomingRequests(); track req.relationshipId) {
                <div class="group bg-white dark:bg-[#181a1f] border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <div class="flex flex-col md:flex-row gap-6">
                    <div class="relative shrink-0 hidden md:flex flex-col items-center">
                      <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center text-purple-600 dark:text-purple-300 text-2xl font-bold">
                        {{ req.clientName.charAt(0) }}
                      </div>
                      <span class="mt-2 text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">New</span>
                    </div>

                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-start mb-2">
                        <div>
                          <h3 class="text-xl font-bold text-gray-900 dark:text-white truncate">{{ req.clientName }}</h3>
                          <p class="text-xs text-gray-500 dark:text-gray-400">{{ req.createdAt | date:'medium' }}</p>
                        </div>
                        <span class="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">#{{ req.relationshipId }}</span>
                      </div>

                      @if (req.initialMessage) {
                        <div class="my-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 p-4 rounded-xl relative">
                          <i class="ri-double-quotes-l absolute top-3 left-3 text-blue-300 dark:text-blue-700 text-xl"></i>
                          <p class="pl-6 text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">"{{ req.initialMessage }}"</p>
                        </div>
                      }

                      <div class="flex flex-col sm:flex-row gap-3 mt-4">
                        <button (click)="handleResponse(req.relationshipId, 'ACCEPT')" 
                                [disabled]="isProcessing() === req.relationshipId"
                                class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                          @if(isProcessing() === req.relationshipId) {
                            <i class="ri-loader-4-line animate-spin"></i>
                          } @else {
                            <i class="ri-check-line"></i>
                          }
                          Accept Request
                        </button>
                        <button (click)="handleResponse(req.relationshipId, 'DECLINE')"
                                [disabled]="isProcessing() === req.relationshipId"
                                class="flex-1 py-3 bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold text-sm transition-all">
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              }
            }
          </div>
        }

        @if (viewMode() === 'active') {
          <div class="grid grid-cols-1 gap-4 animate-slide-up">
            @if (activeRelationships().length === 0) {
                <div class="text-center py-10 text-gray-500 dark:text-gray-400">
                    No active clients found. Accept a request to get started.
                </div>
            }
            
            @for (rel of activeRelationships(); track rel.relationshipId) {
              <div class="bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                   <div class="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-lg">
                      {{ rel.clientName.charAt(0) }}
                   </div>
                   <div>
                      <h4 class="font-bold text-gray-900 dark:text-white">{{ rel.clientName }}</h4>
                      <div class="flex items-center gap-2 text-xs mt-1">
                        <span class="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500">
                            {{ rel.status.replace('_', ' ') }}
                        </span>
                        <span class="text-gray-400">ID: #{{ rel.relationshipId }}</span>
                      </div>
                   </div>
                </div>
                
                <button routerLink="/messages" 
                        [queryParams]="{ relationshipId: rel.relationshipId, recipientId: rel.clientName }"
                        class="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto">
                    <i class="ri-message-3-line"></i> Chat
                </button>
              </div>
            }
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class InterpreterDashboard implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private realtime = inject(RealtimeService);
  private apiUrl = `${environment.apiUrl}/relationships`;
  private realtimeSub?: Subscription;

  viewMode = signal<'requests' | 'active'>('requests');
  incomingRequests = signal<RelationshipResponse[]>([]);
  activeRelationships = signal<RelationshipResponse[]>([]);
  isLoading = signal(true);
  isProcessing = signal<number | null>(null);

  ngOnInit() {
    this.loadIncomingRequests();
    this.loadActiveRelationships();
    this.subscribeToRealtime();
  }

  ngOnDestroy() {
    this.realtimeSub?.unsubscribe();
  }

  loadIncomingRequests() {
    this.isLoading.set(true);
    this.http.get<RelationshipResponse[]>(`${this.apiUrl}/requests/incoming`)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.incomingRequests.set(data),
        error: (err) => console.error(err)
      });
  }

  loadActiveRelationships() {
    this.http.get<RelationshipResponse[]>(`${this.apiUrl}/mine`)
      .subscribe({
        next: (data) => this.activeRelationships.set(data),
        error: (err) => console.error(err)
      });
  }

  handleResponse(id: number, actionStr: 'ACCEPT' | 'DECLINE') {
    this.isProcessing.set(id);
    const body = { action: actionStr };

    this.http.patch<RelationshipResponse>(`${this.apiUrl}/${id}/respond`, body)
      .pipe(finalize(() => this.isProcessing.set(null)))
      .subscribe({
        next: (res) => {
          // 1. Remove from incoming
          const updated = this.incomingRequests().filter(r => r.relationshipId !== id);
          this.incomingRequests.set(updated);
          
          if (actionStr === 'ACCEPT') {
             // 2. Add to active list immediately
             this.activeRelationships.update(prev => [res, ...prev]);
             // 3. Switch view so they can click "Chat"
             this.viewMode.set('active'); 
          }
        },
        error: (err) => console.error(err)
      });
  }

  private subscribeToRealtime() {
    this.realtimeSub = this.realtime.events$.subscribe(event => {
      if (!event) return;
      if (event.type === 'RELATIONSHIP_REQUEST_RECEIVED') {
         this.loadIncomingRequests(); 
      }
    });
  }
}