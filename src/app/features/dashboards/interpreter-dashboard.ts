import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from "../layout/navbar";
import { ChatService } from '../../core/services/chat.service';
import { ChatLayoutComponent } from "../components/chat-layout";
import { RealtimeService } from '../../core/realtime/realtime.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-interpreter-dashboard',
  standalone: true,
  imports: [Navbar, CommonModule, ChatLayoutComponent],
  template: `
    <app-navbar class="fixed top-0 left-0 h-[72px] w-full z-50"></app-navbar>

    <div class="min-h-screen bg-gray-50 pt-[90px] px-4 md:px-8 pb-12">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Interpreter Portal</h1>
            <p class="text-gray-500 mt-1">Manage incoming requests and active sessions.</p>
          </div>

          <div class="flex items-center gap-4">
            <div class="flex bg-gray-100 p-1 rounded-xl">
              <button (click)="viewMode.set('requests')" 
                      [class]="viewMode() === 'requests' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'"
                      class="px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
                <i class="ri-notification-3-line"></i> Requests
                @if (requestCount() > 0) {
                  <span class="bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full">{{ requestCount() }}</span>
                }
              </button>
              <button (click)="viewMode.set('chat')" 
                      [class]="viewMode() === 'chat' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'"
                      class="px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
                <i class="ri-message-3-line"></i> Messages
              </button>
            </div>

            <div class="hidden md:flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl font-bold text-sm">
              <span class="relative flex h-2.5 w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              Online
            </div>
          </div>
        </div>

        @if (viewMode() === 'requests') {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            
            <div class="lg:col-span-2 space-y-4">
              <div class="flex justify-between items-center">
                <h2 class="font-bold text-gray-800 text-lg">Incoming Job Requests</h2>
                <button (click)="loadData()" class="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <i class="ri-refresh-line"></i> Refresh
                </button>
              </div>
              
              @if (isLoading()) {
                <div class="flex justify-center py-12">
                  <div class="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              } @else if (incomingRequests().length === 0) {
                <div class="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
                  <div class="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                    <i class="ri-inbox-archive-line text-3xl"></i>
                  </div>
                  <h3 class="text-gray-900 font-bold text-lg">No Pending Requests</h3>
                  <p class="text-gray-500 text-sm mt-1 max-w-xs mx-auto">You're all caught up! Keep this page open to receive real-time notifications for new jobs.</p>
                </div>
              } @else {
                <div class="space-y-4">
                  @for (req of incomingRequests(); track req.relationshipId) {
                    <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                      <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div class="flex gap-4 w-full">
                          <div class="h-12 w-12 bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-xl shadow-inner">
                            {{ req.clientName?.charAt(0) || 'C' }}
                          </div>
                          <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-start">
                              <h3 class="font-bold text-gray-900 text-lg truncate">{{ req.clientName || 'Anonymous Client' }}</h3>
                              <span class="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">New</span>
                            </div>
                            <p class="text-xs text-gray-500 mb-3 flex items-center gap-2">
                              <i class="ri-time-line"></i> {{ req.createdAt | date:'shortTime' }} 
                              <span class="text-gray-300">|</span> 
                              ID: #{{ req.relationshipId }}
                            </p>
                            
                            @if (req.initialMessage) {
                              <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-700 text-sm relative">
                                <i class="ri-chat-quote-line absolute top-2 right-2 text-gray-300 text-lg"></i>
                                "{{ req.initialMessage }}"
                              </div>
                            }
                          </div>
                        </div>
                        
                        <div class="flex flex-row sm:flex-col gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:min-w-[140px]">
                          <button (click)="handleResponse(req.relationshipId, 'ACCEPT')" 
                                  [disabled]="isProcessing() === req.relationshipId"
                                  class="flex-1 sm:w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                            @if(isProcessing() === req.relationshipId) {
                              <i class="ri-loader-4-line animate-spin"></i>
                            } @else {
                              <i class="ri-check-line"></i>
                            }
                            Accept
                          </button>
                          <button (click)="handleResponse(req.relationshipId, 'DECLINE')"
                                  [disabled]="isProcessing() === req.relationshipId"
                                  class="flex-1 sm:w-full py-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-xl font-bold text-sm disabled:opacity-50 transition-all active:scale-95">
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <div class="lg:col-span-1 space-y-6">
               <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                 <div class="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                 <h3 class="font-bold text-blue-100 mb-1 text-sm uppercase tracking-wide">Earnings Today</h3>
                 <p class="text-4xl font-extrabold">$0.00</p>
                 <div class="mt-4 pt-4 border-t border-white/20 flex justify-between items-center text-sm font-medium">
                   <span>0 Jobs Completed</span>
                   <i class="ri-arrow-right-line"></i>
                 </div>
               </div>
               
               <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                 <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
                   <i class="ri-lightbulb-flash-line text-yellow-500"></i> Quick Tips
                 </h3>
                 <ul class="space-y-3 text-sm text-gray-600">
                   <li class="flex gap-3 items-start">
                     <div class="mt-0.5 min-w-[16px]"><i class="ri-checkbox-circle-fill text-green-500"></i></div>
                     <span>Respond within 5 minutes to maintain your rating.</span>
                   </li>
                   <li class="flex gap-3 items-start">
                     <div class="mt-0.5 min-w-[16px]"><i class="ri-checkbox-circle-fill text-green-500"></i></div>
                     <span>Always verify audio quality before starting the session.</span>
                   </li>
                   <li class="flex gap-3 items-start">
                     <div class="mt-0.5 min-w-[16px]"><i class="ri-checkbox-circle-fill text-green-500"></i></div>
                     <span>Maintain a professional, neutral tone.</span>
                   </li>
                 </ul>
               </div>
            </div>
          </div>
        }

        @if (viewMode() === 'chat') {
            @defer (on viewport) {
                <app-chat-layout class="block animate-fade-in h-[calc(100vh-220px)]"></app-chat-layout>
            } 
            @placeholder {
                <div class="h-[600px] flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-200">
                    <div class="flex flex-col items-center gap-3">
                      <div class="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                      <p class="text-gray-400 font-medium">Loading chat interface...</p>
                    </div>
                </div>
            }
        }

      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class InterpreterDashboard implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private realtime = inject(RealtimeService);
  
  private realtimeSub?: Subscription;

  // Signals
  viewMode = signal<'requests' | 'chat'>('requests');
  incomingRequests = signal<any[]>([]);
  requestCount = signal(0);
  isLoading = signal(true);
  isProcessing = signal<number | null>(null);

  ngOnInit() {
    this.loadData();
    this.subscribeToRealtime();
  }

  ngOnDestroy() {
    this.realtimeSub?.unsubscribe();
  }

  loadData() {
    this.isLoading.set(true);
    this.chatService.getIncomingRequests().subscribe({
      next: (reqs) => {
        this.incomingRequests.set(reqs);
        this.requestCount.set(reqs.length);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  handleResponse(id: number, action: 'ACCEPT' | 'DECLINE') {
    this.isProcessing.set(id);

    this.chatService.respondToRequest(id, action).subscribe({
      next: (res) => {
        // Optimistic UI update
        const updated = this.incomingRequests().filter(r => r.relationshipId !== id);
        this.incomingRequests.set(updated);
        this.requestCount.set(updated.length);
        
        if (action === 'ACCEPT') {
            // Auto-switch to chat view
            this.viewMode.set('chat'); 
        }

        this.isProcessing.set(null);
      },
      error: (err) => {
        console.error(err);
        this.isProcessing.set(null);
      }
    });
  }

  private subscribeToRealtime() {
    this.realtimeSub = this.realtime.events$.subscribe(event => {
      if (!event) return;

      // Listen for new requests via WebSocket
      if (event.type === 'RELATIONSHIP_REQUEST_RECEIVED') {
         this.loadData(); // Refresh list
         // Optional: Play a sound notification here
      }
    });
  }
}