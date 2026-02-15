import { Component, ElementRef, Input, OnDestroy, OnInit, Output, ViewChild, EventEmitter, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  Room, 
  RoomEvent, 
  RemoteParticipant, 
  RemoteTrackPublication, 
  RemoteTrack, 
  Track,
  LocalTrackPublication,
  ConnectionState,
  LocalVideoTrack,
  createLocalTracks
} from 'livekit-client';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[100] bg-black flex flex-col font-sans overflow-hidden touch-none select-none">
      
      <div class="relative w-full h-full">

        <div [ngClass]="getContainerClass('remote')" 
             (click)="setFocus('remote')"
             class="transition-all duration-300 ease-in-out bg-gray-900 overflow-hidden shadow-2xl">
           
           <video #remoteVideoElement class="w-full h-full object-cover"></video>

           <div *ngIf="!hasRemoteVideo()" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/50 backdrop-blur-md z-10">
              <div class="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/10 animate-pulse">
                 <span class="text-2xl font-bold text-white/70">{{ remoteIdentity.charAt(0) || '?' }}</span>
              </div>
              <p class="text-white/60 text-xs font-medium mt-3 tracking-wide">
                 {{ connectionState() === 'connected' ? 'Waiting for video...' : 'Connecting...' }}
              </p>
           </div>
           
           <div class="absolute bottom-2 left-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded text-[10px] font-bold text-white z-20">
              {{ remoteIdentity || 'Partner' }}
           </div>
        </div>

        <div [ngClass]="getContainerClass('local')" 
             (click)="setFocus('local')"
             class="transition-all duration-300 ease-in-out bg-gray-800 overflow-hidden shadow-2xl border border-white/10">
           
           <video #localVideoElement class="w-full h-full object-cover -scale-x-100 muted" muted playsinline></video>
           
           <div *ngIf="!isCameraEnabled()" class="absolute inset-0 flex items-center justify-center bg-gray-800">
              <i class="ri-camera-off-fill text-white/20 text-3xl"></i>
           </div>

           <div class="absolute bottom-2 left-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded text-[10px] font-bold text-white z-20 flex items-center gap-1">
              <span>YOU</span>
              <i *ngIf="!isMicEnabled()" class="ri-mic-off-fill text-red-500 text-xs"></i>
           </div>
        </div>

      </div>

      <div class="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between items-start pointer-events-none z-50 bg-gradient-to-b from-black/70 to-transparent h-24">
        
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 pointer-events-auto">
           <span class="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" 
             [ngClass]="{
                'bg-green-500 text-green-500': connectionState() === ConnectionState.Connected,
                'bg-yellow-500 text-yellow-500': connectionState() === ConnectionState.Connecting || connectionState() === ConnectionState.Reconnecting,
                'bg-red-500 text-red-500': connectionState() === ConnectionState.Disconnected
             }"></span>
           <span class="text-white/90 text-xs font-semibold">{{ statusMessage() }}</span>
        </div>

        </div>

      <div class="absolute bottom-0 left-0 w-full flex justify-center pb-8 pt-12 px-4 z-50 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none">
         
         <div class="flex items-center gap-4 px-6 py-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl pointer-events-auto transition-transform hover:scale-105">
            
            <button (click)="toggleMic()" 
               class="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl transition-all duration-200 active:scale-95"
               [ngClass]="isMicEnabled() 
                  ? 'bg-gray-700/50 text-white hover:bg-gray-600' 
                  : 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]'">
               <i [class]="isMicEnabled() ? 'ri-mic-fill' : 'ri-mic-off-fill'"></i>
            </button>

            <button (click)="toggleCamera()" 
               class="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl transition-all duration-200 active:scale-95"
               [ngClass]="isCameraEnabled() 
                  ? 'bg-gray-700/50 text-white hover:bg-gray-600' 
                  : 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]'">
               <i [class]="isCameraEnabled() ? 'ri-camera-fill' : 'ri-camera-off-fill'"></i>
            </button>

            <button (click)="flipCamera()" 
               class="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl bg-gray-700/50 text-white hover:bg-gray-600 transition-all duration-200 active:scale-95 active:rotate-180">
               <i class="ri-camera-switch-line"></i>
            </button>

            <div class="w-px h-8 bg-white/20 mx-1"></div>

            <button (click)="disconnect()" 
               class="w-14 h-14 md:w-16 md:h-16 rounded-full bg-red-600 flex items-center justify-center text-2xl md:text-3xl text-white shadow-lg transition-all duration-200 hover:bg-red-700 hover:scale-110 active:scale-90">
               <i class="ri-phone-end-fill"></i>
            </button>
         </div>
      </div>

    </div>
  `,
  styles: [`
    /* Dynamic Classes for Layout Swapping 
       These are applied via ngClass based on 'focusedView' signal
    */

    /* Full Screen Style */
    .view-full {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
    }

    /* Picture-in-Picture Style */
    .view-pip {
        position: absolute;
        width: 110px;
        height: 160px;
        bottom: 120px; /* Above control bar */
        right: 16px;
        z-index: 40;
        border-radius: 16px;
        cursor: pointer;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }

    /* Responsive PiP for Tablets/Desktop */
    @media (min-width: 768px) {
        .view-pip {
            width: 240px;
            height: 160px; /* Landscape aspect ratio preference on desktop */
            bottom: 32px;
            right: 32px;
        }
    }
  `]
})
export class VideoCallComponent implements OnInit, OnDestroy {
  @Input({ required: true }) token!: string;
  @Input() wsUrl: string = 'wss://verbrix-is1gv2zd.livekit.cloud'; 
  @Output() close = new EventEmitter<void>();

  @ViewChild('remoteVideoElement') remoteVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('localVideoElement') localVideo!: ElementRef<HTMLVideoElement>;

  room: Room | undefined;
  ConnectionState = ConnectionState; 

  // State Signals
  connectionState = signal<ConnectionState>(ConnectionState.Disconnected);
  statusMessage = signal('Initializing...');
  isMicEnabled = signal(true);
  isCameraEnabled = signal(true);
  hasRemoteVideo = signal(false);
  
  // 'remote' = remote is full screen, local is PiP
  // 'local' = local is full screen, remote is PiP
  focusedView = signal<'remote' | 'local'>('remote'); 
  
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
    await this.disconnect(false); // Clean up without emitting 'close' again if destroyed by parent
  }

  // --- Layout Logic ---

  getContainerClass(type: 'remote' | 'local'): string {
    // If the type matches the focus, it's full screen. Otherwise, it's PiP.
    return this.focusedView() === type ? 'view-full' : 'view-pip hover:scale-105 active:scale-95';
  }

  setFocus(type: 'remote' | 'local') {
    // Only allow swapping if the PiP is clicked (the one that isn't focused)
    if (this.focusedView() !== type) {
        this.focusedView.set(type);
    }
  }

  // --- LiveKit Logic ---

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
            facingMode: 'user' // Start with front camera
        }
      });

      // Event Listeners
      this.room
        .on(RoomEvent.Connected, () => {
            this.connectionState.set(ConnectionState.Connected);
            this.statusMessage.set('Connected');
            this.isInitiating = false;
            this.publishLocalTracks();
        })
        .on(RoomEvent.Disconnected, () => {
             this.connectionState.set(ConnectionState.Disconnected);
             this.statusMessage.set('Call Ended');
             this.close.emit(); // Tell parent to destroy component
        })
        .on(RoomEvent.Reconnecting, () => {
             this.connectionState.set(ConnectionState.Reconnecting);
             this.statusMessage.set('Reconnecting...');
        })
        .on(RoomEvent.Reconnected, () => {
             this.connectionState.set(ConnectionState.Connected);
             this.statusMessage.set('Connected');
        })
        .on(RoomEvent.ParticipantConnected, (p: RemoteParticipant) => {
             this.statusMessage.set(`${p.identity || 'Partner'} joined`);
             this.remoteIdentity = p.identity || '';
        })
        .on(RoomEvent.TrackSubscribed, (track: RemoteTrack, pub: RemoteTrackPublication, p: RemoteParticipant) => {
             this.handleTrackSubscribed(track, p);
        })
        .on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
             track.detach();
             if (track.kind === Track.Kind.Video) this.hasRemoteVideo.set(false);
        });

      await this.room.connect(this.wsUrl, this.token);
      
    } catch (error: any) {
      console.error('Connection Failed:', error);
      this.connectionState.set(ConnectionState.Disconnected);
      this.statusMessage.set('Connection Failed');
      this.isInitiating = false;
      setTimeout(() => this.close.emit(), 2000); // Auto close after error
    }
  }

  handleTrackSubscribed(track: RemoteTrack, participant: RemoteParticipant) {
    if (track.kind === Track.Kind.Video) {
       this.remoteIdentity = participant.identity || '';
       this.hasRemoteVideo.set(true);
       
       // Attach to the ViewChild Element
       if (this.remoteVideo?.nativeElement) {
           track.attach(this.remoteVideo.nativeElement);
       }
    } else if (track.kind === Track.Kind.Audio) {
       // Audio tracks don't need a specific element, they attach to document
       track.attach(); 
    }
  }

  async publishLocalTracks() {
    if (!this.room) return;
    try {
        await this.room.localParticipant.enableCameraAndMicrophone();

        const videoTrack = this.room.localParticipant.videoTrackPublications
            .values().next().value?.track as LocalVideoTrack;

        if (videoTrack && this.localVideo?.nativeElement) {
            videoTrack.attach(this.localVideo.nativeElement);
        }

        this.isCameraEnabled.set(true);
        this.isMicEnabled.set(true);
    } catch (e) {
        console.error('Failed to publish tracks', e);
        this.statusMessage.set('Permission Error');
    }
  }

  // --- Controls ---

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
    if (!this.room?.localParticipant) return;
    
    // Get all video tracks
    const videoPub = Array.from(this.room.localParticipant.videoTrackPublications.values())[0];
    if (!videoPub || !videoPub.track) return;
    
    const currentTrack = videoPub.track as LocalVideoTrack;
    
    // Get available devices
    const devices = await Room.getLocalDevices('videoinput');
    if (devices.length < 2) {
        this.statusMessage.set('Only 1 camera found');
        setTimeout(() => this.statusMessage.set('Connected'), 2000);
        return;
    }

    const currentSettings = currentTrack.mediaStreamTrack.getSettings();
    const currentFacingMode = currentSettings.facingMode;
    const nextFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

    try {
        await currentTrack.restartTrack({
            facingMode: nextFacingMode
        });
    } catch (e) {
        console.error('Failed to switch camera', e);
    }
  }

  async disconnect(emitEvent = true) {
    if (this.room) {
        // Stop all local tracks to release camera/mic hardware
        this.room.localParticipant.trackPublications.forEach((pub) => {
            pub.track?.stop();
        });
        await this.room.disconnect();
    }
    this.room = undefined;
    if (emitEvent) this.close.emit();
  }
}