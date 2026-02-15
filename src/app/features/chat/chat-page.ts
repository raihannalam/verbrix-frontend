import { Component, inject, OnInit, OnDestroy, AfterViewInit, signal, ViewChild, ElementRef, computed, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, switchMap, tap, finalize, of, catchError } from 'rxjs';

// Services
import { ChatService, ChatMessage } from '../../core/services/chat.service';
import { RealtimeService } from '../../core/realtime/realtime.service';
import { AuthService } from '../../core/auth/auth.service';
import { PaymentService } from '../../core/services/payment.service';

// Components
import { Navbar } from '../layout/navbar';
import { VideoCallComponent } from '../components/video-call';

// --- Interfaces ---
export interface ChatRelationship {
  relationshipId: number;
  clientName: string;
  interpreterName: string;
  clientProfilePicture?: string;
  interpreterProfilePicture?: string;
  lastMessagePreview?: string;
  lastMessageTime?: string;
  lastMessageRead: boolean;
  online: boolean;
  status: 'REQUESTED' | 'REQUEST_ACCEPTED' | 'CONSULTATION_ACTIVE' | 'AGREEMENT_ACTIVE' | 'TERMINATED';
}

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, Navbar, FormsModule, DatePipe, VideoCallComponent],
  template: `
    <app-navbar></app-navbar>

    @if (videoCallToken()) {
      <div class="fixed inset-0 z-[60] bg-black animate-fade-in">
        <app-video-call 
            [token]="videoCallToken()!" 
            wsUrl="wss://verbrix-is1gv2zd.livekit.cloud" 
            (close)="onCallEnded()">
        </app-video-call>
      </div>
    }

    <div class="h-screen bg-white dark:bg-[#0f1115] pt-[64px] flex overflow-hidden">
      
      <aside class="w-full md:w-[380px] border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-[#13151a] z-20 transition-transform duration-300 absolute md:relative h-full"
             [class.-translate-x-full]="showMobileChat() && isMobileView()"
             [class.translate-x-0]="!showMobileChat() || !isMobileView()">
        
        <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Messages</h2>
          <div class="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
             <span class="text-xs font-bold">{{ relationships().length }}</span>
          </div>
        </div>
        
        <div class="px-4 py-3">
            <div class="relative">
                <i class="ri-search-line absolute left-3 top-2.5 text-gray-400"></i>
                <input type="text" placeholder="Search conversations..." 
                       class="w-full bg-gray-100 dark:bg-[#1f2229] border-none rounded-xl py-2.5 pl-10 text-sm focus:ring-2 focus:ring-blue-500/50 dark:text-white placeholder-gray-500 transition-all">
            </div>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar">
          @if (loadingRelationships()) {
             <div class="p-4 space-y-4">
               @for(i of [1,2,3,4,5]; track i) {
                 <div class="flex items-center gap-3 animate-pulse">
                    <div class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                    <div class="flex-1 space-y-2">
                        <div class="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded"></div>
                        <div class="h-2 w-3/4 bg-gray-100 dark:bg-gray-800 rounded"></div>
                    </div>
                 </div>
               }
             </div>
          }

          @for (rel of relationships(); track rel.relationshipId) {
            <div (click)="selectConversation(rel)"
                 class="px-4 py-4 cursor-pointer transition-all border-l-4 border-transparent hover:bg-gray-50 dark:hover:bg-[#1f2229] group"
                 [class.bg-blue-50]="selectedRel()?.relationshipId === rel.relationshipId"
                 [class.dark:bg-blue-900_10]="selectedRel()?.relationshipId === rel.relationshipId"
                 [class.border-l-blue-500]="selectedRel()?.relationshipId === rel.relationshipId">
              
              <div class="flex items-center gap-4">
                <div class="relative shrink-0">
                    @if (getOtherAvatar(rel)) {
                        <img [src]="getOtherAvatar(rel)" class="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800">
                    } @else {
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-lg ring-2 ring-gray-100 dark:ring-gray-800">
                            {{ getOtherName(rel).charAt(0) }}
                        </div>
                    }
                    @if(rel.online) {
                        <span class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#13151a] rounded-full"></span>
                    }
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-baseline mb-1">
                    <h3 class="font-bold text-gray-900 dark:text-white truncate text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {{ getOtherName(rel) }}
                    </h3>
                    @if(rel.lastMessageTime) {
                        <span class="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                            {{ rel.lastMessageTime | date:'shortTime' }}
                        </span>
                    }
                  </div>
                  <div class="flex justify-between items-center">
                      <p class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[80%]" 
                         [class.font-semibold]="!rel.lastMessageRead && !isMyMessageSimple(rel)"
                         [class.text-gray-900]="!rel.lastMessageRead && !isMyMessageSimple(rel)"
                         [class.dark:text-white]="!rel.lastMessageRead && !isMyMessageSimple(rel)">
                          {{ rel.lastMessagePreview || 'Start a conversation' }}
                      </p>
                      
                      @if (!rel.lastMessageRead && !isMyMessageSimple(rel)) {
                          <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                      }
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </aside>

      <main class="flex-1 flex flex-col bg-[#f8f9fa] dark:bg-[#0b0c0f] relative w-full h-full transition-transform duration-300"
            [class.translate-x-full]="!showMobileChat() && isMobileView()"
            [class.translate-x-0]="showMobileChat() || !isMobileView()"
            [class.absolute]="isMobileView()">
        
        @if (selectedRel(); as rel) {
          <div class="h-[72px] bg-white dark:bg-[#13151a] border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between shadow-sm z-10 shrink-0">
            <div class="flex items-center gap-3">
               <button (click)="backToConversations()" class="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <i class="ri-arrow-left-s-line text-2xl"></i>
               </button>

               <div class="relative cursor-pointer hover:opacity-80 transition-opacity">
                 <img [src]="getOtherAvatar(rel) || 'assets/default-avatar.png'" class="w-10 h-10 rounded-full object-cover bg-gray-200">
                 <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#13151a] rounded-full" *ngIf="rel.online"></div>
               </div>
               
               <div class="flex flex-col">
                  <h2 class="text-sm md:text-base font-bold text-gray-900 dark:text-white leading-tight">
                    {{ getOtherName(rel) }}
                  </h2>
                  <div class="flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="rel.online ? 'bg-green-500' : 'bg-gray-400'"></span>
                      <span class="text-[11px] font-medium" [ngClass]="rel.online ? 'text-green-600 dark:text-green-400' : 'text-gray-400'">
                        {{ rel.online ? 'Active now' : 'Offline' }}
                      </span>
                  </div>
               </div>
            </div>

            <div class="flex items-center gap-2">
                <button (click)="startVideoCall()"
                        [disabled]="!isVideoAllowed(rel.status)"
                        class="group flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md">
                    <i class="ri-video-chat-fill text-lg group-hover:scale-110 transition-transform"></i>
                    <span class="hidden md:inline font-bold text-xs">Call</span>
                </button>
                <button class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <i class="ri-more-2-fill text-xl"></i>
                </button>
            </div>
          </div>

          <div #scrollContainer class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth bg-dots-pattern">
            
            @if (messagesLoading()) {
              <div class="flex flex-col items-center justify-center py-12 gap-3">
                <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span class="text-xs text-gray-400 font-medium">Loading history...</span>
              </div>
            }

            @for (msg of messages(); track msg.id; let i = $index) {
                @if (showDateSeparator(messages(), i)) {
                    <div class="flex justify-center w-full my-6">
                        <span class="px-3 py-1 bg-gray-200/60 dark:bg-gray-800/60 backdrop-blur-sm text-gray-600 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm border border-white/20">
                            {{ msg.timestamp | date:'mediumDate' }}
                        </span>
                    </div>
                }

                @if (msg.type === 'SYSTEM') {
                    <div class="flex justify-center w-full my-4 opacity-80">
                        <span class="px-4 py-1.5 bg-gray-100 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-xs italic rounded-lg">
                           <i class="ri-information-line mr-1"></i> {{ msg.content }}
                        </span>
                    </div>
                } @else {
                    <div class="flex w-full flex-col animate-slide-up" 
                         [class.items-end]="isMyMessage(msg)" 
                         [class.items-start]="!isMyMessage(msg)">
                         
                        <div class="max-w-[85%] md:max-w-[65%] flex flex-col" 
                             [class.items-end]="isMyMessage(msg)" 
                             [class.items-start]="!isMyMessage(msg)">
                            
                            @if (!isMyMessage(msg) && showNameHeader(messages(), i)) {
                                <span class="text-[10px] text-gray-400 ml-3 mb-1 font-medium">
                                    {{ getOtherName(rel) }}
                                </span>
                            }

                            <div class="px-4 py-2.5 text-[15px] shadow-sm relative group transition-all"
                                 [ngClass]="getBubbleClass(isMyMessage(msg), msg.type === 'IMAGE')">
                                
                                @if (msg.type === 'IMAGE' && msg.fileUrl) {
                                   <div class="overflow-hidden rounded-lg mb-1 bg-black/10">
                                     <img [src]="msg.fileUrl" 
                                          class="max-w-full max-h-72 object-contain cursor-zoom-in hover:scale-[1.02] transition-transform duration-300" 
                                          (click)="openImage(msg.fileUrl)">
                                   </div>
                                }
                                
                                @if (msg.content) {
                                    <span class="whitespace-pre-wrap leading-relaxed block min-w-[2rem]">{{ msg.content }}</span>
                                }

                                <div class="text-[9px] mt-1 text-right opacity-70 select-none flex items-center justify-end gap-1"
                                     [class.text-blue-100]="isMyMessage(msg)"
                                     [class.text-gray-400]="!isMyMessage(msg)">
                                    {{ msg.timestamp | date:'shortTime' }}
                                    @if(isMyMessage(msg)) {
                                        <i class="ri-check-double-line" [class.opacity-100]="true"></i>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                }
            }
          </div>

          <div class="bg-white dark:bg-[#13151a] p-3 md:p-4 sticky bottom-0 z-20 shrink-0 border-t border-gray-100 dark:border-gray-800">
            
            @if (rel.status === 'REQUESTED') {
              <div class="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed">
                 <div class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400 mb-2">
                     <i class="ri-time-line text-xl"></i>
                 </div>
                 <h3 class="font-bold text-gray-900 dark:text-white">Request Pending</h3>
                 <p class="text-sm text-gray-500 text-center mt-1">Chat will be enabled once the request is accepted.</p>
              </div>
            } 
            @else if (rel.status === 'REQUEST_ACCEPTED' && isClient()) {
               <div class="flex flex-col md:flex-row items-center justify-between p-5 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 gap-4 shadow-sm">
                    <div class="text-center md:text-left">
                        <div class="flex items-center gap-2 justify-center md:justify-start">
                            <i class="ri-secure-payment-fill text-indigo-600 dark:text-indigo-400 text-xl"></i>
                            <span class="block font-bold text-gray-900 dark:text-white text-lg">Payment Required</span>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-md">
                            To unlock high-quality video consultations with {{ rel.interpreterName }}, please complete the secure payment.
                        </p>
                    </div>
                    <button (click)="payConsultation(rel)" 
                            [disabled]="isProcessingPayment()"
                            class="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/30 active:scale-95 whitespace-nowrap">
                      @if (isProcessingPayment()) {
                        <i class="ri-loader-4-line animate-spin text-lg"></i> Processing...
                      } @else {
                        <span>Unlock Video Call</span>
                        <i class="ri-arrow-right-line"></i>
                      }
                    </button>
               </div>
               <div class="mt-4 opacity-50 hover:opacity-100 transition-opacity">
                   <ng-container *ngTemplateOutlet="inputBox"></ng-container>
               </div>
            } 
            @else {
               <ng-container *ngTemplateOutlet="inputBox"></ng-container>
            }

            <ng-template #inputBox>
                <div class="flex items-end gap-2 max-w-5xl mx-auto relative">
                    <input type="file" #fileInput hidden (change)="handleFileUpload($event)" accept="image/*">
                    <button (click)="fileInput.click()" [disabled]="isUploading()" 
                            class="p-3 mb-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all"
                            title="Attach Image">
                        <i *ngIf="!isUploading()" class="ri-attachment-2 text-xl"></i>
                        <i *ngIf="isUploading()" class="ri-loader-4-line animate-spin text-xl text-blue-500"></i>
                    </button>

                    <div class="flex-1 bg-gray-100 dark:bg-[#1f2229] rounded-[24px] flex items-center px-2 border-2 border-transparent focus-within:border-blue-500/30 focus-within:bg-white dark:focus-within:bg-[#13151a] transition-all">
                        <textarea [(ngModel)]="newMessage" 
                                  (keydown.enter)="onEnterKey($event)"
                                  placeholder="Type your message..." 
                                  rows="1"
                                  class="w-full bg-transparent border-none focus:ring-0 text-[15px] text-gray-900 dark:text-white resize-none max-h-32 py-3 px-2 placeholder-gray-500 custom-scrollbar"></textarea>
                    </div>
                        
                    <button (click)="sendMessage()" 
                            [disabled]="!newMessage.trim() && !isUploading()" 
                            class="p-3 mb-1 bg-blue-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white rounded-full hover:bg-blue-700 transition-all shadow-md active:scale-90">
                      <i class="ri-send-plane-fill text-lg translate-x-px translate-y-px"></i>
                    </button>
                </div>
            </ng-template>
          </div>

        } @else {
          <div class="flex-1 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-[#0b0c0f] p-8 text-center h-full animate-fade-in">
            <div class="w-24 h-24 bg-white dark:bg-[#1f2229] rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <i class="ri-message-3-line text-5xl text-blue-500"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Conversations</h3>
            <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                Select a patient or interpreter from the sidebar to start a secure consultation or continue a chat.
            </p>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
    .dark .custom-scrollbar { scrollbar-color: #374151 transparent; }
    textarea { border: none !important; outline: none !important; box-shadow: none !important; }
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .bg-dots-pattern {
        background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
        background-size: 20px 20px;
    }
    .dark .bg-dots-pattern {
        background-image: radial-gradient(#374151 1px, transparent 1px);
    }
  `]
})
export class ChatPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private chatService = inject(ChatService);
  private realtime = inject(RealtimeService);
  private auth = inject(AuthService);
  private paymentService = inject(PaymentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // State Signals
  relationships = signal<ChatRelationship[]>([]);
  loadingRelationships = signal(true);
  
  selectedRel = signal<ChatRelationship | null>(null);
  
  messages = signal<ChatMessage[]>([]);
  messagesLoading = signal(false);
  
  isUploading = signal(false);
  isProcessingPayment = signal(false);
  videoCallToken = signal<string | null>(null);
  
  showMobileChat = signal(false);
  isMobileView = signal(window.innerWidth < 768);

  newMessage = '';
  
  // Logic Variables
  private activeChatSub: Subscription | null = null;
  private socketSub: any = null;
  private resizeListener: any;
  private scrollObserver: MutationObserver | null = null;
  private isNearBottom = true;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor() {
    this.resizeListener = () => this.isMobileView.set(window.innerWidth < 768);
    window.addEventListener('resize', this.resizeListener);

    // Effect to handle relationship ID from URL automatically
    effect(() => {
        // You could put URL sync logic here if using router inputs
    });
  }

  ngOnInit() {
    this.loadRelationships();
  }

  ngAfterViewInit() {
    // We observe the scroll container to auto-scroll when new messages arrive
    // BUT only if the user is already at the bottom.
  }

  ngOnDestroy() {
    this.socketSub?.unsubscribe();
    this.activeChatSub?.unsubscribe();
    this.scrollObserver?.disconnect();
    window.removeEventListener('resize', this.resizeListener);
  }

  /**
   * Loads the sidebar list.
   */
  loadRelationships() {
    this.loadingRelationships.set(true);
    this.chatService.getMyRelationships()
      .pipe(finalize(() => this.loadingRelationships.set(false)))
      .subscribe({
        next: (data) => {
          // Sort by latest message time descending initially
          const sorted = this.sortRelationships(data as ChatRelationship[]);
          this.relationships.set(sorted);
          this.checkUrlParams(sorted);
        },
        error: (err) => console.error('Failed to load relationships', err)
      });
  }

  private sortRelationships(data: ChatRelationship[]): ChatRelationship[] {
      return data.sort((a, b) => {
          const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
          const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
          return timeB - timeA;
      });
  }

  private checkUrlParams(data: ChatRelationship[]) {
    const relIdStr = this.route.snapshot.queryParamMap.get('relationshipId');
    if (relIdStr) {
      const id = Number(relIdStr);
      const target = data.find(r => r.relationshipId === id);
      if (target) this.selectConversation(target);
    }
  }

  selectConversation(rel: ChatRelationship) {
    if (this.selectedRel()?.relationshipId === rel.relationshipId) {
        this.showMobileChat.set(true);
        return;
    }

    this.socketSub?.unsubscribe();
    this.activeChatSub?.unsubscribe();
    
    this.selectedRel.set(rel);
    this.showMobileChat.set(true);
    this.messages.set([]);
    this.messagesLoading.set(true);
    this.newMessage = '';

    const url = this.router.createUrlTree([], { 
        relativeTo: this.route, 
        queryParams: { relationshipId: rel.relationshipId },
        queryParamsHandling: 'merge'
    }).toString();
    history.replaceState({}, '', url);

    this.activeChatSub = this.chatService.getChatHistory(rel.relationshipId)
      .pipe(finalize(() => this.messagesLoading.set(false)))
      .subscribe({
        next: (msgs) => {
          this.messages.set(msgs);
          
          // FIX: If we have history, verify sidebar has the latest info
          if (msgs.length > 0) {
             const lastMsg = msgs[msgs.length - 1];
             this.updateSidebarPreview(rel.relationshipId, lastMsg);
          }

          this.scrollToBottom(true);
          this.setupRealtime(rel.relationshipId);
          this.setupScrollObserver();
        },
        error: (err) => console.error('Failed to load history', err)
      });
  }

  private setupRealtime(relId: number) {
    this.socketSub = this.realtime.subscribeToTopic(
      `/topic/chat/${relId}`, 
      (msg: ChatMessage) => {
        // 1. Add to active message list if chat is open
        if (this.selectedRel()?.relationshipId === relId) {
             this.messages.update(prev => {
                if (prev.some(p => p.id === msg.id)) return prev;
                return [...prev, msg];
             });
             
             if (this.isNearBottom || this.isMyMessage(msg)) {
                this.scrollToBottom();
             }
        }

        // 2. Update Sidebar Preview & Re-sort (Bubble to top)
        this.updateSidebarPreview(relId, msg);
      }
    );
  }

  private updateSidebarPreview(relId: number, msg: ChatMessage) {
      this.relationships.update(rels => {
          // 1. Update the specific relationship data
          const updatedList = rels.map(r => {
              if (r.relationshipId === relId) {
                  return { 
                      ...r, 
                      lastMessagePreview: msg.type === 'IMAGE' ? '📷 Image' : msg.content,
                      lastMessageTime: new Date().toISOString(),
                      lastMessageRead: this.selectedRel()?.relationshipId === relId // Read if currently open
                  };
              }
              return r;
          });

          // 2. Sort list so this relationship moves to TOP (WhatsApp style)
          return this.sortRelationships(updatedList);
      });
  }

  sendMessage(type: 'TEXT' | 'IMAGE' = 'TEXT', fileUrl?: string) {
    const rel = this.selectedRel();
    const content = type === 'TEXT' ? this.newMessage.trim() : 'Image sent';

    if ((!content && type === 'TEXT') || !rel) return;

    const payload = {
      relationshipId: rel.relationshipId,
      content: content,
      type: type,
      fileUrl: fileUrl || null
    };

    this.realtime.sendMessage('/app/chat.sendMessage', payload);
    
    if (type === 'TEXT') {
        this.newMessage = '';
        const textarea = document.querySelector('textarea');
        if (textarea) textarea.style.height = 'auto';
    }
  }

  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    if (file.size > 5 * 1024 * 1024) {
        alert('File too large. Max 5MB.');
        return;
    }

    this.isUploading.set(true);
    
    this.chatService.uploadAttachment(file)
      .pipe(finalize(() => {
          this.isUploading.set(false);
          input.value = ''; 
      }))
      .subscribe({
        next: (res) => this.sendMessage('IMAGE', res.url),
        error: (err) => console.error('Upload failed', err)
      });
  }

  onEnterKey(e: Event) {
      e.preventDefault(); 
      this.sendMessage();
  }

  backToConversations() {
    this.showMobileChat.set(false);
    this.selectedRel.set(null);
    this.router.navigate([], { queryParams: { relationshipId: null }, queryParamsHandling: 'merge' });
  }

  // --- UI Helpers ---

  isMyMessage(msg: ChatMessage): boolean {
    return msg.senderEmail === this.auth.currentUser()?.email;
  }

  getBubbleClass(isMine: boolean, isImage: boolean): string {
    const base = 'rounded-2xl px-4 py-2 break-words max-w-full ';
    if (isImage) return 'bg-transparent p-0 shadow-none';
    
    if (isMine) {
        return base + 'bg-blue-600 text-white rounded-br-sm';
    } else {
        return base + 'bg-white dark:bg-[#1f2229] text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-800 rounded-bl-sm';
    }
  }

  showNameHeader(msgs: ChatMessage[], index: number): boolean {
      if (index === 0) return true;
      const prev = msgs[index - 1];
      const curr = msgs[index];
      return prev.senderEmail !== curr.senderEmail;
  }

  showDateSeparator(msgs: ChatMessage[], index: number): boolean {
      if (index === 0) return true;
      const prevDate = new Date(msgs[index - 1].timestamp).toDateString();
      const currDate = new Date(msgs[index].timestamp).toDateString();
      return prevDate !== currDate;
  }

  // --- Scroll Logic ---

  private setupScrollObserver() {
      this.scrollObserver?.disconnect();
      if (!this.scrollContainer) return;
      
      const el = this.scrollContainer.nativeElement;
      
      el.addEventListener('scroll', () => {
          const threshold = 100;
          const position = el.scrollTop + el.clientHeight;
          const height = el.scrollHeight;
          this.isNearBottom = position > height - threshold;
      });

      this.scrollObserver = new MutationObserver(() => {
          if (this.isNearBottom) this.scrollToBottom();
      });
      
      this.scrollObserver.observe(el, { childList: true, subtree: true, attributes: true });
  }

  scrollToBottom(force = false) {
    if (!this.scrollContainer) return;
    setTimeout(() => {
        const el = this.scrollContainer.nativeElement;
        el.scrollTo({ top: el.scrollHeight, behavior: force ? 'auto' : 'smooth' });
    }, 50);
  }

  // --- Payment & Video ---

  payConsultation(rel: ChatRelationship) {
    this.isProcessingPayment.set(true);
    this.paymentService.createConsultationOrder(rel.relationshipId)
      .pipe(
          switchMap(order => {
              return new Promise((resolve, reject) => {
                  this.paymentService.openGateway(
                      order, 
                      this.auth.currentUser()?.email || '',
                      resolve,
                      reject
                  );
              });
          }),
          finalize(() => this.isProcessingPayment.set(false))
      )
      .subscribe({
          next: () => {
              this.loadRelationships();
              this.selectedRel.update(curr => curr ? ({...curr, status: 'CONSULTATION_ACTIVE'}) : null);
          },
          error: (err) => console.error('Payment failed', err)
      });
  }

  startVideoCall() {
    const rel = this.selectedRel();
    if (!rel) return;
    this.chatService.joinVideoCall(rel.relationshipId).subscribe(token => {
        this.videoCallToken.set(token);
    });
  }

  onCallEnded() {
    this.videoCallToken.set(null);
  }

  // --- Helpers ---
  isClient() { return this.auth.isClient(); }
  
  getOtherName(rel: ChatRelationship): string {
    return this.isClient() ? rel.interpreterName : rel.clientName;
  }
  
  getOtherAvatar(rel: ChatRelationship): string | null {
    return (this.isClient() ? rel.interpreterProfilePicture : rel.clientProfilePicture) || null;
  }
  
  isVideoAllowed(status: string): boolean {
    return ['CONSULTATION_ACTIVE', 'AGREEMENT_ACTIVE', 'WORK_ACTIVE'].includes(status);
  }
  
  openImage(url: string) { window.open(url, '_blank'); }
  
  isMyMessageSimple(rel: ChatRelationship): boolean {
      return false; 
  }
}