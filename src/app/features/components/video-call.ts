import { Component, ElementRef, Input, OnDestroy, OnInit, Output, ViewChild, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  Room, 
  RoomEvent, 
  RemoteParticipant, 
  RemoteTrackPublication, 
  RemoteTrack, 
  Track,
  ConnectionState,
  LocalVideoTrack
} from 'livekit-client';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[9999] bg-black flex flex-col font-sans overflow-hidden touch-none select-none">
      
      <div class="relative w-full h-full">

        <div [ngClass]="getContainerClass('remote')" 
             (click)="setFocus('remote')"
             class="transition-all duration-300 ease-in-out bg-gray-900 overflow-hidden shadow-2xl relative">
           
           <video #remoteVideoElement class="w-full h-full object-cover"></video>

           <div *ngIf="!hasRemoteVideo()" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 z-10">
              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center border-4 border-gray-800 shadow-xl animate-pulse">
                 <span class="text-3xl font-bold text-white">{{ (displayName || remoteIdentity).charAt(0).toUpperCase() }}</span>
              </div>
              <p class="text-white/60 text-sm font-medium mt-4 tracking-wide">
                 {{ connectionState() === 'connected' ? 'Waiting for video...' : 'Connecting...' }}
              </p>
           </div>
           
           <div class="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-xs font-bold text-white z-20 shadow-lg">
              {{ displayName || remoteIdentity || 'Partner' }}
           </div>
        </div>

        <div [ngClass]="getContainerClass('local')" 
             (click)="setFocus('local')"
             class="transition-all duration-300 ease-in-out bg-gray-800 overflow-hidden shadow-2xl border-2 border-white/10 relative">
           
           <video #localVideoElement class="w-full h-full object-cover -scale-x-100 muted" muted playsinline></video>
           
           <div *ngIf="!isCameraEnabled()" class="absolute inset-0 flex items-center justify-center bg-gray-900">
               <svg class="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
           </div>

           <div class="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white z-20 flex items-center gap-1">
              <span>YOU</span>
              <svg *ngIf="!isMicEnabled()" class="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" /></svg>
           </div>
        </div>

      </div>

      <div class="absolute top-0 left-0 w-full p-4 pt-8 md:pt-6 flex justify-center items-start pointer-events-none z-50">
        <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg pointer-events-auto">
           <span class="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] transition-colors duration-500" 
             [ngClass]="{
                'bg-emerald-500 text-emerald-500': connectionState() === ConnectionState.Connected,
                'bg-amber-500 text-amber-500': connectionState() === ConnectionState.Connecting || connectionState() === ConnectionState.Reconnecting,
                'bg-red-500 text-red-500': connectionState() === ConnectionState.Disconnected
             }"></span>
           <span class="text-white/90 text-xs font-bold tracking-wide uppercase">{{ statusMessage() }}</span>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 w-full flex justify-center pb-10 pt-16 px-4 z-50 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
         
         <div class="flex items-center gap-5 px-6 py-4 rounded-3xl bg-black/70 backdrop-blur-2xl border border-white/10 shadow-2xl pointer-events-auto">
            
            <button (click)="toggleMic()" 
               class="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
               [ngClass]="isMicEnabled() 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'">
               <svg *ngIf="isMicEnabled()" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
               <svg *ngIf="!isMicEnabled()" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18"></path></svg>
            </button>

            <button (click)="toggleCamera()" 
               class="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
               [ngClass]="isCameraEnabled() 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]'">
               <svg *ngIf="isCameraEnabled()" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
               <svg *ngIf="!isCameraEnabled()" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
            </button>

            <button (click)="flipCamera()" 
               class="w-14 h-14 rounded-full flex items-center justify-center bg-gray-800 text-white hover:bg-gray-700 transition-all duration-200 active:scale-90 active:rotate-180">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </button>

            <div class="w-px h-8 bg-white/10 mx-2"></div>

            <button (click)="disconnect()" 
               class="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xl shadow-red-900/40 transition-all duration-200 hover:bg-red-700 hover:scale-105 active:scale-95">
               <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.36 7.46 6 12 6s8.66 2.36 11.71 5.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"></path></svg>
            </button>
         </div>
      </div>

    </div>
  `,
  styles: [`
    /* Layout Swapping Logic */
    .view-full {
        position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0;
    }
    .view-pip {
        position: absolute;
        width: 100px; height: 150px; /* Mobile size */
        bottom: 140px; right: 16px;
        z-index: 40;
        border-radius: 16px;
        cursor: pointer;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    @media (min-width: 768px) {
        .view-pip {
            width: 240px; height: 160px; /* Desktop size */
            bottom: 32px; right: 32px;
        }
    }
  `]
})
export class VideoCallComponent implements OnInit, OnDestroy {
  @Input({ required: true }) token!: string;
  @Input() displayName: string = ''; // 🟢 ADDED: Pass "John Doe" here
  @Input() wsUrl: string = 'wss://verbrix-is1gv2zd.livekit.cloud'; 
  @Output() close = new EventEmitter<void>();

  @ViewChild('remoteVideoElement') remoteVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('localVideoElement') localVideo!: ElementRef<HTMLVideoElement>;

  room: Room | undefined;
  ConnectionState = ConnectionState; 
  connectionState = signal<ConnectionState>(ConnectionState.Disconnected);
  statusMessage = signal('Initializing...');
  isMicEnabled = signal(true);
  isCameraEnabled = signal(true);
  hasRemoteVideo = signal(false);
  focusedView = signal<'remote' | 'local'>('remote'); 
  remoteIdentity: string = '';

  private isInitiating = false;

  async ngOnInit() {
    if (!this.token) return;
    await this.initRoom();
  }

  async ngOnDestroy() {
    await this.disconnect(false);
  }

  getContainerClass(type: 'remote' | 'local'): string {
    return this.focusedView() === type ? 'view-full' : 'view-pip hover:scale-105 active:scale-95';
  }

  setFocus(type: 'remote' | 'local') {
    if (this.focusedView() !== type) this.focusedView.set(type);
  }

  async initRoom() {
    if (this.isInitiating) return;
    this.isInitiating = true;
    this.statusMessage.set('Connecting...');
    this.connectionState.set(ConnectionState.Connecting);

    try {
      this.room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: { resolution: { width: 1280, height: 720 }, facingMode: 'user' }
      });

      this.room
        .on(RoomEvent.Connected, () => {
            this.connectionState.set(ConnectionState.Connected);
            this.statusMessage.set('Connected');
            this.isInitiating = false;
            this.publishLocalTracks();
        })
        .on(RoomEvent.Disconnected, () => {
             this.connectionState.set(ConnectionState.Disconnected);
             this.close.emit();
        })
        .on(RoomEvent.ParticipantConnected, (p: RemoteParticipant) => {
             this.statusMessage.set(`${p.identity} joined`);
             this.remoteIdentity = p.identity || '';
        })
        .on(RoomEvent.TrackSubscribed, (track: RemoteTrack, pub: RemoteTrackPublication, p: RemoteParticipant) => {
             if (track.kind === Track.Kind.Video) {
                this.hasRemoteVideo.set(true);
                track.attach(this.remoteVideo.nativeElement);
             } else {
                track.attach(); 
             }
        })
        .on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
             track.detach();
             if (track.kind === Track.Kind.Video) this.hasRemoteVideo.set(false);
        });

      await this.room.connect(this.wsUrl, this.token);
    } catch (error) {
      this.statusMessage.set('Connection Failed');
      this.isInitiating = false;
    }
  }

  async publishLocalTracks() {
    if (!this.room) return;
    await this.room.localParticipant.enableCameraAndMicrophone();
    const videoTrack = this.room.localParticipant.videoTrackPublications.values().next().value?.track as LocalVideoTrack;
    if (videoTrack) videoTrack.attach(this.localVideo.nativeElement);
  }

  toggleMic() {
    if (!this.room?.localParticipant) return;
    const current = this.isMicEnabled();
    this.room.localParticipant.setMicrophoneEnabled(!current);
    this.isMicEnabled.set(!current);
  }

  toggleCamera() {
    if (!this.room?.localParticipant) return;
    const current = this.isCameraEnabled();
    this.room.localParticipant.setCameraEnabled(!current);
    this.isCameraEnabled.set(!current);
  }

  async flipCamera() {
    const videoPub = Array.from(this.room?.localParticipant.videoTrackPublications.values() || [])[0];
    if (videoPub?.track) {
        const track = videoPub.track as LocalVideoTrack;
        const nextMode = track.mediaStreamTrack.getSettings().facingMode === 'user' ? 'environment' : 'user';
        await track.restartTrack({ facingMode: nextMode });
    }
  }

  async disconnect(emitEvent = true) {
    if (this.room) {
        this.room.localParticipant.trackPublications.forEach(p => p.track?.stop());
        await this.room.disconnect();
    }
    this.room = undefined;
    if (emitEvent) this.close.emit();
  }
}