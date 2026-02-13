import { Component, inject, OnInit, OnDestroy, AfterViewInit, signal, ViewChild, ElementRef, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StompSubscription } from '@stomp/stompjs';

import { ChatService, ChatMessage } from '../../core/services/chat.service';
import { RealtimeService } from '../../core/realtime/realtime.service';
import { AuthService } from '../../core/auth/auth.service';
import { PaymentService } from '../../core/services/payment.service';
import { Navbar } from '../layout/navbar';
import { VideoCallComponent } from '../components/video-call';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, Navbar, FormsModule, DatePipe, VideoCallComponent],
  template: `
    <app-navbar></app-navbar>

    @if (videoCallToken()) {
      <div class="fixed inset-0 z-50 bg-black">
        <app-video-call 
            [token]="videoCallToken()!" 
            wsUrl="wss://verbrix-is1gv2zd.livekit.cloud" 
            (close)="onCallEnded()">
        </app-video-call>
      </div>
    }

    <div class="h-screen bg-white dark:bg-[#0f1115] pt-[72px] flex font-sans overflow-hidden">
      
      <div class="w-full md:w-96 border-r border-gray-200 dark:border-gray-800 flex flex-col z-20 bg-white dark:bg-[#181a1f] transition-all duration-300 absolute md:relative h-full"
           [class.-translate-x-full]="showMobileChat() && isMobileView()"
           [class.translate-x-0]="!showMobileChat() || !isMobileView()"
           [class.w-full]="isMobileView()">
        
        <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#181a1f]">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
        </div>
        
        <div class="flex-1 overflow-y-auto custom-scrollbar">
          @if (loadingRelationships()) {
             <div class="p-4 space-y-4">
               <div *ngFor="let i of [1,2,3]" class="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
             </div>
          }

          @for (rel of relationships(); track rel.relationshipId) {
            <div (click)="selectConversation(rel)"
                 class="p-4 border-b border-gray-50 dark:border-gray-800/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1f2229] transition-all relative group"
                 [class.bg-blue-50]="selectedRel()?.relationshipId === rel.relationshipId"
                 [class.dark:bg-blue-900_20]="selectedRel()?.relationshipId === rel.relationshipId">
              
              <div class="flex items-center gap-4">
                <div class="relative shrink-0">
                    @if (getOtherAvatar(rel)) {
                        <img [src]="getOtherAvatar(rel)" class="w-12 h-12 rounded-full object-cover shadow-sm">
                    } @else {
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-lg">
                            {{ getOtherName(rel).charAt(0) }}
                        </div>
                    }
                    <span class="absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white dark:border-[#181a1f] rounded-full"
                          [ngClass]="rel.online ? 'bg-green-500' : 'bg-gray-400'"></span>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-baseline mb-1">
                    <h3 class="font-bold text-gray-900 dark:text-white truncate text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {{ getOtherName(rel) }}
                    </h3>
                    <span class="text-[10px] text-gray-400 font-medium">
                        {{ rel.lastMessageTime | date:'shortTime' }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate" 
                     [class.font-semibold]="!rel.lastMessageRead && !isMyMessageSimple(rel)">
                      {{ rel.lastMessagePreview || 'Start a conversation' }}
                  </p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="flex-1 flex flex-col bg-[#f0f2f5] dark:bg-[#0b0c0f] relative w-full h-full absolute md:relative transition-transform duration-300"
           [class.translate-x-full]="!showMobileChat() && isMobileView()"
           [class.translate-x-0]="showMobileChat() || !isMobileView()">
        
        @if (selectedRel(); as rel) {
          <div class="h-[72px] bg-white dark:bg-[#181a1f] border-b border-gray-200 dark:border-gray-800 px-4 md:px-6 flex items-center justify-between shadow-sm z-10 shrink-0">
            <div class="flex items-center gap-3">
               <button (click)="backToConversations()" class="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <i class="ri-arrow-left-line text-xl"></i>
               </button>

               <div class="relative">
                 <img [src]="getOtherAvatar(rel) || 'assets/default-avatar.png'" class="w-10 h-10 rounded-full object-cover">
                 <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#181a1f] rounded-full" *ngIf="rel.online"></div>
               </div>
               
               <div class="flex flex-col">
                  <h2 class="text-sm md:text-base font-bold text-gray-900 dark:text-white leading-tight">
                    {{ getOtherName(rel) }}
                  </h2>
                  <span class="text-[10px] md:text-xs" [ngClass]="rel.online ? 'text-green-600 dark:text-green-400' : 'text-gray-400'">
                    {{ rel.online ? 'Active now' : 'Offline' }}
                  </span>
               </div>
            </div>

            <button (click)="startVideoCall()"
                    [disabled]="!isVideoAllowed(rel.status)"
                    class="flex items-center gap-2 px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs shadow-lg">
              <i class="ri-vidicon-fill text-lg"></i>
              <span class="hidden md:inline">Video Call</span>
            </button>
          </div>

          <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            @if (messagesLoading()) {
              <div class="flex justify-center py-10">
                <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }

            @for (msg of messages(); track msg.id) {
              @if (msg.type === 'SYSTEM') {
                 <div class="flex justify-center w-full my-4 opacity-75">
                    <span class="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] md:text-xs rounded-full shadow-sm border border-gray-300 dark:border-gray-700">
                       {{ msg.content }}
                    </span>
                 </div>
              } @else {
                  <div class="flex w-full flex-col animate-fade-in" 
                       [class.items-end]="isMyMessage(msg)" 
                       [class.items-start]="!isMyMessage(msg)">
                    
                    <div class="max-w-[85%] md:max-w-[70%] relative group flex flex-col" 
                         [class.items-end]="isMyMessage(msg)" 
                         [class.items-start]="!isMyMessage(msg)">
                      
                      <div class="px-4 py-2 text-sm shadow-md break-words"
                           [ngClass]="isMyMessage(msg) 
                              ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                              : 'bg-white dark:bg-[#1f2229] text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-gray-800'">
                        
                        @if (msg.type === 'IMAGE' && msg.fileUrl) {
                           <div class="mb-2 overflow-hidden rounded-lg bg-black/5 dark:bg-white/5">
                             <img [src]="msg.fileUrl" 
                                  class="max-w-full max-h-60 object-contain cursor-pointer hover:scale-105 transition-transform duration-300" 
                                  (click)="openImage(msg.fileUrl)">
                           </div>
                        }
                        <span class="whitespace-pre-wrap leading-relaxed">{{ msg.content }}</span>
                      </div>
                      
                      <span class="text-[10px] text-gray-400 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {{ msg.timestamp | date:'shortTime' }}
                      </span>
                    </div>
                  </div>
              }
            }
          </div>

          <div class="bg-white dark:bg-[#181a1f] border-t border-gray-200 dark:border-gray-800 p-3 sticky bottom-0 z-20 shrink-0 safe-area-bottom">
            
            @if (rel.status === 'REQUESTED') {
              <div class="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 text-sm rounded-xl border border-yellow-200 dark:border-yellow-800/50">
                 <i class="ri-lock-line mr-1"></i> Waiting for acceptance.
              </div>
            } @else if (rel.status === 'REQUEST_ACCEPTED' && isClient()) {
               <div class="flex flex-col md:flex-row items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50 mb-3 gap-3">
                    <div class="text-sm text-center md:text-left">
                        <span class="block font-bold text-indigo-900 dark:text-indigo-300">Consultation Fee Required</span>
                        <span class="text-xs text-indigo-700 dark:text-indigo-400">Payment is needed to enable video calls. Text chat is open.</span>
                    </div>
                    <button (click)="payConsultation(rel)" 
                            [disabled]="isProcessingPayment()"
                            class="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/30">
                      @if (isProcessingPayment()) {
                        <i class="ri-loader-4-line animate-spin text-lg"></i> Processing...
                      } @else {
                        <i class="ri-secure-payment-line text-lg"></i> Pay Now
                      }
                    </button>
               </div>
               <ng-container *ngTemplateOutlet="inputBox"></ng-container>
            } @else {
               <ng-container *ngTemplateOutlet="inputBox"></ng-container>
            }

            

            <ng-template #inputBox>
                <div class="flex items-end gap-2 max-w-5xl mx-auto">
                    <input type="file" #fileInput hidden (change)="handleFileUpload($event)" accept="image/*">
                    <button (click)="fileInput.click()" [disabled]="isUploading()" 
                            class="p-3 mb-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252830] rounded-full transition-colors">
                        <i *ngIf="!isUploading()" class="ri-attachment-2 text-xl"></i>
                        <i *ngIf="isUploading()" class="ri-loader-4-line animate-spin text-xl"></i>
                    </button>

                    <div class="flex-1 bg-gray-100 dark:bg-[#252830] rounded-[24px] flex items-center px-4 py-2 border border-transparent focus-within:border-blue-500/30 transition-all">
                        <textarea [(ngModel)]="newMessage" (keydown.enter)="$event.preventDefault(); sendMessage()"
                                  placeholder="Message..." rows="1"
                                  class="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-900 dark:text-white resize-none max-h-32 py-2 placeholder-gray-500"></textarea>
                    </div>
                        
                    <button (click)="sendMessage()" 
                            [disabled]="!newMessage.trim()" 
                            class="p-3 mb-1 bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-full hover:bg-blue-700 transition-all shadow-md">
                      <i class="ri-send-plane-fill text-lg"></i>
                    </button>
                </div>
            </ng-template>
          </div>

          

        } @else {
          <div class="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center h-full">
            <div class="w-20 h-20 bg-gray-100 dark:bg-[#181a1f] rounded-full flex items-center justify-center mb-6">
                <i class="ri-chat-smile-2-line text-4xl text-gray-300 dark:text-gray-600"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Your Messages</h3>
            <p class="text-sm">Select a conversation from the left to start chatting.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar { scrollbar-width: thin; }
    textarea { border: none !important; outline: none !important; box-shadow: none !important; }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom, 12px); }
  `]
})
export class ChatPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private chatService = inject(ChatService);
  private realtime = inject(RealtimeService);
  private auth = inject(AuthService);
  private paymentService = inject(PaymentService);
  private route = inject(ActivatedRoute);

  // Signals
  relationships = signal<any[]>([]);
  loadingRelationships = signal(true);
  selectedRel = signal<any>(null);
  
  messages = signal<ChatMessage[]>([]);
  messagesLoading = signal(false);
  
  isUploading = signal(false);
  isProcessingPayment = signal(false);
  videoCallToken = signal<string | null>(null);

  // Mobile State
  showMobileChat = signal(false);
  
  // Helpers to detect screen size (simple implementation)
  isMobileView = signal(window.innerWidth < 768);

  newMessage = '';
  private chatSubscription: StompSubscription | null = null;
  private mutationObserver: MutationObserver | null = null;
  private resizeListener: any;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor() {
    console.log('[ChatPage] Initializing...');
    this.resizeListener = () => this.isMobileView.set(window.innerWidth < 768);
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnInit() {
    console.log('[ChatPage] ngOnInit - Loading relationships');
    this.loadRelationships();
  }

  ngAfterViewInit() {
    this.mutationObserver = new MutationObserver(() => this.scrollToBottom());
  }

  ngOnDestroy() {
    console.log('[ChatPage] Destroying');
    this.unsubscribeFromChat();
    this.mutationObserver?.disconnect();
    window.removeEventListener('resize', this.resizeListener);
  }

  private attachScrollObserver() {
    if (this.scrollContainer) {
       this.mutationObserver?.disconnect();
       this.mutationObserver?.observe(this.scrollContainer.nativeElement, { childList: true, subtree: true });
    }
  }

  loadRelationships() {
    this.loadingRelationships.set(true);
    this.chatService.getMyRelationships().subscribe({
      next: (data) => {
        console.log(`[ChatPage] Loaded ${data.length} relationships`);
        this.relationships.set(data);
        this.loadingRelationships.set(false);
        
        // Handle Query Param linking
        const relId = this.route.snapshot.queryParamMap.get('relationshipId');
        if (relId) {
          const target = data.find(r => r.relationshipId === Number(relId));
          if (target) this.selectConversation(target);
        }
      },
      error: (err) => {
          console.error('[ChatPage] Failed to load relationships', err);
          this.loadingRelationships.set(false);
      }
    });
  }

  selectConversation(rel: any) {
    console.log('[ChatPage] Selecting conversation:', rel.relationshipId);
    
    // On Mobile: Show Chat View
    this.showMobileChat.set(true);

    if (this.selectedRel()?.relationshipId === rel.relationshipId) return;

    this.selectedRel.set(rel);
    this.messagesLoading.set(true);
    this.messages.set([]); 
    this.unsubscribeFromChat();

    // 1. Load History (HTTP)
    this.chatService.getChatHistory(rel.relationshipId).subscribe({
      next: (msgs) => {
        console.log(`[ChatPage] Loaded ${msgs.length} historical messages`);
        this.messages.set(msgs);
        this.messagesLoading.set(false);
        setTimeout(() => {
            this.attachScrollObserver();
            this.scrollToBottom();
        }, 50);
      },
      error: (err) => {
          console.error('[ChatPage] Failed to load history', err);
          this.messagesLoading.set(false);
      }
    });

    // 2. Subscribe to Realtime Updates (WebSocket)
    this.chatSubscription = this.realtime.subscribeToTopic(
      `/topic/chat/${rel.relationshipId}`, 
      (msg) => this.appendMessage(msg)
    );
  }

  backToConversations() {
      this.showMobileChat.set(false);
      this.selectedRel.set(null);
  }

  private appendMessage(msg: ChatMessage) {
    this.messages.update(current => {
      if (current.some(m => m.id === msg.id)) return current;
      return [...current, msg];
    });
    this.scrollToBottom();
  }

  sendMessage(type: 'TEXT' | 'IMAGE' = 'TEXT', fileUrl?: string) {
    if ((!this.newMessage.trim() && type === 'TEXT') || !this.selectedRel()) return;

    const payload = {
      relationshipId: this.selectedRel().relationshipId,
      content: type === 'TEXT' ? this.newMessage : 'Image sent',
      type: type,
      fileUrl: fileUrl || null
    };

    console.log('[ChatPage] Sending message:', payload);
    this.realtime.sendMessage('/app/chat.sendMessage', payload);
    
    if (type === 'TEXT') this.newMessage = '';
  }

  handleFileUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading.set(true);
    console.log('[ChatPage] Uploading file...');
    
    this.chatService.uploadAttachment(file).subscribe({
        next: (response) => {
            console.log('[ChatPage] Upload success:', response.url);
            this.sendMessage('IMAGE', response.url);
            this.isUploading.set(false);
        },
        error: (err) => {
            console.error('[ChatPage] Upload failed', err);
            this.isUploading.set(false);
        }
    });
  }

  payConsultation(rel: any) {
    if (this.isProcessingPayment()) return;
    
    console.log('[ChatPage] Initiating payment for:', rel.relationshipId);
    this.isProcessingPayment.set(true);

    this.paymentService.createConsultationOrder(rel.relationshipId).subscribe({
        next: (order) => {
            console.log('[ChatPage] Order created:', order);
            this.paymentService.openGateway(
                order,
                this.auth.currentUser()?.email || '',
                (successRes) => {
                    console.log('[ChatPage] Payment Success:', successRes);
                    this.loadRelationships(); // Refresh status
                    this.isProcessingPayment.set(false);
                },
                (error) => {
                    console.error('[ChatPage] Payment Gateway Error:', error);
                    this.isProcessingPayment.set(false);
                }
            );
        },
        error: (err) => {
            // 🛑 THIS IS WHERE THE 500 ERROR WAS CAUSING ISSUES
            console.error('[ChatPage] Failed to create order (Backend 500 likely):', err);
            this.isProcessingPayment.set(false); // Reset button so user can try again
        }
    });
  }

  startVideoCall() {
    const rel = this.selectedRel();
    if (!rel) return;
    console.log('[ChatPage] Starting video call...');
    
    this.chatService.joinVideoCall(rel.relationshipId).subscribe({
        next: (token) => {
            console.log('[ChatPage] Video token received');
            this.videoCallToken.set(token);
        },
        error: (err) => console.error('[ChatPage] Call failed', err)
    });
  }

  onCallEnded() {
    console.log('[ChatPage] Call ended');
    this.videoCallToken.set(null);
  }

  // Helpers
  isClient() { return this.auth.isClient(); }
  
  isMyMessage(msg: ChatMessage): boolean {
    const myEmail = this.auth.currentUser()?.email;
    return !!myEmail && msg.senderEmail === myEmail;
  }
  
  // Simple check for relationship object message preview (not chat message)
  isMyMessageSimple(rel: any): boolean {
      return false; // You can improve this if relationship object has lastSenderId
  }

  getOtherName(rel: any): string {
    return this.isClient() ? rel.interpreterName : rel.clientName;
  }
  getOtherAvatar(rel: any): string | null {
    return this.isClient() ? rel.interpreterProfilePicture : rel.clientProfilePicture;
  }
  openImage(url: string) { window.open(url, '_blank'); }


  
  isVideoAllowed(status: string): boolean {
    return ['CONSULTATION_ACTIVE', 'AGREEMENT_ACTIVE', 'WORK_ACTIVE'].includes(status);
  }


  unsubscribeFromChat() {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
      this.chatSubscription = null;
    }
  }

  scrollToBottom() {
    if (!this.scrollContainer) return;
    requestAnimationFrame(() => {
        try {
            const el = this.scrollContainer.nativeElement;
            el.scrollTop = el.scrollHeight;
        } catch(err) { }
    });
  }
}