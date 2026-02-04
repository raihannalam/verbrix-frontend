import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client, Message, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, firstValueFrom, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { UserProfileService } from '../profile/user-profile.service';

export interface ChatMessage {
  id?: string | number;
  relationshipId: number;
  senderEmail: string;
  recipientId?: number; // Optional depending on backend
  content: string;
  timestamp: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'VIDEO' | 'PDF';
  fileUrl?: string;
  status?: 'sending' | 'sent' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
  // Dependencies
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private userProfileService = inject(UserProfileService); // Use profile service for accurate ID
  
  private readonly API_URL = environment.apiUrl;
  
  // WebSocket State
  private stompClient: Client | null = null;
  private activeTopicSubscription: StompSubscription | null = null;
  private currentRelationshipId: number | null = null;

  // Data State
  private messageCache = new Map<number, ChatMessage[]>();
  public messages$ = new BehaviorSubject<ChatMessage[]>([]);
  public hasMoreMessages = signal(true);
  public isConnected = signal(false);

  // Audio
  private sentSound = new Audio('assets/sounds/sent_pop.mp3'); 
  private receivedSound = new Audio('assets/sounds/received_ding.mp3');

  constructor() {
    this.sentSound.volume = 0.5;
    this.receivedSound.volume = 0.5;
  }

  // ----------------------------------------------------------------
  // 1. HTTP METHODS (REST)
  // ----------------------------------------------------------------

  getMyConnections() { 
    return this.http.get<any[]>(`${this.API_URL}/relationships/mine`); 
  }

  getIncomingRequests() { 
    return this.http.get<any[]>(`${this.API_URL}/relationships/requests/incoming`); 
  }
  
  connectToInterpreter(profileId: number, initialMessage: string) {
    return this.http.post(`${this.API_URL}/relationships/connect`, {
      interpreterProfileId: profileId,
      initialMessage
    });
  }

  respondToRequest(relationshipId: number, action: 'ACCEPT' | 'DECLINE') {
    return this.http.patch(`${this.API_URL}/relationships/${relationshipId}/respond`, { action });
  }

  async uploadMedia(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await firstValueFrom(
      this.http.post<{ url: string }>(`${this.API_URL}/files/upload`, formData)
    );
    return response.url;
  }

  // ----------------------------------------------------------------
  // 2. HISTORY & CACHING
  // ----------------------------------------------------------------

  loadChatHistory(relationshipId: number, page: number = 0) {
    // A. Initial Load Logic
    if (page === 0) {
      this.hasMoreMessages.set(true); 
      
      // Serve from cache immediately if available
      if (this.messageCache.has(relationshipId)) {
        this.messages$.next(this.messageCache.get(relationshipId)!);
      } else {
        this.messages$.next([]);
      }
    }

    // B. Fetch from Backend
    const pageSize = 50;
    this.http.get<any>(`${this.API_URL}/chat/${relationshipId}/history?page=${page}&size=${pageSize}`)
      .subscribe({
        next: (response) => {
          // Assuming backend returns Page<ChatMessage> with content sorted DESC (newest first)
          // We reverse to show oldest at top for chat UI
          const history = response.content.reverse();
          
          if (history.length < pageSize) {
            this.hasMoreMessages.set(false);
          }

          let updatedList: ChatMessage[];
          
          if (page === 0) {
            updatedList = history;
          } else {
            // Prepend history to current state (Pagination)
            const current = this.messages$.value;
            updatedList = [...history, ...current];
          }

          // Update State & Cache
          this.updateState(relationshipId, updatedList);
        },
        error: (err) => console.error('Failed to load history', err)
      });
  }

  // ----------------------------------------------------------------
  // 3. WEBSOCKET CONNECTION
  // ----------------------------------------------------------------

  private getWebSocketUrl(): string {
    let url = this.API_URL;
    url = url.replace(/\/api\/v1\/?$/, '');
    url = url.replace(/^http/, 'ws');
    return `${url}/ws`;
  }

  private initConnection() {
    if (this.stompClient?.active) return;

    const token = this.authService.getAccessToken();
    if (!token) return;

    this.stompClient = new Client({
      brokerURL: this.getWebSocketUrl(),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.isConnected.set(true);
        // If we were trying to join a chat, resubscribe now
        if (this.currentRelationshipId) {
          this.subscribeToTopic(this.currentRelationshipId);
        }
      },
      onDisconnect: () => this.isConnected.set(false),
      onStompError: (frame) => console.error('Broker Error', frame.headers['message'])
    });

    this.stompClient.activate();
  }

  joinChat(relationshipId: number) {
    this.currentRelationshipId = relationshipId;
    
    // 1. Ensure Socket is Open
    this.initConnection();

    // 2. Unsubscribe from previous chat room
    if (this.activeTopicSubscription) {
      this.activeTopicSubscription.unsubscribe();
      this.activeTopicSubscription = null;
    }

    // 3. Subscribe if connected (otherwise onConnect will handle it)
    if (this.stompClient?.connected) {
      this.subscribeToTopic(relationshipId);
    }

    // 4. Load REST History
    this.loadChatHistory(relationshipId, 0);
  }

  private subscribeToTopic(relationshipId: number) {
    if (!this.stompClient) return;

    this.activeTopicSubscription = this.stompClient.subscribe(
      `/topic/chat/${relationshipId}`, 
      (message: Message) => {
        try {
          const parsedMsg: ChatMessage = JSON.parse(message.body);
          this.handleIncomingMessage(parsedMsg);
        } catch (e) {
          console.error('Parse error', e);
        }
      }
    );
  }

  // ----------------------------------------------------------------
  // 4. MESSAGE HANDLING
  // ----------------------------------------------------------------

  sendMessage(relationshipId: number, content: string, type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT', fileUrl?: string) {
    if (!content && !fileUrl) return;

    this.playSound('sent');
    const myEmail = this.getCurrentUserEmail();

    // A. Optimistic Update (Show immediately)
    const tempMessage: ChatMessage = {
      relationshipId,
      senderEmail: myEmail,
      content: content,
      timestamp: new Date().toISOString(),
      type: type,
      fileUrl: fileUrl,
      status: 'sending'
    };

    this.handleIncomingMessage(tempMessage);

    // B. Publish to Socket
    if (this.stompClient?.connected) {
      this.stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({ 
          relationshipId, 
          content, 
          type, 
          fileUrl 
        })
      });
    } else {
      // Handle offline case if needed (queueing)
      console.warn('Socket offline, message not sent to server');
    }
  }

  private handleIncomingMessage(newMsg: ChatMessage) {
    const currentMessages = this.messages$.value;
    const myEmail = this.getCurrentUserEmail();

    // 1. Deduplication (Optimistic vs Echo)
    // We check if we have a message with same content/sender in the last 5 seconds
    const existingIndex = currentMessages.findIndex(msg => 
      msg.senderEmail === newMsg.senderEmail &&
      msg.content === newMsg.content &&
      msg.status === 'sending' // Only replace 'sending' messages
    );

    let updatedList: ChatMessage[];

    if (existingIndex !== -1) {
        // REPLACE Optimistic Message with Server Echo
        updatedList = [...currentMessages];
        updatedList[existingIndex] = { 
            ...newMsg, 
            status: 'sent', 
            id: newMsg.id || updatedList[existingIndex].id // Keep temp ID if server doesn't send one (rare)
        };
    } else {
        // NEW Message
        updatedList = [...currentMessages, newMsg];
        
        // Play sound if it's from someone else
        if (newMsg.senderEmail !== myEmail) {
            this.playSound('received');
        }
    }

    this.updateState(newMsg.relationshipId, updatedList);
  }

  private updateState(relationshipId: number, list: ChatMessage[]) {
    // Only update the BehaviorSubject if this is the ACTIVE chat
    if (this.currentRelationshipId === relationshipId) {
      this.messages$.next(list);
    }
    // Always update cache
    this.messageCache.set(relationshipId, list);
  }

  // ----------------------------------------------------------------
  // 5. HELPERS
  // ----------------------------------------------------------------

  private getCurrentUserEmail(): string {
    // Priority: Profile Service -> Auth Service -> Empty
    return this.userProfileService.snapshot?.email 
        || this.authService.currentUser()?.email 
        || '';
  }

  private playSound(type: 'sent' | 'received') {
    try {
        const audio = type === 'sent' ? this.sentSound : this.receivedSound;
        audio.currentTime = 0; 
        audio.play().catch(() => { /* Interactions required for audio */ });
    } catch (e) {}
  }

  disconnect() {
    if (this.activeTopicSubscription) this.activeTopicSubscription.unsubscribe();
    if (this.stompClient) this.stompClient.deactivate();
    this.isConnected.set(false);
  }

  ngOnDestroy() {
    this.disconnect();
  }
}