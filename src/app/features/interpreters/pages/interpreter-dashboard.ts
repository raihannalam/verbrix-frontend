import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Navbar } from "../../../layout/navbar/navbar";
import { HttpClient } from '@angular/common/http';
import { RealtimeService } from '../../../core/services/realtime.service';
import { Subscription, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RouterLink } from '@angular/router';

export interface RelationshipResponse {
  relationshipId: number;
  clientId: number;
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
  imports: [Navbar, CommonModule, DatePipe, RouterLink],
  template: `
    <app-navbar></app-navbar>

    <div class="min-h-screen bg-gray-50 dark:bg-[#0f1115] pt-24 md:pt-32 px-4 md:px-8 pb-20 transition-colors duration-300">

      <div class="max-w-6xl mx-auto space-y-8">

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <i class="ri-stethoscope-line text-blue-600 dark:text-blue-400"></i>
              Interpreter Portal
            </h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">Manage your patient consultations and incoming requests.</p>
          </div>

          <div class="flex items-center gap-4">
             <div class="hidden md:flex gap-6 mr-4 border-r border-gray-200 dark:border-gray-800 pr-6">
                <div class="text-right">
                   <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ activeRelationships().length }}</p>
                   <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Patients</p>
                </div>
                <div class="text-right">
                   <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ incomingRequests().length }}</p>
                   <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Triage</p>
                </div>
             </div>

            <div class="px-4 py-2 bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-full flex items-center gap-2 shadow-sm">
              <span class="relative flex h-2.5 w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Online for Consults</span>
            </div>
          </div>
        </div>

        <div class="border-b border-gray-200 dark:border-gray-800">
           <div class="flex gap-8">
              <button (click)="viewMode.set('requests')"
                      class="relative pb-4 text-sm font-semibold transition-all duration-200"
                      [class.text-blue-600]="viewMode() === 'requests'"
                      [class.dark:text-blue-400]="viewMode() === 'requests'"
                      [class.text-gray-500]="viewMode() !== 'requests'"
                      [class.dark:text-gray-400]="viewMode() !== 'requests'">
                  Incoming Requests
                  @if (incomingRequests().length > 0) {
                     <span class="ml-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 py-0.5 px-2 rounded-full text-xs font-bold">
                        {{ incomingRequests().length }}
                     </span>
                  }
                  @if (viewMode() === 'requests') {
                     <span class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full"></span>
                  }
              </button>

              <button (click)="viewMode.set('active')"
                      class="relative pb-4 text-sm font-semibold transition-all duration-200"
                      [class.text-blue-600]="viewMode() === 'active'"
                      [class.dark:text-blue-400]="viewMode() === 'active'"
                      [class.text-gray-500]="viewMode() !== 'active'"
                      [class.dark:text-gray-400]="viewMode() !== 'active'">
                  My Patients
                  @if (viewMode() === 'active') {
                     <span class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full"></span>
                  }
              </button>
           </div>
        </div>

        <div class="min-h-[400px]">

           @if (isLoading()) {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                 @for(i of [1,2,3]; track i) {
                    <div class="h-64 bg-gray-200 dark:bg-[#181a1f] rounded-2xl"></div>
                 }
              </div>
           }

           @else if (viewMode() === 'requests') {
              <div class="animate-fade-in">
                 @if (incomingRequests().length === 0) {
                    <div class="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#181a1f] rounded-3xl border border-gray-100 dark:border-gray-800 text-center">
                       <div class="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                          <i class="ri-check-double-line text-3xl text-gray-400"></i>
                       </div>
                       <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">All caught up</h3>
                       <p class="text-gray-500 dark:text-gray-400 max-w-sm">
                          There are no pending interpretation requests at this moment.
                       </p>
                    </div>
                 } @else {
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                       @for (req of incomingRequests(); track req.relationshipId) {
                          <div class="bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                             <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>

                             <div class="flex items-start justify-between mb-4 pl-3">
                                <div class="flex items-center gap-4">
                                   <div class="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl border border-blue-100 dark:border-blue-800">
                                      {{ req.clientName.charAt(0) }}
                                   </div>
                                   <div>
                                      <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ req.clientName }}</h3>
                                      <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        <i class="ri-time-line"></i>
                                        <span>Requested: {{ req.createdAt | date:'shortTime' }}</span>
                                      </div>
                                   </div>
                                </div>
                                <span class="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                                   New
                                </span>
                             </div>

                             <div class="pl-3 mb-6">
                                <div class="bg-gray-50 dark:bg-[#252830] border border-gray-100 dark:border-gray-800 rounded-xl p-4 relative">
                                   <div class="flex items-start gap-3">
                                     <i class="ri-file-list-3-line text-gray-400 mt-0.5"></i>
                                     <p class="text-sm text-gray-700 dark:text-gray-300 italic">
                                        "{{ req.initialMessage || 'Interpretation assistance required.' }}"
                                     </p>
                                   </div>
                                </div>
                             </div>

                             <div class="flex gap-3 pl-3">
                                <button (click)="handleResponse(req.relationshipId, 'DECLINE')"
                                        [disabled]="isProcessing() === req.relationshipId"
                                        class="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 dark:hover:bg-red-900/10 transition-colors">
                                   Decline
                                </button>
                                <button (click)="handleResponse(req.relationshipId, 'ACCEPT')"
                                        [disabled]="isProcessing() === req.relationshipId"
                                        class="flex-[2] py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all">
                                   @if(isProcessing() === req.relationshipId) {
                                      <i class="ri-loader-4-line animate-spin"></i>
                                   } @else {
                                      <i class="ri-check-line"></i>
                                      Accept Patient
                                   }
                                </button>
                             </div>
                          </div>
                       }
                    </div>
                 }
              </div>
           }

           @else {
              <div class="animate-slide-up">
                 @if (activeRelationships().length === 0) {
                    <div class="flex flex-col items-center justify-center py-20 text-center opacity-60">
                       <i class="ri-user-heart-line text-4xl mb-4 text-gray-400"></i>
                       <p class="text-gray-500 dark:text-gray-400">No active patient consultations.</p>
                       <button (click)="viewMode.set('requests')" class="mt-4 text-blue-600 font-semibold hover:underline">
                          View incoming requests
                       </button>
                    </div>
                 } @else {
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                       @for (rel of activeRelationships(); track rel.relationshipId) {
                          <div class="bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 hover:border-blue-300 dark:hover:border-blue-900 transition-all duration-200 flex flex-col justify-between h-full group">

                             <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center gap-3">
                                   <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold text-lg flex items-center justify-center">
                                      {{ rel.clientName.charAt(0) }}
                                   </div>
                                   <div>
                                      <h4 class="font-bold text-gray-900 dark:text-white truncate max-w-[120px]">{{ rel.clientName }}</h4>
                                      <div class="flex items-center gap-1.5 mt-0.5">
                                         <span class="relative flex h-2 w-2">
                                           <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                           <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                         </span>
                                         <span class="text-xs text-gray-500 dark:text-gray-400">Connected</span>
                                      </div>
                                   </div>
                                </div>
                                <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                   <i class="ri-more-2-fill text-xl"></i>
                                </button>
                             </div>

                             <div class="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button routerLink="/messages"
                                        [queryParams]="{ relationshipId: rel.relationshipId, recipientId: rel.clientName }"
                                        class="w-full py-2.5 bg-gray-50 dark:bg-[#252830] hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10">
                                   <i class="ri-message-3-line"></i>
                                   Open Chat
                                </button>
                             </div>
                          </div>
                       }
                    </div>
                 }
              </div>
           }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
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
    this.initialLoad();
    this.subscribeToRealtime();
  }

  ngOnDestroy() {
    this.realtimeSub?.unsubscribe();
  }

  private initialLoad() {
    this.isLoading.set(true);

    // Load requests first
    this.http.get<RelationshipResponse[]>(`${this.apiUrl}/requests/incoming`)
      .subscribe({
        next: (reqs) => {
           this.incomingRequests.set(reqs);
           // If no requests, default to active view
           if (reqs.length === 0) this.viewMode.set('active');
        },
        error: (e) => console.error('Failed to load requests', e)
      });

    // Load active clients
    this.http.get<RelationshipResponse[]>(`${this.apiUrl}/mine`)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (active) => this.activeRelationships.set(active),
        error: (e) => console.error('Failed to load active patients', e)
      });
  }

  loadIncomingRequests() {
    this.http.get<RelationshipResponse[]>(`${this.apiUrl}/requests/incoming`)
      .subscribe({
        next: (data) => this.incomingRequests.set(data),
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
          const updated = this.incomingRequests().filter(r => r.relationshipId !== id);
          this.incomingRequests.set(updated);

          if (actionStr === 'ACCEPT') {
             this.activeRelationships.update(prev => [res, ...prev]);
             this.viewMode.set('active');
          }
        },
        error: (err) => console.error('Error responding to request', err)
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
