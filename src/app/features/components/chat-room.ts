import { 
  Component, inject, Input, OnInit, OnChanges, SimpleChanges, 
  ElementRef, ViewChild, OnDestroy, ChangeDetectorRef, signal 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatService, ChatMessage } from '../../core/services/chat.service';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full bg-slate-50 relative">
      
      <div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" 
           #scrollContainer 
           (scroll)="onScroll($event)">
        
        @if (isLoadingHistory()) {
            <div class="flex justify-center py-2">
                <div class="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
        }

        @for (msg of messages; track msg.timestamp) {
          <div class="flex w-full animate-fade-in" 
               [ngClass]="isMe(msg) ? 'justify-end' : 'justify-start'">
            
            <div class="max-w-[75%] flex flex-col" [ngClass]="isMe(msg) ? 'items-end' : 'items-start'">
              
              <div class="p-3 rounded-2xl text-sm shadow-sm relative break-words group min-w-[60px]"
                   [ngClass]="isMe(msg) 
                     ? 'bg-blue-600 text-white rounded-br-none' 
                     : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'">
                
                {{ msg.type === 'TEXT' ? msg.content : 'Attachment' }}
                
                @if (isMe(msg)) {
                   <div class="absolute -left-5 bottom-1 text-xs w-4 h-4 flex items-center justify-center">
                     @if (msg.status === 'sending') { <i class="ri-loader-4-line animate-spin text-gray-400"></i> }
                     @else { <i class="ri-check-double-line text-blue-400"></i> }
                   </div>
                }
              </div>
              <p class="text-[10px] text-gray-400 mt-1">{{ msg.timestamp | date:'shortTime' }}</p>
            </div>
          </div>
        }
      </div>

      <div class="p-3 bg-white border-t mt-auto flex-shrink-0 z-10">
        <div class="flex gap-2 items-center bg-gray-100 p-2 rounded-xl border border-transparent focus-within:border-blue-300 focus-within:bg-white transition-all">
          <input type="text" [(ngModel)]="newMessage" (keyup.enter)="send()"
                 placeholder="Type a message..."
                 class="flex-1 bg-transparent border-none focus:ring-0 px-2 text-sm outline-none text-gray-700">
          <button (click)="send()" [disabled]="!newMessage.trim()"
                  class="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-sm disabled:opacity-50">
            <i class="ri-send-plane-fill"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`.custom-scrollbar { scroll-behavior: auto; }`]
})
export class ChatRoomComponent implements OnInit, OnChanges, OnDestroy {
  @Input() relationshipId!: number;
  @Input() currentUserEmail: string = ''; 
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  private chatService = inject(ChatService);
  private cdr = inject(ChangeDetectorRef);
  private sub!: Subscription;

  messages: ChatMessage[] = [];
  newMessage = '';
  isLoadingHistory = signal(false);
  private currentPage = 0;
  private lastScrollHeight = 0;

  ngOnInit() {
    this.sub = this.chatService.messages$.subscribe(msgs => {
      const isPagination = msgs.length > this.messages.length && msgs.length > 0 && this.messages.length > 0 && msgs[0].id !== this.messages[0].id;
      this.messages = msgs;
      this.cdr.detectChanges();
      isPagination ? this.restoreScrollPosition() : this.scrollToBottom();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['relationshipId'] && this.relationshipId) {
      this.messages = [];
      this.currentPage = 0; 
      this.chatService.joinChat(this.relationshipId);
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  onScroll(event: any) {
    const element = event.target;
    if (element.scrollTop === 0 && !this.isLoadingHistory() && this.chatService.hasMoreMessages()) {
      this.isLoadingHistory.set(true);
      this.currentPage++;
      this.lastScrollHeight = element.scrollHeight; 
      setTimeout(() => {
          this.chatService.loadChatHistory(this.relationshipId, this.currentPage);
          this.isLoadingHistory.set(false);
      }, 500);
    }
  }

  private restoreScrollPosition() {
    if (this.scrollContainer) this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight - this.lastScrollHeight;
  }

  private scrollToBottom() {
    if (this.scrollContainer) setTimeout(() => this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight, 0);
  }

  send() {
    if (!this.newMessage.trim()) return;
    this.chatService.sendMessage(this.relationshipId, this.newMessage);
    this.newMessage = '';
    this.scrollToBottom();
  }

  isMe(msg: ChatMessage): boolean {
    return !!this.currentUserEmail && msg.senderEmail?.toLowerCase() === this.currentUserEmail.toLowerCase();
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }
}