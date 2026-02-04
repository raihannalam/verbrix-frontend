import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ChatService } from '../../core/services/chat.service';
import { environment } from '../../../environments/environment';

// 1. Define Interfaces for the API Response
interface InterpreterPublicResponse {
  id: number;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
  bio: string;
  languages: Array<{ language: { label: string }, proficiency: string }>; // Adjust based on your exact DTO structure
  specializations: Array<{ label: string }>;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

@Component({
  selector: 'app-find-interpreter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-800">Find an Interpreter</h2>
        <span class="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg font-semibold">
           Verified Pros
        </span>
      </div>
      
      @if (isLoadingList()) {
        <div class="flex-1 flex items-center justify-center min-h-[200px]">
          <div class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      } 
      
      @else if (interpreters().length === 0) {
        <div class="text-center py-8 text-gray-500">
          <i class="ri-user-search-line text-4xl mb-2 block"></i>
          <p>No interpreters available right now.</p>
        </div>
      }

      @else {
        <div class="grid grid-cols-1 gap-3 mb-6 overflow-y-auto max-h-[400px] pr-1 custom-scrollbar">
          @for (interpreter of interpreters(); track interpreter.id) {
            <div class="p-4 border rounded-xl hover:border-blue-500 cursor-pointer transition-all group relative bg-white hover:shadow-md"
                 [class.ring-2]="selectedInterpreter()?.id === interpreter.id"
                 [class.ring-blue-500]="selectedInterpreter()?.id === interpreter.id"
                 [class.bg-blue-50]="selectedInterpreter()?.id === interpreter.id"
                 (click)="selectInterpreter(interpreter)">
              
              <div class="flex items-start gap-3">
                <div class="h-12 w-12 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                  @if (interpreter.profilePictureUrl) {
                    <img [src]="interpreter.profilePictureUrl" class="h-full w-full object-cover" alt="Profile">
                  } @else {
                    <div class="h-full w-full flex items-center justify-center text-gray-400">
                      <i class="ri-user-line text-xl"></i>
                    </div>
                  }
                </div>

                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-gray-900 truncate">
                    {{ interpreter.firstName }} {{ interpreter.lastName }}
                  </h3>
                  
                  <div class="flex flex-wrap gap-1 mt-1">
                    @for (lang of interpreter.languages.slice(0, 3); track $index) {
                      <span class="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-md font-medium">
                        {{ lang.language.label || lang }}
                      </span>
                    }
                    @if (interpreter.languages.length > 3) {
                      <span class="text-[10px] text-gray-400">+{{interpreter.languages.length - 3}}</span>
                    }
                  </div>

                  @if (interpreter.specializations.length) {
                    <p class="text-xs text-blue-600 mt-1 truncate">
                      <i class="ri-stethoscope-line align-middle"></i> 
                      {{ interpreter.specializations[0].label }}
                    </p>
                  }
                </div>

                <div class="h-5 w-5 rounded-full border border-gray-300 flex items-center justify-center"
                     [class.bg-blue-600]="selectedInterpreter()?.id === interpreter.id"
                     [class.border-blue-600]="selectedInterpreter()?.id === interpreter.id">
                   @if (selectedInterpreter()?.id === interpreter.id) {
                     <i class="ri-check-line text-white text-xs"></i>
                   }
                </div>
              </div>
            </div>
          }
        </div>
      }

      @if (selectedInterpreter()) {
        <div class="mt-auto border-t pt-4 animate-slide-up">
          <form [formGroup]="connectForm" (ngSubmit)="onConnect()" class="space-y-3">
            <div>
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Message to {{ selectedInterpreter()?.firstName }}
              </label>
              <textarea formControlName="initialMessage" rows="2" 
                class="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"
                placeholder="Hi, I need an interpreter for..."></textarea>
              
              @if (connectForm.get('initialMessage')?.invalid && connectForm.get('initialMessage')?.touched) {
                <p class="text-red-500 text-xs mt-1">Message is required</p>
              }
            </div>
            
            <div class="flex gap-2">
              <button type="button" (click)="selectedInterpreter.set(null)"
                class="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors text-sm">
                Cancel
              </button>
              <button type="submit" [disabled]="connectForm.invalid || isSubmitting()"
                class="flex-1 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/20 transition-all text-sm flex justify-center items-center gap-2">
                @if (isSubmitting()) {
                  <div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                }
                Send Request
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
    .animate-slide-up { animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class FindInterpreterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private chatService = inject(ChatService);
  private readonly API_URL = environment.apiUrl; 

  // Signals
  interpreters = signal<InterpreterPublicResponse[]>([]);
  selectedInterpreter = signal<InterpreterPublicResponse | null>(null);
  isLoadingList = signal(true);
  isSubmitting = signal(false);

  connectForm = this.fb.group({
    initialMessage: ['', [Validators.required, Validators.minLength(5)]]
  });

  ngOnInit() {
    this.fetchAvailableInterpreters();
  }

  fetchAvailableInterpreters() {
    // Calling the public endpoint
    // Params: page=0, size=4 (matching your controller default)
    this.http.get<PageResponse<InterpreterPublicResponse>>(`${this.API_URL}/public/get-started-available-interpreters?size=10`)
      .subscribe({
        next: (res) => {
          this.interpreters.set(res.content);
          this.isLoadingList.set(false);
        },
        error: (err) => {
          console.error('Error fetching interpreters', err);
          this.isLoadingList.set(false);
        }
      });
  }

  selectInterpreter(interpreter: InterpreterPublicResponse) {
    this.selectedInterpreter.set(interpreter);
    this.connectForm.reset();
  }

  onConnect() {
    if (this.connectForm.invalid || !this.selectedInterpreter()) return;
    
    this.isSubmitting.set(true);
    const interpreter = this.selectedInterpreter()!;
    const { initialMessage } = this.connectForm.value;

    // Use the ChatService to connect (POST /api/v1/relationships/connect)
    this.chatService.connectToInterpreter(interpreter.id, initialMessage!).subscribe({
      next: (res) => {
        // Success Logic
        this.isSubmitting.set(false);
        this.selectedInterpreter.set(null);
        this.connectForm.reset();
        // Optional: Trigger a refresh or emit an event to parent to reload "My Connections"
        alert(`Request sent to ${interpreter.firstName}!`);
      },
      error: (err) => {
        // Error Logic
        console.error(err);
        const errorMsg = err.error?.message || 'Connection failed';
        alert(`Error: ${errorMsg}`);
        this.isSubmitting.set(false);
      }
    });
  }
}