import { Injectable, OnDestroy, inject, effect } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import { Subject, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

export interface RealtimeEvent {
  type: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeService implements OnDestroy {
  private authService = inject(AuthService);

  private client: Client | null = null;
  private subscription: StompSubscription | null = null;
  
  public connected$ = new BehaviorSubject<boolean>(false);
  private eventsSubject = new Subject<RealtimeEvent | null>();
  public events$ = this.eventsSubject.asObservable();

  private isRefreshing = false;
  private retryCount = 0;

  constructor() {
    effect((onCleanup) => {
      // Only connect if we have a user AND a valid token
      const user = this.authService.currentUser();
      const token = this.authService.getAccessToken();
      
      if (user && token && !this.authService.isTokenExpired(token)) {
         this.connect();
      } else {
         this.disconnect();
      }

      onCleanup(() => {
        if (!this.authService.getAccessToken()) this.disconnect();
      });
    });
  }

  private connect(): void {
    if (this.client?.active || this.isRefreshing) return;

    const token = this.authService.getAccessToken();
    if (!token) return;

    // 1. Pre-check: If token is expired, refresh FIRST, then connect
    if (this.authService.isTokenExpired(token)) {
      this.isRefreshing = true;
      this.authService.refreshToken().subscribe({
        next: () => {
          this.isRefreshing = false;
          this.connect(); // Retry connection with new token
        },
        error: () => this.isRefreshing = false
      });
      return; 
    }

    // 2. Build URL with Query Param (Crucial for Spring Security)
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    const host = environment.apiBaseUrl.replace(/^http(s)?:\/\//, ''); 
    // 🟢 FIX: Pass token in URL to bypass Handshake Interceptors issues
    const brokerURL = `${protocol}://${host}/ws?access_token=${token}`;

    this.client = new Client({
      brokerURL: brokerURL,
      // We still send headers for STOMP, but URL handles the Handshake
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 20000, // Increase heartbeat tolerance
      heartbeatOutgoing: 20000,
      debug: (str) => {
        // Only log errors or specific connection events to reduce noise
        if(str.includes('Error') || str.includes('Connect')) console.debug('[STOMP]:', str);
      }
    });

    this.client.onConnect = () => {
      console.log('RealtimeService: Connected Successfully');
      this.connected$.next(true);
      this.retryCount = 0; // Reset retry counter on success

      this.subscription = this.client!.subscribe('/user/queue/notifications', (message) => {
          try {
            this.eventsSubject.next(JSON.parse(message.body));
          } catch (e) { console.error('Parse error', e); }
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error:', frame.headers['message']);
      console.error('Details:', frame.body);
      // If session is closed, force a disconnect so we can cleanly retry
      if (frame.headers['message']?.includes('Session closed')) {
         this.disconnect(); 
      }
    };
    
    this.client.onWebSocketError = (evt) => {
        console.error('WebSocket Error - Connection dropped');
    };

    this.client.onDisconnect = () => {
        this.connected$.next(false);
    }

    this.client.activate();
  }

  private disconnect(): void {
    this.connected$.next(false);
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  public sendMessage(destination: string, body: any): void {
    if (this.connected$.value && this.client?.connected) {
        this.client.publish({ destination, body: JSON.stringify(body) });
    }
  }

  public subscribeToTopic(topic: string, callback: (payload: any) => void): StompSubscription {
    if (this.connected$.value && this.client?.connected) {
        return this.client.subscribe(topic, (msg) => callback(JSON.parse(msg.body)));
    }

    const autoSub = this.connected$.pipe(
        filter(c => c), take(1)
    ).subscribe(() => {
        if(this.client?.connected) {
           this.client.subscribe(topic, (msg) => callback(JSON.parse(msg.body)));
        }
    });

    return { id: 'pending', unsubscribe: () => autoSub.unsubscribe() } as StompSubscription;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}