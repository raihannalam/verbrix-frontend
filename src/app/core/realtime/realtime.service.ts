import { Injectable, OnDestroy, inject, effect } from '@angular/core';
import { Client, StompSubscription, IMessage } from '@stomp/stompjs';
import { Subject, BehaviorSubject, filter, take, scan, map } from 'rxjs';
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

  // 🟢 FIX 1: DEDUPLICATION LOGIC
  // This pipe filters out duplicate messages based on ID before they reach your components
  public events$ = this.eventsSubject.asObservable().pipe(
    filter((event): event is RealtimeEvent => event !== null), // Ignore nulls
    scan((acc, curr) => {
      // ⚠️ IMPORTANT: Change 'curr.data?.id' to whatever unique ID your backend sends (e.g., messageId, uuid)
      const currentId = curr.data?.id || JSON.stringify(curr.data); 
      const isDuplicate = acc.lastId === currentId;

      return { 
        lastId: currentId, 
        payload: isDuplicate ? null : curr 
      };
    }, { lastId: null, payload: null } as { lastId: any, payload: RealtimeEvent | null }),
    map(acc => acc.payload), // Extract the message
    filter((event): event is RealtimeEvent => event !== null) // Final filter to drop duplicates
  );

  constructor() {
    // 🟢 FIX 2: AUTOMATIC RECONNECT via SIGNALS
    effect((onCleanup) => {
      const user = this.authService.currentUser();
      const token = this.authService.accessToken(); 
      
      // If we have a user and a valid token...
      if (user && token && !this.authService.isTokenExpired(token)) {
         // ... connect using THAT SPECIFIC token
         this.connect(token);
      } else {
         this.disconnect();
      }

      // Cleanup: When token changes (signal updates), this runs FIRST
      // This ensures the old connection is killed before the new one starts
      onCleanup(() => {
        this.disconnect();
      });
    });
  }

  private connect(token: string): void {
    // Safety check: Don't connect if already active
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
        // Only log critical errors to reduce console noise
        if(str.includes('Error') || str.includes('Connect')) console.debug('[STOMP]:', str);
      }
    });

    this.client.onConnect = () => {
      console.log('RealtimeService: Connected Successfully');
      this.connected$.next(true);

      // Subscribe to global notifications
      this.subscription = this.client!.subscribe('/user/queue/notifications', (message: IMessage) => {
          try {
            if (message.body) {
              const parsedBody = JSON.parse(message.body);
              this.eventsSubject.next(parsedBody);
            }
          } catch (e) { 
            console.error('JSON Parse error', e); 
          }
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error:', frame.headers['message']);
      // If session is invalid, disconnect so the Effect can trigger a retry/refresh logic
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

  // 🟢 FIX 3: ROBUST DISCONNECT
  // Ensures we completely kill the client and subscription to prevent ghost listeners
  private disconnect(): void {
    this.connected$.next(false);
    
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    
    if (this.client) {
      this.client.deactivate(); // Async, but we nullify immediately below
      this.client = null;
    }
  }

  public sendMessage(destination: string, body: any): void {
    if (this.connected$.value && this.client?.connected) {
        this.client.publish({ destination, body: JSON.stringify(body) });
    }
  }

  // Helper for component-specific subscriptions
  public subscribeToTopic(topic: string, callback: (payload: any) => void): StompSubscription {
    if (this.connected$.value && this.client?.connected) {
        return this.client.subscribe(topic, (msg) => {
          try {
            callback(JSON.parse(msg.body));
          } catch (e) { console.error(e); }
        });
    }

    // Queue subscription if not yet connected
    const autoSub = this.connected$.pipe(
        filter(c => c), take(1)
    ).subscribe(() => {
        if(this.client?.connected) {
           this.client.subscribe(topic, (msg) => {
             try {
               callback(JSON.parse(msg.body));
             } catch(e) { console.error(e); }
           });
        }
    });

    // Return a dummy subscription object that handles the pending logic cleanup
    return { id: 'pending', unsubscribe: () => autoSub.unsubscribe() } as StompSubscription;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}