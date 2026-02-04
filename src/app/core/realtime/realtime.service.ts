import { Injectable, OnDestroy, inject, effect } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Subject } from 'rxjs';
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
  // Dependencies
  private authService = inject(AuthService);

  // State
  private client: Client | null = null;
  private subscription: StompSubscription | null = null;

  // Event Stream (Kept as Observable for event handling)
  private eventsSubject = new Subject<RealtimeEvent | null>();
  public events$ = this.eventsSubject.asObservable();

  constructor() {
    // 🔑 REACTIVE CONNECTION MANAGER
    // This effect automatically runs whenever the Auth User signal changes.
    effect((onCleanup) => {
      const user = this.authService.currentUser();
      
      if (user) {
        this.connect();
      } else {
        this.disconnect();
      }

      // Cleanup logic if the effect is destroyed or re-runs
      onCleanup(() => {
        // We generally rely on the 'else' block above for logic, 
        // but this ensures safety if the service is destroyed.
        if (!this.authService.currentUser()) {
           this.disconnect();
        }
      });
    });
  }

  private connect(): void {
    // Prevent duplicate connections
    if (this.client?.active) return;

    const token = this.authService.getAccessToken();
    if (!token) return;

    // Initialize STOMP Client
    this.client = new Client({
      brokerURL: `${environment.apiBaseUrl.replace('http', 'ws')}/ws`,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      // Debug helper (optional)
      // debug: (str) => console.log(str) 
    });

    this.client.onConnect = () => {
      // Subscribe to user-specific queue
      this.subscription = this.client!.subscribe(
        '/user/queue/events',
        (message: IMessage) => {
          try {
            const event: RealtimeEvent = JSON.parse(message.body);
            this.eventsSubject.next(event);
          } catch (e) {
            console.error('Failed to parse realtime message', e);
          }
        }
      );
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.client.activate();
  }

  private disconnect(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    // Optional: Notify subscribers of disconnection/reset
    // this.eventsSubject.next(null); 
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}