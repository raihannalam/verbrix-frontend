import { Component, ElementRef, Input, OnDestroy, OnInit, Output, ViewChild, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  Room, 
  RoomEvent, 
  RemoteParticipant, 
  RemoteTrackPublication, 
  RemoteTrack, 
  Track,
  LocalTrackPublication,
  ConnectionState
} from 'livekit-client';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[100] bg-[#0f1115] flex flex-col font-sans animate-fade-in overflow-hidden">
      
      <div class="absolute inset-0 w-full h-full bg-black/40 flex items-center justify-center">
           
           <video #remoteVideoElement 
                  class="w-full h-full object-cover" 
                  [class.hidden]="!hasRemoteVideo()"
                  autoplay playsinline>
           </video>

           <div *ngIf="!hasRemoteVideo()" class="flex flex-col items-center gap-4 z-10 animate-pulse absolute">
              <div class="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                 <span class="text-4xl font-bold text-white/70">{{ remoteIdentity.charAt(0) || '...' }}</span>
              </div>
              <p class="text-white/60 text-sm font-medium tracking-wide">Waiting for partner...</p>
           </div>
      </div>

      <div class="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 bg-gradient-to-b from-black/60 to-transparent">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 w-fit">
           <span class="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" 
              [ngClass]="{
                 'bg-green-500 text-green-500': connectionState() === ConnectionState.Connected,
                 'bg-yellow-500 text-yellow-500': connectionState() === ConnectionState.Connecting,
                 'bg-red-500 text-red-500': connectionState() === ConnectionState.Disconnected
              }"></span>
           <span class="text-white/90 text-xs font-semibold">{{ statusMessage() }}</span>
        </div>
      </div>

      <div class="absolute bottom-28 right-6 w-36 h-52 md:w-48 md:h-72 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-white/20 z-30 transition-transform hover:scale-105 group">
         <video #localVideoElement class="w-full h-full object-cover -scale-x-100" autoplay playsinline muted></video>
         
         <div class="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
            <span class="text-[10px] font-bold text-white/90 px-2 py-0.5 rounded bg-white/10 backdrop-blur-sm">YOU</span>
            <div class="flex gap-1">
               <i *ngIf="!isMicEnabled()" class="ri-mic-off-fill text-red-500 text-xs bg-black/50 p-1 rounded-full"></i>
            </div>
         </div>
      </div>

      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
         <div class="flex items-center gap-4 px-6 py-3 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl transition-all hover:bg-black/70 hover:scale-105 hover:border-white/20">
            
            <button (click)="toggleMic()" 
               class="w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-200"
               [ngClass]="isMicEnabled() 
                  ? 'bg-white/10 text-white hover:bg-white/20' 
                  : 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]'">
               <i [class]="isMicEnabled() ? 'ri-mic-fill' : 'ri-mic-off-fill'"></i>
            </button>

            <button (click)="toggleCamera()" 
               class="w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-200"
               [ngClass]="isCameraEnabled() 
                  ? 'bg-white/10 text-white hover:bg-white/20' 
                  : 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]'">
               <i [class]="isCameraEnabled() ? 'ri-camera-fill' : 'ri-camera-off-fill'"></i>
            </button>

            <div class="w-px h-8 bg-white/20 mx-1"></div>

            <button (click)="manualDisconnect()" 
               class="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center text-2xl text-white shadow-lg transition-all duration-200 hover:bg-red-700 hover:scale-110 active:scale-95">
               <i class="ri-phone-end-fill"></i>
            </button>
         </div>
      </div>

    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
    .hidden { display: none !important; }
  `]
})
export class VideoCallComponent implements OnInit, OnDestroy {
  @Input({ required: true }) token!: string;
  @Input() wsUrl: string = 'wss://verbrix-is1gv2zd.livekit.cloud'; 
  @Output() close = new EventEmitter<void>();

  // 🟢 FIX: Reference the VIDEO element, not the div
  @ViewChild('remoteVideoElement') remoteVideo!: ElementRef;
  @ViewChild('localVideoElement') localVideo!: ElementRef;

  room: Room | undefined;
  ConnectionState = ConnectionState; 

  connectionState = signal<ConnectionState>(ConnectionState.Disconnected);
  statusMessage = signal('Initializing...');
  isMicEnabled = signal(true);
  isCameraEnabled = signal(true);
  hasRemoteVideo = signal(false);
  remoteIdentity: string = '';

  private isInitiating = false;

  async ngOnInit() {
    if (!this.token) {
        this.statusMessage.set('Error: Missing Token');
        return;
    }
    await this.initRoom();
  }

  async ngOnDestroy() {
    if (this.room) {
      this.room.localParticipant.trackPublications.forEach((pub: LocalTrackPublication) => {
        pub.track?.stop();
      });
      await this.room.disconnect();
    }
  }

  async initRoom() {
    if (this.isInitiating || (this.room && this.room.state !== ConnectionState.Disconnected)) return;
    
    this.isInitiating = true;
    this.statusMessage.set('Connecting...');
    this.connectionState.set(ConnectionState.Connecting);

    try {
      this.room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
            resolution: { width: 1280, height: 720 },
            facingMode: 'user'
        }
      });

      this.room.on(RoomEvent.Connected, () => {
          this.connectionState.set(ConnectionState.Connected);
          this.statusMessage.set('Connected');
          this.isInitiating = false;
          this.publishLocalTracks();
      });

      this.room.on(RoomEvent.Disconnected, (reason) => {
           this.connectionState.set(ConnectionState.Disconnected);
           this.statusMessage.set('Call Ended');
      });

      this.room.on(RoomEvent.ParticipantConnected, (p: RemoteParticipant) => {
          this.statusMessage.set(`${p.identity} joined`);
          this.remoteIdentity = p.identity || '';
      });

      this.room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, pub: RemoteTrackPublication, p: RemoteParticipant) => {
         this.handleTrackSubscribed(track, p);
      });

      this.room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
         track.detach();
         if (track.kind === Track.Kind.Video) this.hasRemoteVideo.set(false);
      });

      await this.room.connect(this.wsUrl, this.token);
      
    } catch (error: any) {
      console.error('Connection Failed:', error);
      this.connectionState.set(ConnectionState.Disconnected);
      this.statusMessage.set('Connection Failed');
      this.isInitiating = false;
    }
  }

  handleTrackSubscribed(track: RemoteTrack, participant: RemoteParticipant) {
    if (track.kind === Track.Kind.Video) {
       // 🟢 CRITICAL FIX: Attach to the <video> element, NOT the <div>
       track.attach(this.remoteVideo.nativeElement);
       this.hasRemoteVideo.set(true);
       this.remoteIdentity = participant.identity || '';
    } else {
       // Audio tracks attach to the document (invisible audio element)
       track.attach(); 
    }
  }

  async publishLocalTracks() {
    if (!this.room) return;
    try {
        await this.room.localParticipant.setCameraEnabled(true);
        await this.room.localParticipant.setMicrophoneEnabled(true);

        const videoPub = Array.from(this.room.localParticipant.videoTrackPublications.values())
            .find((pub: LocalTrackPublication) => pub.kind === Track.Kind.Video);

        if (videoPub?.track) {
            videoPub.track.attach(this.localVideo.nativeElement);
        }

        this.isCameraEnabled.set(true);
        this.isMicEnabled.set(true);
    } catch (e) {
        console.error('Device Error', e);
        this.statusMessage.set('Mic/Camera Error');
    }
  }

  toggleMic() {
    if (!this.room?.localParticipant) return;
    const current = this.room.localParticipant.isMicrophoneEnabled;
    this.room.localParticipant.setMicrophoneEnabled(!current);
    this.isMicEnabled.set(!current);
  }

  toggleCamera() {
    if (!this.room?.localParticipant) return;
    const current = this.room.localParticipant.isCameraEnabled;
    this.room.localParticipant.setCameraEnabled(!current);
    this.isCameraEnabled.set(!current);
  }

  manualDisconnect() {
    if (this.room?.localParticipant) {
        this.room.localParticipant.trackPublications.forEach((pub: LocalTrackPublication) => {
            pub.track?.stop();
        });
    }
    this.room?.disconnect();
    this.close.emit();
  }
}