import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ChatService } from '../../core/services/chat.service';
import { environment } from '../../../environments/environment';
import { catchError, finalize, of } from 'rxjs';

// Interfaces
interface InterpreterPublicResponse {
  id: number;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
  bio: string;
  // Ensure we handle cases where these might be null from backend
  languages: Array<{ language: { label: string }, proficiency: string }>; 
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
    <div class="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col transition-colors duration-300">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white">Find an Interpreter</h2>
        <span class="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg font-semibold border border-blue-100 dark:border-blue-800">
            Verified Pros
        </span>
      </div>
      
      @if (isLoadingList()) {
        <div class="flex-1 flex items-center justify-center min-h-[200px]">
          <div class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      } 
      
      @else if (interpreters().length === 0) {
        <div class="text-center py-8 text-gray-500 dark:text-gray-400">
          <i class="ri-user-search-line text-4xl mb-2 block opacity-50"></i>
          <p>No interpreters available right now.</p>
        </div>
      }

      @else {
        <div class="grid grid-cols-1 gap-3 mb-6 overflow-y-auto max-h-[400px] pr-1 custom-scrollbar">
          @for (interpreter of interpreters(); track interpreter.id) {
            <div class="p-4 border rounded-xl cursor-pointer transition-all group relative hover:shadow-md"
                 [class.border-blue-500]="selectedInterpreter()?.id === interpreter.id"
                 [class.dark:border-blue-400]="selectedInterpreter()?.id === interpreter.id"
                 [class.border-gray-200]="selectedInterpreter()?.id !== interpreter.id"
                 [class.dark:border-gray-700]="selectedInterpreter()?.id !== interpreter.id"
                 [class.bg-blue-50]="selectedInterpreter()?.id === interpreter.id"
                 [class.dark:bg-blue-900/20]="selectedInterpreter()?.id === interpreter.id"
                 [class.bg-white]="selectedInterpreter()?.id !== interpreter.id"
                 [class.dark:bg-gray-800]="selectedInterpreter()?.id !== interpreter.id"
                 (click)="selectInterpreter(interpreter)">
              
              <div class="flex items-start gap-3">
                <div class="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-gray-600">
                  @if (interpreter.profilePictureUrl) {
                    <img [src]="interpreter.profilePictureUrl" class="h-full w-full object-cover" alt="Profile">
                  } @else {
                    <div class="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <i class="ri-user-line text-xl"></i>
                    </div>
                  }
                </div>

                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-gray-900 dark:text-gray-100 truncate">
                    {{ interpreter.firstName }} {{ interpreter.lastName }}
                  </h3>
                  
                  <div class="flex flex-wrap gap-1 mt-1">
                    @for (lang of interpreter.languages.slice(0, 3); track $index) {
                      <span class="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md font-medium border border-gray-200 dark:border-gray-600">
                        {{ lang.language.label || 'Unknown' }}
                      </span>
                    }
                    @if (interpreter.languages.length > 3) {
                      <span class="text-[10px] text-gray-400 dark:text-gray-500">+{{interpreter.languages.length - 3}}</span>
                    }
                  </div>

                  @if (interpreter.specializations && interpreter.specializations.length > 0) {
                    <p class="text-xs text-blue-600 dark:text-blue-400 mt-1 truncate">
                      <i class="ri-stethoscope-line align-middle"></i> 
                      {{ interpreter.specializations[0].label }}
                    </p>
                  }
                </div>

                <div class="h-5 w-5 rounded-full border flex items-center justify-center transition-colors"
                     [class.bg-blue-600]="selectedInterpreter()?.id === interpreter.id"
                     [class.border-blue-600]="selectedInterpreter()?.id === interpreter.id"
                     [class.border-gray-300]="selectedInterpreter()?.id !== interpreter.id"
                     [class.dark:border-gray-600]="selectedInterpreter()?.id !== interpreter.id">
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
        <div class="mt-auto border-t border-gray-100 dark:border-gray-700 pt-4 animate-slide-up">
          <form [formGroup]="connectForm" (ngSubmit)="onConnect()" class="space-y-3">
            <div>
              <label class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Message to {{ selectedInterpreter()?.firstName }}
              </label>
              <textarea formControlName="initialMessage" rows="2" 
                class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all resize-none placeholder-gray-400 dark:placeholder-gray-600"
                placeholder="Hi, I need an interpreter for..."></textarea>
              
              @if (connectForm.get('initialMessage')?.invalid && connectForm.get('initialMessage')?.touched) {
                <p class="text-red-500 text-xs mt-1">Please enter at least 5 characters.</p>
              }
            </div>
            
            <div class="flex gap-2">
              <button type="button" (click)="cancelSelection()"
                class="px-4 py-2 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-sm">
                Cancel
              </button>
              
              <button type="submit" [disabled]="connectForm.invalid || isSubmitting()"
                class="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/20 transition-all text-sm flex justify-center items-center gap-2">
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
    :host-context(.dark) .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; }
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
    this.http.get<PageResponse<InterpreterPublicResponse>>(`${this.API_URL}/public/get-started-available-interpreters?size=10`)
      .pipe(
        // Prevent crash if API fails
        catchError(err => {
          console.error('API Error:', err);
          return of({ content: [] } as any); 
        }),
        finalize(() => this.isLoadingList.set(false))
      )
      .subscribe((res) => {
        // MAP DATA SAFELY: Ensure arrays are never null to prevent template crashes
        const safeContent = (res.content || []).map((i: InterpreterPublicResponse) => ({
          ...i,
          languages: i.languages || [], // Default to empty array if null
          specializations: i.specializations || [] // Default to empty array if null
        }));
        this.interpreters.set(safeContent);
      });
  }

  selectInterpreter(interpreter: InterpreterPublicResponse) {
    this.selectedInterpreter.set(interpreter);
    // Only reset values, don't destroy form group structure
    this.connectForm.patchValue({ initialMessage: '' });
    this.connectForm.markAsUntouched();
  }
  
  cancelSelection() {
    this.selectedInterpreter.set(null);
  }

  onConnect() {
    if (this.connectForm.invalid || !this.selectedInterpreter()) return;
    
    this.isSubmitting.set(true);
    const interpreter = this.selectedInterpreter()!;
    const { initialMessage } = this.connectForm.value;

    this.chatService.connectToInterpreter(interpreter.id, initialMessage!)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (res) => {
          // SAFE RESET ORDER:
          // 1. Reset form data while it is still in DOM
          this.connectForm.reset();
          
          // 2. Alert success
          alert(`Request sent to ${interpreter.firstName}!`);
          
          // 3. Finally hide the form (triggers DOM removal)
          this.selectedInterpreter.set(null);
        },
        error: (err) => {
          console.error('Connection Error:', err);
          // Handle 401 specifically if needed
          if (err.status === 401) {
            alert('Your session has expired. Please log in again.');
          } else {
            const errorMsg = err.error?.message || 'Connection failed. Please try again.';
            alert(`Error: ${errorMsg}`);
          }
        }
      });
  }
}