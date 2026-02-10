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
    // Automatic Connection Management via Signals
    effect((onCleanup) => {
      const user = this.authService.currentUser();
      const token = this.authService.accessToken(); 
      
      if (user && token && !this.authService.isTokenExpired(token)) {
         this.connect(token);
      } else {
         this.disconnect();
      }

      onCleanup(() => {
        this.disconnect();
      });
    });
  }

  private connect(token: string): void {
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
      // Debug only critical issues
      debug: (str) => {
        if(str.includes('Error') || str.includes('Connect')) console.debug('[STOMP]:', str);
      }
    });

    this.client.onConnect = () => {
      console.log('RealtimeService: Connected');
      this.connected$.next(true);

      // Global User Notifications
      this.subscription = this.client!.subscribe('/user/queue/notifications', (message: IMessage) => {
          this.safeParseAndEmit(message, (body) => this.eventsSubject.next(body));
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Broker error:', frame.headers['message']);
      if (frame.headers['message']?.includes('Session closed')) this.disconnect(); 
    };

    this.client.onDisconnect = () => this.connected$.next(false);
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

  // Used by Chat Component
  public subscribeToTopic(topic: string, callback: (payload: any) => void): StompSubscription {
    // 1. If connected, subscribe immediately
    if (this.connected$.value && this.client?.connected) {
        return this.client.subscribe(topic, (msg) => this.safeParseAndEmit(msg, callback));
    }

    // 2. If not connected, wait for connection then subscribe
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
    } catch (e) { console.error('JSON Parse Error', e); }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}