import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Navbar } from '../layout/navbar';
import { AuthService } from '../../core/auth/auth.service';

// --- Interfaces ---
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
  online: boolean; 
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
  imports: [CommonModule, Navbar, CurrencyPipe, TitleCasePipe],
  template: `
    <app-navbar class="fixed top-0 left-0 w-full z-50"></app-navbar>

    <div class="min-h-screen bg-slate-50 dark:bg-[#0f1115] pt-[100px] pb-12 px-4 md:px-6 transition-colors duration-300 font-sans">
      
      <div class="max-w-5xl mx-auto">
        
        <div class="mb-8 space-y-4">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Find a Professional Interpreter</h1>
          
          <div class="bg-white dark:bg-[#181a1f] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center">
             <div class="relative flex-1 w-full">
               <i class="ri-search-line absolute left-4 top-3.5 text-slate-400 text-lg"></i>
               <input type="text" 
                      placeholder="Search by language, name, or specialty..." 
                      class="w-full bg-slate-50 dark:bg-[#131519] border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors dark:text-white placeholder-slate-400">
             </div>
             
             <div class="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <button class="px-5 py-3 bg-slate-50 dark:bg-[#131519] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap flex items-center gap-2">
                   <i class="ri-global-line"></i> Language
                </button>
                <button class="px-5 py-3 bg-slate-50 dark:bg-[#131519] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap flex items-center gap-2">
                   <i class="ri-stethoscope-line"></i> Specialty
                </button>
                <button class="px-5 py-3 bg-slate-50 dark:bg-[#131519] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap flex items-center gap-2">
                   <i class="ri-filter-3-line"></i> More
                </button>
             </div>
          </div>
          
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium px-1">
             {{ totalElements() }} verified professionals available
          </p>
        </div>

        <div class="space-y-6">
          
          @if (loading()) {
            @for (item of [1,2,3,4]; track item) {
              <div class="bg-white dark:bg-[#181a1f] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-6 animate-pulse">
                 <div class="w-full md:w-48 h-48 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0"></div>
                 <div class="flex-1 space-y-3 py-2">
                    <div class="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div class="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div class="h-16 w-full bg-slate-200 dark:bg-slate-800 rounded mt-4"></div>
                 </div>
                 <div class="w-full md:w-40 h-full bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0"></div>
              </div>
            }
          } @else {

            @for (interpreter of interpreters(); track interpreter.id) {
              <div class="group bg-white dark:bg-[#181a1f] rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 overflow-hidden flex flex-col md:flex-row">
                
                <div class="p-5 md:w-[220px] shrink-0 flex flex-row md:flex-col gap-4 md:gap-3 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/50">
                   <div class="relative w-20 h-20 md:w-full md:h-auto md:aspect-square shrink-0">
                      <img [src]="interpreter.profilePictureUrl || 'assets/default-avatar.png'" 
                           class="w-full h-full rounded-xl object-cover border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                           alt="Profile">
                      
                      <div class="absolute bottom-1 right-1 md:bottom-2 md:right-2 flex items-center justify-center">
                         <span class="relative flex h-4 w-4">
                           <span *ngIf="interpreter.online" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                           <span class="relative inline-flex rounded-full h-4 w-4 border-2 border-white dark:border-[#181a1f]"
                                 [ngClass]="interpreter.online ? 'bg-green-500' : 'bg-slate-400'"></span>
                         </span>
                      </div>

                      <div *ngIf="interpreter.introVideoUrl" class="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl group-hover:bg-black/20 transition-colors cursor-pointer" (click)="handleViewProfile(interpreter.id)">
                         <div class="w-10 h-10 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur text-blue-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                            <i class="ri-play-fill text-xl ml-0.5"></i>
                         </div>
                      </div>
                   </div>

                   <div class="flex flex-col justify-center md:hidden">
                      <h3 class="font-bold text-slate-900 dark:text-white text-lg">
                        {{ interpreter.firstName }} {{ interpreter.lastName }}
                      </h3>
                      <div class="flex items-center gap-1 text-yellow-500">
                         <i class="ri-star-fill"></i>
                         <span class="font-bold text-slate-900 dark:text-white">{{ interpreter.rating }}</span>
                         <span class="text-slate-400 text-xs">({{ interpreter.ratingCount }} reviews)</span>
                      </div>
                   </div>
                </div>

                <div class="flex-1 p-5 md:p-6 flex flex-col gap-4">
                   
                   <div class="hidden md:flex justify-between items-start">
                      <div>
                        <h3 class="font-bold text-slate-900 dark:text-white text-xl hover:text-blue-600 transition-colors cursor-pointer" (click)="handleViewProfile(interpreter.id)">
                           {{ interpreter.firstName }} {{ interpreter.lastName }}
                           <i class="ri-verified-badge-fill text-blue-500 ml-1 text-lg align-middle" title="Verified Professional"></i>
                        </h3>
                        <p class="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide mt-1">
                           Certified Medical Interpreter
                        </p>
                      </div>
                      
                      <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50">
                         <i class="ri-briefcase-4-line text-slate-500 dark:text-slate-400"></i>
                         <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">
                           {{ interpreter.experienceYears }} Yrs Exp.
                         </span>
                      </div>
                   </div>

                   <div class="flex flex-wrap gap-2">
                      @for (spec of interpreter.specializations.slice(0, 4); track spec) {
                         <span class="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50 rounded-md text-xs font-bold uppercase tracking-wide">
                            {{ spec }}
                         </span>
                      }
                      @if (interpreter.specializations.length > 4) {
                         <span class="px-2 py-1 text-slate-500 text-xs font-medium">+{{ interpreter.specializations.length - 4 }} more</span>
                      }
                   </div>

                   <div class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 md:line-clamp-3">
                      {{ interpreter.bio || 'Experienced professional dedicated to bridging communication gaps in healthcare settings. Specialized in terminology and cultural nuances.' }}
                   </div>

                   <div class="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50">
                      <p class="text-xs text-slate-400 font-bold uppercase mb-2">Speaks</p>
                      <div class="flex flex-wrap gap-x-6 gap-y-2">
                         @for (lang of interpreter.languages; track lang.language) {
                            <div class="flex items-center gap-1.5 text-sm">
                               <span class="text-slate-700 dark:text-slate-200 font-medium">{{ lang.language | titlecase }}</span>
                               <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                                  {{ lang.proficiency }}
                               </span>
                            </div>
                         }
                      </div>
                   </div>
                </div>

                <div class="p-5 md:w-[240px] shrink-0 bg-slate-50 dark:bg-[#131519]/50 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-stretch gap-4">
                   
                   <div class="hidden md:flex flex-col items-center mb-4">
                      <div class="flex items-center gap-1 text-yellow-400 text-lg">
                         <i class="ri-star-fill"></i>
                         <span class="font-bold text-slate-900 dark:text-white">{{ interpreter.rating }}</span>
                      </div>
                      <span class="text-xs text-slate-400 font-medium underline cursor-pointer hover:text-blue-500">{{ interpreter.ratingCount }} Reviews</span>
                   </div>

                   <div class="text-left md:text-center">
                      <div class="flex items-baseline md:justify-center gap-1">
                         <span class="text-2xl font-extrabold text-slate-900 dark:text-white">
                           {{ interpreter.consultationFees | currency }}
                         </span>
                      </div>
                      <span class="text-xs text-slate-500 dark:text-slate-400 font-medium block md:text-center">per 50-min session</span>
                   </div>

                   <div class="flex flex-col gap-3 w-full md:mt-4">
                      <button (click)="handleViewProfile(interpreter.id)"
                              class="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                         <span>Book Now</span>
                         <i class="ri-arrow-right-line"></i>
                      </button>
                      
                      <button (click)="handleViewProfile(interpreter.id)" 
                              class="w-full py-2.5 bg-white dark:bg-transparent border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                         View Profile
                      </button>
                   </div>
                </div>

              </div>
            }

            @if (!loading() && interpreters().length === 0) {
              <div class="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
                <div class="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
                  <i class="ri-user-search-line text-3xl text-slate-400"></i>
                </div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white">No professionals found</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">
                   Try adjusting your filters or search for a broader medical specialty.
                </p>
                <button (click)="fetchPublicInterpreters()" class="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors">
                   Clear Filters
                </button>
              </div>
            }
          }

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    /* Smooth line clamping for bio */
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class FindInterpreterComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private auth = inject(AuthService);
  
  private readonly API_URL = environment.apiUrl;

  interpreters = signal<InterpreterPublic[]>([]);
  totalElements = signal(0);
  loading = signal(true);

  ngOnInit() {
    this.fetchPublicInterpreters();
  }

  fetchPublicInterpreters() {
    this.loading.set(true);
    
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

  handleViewProfile(interpreterId: number) {
    const targetUrl = `/interpreters/${interpreterId}`;

    if (this.auth.isLoggedIn()) {
      this.router.navigate([targetUrl]);
    } else {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: targetUrl }
      });
    }
  }
}