import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Navbar } from '../layout/navbar';

// --- Interfaces matching InterpreterPublicResponse ---

export interface LanguagePublic {
  language: string; 
  proficiency: string;
}

export interface InterpreterPublic {
  id: number;
  firstName: string;
  lastName: string;
  bio: string;
  
  profilePictureUrl?: string;
  introVideoUrl?: string;
  
  experienceYears: number;
  experienceMonths: number;
  
  specializations: string[]; 
  languages: LanguagePublic[];
  
  consultationFees: number;
  
  rating: number;
  ratingCount: number;
  
  online: boolean; // "coarse presence only"
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Component({
  selector: 'app-find-interpreter',
  standalone: true,
  imports: [CommonModule, Navbar, RouterLink],
  template: `
    <app-navbar class="fixed top-0 left-0 w-full z-50"></app-navbar>

    <div class="min-h-screen bg-gray-50/50 dark:bg-[#0f1115] pt-[100px] pb-10 px-4 transition-colors duration-300 font-sans text-sm">
      
      <div class="max-w-[1600px] mx-auto">
        
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Available Professionals</h1>
            <p class="text-gray-500 dark:text-gray-400 text-xs mt-1">
              {{ totalElements() }} verified interpreters ready for consultation.
            </p>
          </div>
          
          <div class="flex gap-3 w-full md:w-auto">
            <div class="relative flex-1 md:w-64">
               <i class="ri-search-line absolute left-3 top-2.5 text-gray-400"></i>
               <input type="text" 
                      placeholder="Search language..." 
                      class="w-full bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-lg pl-9 pr-4 py-2 text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:text-white placeholder-gray-400 shadow-sm">
            </div>
            <button class="px-4 py-2 bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2">
               <i class="ri-filter-3-line"></i> Filters
            </button>
          </div>
        </div>

        @if (loading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            @for (item of [1,2,3,4,5,6,7,8]; track item) {
              <div class="bg-white dark:bg-[#181a1f] h-[300px] rounded-xl border border-gray-100 dark:border-gray-800 animate-pulse"></div>
            }
          </div>
        } @else {

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            
            @for (interpreter of interpreters(); track interpreter.id) {
              <div class="group bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-xl hover:border-blue-400/50 dark:hover:border-blue-700 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col relative overflow-hidden">
                
                <div class="p-4 flex gap-4 items-start">
                   <div class="relative shrink-0">
                      <img [src]="interpreter.profilePictureUrl || 'assets/default-avatar.png'" 
                           class="w-14 h-14 rounded-full object-cover border border-gray-100 dark:border-gray-700 shadow-sm group-hover:scale-105 transition-transform"
                           alt="Profile">
                      <span class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#181a1f]"
                            [ngClass]="interpreter.online ? 'bg-green-500' : 'bg-gray-400'"
                            [title]="interpreter.online ? 'Online' : 'Offline'">
                      </span>
                   </div>
                   
                   <div class="min-w-0 flex-1">
                      <h3 class="font-bold text-gray-900 dark:text-white truncate text-sm leading-tight group-hover:text-blue-600 transition-colors cursor-pointer"
                          [routerLink]="['/interpreters', interpreter.id]">
                         {{ interpreter.firstName }} {{ interpreter.lastName }}
                      </h3>
                      <div class="flex items-center gap-1 mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                         <span class="truncate">{{ interpreter.experienceYears }}y {{ interpreter.experienceMonths }}m exp</span>
                      </div>
                      
                      <div class="flex items-center gap-1 mt-1.5">
                         <i class="ri-star-fill text-yellow-400 text-xs"></i>
                         <span class="text-xs font-bold text-gray-900 dark:text-white">{{ interpreter.rating }}</span>
                         <span class="text-[10px] text-gray-400">({{ interpreter.ratingCount }})</span>
                      </div>
                   </div>
                </div>

                <div class="px-4 pb-2 space-y-3">
                   
                   <div class="flex flex-wrap gap-1.5">
                      @for (lang of interpreter.languages.slice(0, 3); track lang.language) {
                        <span class="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-[4px] text-[10px] font-semibold border border-gray-100 dark:border-gray-700/50">
                          {{ lang.language | titlecase }}
                        </span>
                      }
                      @if (interpreter.languages.length > 3) {
                        <span class="text-[10px] text-gray-400 py-0.5">+{{interpreter.languages.length - 3}}</span>
                      }
                   </div>

                   <p class="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2 h-[32px]">
                      {{ interpreter.bio || 'Professional medical interpreter.' }}
                   </p>
                </div>

                <div class="mt-auto pt-3 pb-4 px-4 border-t border-gray-50 dark:border-gray-800/50 flex items-center justify-between gap-3">
                   
                   <div>
                      <span class="block text-[10px] font-bold text-gray-400 uppercase">Rate</span>
                      <div class="text-sm font-bold text-gray-900 dark:text-white">
                         {{ interpreter.consultationFees | currency }}
                      </div>
                   </div>

                   <button [routerLink]="['/interpreters', interpreter.id]"
                           class="flex-1 max-w-[120px] py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-gray-500/20">
                      View Profile
                   </button>
                </div>

              </div>
            }
          </div>

          @if (!loading() && interpreters().length === 0) {
            <div class="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
              <div class="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <i class="ri-user-search-line text-2xl text-gray-400"></i>
              </div>
              <h3 class="text-base font-bold text-gray-900 dark:text-white">No professionals found</h3>
              <p class="text-xs text-gray-500 mt-1">We couldn't find any interpreters matching your criteria.</p>
            </div>
          }

        }
      </div>
    </div>
  `,
  styles: [`
    /* Ensure the grid respects the 'zoomed out' feel */
    :host { display: block; }
  `]
})
export class FindInterpreterComponent implements OnInit {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  interpreters = signal<InterpreterPublic[]>([]);
  totalElements = signal(0);
  loading = signal(true);

  ngOnInit() {
    this.fetchPublicInterpreters();
  }

  fetchPublicInterpreters() {
    this.loading.set(true);
    
    // Using the PUBLIC endpoint
    // Assuming /public/get-started-available-interpreters is mapped in your Spring Security to permitAll
    this.http.get<Page<InterpreterPublic>>(`${this.API_URL}/public/get-started-available-interpreters`)
      .pipe(
        finalize(() => this.loading.set(false)),
        catchError(err => {
          console.error('Fetch error:', err);
          return of({ content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 } as Page<InterpreterPublic>);
        })
      )
      .subscribe(page => {
        if (page && page.content) {
          this.interpreters.set(page.content);
          this.totalElements.set(page.totalElements);
        }
      });
  }
}