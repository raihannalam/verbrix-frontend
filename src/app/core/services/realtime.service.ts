import { Injectable, OnDestroy, inject, effect, untracked } from '@angular/core';
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

  // Connection State
  public connected$ = new BehaviorSubject<boolean>(false);

  // Global Notification Stream (Deduplicated)
  private eventsSubject = new Subject<RealtimeEvent | null>();
  public events$ = this.eventsSubject.asObservable().pipe(
    filter((e): e is RealtimeEvent => e !== null),
    scan((acc, curr) => {
      const currentId = curr.data?.id || JSON.stringify(curr.data);
      return { lastId: currentId, payload: acc.lastId === currentId ? null : curr };
    }, { lastId: null, payload: null } as { lastId: any, payload: RealtimeEvent | null }),
    map(acc => acc.payload),
    filter((e): e is RealtimeEvent => e !== null)
  );

  constructor() {
    // 🟢 REACTIVE CONNECTION MANAGEMENT
    effect((onCleanup) => {
      const user = this.authService.currentUser();
      const token = this.authService.accessToken();

      // If we have a valid token in memory, connect!
      if (user && token && !this.authService.isTokenExpired(token)) {
        // 🟢 FIX: We no longer pass the token here. The client will fetch it dynamically.
        untracked(() => this.connect());
      } else {
        untracked(() => this.disconnect());
      }

      onCleanup(() => {
        untracked(() => this.disconnect());
      });
    });
  }

  private connect(): void {
    if (this.client?.active) return;

    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    const host = environment.apiBaseUrl.replace(/^http(s)?:\/\//, '');

    this.client = new Client({
      reconnectDelay: 5000,
      heartbeatIncoming: 20000,
      heartbeatOutgoing: 20000,

      // 🟢 THE FIX: This fires milliseconds before opening the socket.
      // It guarantees STOMP always uses the freshest token, bypassing the 15-minute expiration issue.
      beforeConnect: () => {
        const freshToken = this.authService.accessToken() || '';
        this.client!.brokerURL = `${protocol}://${host}/ws?access_token=${freshToken}`;
        this.client!.connectHeaders = { Authorization: `Bearer ${freshToken}` };
      },

      debug: (str) => {
        if(str.includes('Error')) console.error('[STOMP Error]:', str);
      }
    });

    this.client.onConnect = () => {
      console.log('✅ RealtimeService: Connected securely');
      this.connected$.next(true);

      // Subscribe to personal security alerts and notifications
      this.subscription = this.client!.subscribe('/user/queue/notifications', (message: IMessage) => {
        this.safeParseAndEmit(message, (body) => this.eventsSubject.next(body));
      });
    };

    this.client.onStompError = (frame) => {
      console.error('❌ Broker error:', frame.headers['message']);
      // If the backend drops the connection due to an expired token, disconnect.
      // The auto-reconnect delay and beforeConnect hook will handle fetching the new one.
      if (frame.headers['message']?.includes('Session closed') || frame.headers['message']?.includes('Access Denied')) {
        this.disconnect();
      }
    };

    this.client.onDisconnect = () => {
      if (this.connected$.value) {
        console.log('⚠️ RealtimeService: Disconnected');
        this.connected$.next(false);
      }
    };

    this.client.activate();
  }

  private disconnect(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (this.client && this.client.active) {
      void this.client.deactivate();
    }

    this.client = null;
    this.connected$.next(false);
  }

  public sendMessage(destination: string, body: any): void {
    if (this.connected$.value && this.client?.connected) {
      this.client.publish({ destination, body: JSON.stringify(body) });
    }
  }

  public subscribeToTopic(topic: string, callback: (payload: any) => void): StompSubscription {
    if (this.connected$.value && this.client?.connected) {
      return this.client.subscribe(topic, (msg) => this.safeParseAndEmit(msg, callback));
    }

    const autoSub = this.connected$.pipe(
      filter(c => c), take(1)
    ).subscribe(() => {
      if(this.client?.connected) {
        this.client.subscribe(topic, (msg) => this.safeParseAndEmit(msg, callback));
      }
    });

    return { id: 'pending', unsubscribe: () => autoSub.unsubscribe() } as StompSubscription;
  }

  private safeParseAndEmit(msg: IMessage, callback: (body: any) => void) {
    try {
      if (msg.body) callback(JSON.parse(msg.body));
    } catch (e) {
      console.error('WebSocket JSON Parse Error', e);
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
