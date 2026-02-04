import { Component, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { ChatService } from '../../core/services/chat.service';
import { PaymentService } from '../../core/services/payment.service';
import { VideoService } from '../../core/services/video.service';
import { RealtimeService } from '../../core/realtime/realtime.service';
import { ChatRoomComponent } from './chat-room';
import { VideoCallComponent } from './video-call';
import { AuthService } from '../../core/auth/auth.service';
import { UserProfileService } from '../../core/profile/user-profile.service';
import { UserRole } from '../../core/models/auth.models';

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [CommonModule, ChatRoomComponent, VideoCallComponent],
  template: `
    <div class="flex h-[calc(100vh-140px)] md:h-[600px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm relative">

      <div [class.hidden]="selectedChatId() && isMobile()"
           class="w-full md:w-1/3 lg:w-1/4 border-r border-gray-100 bg-gray-50 flex flex-col h-full">
           
           <div class="p-4 border-b border-gray-100 bg-white h-[65px] flex items-center justify-between">
             <h3 class="font-bold text-gray-800">Messages</h3>
             <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">{{ activeChats().length }}</span>
           </div>

           <div class="flex-1 overflow-y-auto p-2 space-y-1">
             @for (chat of activeChats(); track chat.relationshipId) {
               <div (click)="selectChat(chat)" 
                    class="group p-3 rounded-xl cursor-pointer hover:bg-white hover:shadow-sm transition-all border border-transparent"
                    [class.bg-white]="selectedChatId() === chat.relationshipId"
                    [class.shadow-sm]="selectedChatId() === chat.relationshipId">
                 <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                      {{ (getOtherUserName(chat) || '?').charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-center">
                        <p class="font-bold text-sm text-gray-700 truncate">{{ getOtherUserName(chat) }}</p>
                        @if(chat.status === 'CONSULTATION_ACTIVE') { 
                          <span class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span> 
                        }
                      </div>
                      <p class="text-xs text-gray-500 truncate group-hover:text-blue-600 transition-colors">
                        {{ chat.lastMessage || 'Open conversation' }}
                      </p>
                    </div>
                 </div>
               </div>
             }
           </div>
      </div>

      <div [class.hidden]="!selectedChatId() && isMobile()"
           class="w-full md:w-2/3 lg:w-3/4 bg-white flex flex-col h-full absolute md:static inset-0 z-20">

        @if (selectedChatId()) {
          
          <div class="px-4 border-b border-gray-100 bg-white h-[65px] flex justify-between items-center shadow-sm z-20 relative">
            <div class="flex items-center gap-3">
              <button (click)="clearSelection()" class="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <i class="ri-arrow-left-line text-xl"></i>
              </button>
              <div>
                <h3 class="font-bold text-gray-800 leading-tight">{{ activeChatName() }}</h3>
                <p class="text-[10px] uppercase font-bold tracking-wider text-gray-400">{{ activeChatStatus().replace('_', ' ') }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              
              @if (isPaymentPending()) {
                <button (click)="initiatePayment()" [disabled]="isProcessing()"
                        class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-md shadow-green-600/20 flex items-center gap-2 active:scale-95 transition-all">
                  @if (isProcessing()) { <i class="ri-loader-4-line animate-spin"></i> } 
                  @else { <i class="ri-bank-card-line"></i> }
                  <span class="hidden sm:inline">Pay Fee</span>
                </button>
              }

              @if (isCallActive()) {
                <button (click)="startCall(false)" 
                        [disabled]="isProcessing()"
                        class="h-10 w-10 sm:w-auto sm:px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl flex items-center justify-center gap-2 transition-all"
                        title="Audio Call">
                  <i class="ri-phone-line text-lg"></i>
                  <span class="hidden sm:inline text-sm font-bold">Call</span>
                </button>

                <button (click)="startCall(true)" 
                        [disabled]="isProcessing()"
                        class="h-10 w-10 sm:w-auto sm:px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                        title="Video Call">
                  <i class="ri-video-chat-fill text-lg"></i>
                  <span class="hidden sm:inline text-sm font-bold">Video</span>
                </button>
              }
            </div>
          </div>

          @if (isVideoMode()) {
            <div class="flex-1 h-full w-full overflow-hidden bg-black">
               <app-video-call 
                  [token]="roomToken()!" 
                  [startWithVideo]="startWithVideo()"
                  [onLeave]="leaveVideoCallBound">
               </app-video-call>
            </div>
          } @else {
            <app-chat-room
              [relationshipId]="selectedChatId()!"
              [currentUserEmail]="currentUser()?.email || ''" 
              class="flex-1 h-full overflow-hidden block">
            </app-chat-room>
          }

        } @else {
          <div class="hidden md:flex h-full flex-col items-center justify-center text-gray-400 bg-gray-50">
            <div class="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <i class="ri-chat-smile-3-line text-3xl text-blue-500"></i>
            </div>
            <p class="font-medium">Select a conversation to start</p>
          </div>
        }
      </div>
    </div>
  `
})
export class ChatLayoutComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private paymentService = inject(PaymentService);
  private videoService = inject(VideoService);
  private realtime = inject(RealtimeService);
  private authService = inject(AuthService);
  private userProfileService = inject(UserProfileService);

  private sub: Subscription | null = null;

  // Signals
  activeChats = signal<any[]>([]);
  selectedChatId = signal<number | null>(null);
  
  isProcessing = signal(false);
  isVideoMode = signal(false);
  startWithVideo = signal(true); // 🔴 New: Controls camera start state
  roomToken = signal<string | null>(null);
  isMobile = signal(window.innerWidth < 768);

  // Computed
  currentUser = computed(() => this.userProfileService.profile() || this.authService.currentUser());
  
  activeChatName = computed(() => {
    const chat = this.activeChats().find(c => c.relationshipId === this.selectedChatId());
    return chat ? this.getOtherUserName(chat) : 'Chat';
  });

  activeChatStatus = computed(() => {
    const chat = this.activeChats().find(c => c.relationshipId === this.selectedChatId());
    return chat?.status || '';
  });

  isPaymentPending = computed(() => {
    const s = this.activeChatStatus();
    return s === 'REQUEST_ACCEPTED' || s === 'CONSULTATION_PENDING_PAYMENT';
  });

  isCallActive = computed(() => {
    const s = this.activeChatStatus();
    return s === 'CONSULTATION_ACTIVE' || s === 'AGREEMENT_ACTIVE';
  });

  leaveVideoCallBound = () => this.leaveVideoCall();

  constructor() {
    window.addEventListener('resize', () => { this.isMobile.set(window.innerWidth <768); });
  }

  ngOnInit() {
    if (!this.userProfileService.snapshot) this.userProfileService.loadProfile();
    this.loadChats();
    this.subscribeToRealtime();
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  loadChats() {
    this.chatService.getMyConnections().subscribe({
      next: chats => this.activeChats.set(chats)
    });
  }

  // --- ACTIONS ---

  initiatePayment() {
    const id = this.selectedChatId();
    if (!id) return;
    this.isProcessing.set(true);

    this.paymentService.createConsultationOrder(id).subscribe({
      next: (order) => {
        this.paymentService.openGateway(order, this.currentUser()?.email || '', 
          () => {
            console.log('Payment success. Waiting for Webhook...');
            this.isProcessing.set(false);
          },
          (err) => { console.error(err); alert('Payment Failed'); this.isProcessing.set(false); }
        );
      },
      error: () => { alert('Error creating order'); this.isProcessing.set(false); }
    });
  }

  // 🔴 UPDATED: Call Starter
  startCall(withVideo: boolean) {
    const id = this.selectedChatId();
    if (!id) return;
    
    this.isProcessing.set(true);
    this.startWithVideo.set(withVideo); // Store preference

    this.videoService.getCallToken(id).subscribe({
      next: (token) => {
        this.roomToken.set(token);
        this.isVideoMode.set(true); // Switch view
        this.isProcessing.set(false);
      },
      error: (err) => {
        console.error(err);
        alert('Call failed. Please try again.');
        this.isProcessing.set(false);
      }
    });
  }

  leaveVideoCall() {
    this.isVideoMode.set(false);
    this.roomToken.set(null);
  }

  selectChat(chat: any) {
    this.selectedChatId.set(chat.relationshipId);
    this.isVideoMode.set(false);
  }

  clearSelection() {
    this.selectedChatId.set(null);
    this.isVideoMode.set(false);
  }

  private subscribeToRealtime() {
    this.sub = this.realtime.events$.subscribe(event => {
      if (event && ['CONSULTATION_STARTED', 'RELATIONSHIP_REQUEST_RESPONSE'].includes(event.type)) {
        this.loadChats();
      }
    });
  }

  getOtherUserName(chat: any): string {
    const user = this.currentUser();
    if (!user || !user.role) return 'Loading...';
    const role = user.role.toString().replace('ROLE_', '').toUpperCase();
    if (role === 'CLIENT') return chat.interpreterName || 'Interpreter';
    if (role === 'INTERPRETER') return chat.clientName || 'Client';
    return 'Unknown';
  }

  getAvatarColor(id: number): string {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500'];
    return colors[id % colors.length];
  }
}