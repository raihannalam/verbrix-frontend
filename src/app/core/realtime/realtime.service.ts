import { Injectable, OnDestroy, inject, effect } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
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
  
  // Track connection status
  public connected$ = new BehaviorSubject<boolean>(false);
  
  private eventsSubject = new Subject<RealtimeEvent | null>();
  public events$ = this.eventsSubject.asObservable();

  private isRefreshing = false;

  constructor() {
    effect((onCleanup) => {
      const user = this.authService.currentUser();
      if (user) {
        this.connect();
      } else {
        this.disconnect();
      }
      onCleanup(() => {
        if (!this.authService.currentUser()) this.disconnect();
      });
    });
  }

  private connect(): void {
    if (this.client?.active || this.isRefreshing) return;

    const token = this.authService.getAccessToken();
    if (!token) return;

    if (this.isTokenExpired(token)) {
      this.isRefreshing = true;
      this.authService.refreshToken().subscribe({
        next: () => {
          this.isRefreshing = false;
          this.connect(); 
        },
        error: () => {
          this.isRefreshing = false;
        }
      });
      return; 
    }

    this.client = new Client({
      brokerURL: `${environment.apiBaseUrl.replace('http', 'ws')}/ws`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    this.client.onConnect = () => {
      console.log('RealtimeService: Connected');
      this.connected$.next(true);

      // Subscribe to global notifications
      this.subscription = this.client!.subscribe('/user/queue/notifications', (message) => {
          try {
            this.eventsSubject.next(JSON.parse(message.body));
          } catch (e) { console.error(e); }
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error:', frame.headers['message']);
      console.error('Details:', frame.body);
    };

    this.client.onDisconnect = () => {
        console.log('RealtimeService: Disconnected');
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

  // 🔴 FIX: Safe Send Method
  public sendMessage(destination: string, body: any): void {
    if (this.connected$.value && this.client?.connected) {
        this.client.publish({ destination, body: JSON.stringify(body) });
    } else {
        console.warn('Message queued or dropped: WebSocket not connected');
    }
  }

  // 🔴 FIX: Safe Subscribe Method
  // Returns a "Dummy" subscription if not connected to prevent UI crashes
  public subscribeToTopic(topic: string, callback: (payload: any) => void): StompSubscription {
    
    // 1. If connected, return real subscription
    if (this.connected$.value && this.client?.connected) {
        return this.client.subscribe(topic, (message) => {
            try {
                callback(JSON.parse(message.body));
            } catch (e) { console.error(e); }
        });
    }

    // 2. If NOT connected, wait for connection then subscribe
    const autoSub = this.connected$.pipe(
        filter(isConnected => isConnected), 
        take(1) 
    ).subscribe(() => {
        console.log(`Late subscribing to ${topic}`);
        if (this.client?.connected) {
            // We can't return this handle to the component easily, 
            // so we manage it internally or let the component re-subscribe on refresh.
            // For now, this ensures the logic runs once connected.
            this.client.subscribe(topic, (message) => {
                try {
                    callback(JSON.parse(message.body));
                } catch (e) { console.error(e); }
            });
        }
    });

    // Return a dummy subscription object to satisfy TypeScript and prevent crashes
    return {
        id: 'pending-subscription',
        unsubscribe: () => autoSub.unsubscribe() 
    } as StompSubscription;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now(); 
    } catch (e) { return true; }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}