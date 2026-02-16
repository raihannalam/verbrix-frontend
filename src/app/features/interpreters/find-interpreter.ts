import { Component, inject, OnInit, AfterViewInit, OnDestroy, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  last: boolean;
}

@Component({
  selector: 'app-find-interpreter',
  standalone: true,
  imports: [CommonModule, Navbar, CurrencyPipe, TitleCasePipe],
  template: `
    <app-navbar class="fixed top-0 left-0 w-full z-50"></app-navbar>

    <div class="min-h-screen bg-slate-50 dark:bg-[#0f1115] pt-[100px] pb-12 px-4 md:px-6 font-sans text-sm transition-colors duration-300">
      
      <div class="max-w-5xl mx-auto">
        
        <div class="mb-8 space-y-6">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
             <div>
                <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Find a Professional Interpreter</h1>
                <p class="text-slate-500 dark:text-slate-400 mt-2 text-base">
                   Displaying {{ interpreters().length }} of {{ totalElements() }} verified medical interpreters.
                </p>
             </div>
          </div>
          
          <div class="bg-white dark:bg-[#181a1f] p-2 md:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3">
             <div class="relative flex-1 w-full">
               <i class="ri-search-line absolute left-4 top-3.5 text-slate-400 text-lg"></i>
               <input type="text" 
                      placeholder="Search by language (e.g. Spanish), name, or specialty..." 
                      class="w-full bg-slate-50 dark:bg-[#131519] border border-transparent focus:bg-white dark:focus:bg-black border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white placeholder-slate-400">
             </div>
             
             <div class="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide shrink-0">
                <button class="px-5 py-3 bg-white dark:bg-[#181a1f] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-[#20232a] transition-colors whitespace-nowrap flex items-center gap-2">
                   <i class="ri-global-line"></i> Language
                </button>
                <button class="px-5 py-3 bg-white dark:bg-[#181a1f] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-[#20232a] transition-colors whitespace-nowrap flex items-center gap-2">
                   <i class="ri-filter-3-line"></i> Filters
                </button>
             </div>
          </div>
        </div>

        <div class="space-y-5">
          
          @if (loading() && interpreters().length === 0) {
            @for (item of [1,2,3]; track item) {
              <div class="bg-white dark:bg-[#181a1f] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-6 animate-pulse">
                 <div class="w-full md:w-56 h-48 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0"></div>
                 <div class="flex-1 space-y-4 py-2">
                    <div class="flex justify-between">
                       <div class="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
                       <div class="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    </div>
                    <div class="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div class="h-12 w-full bg-slate-200 dark:bg-slate-800 rounded mt-2"></div>
                    <div class="flex gap-2 mt-4">
                       <div class="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                       <div class="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                    </div>
                 </div>
              </div>
            }
          } 
          
          @for (interpreter of interpreters(); track interpreter.id) {
            <div class="group bg-white dark:bg-[#181a1f] rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300 overflow-hidden flex flex-col md:flex-row cursor-default">
               
               <div class="p-5 md:w-[240px] shrink-0 flex flex-row md:flex-col gap-5 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-[#131519]/30">
                  
                  <div class="relative w-20 h-20 md:w-full md:h-auto md:aspect-square shrink-0 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 group-hover:border-blue-200 transition-colors">
                     <img [src]="interpreter.profilePictureUrl || 'assets/default-avatar.png'" 
                          class="w-full h-full object-cover bg-white dark:bg-slate-800"
                          alt="Profile">
                     
                     <div class="absolute bottom-2 right-2 flex items-center justify-center" [title]="interpreter.online ? 'Online' : 'Offline'">
                        <span class="relative flex h-3.5 w-3.5">
                          <span *ngIf="interpreter.online" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span class="relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-white dark:border-[#181a1f]"
                                [ngClass]="interpreter.online ? 'bg-green-500' : 'bg-slate-400'"></span>
                        </span>
                     </div>

                     <div *ngIf="interpreter.introVideoUrl" 
                          class="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all cursor-pointer"
                          (click)="handleViewProfile(interpreter.id)">
                        <div class="w-10 h-10 rounded-full bg-white/90 dark:bg-black/70 text-blue-600 flex items-center justify-center shadow-lg transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                           <i class="ri-play-fill text-xl ml-0.5"></i>
                        </div>
                     </div>
                  </div>

                  <div class="flex flex-col justify-center md:hidden">
                     <h3 class="font-bold text-slate-900 dark:text-white text-lg leading-tight">
                       {{ interpreter.firstName }} {{ interpreter.lastName }}
                     </h3>
                     <div class="flex items-center gap-1.5 text-yellow-500 mt-1.5">
                        <i class="ri-star-fill"></i>
                        <span class="font-bold text-slate-900 dark:text-white">{{ interpreter.rating }}</span>
                        <span class="text-slate-400 text-xs">({{ interpreter.ratingCount }})</span>
                     </div>
                  </div>

                  <div class="hidden md:flex flex-col gap-3">
                     <div class="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        <span>Rating</span>
                        <span class="flex items-center gap-1 text-slate-900 dark:text-white">
                           <i class="ri-star-fill text-yellow-400"></i> {{ interpreter.rating }}
                        </span>
                     </div>
                     <div class="h-px bg-slate-200 dark:border-slate-700 w-full"></div>
                     <div class="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        <span>Reviews</span>
                        <span class="text-slate-900 dark:text-white">{{ interpreter.ratingCount }}</span>
                     </div>
                  </div>
               </div>

               <div class="flex-1 p-5 md:p-6 flex flex-col justify-between">
                  <div>
                     <div class="hidden md:flex justify-between items-start mb-3">
                        <div>
                           <h3 class="font-bold text-slate-900 dark:text-white text-xl hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-2" 
                               (click)="handleViewProfile(interpreter.id)">
                              {{ interpreter.firstName }} {{ interpreter.lastName }}
                              <i class="ri-verified-badge-fill text-blue-500 text-lg" title="Verified Professional"></i>
                           </h3>
                           <p class="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">Medical Interpreter</p>
                        </div>
                        
                        <div class="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/10 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/30 text-blue-700 dark:text-blue-300 text-xs font-bold shadow-sm">
                           <i class="ri-time-line"></i>
                           <span>
                             {{ interpreter.experienceYears }} Yrs 
                             @if(interpreter.experienceMonths > 0) { {{ interpreter.experienceMonths }} Mos }
                           </span>
                        </div>
                     </div>

                     <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 mb-4">
                        {{ interpreter.bio || 'Professional interpreter specializing in medical consultations and patient care communication.' }}
                     </p>

                     <div class="flex flex-wrap gap-2 mb-5">
                        @for (spec of interpreter.specializations.slice(0, 5); track spec) {
                           <span class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md text-[11px] font-bold uppercase tracking-wide">
                              {{ spec }}
                           </span>
                        }
                        @if (interpreter.specializations.length > 5) {
                           <span class="px-2 py-1 text-slate-400 text-xs font-medium">+{{ interpreter.specializations.length - 5 }}</span>
                        }
                     </div>
                  </div>

                  <div class="pt-4 border-t border-slate-100 dark:border-slate-800/50">
                     <div class="flex flex-wrap gap-x-6 gap-y-2 items-center">
                        <span class="text-xs text-slate-400 font-bold uppercase mr-2"><i class="ri-translate-2"></i> Speaks:</span>
                        @for (lang of interpreter.languages.slice(0, 4); track lang.language) {
                           <div class="flex items-center gap-1.5 text-sm">
                              <span class="font-bold text-slate-700 dark:text-slate-200">{{ lang.language | titlecase }}</span>
                              <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 font-semibold">
                                 {{ lang.proficiency }}
                              </span>
                           </div>
                        }
                        @if (interpreter.languages.length > 4) {
                           <span class="text-xs text-slate-400 italic">+{{ interpreter.languages.length - 4 }} more</span>
                        }
                     </div>
                  </div>
               </div>

               <div class="p-5 md:w-[200px] shrink-0 bg-slate-50 dark:bg-[#131519]/50 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 flex flex-row md:flex-col justify-between md:justify-center items-center gap-4">
                  <div class="text-left md:text-center">
                     <p class="text-[10px] uppercase font-bold text-slate-400 mb-1 hidden md:block">Session Rate</p>
                     <div class="flex items-baseline md:justify-center gap-0.5">
                        <span class="text-2xl font-extrabold text-slate-900 dark:text-white">
                          {{ interpreter.consultationFees | currency:'USD':'symbol':'1.0-0' }}
                        </span>
                        <span class="text-sm font-bold text-slate-500 dark:text-slate-400">/min</span>
                     </div>
                  </div>

                  <button (click)="handleViewProfile(interpreter.id)" 
                          class="w-auto md:w-full px-6 md:px-4 py-3 bg-slate-900 dark:bg-white hover:bg-blue-600 dark:hover:bg-blue-500 text-white dark:text-slate-900 dark:hover:text-white rounded-xl font-bold text-sm shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-2 group/btn">
                     <span>View Profile</span>
                     <i class="ri-arrow-right-line group-hover/btn:translate-x-1 transition-transform"></i>
                  </button>
               </div>
            </div>
          }

          @if (!loading() && interpreters().length === 0) {
            <div class="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/20">
               <div class="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
                  <i class="ri-search-eye-line text-3xl text-slate-400"></i>
               </div>
               <h3 class="text-xl font-bold text-slate-900 dark:text-white">No interpreters found</h3>
               <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">
                  Try adjusting your search terms or filters to find more professionals.
               </p>
               <button (click)="fetchPublicInterpreters()" class="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                  Reload Listings
               </button>
            </div>
          }

          <div #scrollAnchor class="h-20 flex items-center justify-center w-full">
             @if (loading() && interpreters().length > 0) {
                <div class="flex items-center gap-2 text-slate-500 text-sm">
                   <div class="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                   Loading more...
                </div>
             }
             @if (!hasMore() && interpreters().length > 0) {
                <p class="text-slate-400 text-xs font-bold uppercase tracking-widest opacity-50">End of listings</p>
             }
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class FindInterpreterComponent implements OnInit, AfterViewInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private auth = inject(AuthService);
  private readonly API_URL = environment.apiUrl;

  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;
  private observer!: IntersectionObserver;

  // State Signals
  interpreters = signal<InterpreterPublic[]>([]);
  totalElements = signal(0);
  loading = signal(false);
  hasMore = signal(true);
  currentPage = 0;

  ngOnInit() {
    this.fetchPublicInterpreters();
  }

  ngAfterViewInit() {
    this.setupObserver();
  }

  ngOnDestroy() {
    if (this.observer) this.observer.disconnect();
  }

  setupObserver() {
    this.observer = new IntersectionObserver((entries) => {
      // Trigger load if anchor is visible and we aren't currently loading
      if (entries[0].isIntersecting && !this.loading() && this.hasMore()) {
        this.currentPage++;
        this.fetchPublicInterpreters();
      }
    }, {
      root: null,
      rootMargin: '200px', // Pre-load before user hits the very bottom
      threshold: 0.1
    });

    if (this.scrollAnchor) {
      this.observer.observe(this.scrollAnchor.nativeElement);
    }
  }

  fetchPublicInterpreters() {
    this.loading.set(true);

    const params = new HttpParams()
      .set('page', this.currentPage.toString())
      .set('size', '6')
      .set('sort', 'id,desc');

    this.http.get<Page<InterpreterPublic>>(`${this.API_URL}/public/get-started-available-interpreters`, { params })
      .pipe(
        finalize(() => {
          this.loading.set(false);
          // If the screen is still empty (e.g., large monitor), fetch next page immediately
          setTimeout(() => this.checkIfScreenFilled(), 300);
        }),
        catchError(err => {
          console.error('Fetch error:', err);
          this.hasMore.set(false);
          return of(null);
        })
      )
      .subscribe(page => {
        if (page && page.content) {
          // If it's the first page (refresh or init), replace data. Otherwise, append.
          if (this.currentPage === 0) {
              this.interpreters.set(page.content);
          } else {
              this.interpreters.update(current => [...current, ...page.content]);
          }
          
          this.totalElements.set(page.totalElements);
          
          // Check if it's the last page
          if (page.last || page.content.length === 0) {
            this.hasMore.set(false);
          }
        }
      });
  }

  checkIfScreenFilled() {
    if (!this.hasMore() || this.loading() || !this.scrollAnchor) return;

    const anchor = this.scrollAnchor.nativeElement;
    const rect = anchor.getBoundingClientRect();
    
    // If anchor is visible on screen, user hasn't scrolled enough because 6 items weren't enough to fill vertical space
    if (rect.top < window.innerHeight) {
       this.currentPage++;
       this.fetchPublicInterpreters();
    }
  }

  handleViewProfile(interpreterId: number) {
    const targetUrl = `/interpreters/${interpreterId}`;
    if (this.auth.isLoggedIn()) {
      this.router.navigate([targetUrl]);
    } else {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: targetUrl } });
    }
  }
}