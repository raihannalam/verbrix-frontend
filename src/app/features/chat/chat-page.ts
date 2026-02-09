import { Component, inject, OnInit, OnDestroy, AfterViewInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StompSubscription } from '@stomp/stompjs';

// Services
import { ChatService, ChatMessage } from '../../core/services/chat.service';
import { RealtimeService } from '../../core/realtime/realtime.service';
import { AuthService } from '../../core/auth/auth.service';
import { PaymentService } from '../../core/services/payment.service';

// Components
import { Navbar } from '../layout/navbar';
import { VideoCallComponent } from '../components/video-call'; // 🟢 1. Import Video Component

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, Navbar, FormsModule, DatePipe, VideoCallComponent], // 🟢 2. Add to imports
  template: `
    <app-navbar></app-navbar>

    @if (videoCallToken()) {
      <app-video-call 
         [token]="videoCallToken()!" 
         wsUrl="wss://verbrix-is1gv2zd.livekit.cloud" 
         (close)="onCallEnded()">
      </app-video-call>
    }

    <div class="h-screen bg-white dark:bg-[#0f1115] pt-[72px] flex font-sans overflow-hidden">
      
      <div class="w-80 md:w-96 border-r border-gray-200 dark:border-gray-800 flex flex-col z-20 bg-white dark:bg-[#181a1f]">
        <div class="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
        </div>
        
        <div class="flex-1 overflow-y-auto custom-scrollbar">
          @for (rel of relationships(); track rel.relationshipId) {
            <div (click)="selectConversation(rel)"
                 class="p-4 border-b border-gray-50 dark:border-gray-800/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1f2229] transition-all relative"
                 [class.bg-blue-50]="selectedRel()?.relationshipId === rel.relationshipId"
                 [class.dark:bg-blue-900_20]="selectedRel()?.relationshipId === rel.relationshipId">
              
              <div class="flex items-center gap-4">
                <div class="relative shrink-0">
                    <img *ngIf="getOtherAvatar(rel)" [src]="getOtherAvatar(rel)" class="w-12 h-12 rounded-full object-cover">
                    <div *ngIf="!getOtherAvatar(rel)" class="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-lg">
                        {{ getOtherName(rel).charAt(0) }}
                    </div>
                    <span class="absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-[#181a1f] rounded-full"
                          [ngClass]="rel.online ? 'bg-green-500' : 'bg-gray-400'"></span>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-baseline mb-1">
                    <h3 class="font-bold text-gray-900 dark:text-white truncate text-sm">
                        {{ getOtherName(rel) }}
                    </h3>
                    <span class="text-[10px] text-gray-400">
                        {{ rel.lastMessageTime | date:'shortTime' }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 truncate">
                      {{ rel.lastMessagePreview || 'Click to chat' }}
                  </p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="flex-1 flex flex-col bg-[#f0f2f5] dark:bg-[#0b0c0f] relative">
        
        @if (selectedRel(); as rel) {
          
          <div class="h-[72px] bg-white dark:bg-[#181a1f] border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between shadow-sm z-10">
            <div class="flex items-center gap-4">
               <img [src]="getOtherAvatar(rel) || 'assets/default-avatar.png'" class="w-10 h-10 rounded-full object-cover">
               <div>
                  <h2 class="text-base font-bold text-gray-900 dark:text-white leading-tight">
                    {{ getOtherName(rel) }}
                  </h2>
                  <span class="text-xs text-green-600 dark:text-green-400 font-medium">Online</span>
               </div>
            </div>

            <button (click)="startVideoCall()"
                    [disabled]="!isVideoAllowed(rel.status)"
                    class="flex items-center gap-2 px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs">
              <i class="ri-vidicon-fill text-sm"></i>
              <span>Call</span>
            </button>
          </div>

          <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            
            @if (messagesLoading()) {
              <div class="flex justify-center py-10">
                 <div class="loader"></div>
              </div>
            }

            @for (msg of messages(); track msg.id) {
              @if (msg.type === 'SYSTEM') {
                 <div class="flex justify-center w-full my-4">
                    <span class="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[11px] rounded-full italic shadow-sm">
                       Verbrix System: {{ msg.content }}
                    </span>
                 </div>
              } @else {
                  <div class="flex w-full flex-col" [class.items-end]="isMyMessage(msg)" [class.items-start]="!isMyMessage(msg)">
                    <div class="max-w-[70%] relative group">
                      <div class="px-4 py-2 text-sm shadow-sm break-words"
                           [ngClass]="isMyMessage(msg) 
                             ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                             : 'bg-white dark:bg-[#1f2229] text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-sm'">
                        
                        @if (msg.type === 'IMAGE' && msg.fileUrl) {
                           <div class="mb-2 overflow-hidden rounded-lg">
                             <img [src]="msg.fileUrl" class="max-w-full max-h-60 object-cover cursor-pointer" (click)="openImage(msg.fileUrl)">
                           </div>
                        }
                        <span class="whitespace-pre-wrap leading-relaxed">{{ msg.content }}</span>
                      </div>
                      <span class="text-[10px] text-gray-400 mt-1 px-1 block" 
                            [class.text-right]="isMyMessage(msg)"
                            [class.text-left]="!isMyMessage(msg)">
                        {{ msg.timestamp | date:'shortTime' }}
                      </span>
                    </div>
                  </div>
              }
            }
          </div>

          <div class="bg-white dark:bg-[#181a1f] border-t border-gray-200 dark:border-gray-800 p-3 sticky bottom-0 z-20">
            
            @if (rel.status === 'REQUESTED') {
              <div class="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-sm rounded-lg">
                 <i class="ri-lock-line mr-1"></i> Request pending acceptance.
              </div>
            } 
            
            @else if (rel.status === 'REQUEST_ACCEPTED' && isClient()) {
               <div class="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800 mb-3">
                    <div class="text-sm">
                        <span class="block font-bold text-indigo-900 dark:text-indigo-300">Consultation Fee</span>
                        <span class="text-xs text-indigo-600 dark:text-indigo-400">Pay to enable calls. Chat is open.</span>
                    </div>
                    <button (click)="payConsultation(rel)" 
                            [disabled]="isProcessingPayment()"
                            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-2">
                      <i *ngIf="isProcessingPayment()" class="ri-loader-4-line animate-spin"></i>
                      {{ isProcessingPayment() ? 'Processing...' : 'Pay Now' }}
                    </button>
               </div>
               <ng-container *ngTemplateOutlet="inputBox"></ng-container>
            } @else {
               <ng-container *ngTemplateOutlet="inputBox"></ng-container>
            }

            <ng-template #inputBox>
                <div class="flex items-end gap-2 max-w-5xl mx-auto">
                    <input type="file" #fileInput hidden (change)="handleFileUpload($event)" accept="image/*">
                    <button (click)="fileInput.click()" 
                            [disabled]="isUploading()"
                            class="p-3 mb-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <i *ngIf="!isUploading()" class="ri-attachment-2 text-xl"></i>
                        <i *ngIf="isUploading()" class="ri-loader-4-line animate-spin text-xl"></i>
                    </button>

                    <div class="flex-1 bg-gray-100 dark:bg-[#252830] rounded-[24px] flex items-center px-4 py-2 transition-all focus-within:ring-2 focus-within:ring-blue-500/50">
                        <textarea [(ngModel)]="newMessage" 
                                  (keydown.enter)="$event.preventDefault(); sendMessage()"
                                  placeholder="Message..." 
                                  rows="1"
                                  class="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500 resize-none max-h-32 py-2 shadow-none outline-none ring-0"></textarea>
                    </div>
                        
                    <button (click)="sendMessage()" 
                            [disabled]="!newMessage.trim()"
                            class="p-3 mb-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md flex items-center justify-center">
                      <i class="ri-send-plane-fill text-lg"></i>
                    </button>
                </div>
            </ng-template>

          </div>

        } @else {
          <div class="flex-1 flex flex-col items-center justify-center text-gray-400">
            <i class="ri-chat-smile-2-line text-5xl mb-4 opacity-30"></i>
            <p>Select a conversation</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar { scrollbar-width: thin; }
    
    textarea {
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        background-color: transparent !important;
    }
    textarea:focus {
        outline: none !important;
        box-shadow: none !important;
    }
  `]
})
export class ChatPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private chatService = inject(ChatService);
  private realtime = inject(RealtimeService);
  private auth = inject(AuthService);
  private paymentService = inject(PaymentService);
  private route = inject(ActivatedRoute);

  relationships = signal<any[]>([]);
  selectedRel = signal<any>(null);
  messages = signal<ChatMessage[]>([]);
  messagesLoading = signal(false);
  isUploading = signal(false);
  isProcessingPayment = signal(false);
  
  // 🟢 4. State for the Video Call
  videoCallToken = signal<string | null>(null);

  newMessage = '';
  
  private chatSubscription: StompSubscription | null = null;
  private mutationObserver: MutationObserver | null = null;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  ngOnInit() {
    this.loadRelationships();
  }

  ngAfterViewInit() {
    this.mutationObserver = new MutationObserver(() => {
      this.scrollToBottom();
    });
  }

  private attachScrollObserver() {
    if (this.scrollContainer && !this.mutationObserver) {
       this.mutationObserver = new MutationObserver(() => this.scrollToBottom());
       this.mutationObserver.observe(this.scrollContainer.nativeElement, { childList: true, subtree: true });
    } else if (this.scrollContainer && this.mutationObserver) {
       this.mutationObserver.disconnect();
       this.mutationObserver.observe(this.scrollContainer.nativeElement, { childList: true, subtree: true });
    }
  }

  ngOnDestroy() {
    this.unsubscribeFromChat();
    if (this.mutationObserver) this.mutationObserver.disconnect();
  }

  loadRelationships() {
    this.chatService.getMyRelationships().subscribe({
      next: (data) => {
        this.relationships.set(data);
        const relId = this.route.snapshot.queryParamMap.get('relationshipId');
        if (relId) {
          const target = data.find(r => r.relationshipId === Number(relId));
          if (target) this.selectConversation(target);
        }
      }
    });
  }

  selectConversation(rel: any) {
    if (this.selectedRel()?.relationshipId === rel.relationshipId) return;

    this.selectedRel.set(rel);
    this.messagesLoading.set(true);
    this.messages.set([]); 
    this.unsubscribeFromChat();

    this.chatService.getChatHistory(rel.relationshipId).subscribe({
      next: (msgs) => {
        this.messages.set(msgs);
        this.messagesLoading.set(false);
        setTimeout(() => {
            this.attachScrollObserver();
            this.scrollToBottom();
        }, 50);
      }
    });

    this.chatSubscription = this.realtime.subscribeToTopic(
      `/topic/chat/${rel.relationshipId}`, 
      (msg) => {
        this.messages.update(prev => [...prev, msg]);
        this.scrollToBottom();
      }
    );
  }

  sendMessage(type: 'TEXT' | 'IMAGE' = 'TEXT', fileUrl?: string) {
    if ((!this.newMessage.trim() && type === 'TEXT') || !this.selectedRel()) return;

    const payload = {
      relationshipId: this.selectedRel().relationshipId,
      content: type === 'TEXT' ? this.newMessage : 'Image sent',
      type: type,
      fileUrl: fileUrl || null
    };

    this.realtime.sendMessage('/app/chat.sendMessage', payload);
    if (type === 'TEXT') this.newMessage = '';
    
    this.scrollToBottom();
  }

  handleFileUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading.set(true);
    this.chatService.uploadAttachment(file).subscribe({
        next: (response) => {
            this.sendMessage('IMAGE', response.url);
            this.isUploading.set(false);
        },
        error: (err) => {
            console.error(err);
            this.isUploading.set(false);
            alert('Upload failed.');
        }
    });
  }

  payConsultation(rel: any) {
    if (this.isProcessingPayment()) return;
    this.isProcessingPayment.set(true);

    this.paymentService.createConsultationOrder(rel.relationshipId).subscribe({
        next: (order) => {
            this.paymentService.openGateway(
                order,
                this.auth.currentUser()?.email || '',
                (successRes) => {
                    alert('Payment Successful! Video calls unlocked.');
                    this.loadRelationships();
                    this.isProcessingPayment.set(false);
                },
                (error) => {
                    alert('Payment Failed: ' + (error.description || error));
                    this.isProcessingPayment.set(false);
                }
            );
        },
        error: (err) => {
            alert('Could not initiate payment. Please try again.');
            this.isProcessingPayment.set(false);
        }
    });
  }

  // 🟢 5. LOGIC TO START CALL
  startVideoCall() {
    const rel = this.selectedRel();
    if (!rel) return;

    this.chatService.joinVideoCall(rel.relationshipId).subscribe({
        next: (token) => {
            // Set the token, which triggers the @if block in the HTML
            this.videoCallToken.set(token);
        },
        error: (err) => {
            console.error('Call failed', err);
            alert('Could not start call. Ensure payment is complete.');
        }
    });
  }

  // 🟢 6. LOGIC TO END CALL
  onCallEnded() {
    this.videoCallToken.set(null); // This removes the component from the DOM
  }

  isClient() { return this.auth.isClient(); }
  
  isMyMessage(msg: ChatMessage): boolean {
    const myEmail = this.auth.currentUser()?.email;
    return !!myEmail && msg.senderEmail === myEmail;
  }

  getOtherName(rel: any): string {
    return this.isClient() ? rel.interpreterName : rel.clientName;
  }

  getOtherAvatar(rel: any): string | null {
    return this.isClient() ? rel.interpreterProfilePicture : rel.clientProfilePicture;
  }

  openImage(url: string) {
    window.open(url, '_blank');
  }

  isVideoAllowed(status: string): boolean {
    return ['CONSULTATION_ACTIVE', 'AGREEMENT_ACTIVE', 'WORK_ACTIVE'].includes(status);
  }

  getStatusColor(status: string) { return 'bg-gray-100 text-gray-600'; }

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