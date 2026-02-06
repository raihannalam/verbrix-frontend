import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, of, Subscription, forkJoin, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Navbar } from '../layout/navbar';
import { ChatLayoutComponent } from '../components/chat-layout';
import { RealtimeService } from '../../core/realtime/realtime.service';

// --- Interfaces based on your Java DTOs ---

interface Language {
  name: string;
  code?: string;
}

interface Interpreter {
  id: number;
  firstName: string;
  lastName: string;
  bio: string;
  profilePictureUrl?: string;
  experienceYears: number;
  specializations: string[];
  languages: Language[];
  consultationFees: number;
  rating: number;
  ratingCount: number;
  online: boolean;
  available: boolean;
}

interface Relationship {
  id: number;
  clientName: string;
  interpreterName: string;
  status: 'REQUESTED' | 'REQUEST_ACCEPTED' | 'CONSULTATION_ACTIVE' | 'AGREEMENT_ACTIVE' | 'TERMINATED';
  createdAt: string;
}

// Helper for Spring Data Page response
interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    Navbar,
    CommonModule,
    RouterLink,
    ChatLayoutComponent
    // Removed FindInterpreterComponent as we render the list directly now
  ],
  template: `
    <app-navbar class="fixed top-0 left-0 h-[72px] w-full z-50"></app-navbar>

    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-[90px] px-4 md:px-8 pb-12 transition-colors duration-300">
      <div class="max-w-7xl mx-auto space-y-8">

        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Patient Dashboard</h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">Find interpreters and manage consultations</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex w-full md:w-auto">
            <button
              (click)="viewMode.set('dashboard')"
              [class]="viewMode() === 'dashboard'
                ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-900/40 dark:text-blue-300'
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50'"
              class="flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2">
              <i class="ri-dashboard-line text-lg"></i> Overview
            </button>

            <button
              (click)="viewMode.set('chat')"
              [class]="viewMode() === 'chat'
                ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-900/40 dark:text-blue-300'
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50'"
              class="flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 relative">
              <i class="ri-message-3-line text-lg"></i> Messages
              @if (activeRelationship()) {
                <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
              }
            </button>
          </div>
        </div>

        @if (loading()) {
          <div class="animate-pulse space-y-8">
            <div class="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl" *ngFor="let i of [1,2,3]"></div>
            </div>
          </div>
        } @else {
          
          @if (viewMode() === 'dashboard') {
            <div class="animate-fade-in space-y-10">

              @if (activeRelationship(); as rel) {
                <div class="bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-8 shadow-sm relative overflow-hidden animate-slide-down">
                  <div class="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none"></div>
                  
                  <div class="relative z-10">
                    <div class="flex flex-col md:flex-row justify-between items-center gap-6">
                      <div class="flex items-center gap-5 w-full md:w-auto">
                        <div class="w-16 h-16 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-300 text-2xl font-bold border-2 border-white dark:border-gray-700 shadow-sm">
                          {{ rel.interpreterName.charAt(0) || '?' }}
                        </div>
                        
                        <div class="min-w-0">
                          <div class="flex flex-wrap items-center gap-3 mb-1">
                            <h2 class="text-xl font-bold text-gray-900 dark:text-white truncate">
                              Active: {{ rel.interpreterName }}
                            </h2>
                            <span [class]="getStatusColor(rel.status)" class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-current/10 shrink-0">
                              {{ rel.status.replace('_', ' ') }}
                            </span>
                          </div>
                          <p class="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2">
                            <i class="ri-calendar-check-line"></i> Connected since {{ rel.createdAt | date:'mediumDate' }}
                          </p>
                        </div>
                      </div>

                      <div class="flex gap-3 w-full md:w-auto">
                        <button (click)="viewMode.set('chat')" class="flex-1 md:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2">
                          <i class="ri-chat-3-line"></i> Continue Chat
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <div>
                 <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                      {{ activeRelationship() ? 'Other Available Professionals' : 'Available Interpreters' }}
                    </h2>
                    <span class="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                       {{ interpretersList().length }} Found
                    </span>
                 </div>

                 @if (interpretersList().length === 0) {
                    <div class="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <i class="ri-user-search-line text-4xl text-gray-400"></i>
                        <p class="mt-2 text-gray-500">No interpreters found at the moment.</p>
                    </div>
                 }

                 <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    @for (interpreter of interpretersList(); track interpreter.id) {
                      <div class="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
                        
                        <div class="flex justify-between items-start mb-4">
                           <div class="relative">
                              <img 
                                [src]="interpreter.profilePictureUrl || 'assets/default-avatar.png'" 
                                class="w-14 h-14 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700 shadow-sm"
                                alt="Profile">
                              <span [class]="interpreter.online ? 'bg-green-500' : 'bg-gray-400'" 
                                    class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-800">
                              </span>
                           </div>
                           <div class="text-right">
                              <div class="text-lg font-bold text-gray-900 dark:text-white">
                                {{ interpreter.consultationFees | currency }}
                              </div>
                              <div class="text-[10px] text-gray-500 uppercase font-bold tracking-wide">per session</div>
                           </div>
                        </div>

                        <div class="mb-4">
                           <h3 class="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                              {{ interpreter.firstName }} {{ interpreter.lastName }}
                           </h3>
                           <div class="flex items-center gap-1 text-yellow-500 text-sm mt-1">
                              <i class="ri-star-fill"></i>
                              <span class="font-bold text-gray-700 dark:text-gray-300">{{ interpreter.rating }}</span>
                              <span class="text-gray-400 text-xs">({{ interpreter.ratingCount }})</span>
                           </div>
                           
                           <p class="text-gray-500 dark:text-gray-400 text-sm mt-3 line-clamp-2 min-h-[40px]">
                              {{ interpreter.bio || 'No bio available.' }}
                           </p>
                        </div>

                        <div class="flex flex-wrap gap-2 mb-4">
                           @for (spec of interpreter.specializations.slice(0, 2); track spec) {
                              <span class="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-[10px] font-bold uppercase tracking-wide border border-blue-100 dark:border-blue-800">
                                 {{ spec }}
                              </span>
                           }
                           @if (interpreter.specializations.length > 2) {
                              <span class="px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-md text-[10px] font-bold">
                                 +{{ interpreter.specializations.length - 2 }}
                              </span>
                           }
                        </div>
                        
                        <div class="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
                           <i class="ri-translate-2 text-gray-400"></i>
                           <span class="truncate">
                             {{ getLanguageString(interpreter.languages) }}
                           </span>
                        </div>

                        <div class="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                           <button 
                             [disabled]="!interpreter.available"
                             routerLink="/interpreters/{{interpreter.id}}"
                             class="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-bold hover:bg-blue-600 dark:hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                             {{ interpreter.available ? 'View Profile' : 'Unavailable' }}
                           </button>
                        </div>

                      </div>
                    }
                 </div>
              </div>

            </div>
          } 
          
          @else {
            <app-chat-layout class="block h-[calc(100vh-140px)] animate-fade-in border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden"></app-chat-layout>
          }
        }

      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    .animate-slide-down { animation: slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ClientDashboard implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private realtime = inject(RealtimeService);
  private readonly API_URL = environment.apiUrl;
  private realtimeSub?: Subscription;

  // Signals
  viewMode = signal<'dashboard' | 'chat'>('dashboard');
  
  // Data Signals
  activeRelationship = signal<Relationship | null>(null);
  interpretersList = signal<Interpreter[]>([]);
  
  loading = signal(true);

  ngOnInit(): void {
    this.fetchData();
    this.subscribeToRealtime();
  }

  ngOnDestroy(): void {
    this.realtimeSub?.unsubscribe();
  }

  fetchData(): void {
    this.loading.set(true);
    
    // We execute both requests in parallel using forkJoin
    forkJoin({
      // 1. Get Relationship
      relationships: this.http.get<Relationship[]>(`${this.API_URL}/relationships/mine`).pipe(
        catchError(err => {
          console.error('Rel Error:', err);
          return of([]); 
        })
      ),
      // 2. Get All Interpreters (New Endpoint)
      interpretersPage: this.http.get<Page<Interpreter>>(`${this.API_URL}/clients/interpreters`).pipe(
         catchError(err => {
            console.error('Interpreter Fetch Error:', err);
            // Return empty page structure on error
            return of({ content: [], totalElements: 0 } as any);
         })
      )
    })
    .pipe(
      finalize(() => this.loading.set(false))
    )
    .subscribe(({ relationships, interpretersPage }) => {
       // Handle Relationship
       if (relationships && relationships.length > 0) {
         this.activeRelationship.set(relationships[0]);
       } else {
         this.activeRelationship.set(null);
       }

       // Handle Interpreters List
       // The Spring controller returns Page<Response>, so we extract .content
       if (interpretersPage && interpretersPage.content) {
          this.interpretersList.set(interpretersPage.content);
       } else {
          this.interpretersList.set([]);
       }
    });
  }

  // Helper to format languages for display (e.g., "English, Spanish, French")
  getLanguageString(langs: Language[]): string {
    if (!langs || langs.length === 0) return 'No languages listed';
    return langs.map(l => l.name).join(', ');
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'REQUESTED': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
      case 'REQUEST_ACCEPTED': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      case 'CONSULTATION_ACTIVE': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  }

  private subscribeToRealtime(): void {
    this.realtimeSub = this.realtime.events$.subscribe(event => {
      if (!event) return;
      
      const refreshEvents = [
        'RELATIONSHIP_REQUEST_RESPONSE', 
        'CONSULTATION_STARTED', 
        'AGREEMENT_ACTIVATED'
      ];

      if (refreshEvents.includes(event.type)) {
        this.fetchData();
      }
    });
  }
}