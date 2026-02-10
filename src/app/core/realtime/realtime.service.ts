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

  constructor() {
    // 🟢 FIX: Effect now listens to the accessToken SIGNAL
    // This creates the "Automatic Reconnect" behavior
    effect((onCleanup) => {
      const user = this.authService.currentUser();
      const token = this.authService.accessToken(); 
      
      // If we have a user and a token...
      if (user && token && !this.authService.isTokenExpired(token)) {
         // ... connect using THAT SPECIFIC token
         this.connect(token);
      } else {
         this.disconnect();
      }

      // 🟢 FIX: Explicit Cleanup
      // When the token changes (signal updates), this function runs FIRST
      // This kills the old connection before the new one starts
      onCleanup(() => {
        this.disconnect();
      });
    });
  }

  private connect(token: string): void {
    // Safety check: Don't connect if already active (though cleanup handles this)
    if (this.client?.active) return;

    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    const host = environment.apiBaseUrl.replace(/^http(s)?:\/\//, ''); 
    const brokerURL = `${protocol}://${host}/ws?access_token=${token}`;

    this.client = new Client({
      brokerURL: brokerURL,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 20000, 
      heartbeatOutgoing: 20000,
      debug: (str) => {
        if(str.includes('Error') || str.includes('Connect')) console.debug('[STOMP]:', str);
      }
    });

    this.client.onConnect = () => {
      console.log('RealtimeService: Connected Successfully');
      this.connected$.next(true);

      this.subscription = this.client!.subscribe('/user/queue/notifications', (message) => {
          try {
            this.eventsSubject.next(JSON.parse(message.body));
          } catch (e) { console.error('Parse error', e); }
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error:', frame.headers['message']);
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

  // 🟢 FIX: Robust Disconnect
  // Ensures we completely kill the client and subscription
  private disconnect(): void {
    this.connected$.next(false);
    
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    
    if (this.client) {
      // Force deactivate
      this.client.deactivate();
      this.client = null;
    }
  }

  public sendMessage(destination: string, body: any): void {
    if (this.connected$.value && this.client?.connected) {
        this.client.publish({ destination, body: JSON.stringify(body) });
    }
  }

  // NOTE: This helper handles subscriptions for specific components
  public subscribeToTopic(topic: string, callback: (payload: any) => void): StompSubscription {
    if (this.connected$.value && this.client?.connected) {
        return this.client.subscribe(topic, (msg) => callback(JSON.parse(msg.body)));
    }

    // Queue subscription if not yet connected
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