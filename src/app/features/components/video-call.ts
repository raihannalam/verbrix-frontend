import { 
  Component, 
  ElementRef, 
  Input, 
  OnDestroy, 
  OnInit, 
  ViewChild, 
  signal 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  Room, 
  RoomEvent, 
  RemoteParticipant, 
  ParticipantEvent,
  VideoPresets,
  Track
} from 'livekit-client';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full bg-black flex flex-col overflow-hidden font-sans">
      
      @if (showAudioBanner()) {
        <div (click)="unlockAudio()" 
             class="absolute top-0 left-0 right-0 p-4 bg-amber-500 text-black font-bold text-center z-50 cursor-pointer animate-bounce">
          🔇 TAP HERE TO ENABLE AUDIO
        </div>
      }

      <div #gridContainer class="flex-1 grid gap-1 bg-black p-1 transition-all duration-300 relative">
        @if (remoteCount() === 0) {
          <div class="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <div class="h-20 w-20 rounded-full bg-gray-800 flex items-center justify-center mb-4 animate-pulse">
              <i class="ri-user-search-line text-4xl"></i>
            </div>
            <p>Waiting for others to join...</p>
          </div>
        }
      </div>

      <div class="absolute bottom-28 right-6 w-32 md:w-48 aspect-video bg-gray-900 rounded-xl border border-gray-700 shadow-2xl overflow-hidden z-20 transition-all"
           [class.opacity-0]="!isCamOn()">
        <video #localVideoElement autoplay muted playsinline class="w-full h-full object-cover -scale-x-100"></video>
        <div class="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white">You</div>
      </div>

      <div class="h-24 bg-gray-900/90 backdrop-blur border-t border-gray-800 flex items-center justify-center gap-6 z-30 pb-4">
        
        <button (click)="toggleMic()" 
                [class]="isMicOn() ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'"
                class="h-14 w-14 rounded-full flex items-center justify-center text-2xl transition-all shadow-lg active:scale-95">
          <i [class]="isMicOn() ? 'ri-mic-line' : 'ri-mic-off-line'"></i>
        </button>

        <button (click)="leave()" 
                class="h-14 px-8 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-lg shadow-lg shadow-red-900/30 flex items-center gap-2 active:scale-95 transition-all">
          <i class="ri-phone-end-line"></i> End
        </button>

        <button (click)="toggleCam()" 
                [class]="isCamOn() ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'"
                class="h-14 w-14 rounded-full flex items-center justify-center text-2xl transition-all shadow-lg active:scale-95">
          <i [class]="isCamOn() ? 'ri-camera-line' : 'ri-camera-off-line'"></i>
        </button>

      </div>
    </div>
  `,
  styles: [`:host { display: block; height: 100%; width: 100%; }`]
})
export class VideoCallComponent implements OnInit, OnDestroy {
  @Input({ required: true }) token!: string;
  @Input() startWithVideo = true; 
  @Input() onLeave!: () => void;

  @ViewChild('gridContainer') gridContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('localVideoElement') localVideo!: ElementRef<HTMLVideoElement>;

  room?: Room;
  
  remoteCount = signal(0);
  isMicOn = signal(false);
  isCamOn = signal(false);
  showAudioBanner = signal(false);

  private audioCtx?: AudioContext;

  async ngOnInit() {
    this.initAudioContext();
    this.unlockAudio();
    await this.connectToRoom();
  }

  private initAudioContext() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      this.audioCtx = new AudioContextClass();
    }
  }

  async connectToRoom() {
    try {
      this.room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: { resolution: VideoPresets.h720.resolution },
        publishDefaults: { videoCodec: 'vp8' }
      });

      // 🔴 LIVEKIT CLOUD URL
      const LIVEKIT_URL = 'wss://verbrix-is1gv2zd.livekit.cloud';

      console.log('Connecting to LiveKit...', LIVEKIT_URL);
      await this.room.connect(LIVEKIT_URL, this.token);
      console.log('Connected!');

      // Set initial state
      await this.room.localParticipant.setMicrophoneEnabled(true);
      if (this.startWithVideo) {
        await this.room.localParticipant.setCameraEnabled(true);
      }

      this.attachLocalVideo();

      // Listeners
      this.room
        .on(RoomEvent.TrackSubscribed, (track, pub, participant) => this.handleTrackSubscribed(track, pub, participant))
        .on(RoomEvent.TrackUnsubscribed, (track, pub, participant) => this.handleTrackUnsubscribed(track, pub, participant))
        .on(RoomEvent.ParticipantDisconnected, () => this.updateLayout());

      this.room.localParticipant
        .on(ParticipantEvent.TrackMuted, () => this.syncUI())
        .on(ParticipantEvent.TrackUnmuted, () => this.syncUI());

      this.syncUI();

      // Handle Existing Participants
      this.room.remoteParticipants.forEach(p => {
        p.trackPublications.forEach(pub => {
          if (pub.isSubscribed && pub.track) {
            this.handleTrackSubscribed(pub.track, pub, p);
          }
        });
      });

    } catch (error) {
      console.error('Room Connection Failed:', error);
      alert('Failed to connect to video server. Please check your network.');
      this.leave();
    }
  }

  attachLocalVideo() {
    // Wait slightly for track to be ready
    setTimeout(() => {
      const tracks = this.room?.localParticipant.videoTrackPublications;
      if (!tracks) return;

      // Iterate map values safely
      for (const pub of tracks.values()) {
        if (pub.track) {
          pub.track.attach(this.localVideo.nativeElement);
          return; // Attach first available video track
        }
      }
    }, 500);
  }

  handleTrackSubscribed(track: any, publication: any, participant: RemoteParticipant) {
    if (track.kind === 'video') {
      const elementId = `remote-${participant.identity}`;
      if (document.getElementById(elementId)) return;

      const container = document.createElement('div');
      container.id = elementId;
      container.className = 'relative w-full h-full bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700 shadow-md animate-fade-in';
      
      const videoElement = track.attach();
      videoElement.className = 'w-full h-full object-cover';
      
      const label = document.createElement('div');
      label.className = 'absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm';
      label.innerText = participant.identity || 'User';

      container.appendChild(videoElement);
      container.appendChild(label);
      
      this.gridContainer.nativeElement.appendChild(container);
      this.updateRemoteCount();
      this.updateLayout();
    }

    if (track.kind === 'audio') {
      const audioElement = track.attach();
      document.body.appendChild(audioElement);
      audioElement.play().catch(() => {
        console.warn('Audio autoplay blocked');
        this.showAudioBanner.set(true);
      });
    }
  }

  handleTrackUnsubscribed(track: any, publication: any, participant: RemoteParticipant) {
    if (track.kind === 'video') {
      const element = document.getElementById(`remote-${participant.identity}`);
      if (element) {
        element.remove();
        this.updateRemoteCount();
        this.updateLayout();
      }
    }
  }

  updateRemoteCount() {
    const count = this.gridContainer.nativeElement.childElementCount;
    this.remoteCount.set(count);
  }

  updateLayout() {
    const count = this.remoteCount();
    const grid = this.gridContainer.nativeElement;
    
    if (count <= 1) {
      grid.style.gridTemplateColumns = '1fr';
    } else if (count === 2) {
      grid.style.gridTemplateColumns = '1fr 1fr';
    } else {
      grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
    }
  }

  syncUI() {
    if (!this.room) return;
    this.isMicOn.set(this.room.localParticipant.isMicrophoneEnabled);
    this.isCamOn.set(this.room.localParticipant.isCameraEnabled);
  }

  async unlockAudio() {
    if (this.audioCtx?.state === 'suspended') {
      await this.audioCtx.resume();
    }
    if (this.audioCtx) {
      const buffer = this.audioCtx.createBuffer(1, 1, 22050);
      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioCtx.destination);
      source.start(0);
    }
    this.showAudioBanner.set(false);
  }

  async toggleMic() {
    if (!this.room) return;
    const current = this.room.localParticipant.isMicrophoneEnabled;
    await this.room.localParticipant.setMicrophoneEnabled(!current);
  }

  async toggleCam() {
    if (!this.room) return;
    const current = this.room.localParticipant.isCameraEnabled;
    await this.room.localParticipant.setCameraEnabled(!current);
  }

  leave() {
    this.room?.disconnect();
    if (this.onLeave) this.onLeave();
  }

  ngOnDestroy() {
    this.room?.disconnect();
  }
}