import {
  Component,
  computed,
  inject,
  signal,
  afterNextRender,
  DestroyRef,
  NgZone
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';
import { fromEvent, throttleTime } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { UserProfileService } from '../../core/profile/user-profile.service';
import { UserRole } from '../../core/models/auth.models';

interface NavLink {
  label: string;
  route?: string;
  fragment?: string;
  queryParams?: Record<string, any>;
  isDisabled?: boolean;
}

const NAV_CONFIG: Record<string, NavLink[]> = {
  [UserRole.ADMIN]: [
    { label: 'Overview', route: '/dashboard/admin/home' }, 
    { label: 'Approvals', route: '/dashboard/admin/approvals' },
    { label: 'Users', route: '/dashboard/admin/users' },
    { label: 'Financials', route: '/dashboard/admin/financials' },
    { label: 'Messages', route: '/messages' },
  ],
  [UserRole.INTERPRETER]: [
    { label: 'Overview', route: '/dashboard/interpreter/home' },
    { label: 'Requests', isDisabled: true },
    { label: 'Schedule', isDisabled: true },
    { label: 'Messages', route: '/messages' },
  ],
  [UserRole.CLIENT]: [
    { label: 'Overview', route: '/dashboard/client/home' },
    { label: 'Bookings', isDisabled: true },
    { label: 'Documents', isDisabled: true },
    { label: 'Messages', route: '/messages' },
  ],
  'GUEST': [
    { label: 'How It Works', fragment: 'how-it-works' },
    { label: 'Patients', fragment: 'patients' },
    { label: 'Interpreters', fragment: 'interpreters' },
    { label: 'About', route: '/about' },
  ]
};

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <header
      class="w-full h-16 transition-all duration-300 border-b relative z-[1001]"
      [class.border-transparent]="!isScrolled() && !isMenuOpen()"
      [class.border-[var(--border)]]="isScrolled() || isMenuOpen()"
      [class.bg-transparent]="!isScrolled() && !isMenuOpen()"
      [class.bg-[var(--bg-glass)]]="isScrolled() && !isMenuOpen()"
      [class.backdrop-blur-xl]="isScrolled() && !isMenuOpen()"
      [class.bg-[var(--bg-page)]]="isMenuOpen()"
    >
      <div class="container mx-auto h-full px-4 sm:px-6 flex items-center justify-between relative z-10">
        
        <a (click)="handleLogoClick()" 
           class="flex items-center select-none cursor-pointer group"
           aria-label="Verbrix Home">
          <img src="/assets/images/logo.png" alt="Verbrix" class="h-7 w-auto object-contain transition-transform group-hover:scale-105" />
          <span class="ml-3 text-lg font-['Outfit'] font-medium tracking-[0.15em] text-[var(--text-main)] uppercase">
            Verbrix
          </span>
        </a>

        <nav class="hidden md:flex items-center gap-1">
          @for (link of currentNavLinks(); track link.label) {
            @if (link.isDisabled) {
              <span class="px-4 py-2 text-sm font-medium text-[var(--text-muted)] opacity-50 select-none cursor-not-allowed">
                {{ link.label }}
              </span>
            } @else if (link.route) {
              <a [routerLink]="link.route"
                 [queryParams]="link.queryParams"
                 routerLinkActive="text-blue-600 bg-blue-50 dark:bg-blue-900/20 font-semibold"
                 [routerLinkActiveOptions]="link.queryParams ? { matrixParams: 'ignored', queryParams: 'exact', paths: 'subset', fragment: 'ignored' } : { exact: false }"
                 class="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-muted)] transition-all hover:text-blue-600 hover:bg-[var(--bg-surface)] cursor-pointer">
                {{ link.label }}
              </a>
            } @else {
              <button (click)="scrollTo(link.fragment!)"
                      class="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-muted)] transition-all hover:text-blue-600 hover:bg-[var(--bg-surface)] cursor-pointer">
                {{ link.label }}
              </button>
            }
          }
        </nav>

        <div class="flex items-center gap-3">
          @if (isLoggedIn()) {
            <div class="hidden md:flex items-center gap-4 pl-4 border-l border-[var(--border)]">
              <a [routerLink]="dashboardRoute()" 
                 class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                 aria-label="Go to Dashboard">
                <div class="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shadow-sm">
                  {{ userInitials() }}
                </div>
                <div class="flex flex-col leading-none">
                  <span class="text-sm font-bold text-[var(--text-main)]">{{ displayName() }}</span>
                  <span class="text-[10px] uppercase tracking-wide font-bold text-[var(--text-muted)]">{{ roleLabel() }}</span>
                </div>
              </a>
              <button (click)="logout()" 
                      class="h-8 w-8 rounded-full flex items-center justify-center text-[var(--text-dim)] transition-colors hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer" 
                      title="Sign Out">
                <i class="ri-logout-box-r-line"></i>
              </button>
            </div>
          } @else {
            <div class="hidden md:flex items-center gap-2 flex-nowrap">
              <a routerLink="/auth/login" 
                 class="px-5 py-2 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer rounded-full hover:bg-[var(--bg-surface)]">
                 Sign In
              </a>
              <a routerLink="/auth/register" 
                 class="inline-flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm font-semibold shadow-lg shadow-blue-600/25 cursor-pointer whitespace-nowrap transition-transform hover:scale-105 active:scale-95">
                 Get Started
              </a>
            </div>
          }

          <button (click)="toggleMenu()" 
                  class="md:hidden flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-main)] hover:bg-[var(--bg-surface)] cursor-pointer transition-colors"
                  [attr.aria-expanded]="isMenuOpen()"
                  aria-label="Toggle Menu">
            <i [class]="isMenuOpen() ? 'ri-close-line text-2xl' : 'ri-menu-4-line text-2xl'"></i>
          </button>
        </div>
      </div>
    </header>

    <div
      class="md:hidden fixed inset-0 z-[999] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300"
      [class.opacity-0]="!isMenuOpen()"
      [class.pointer-events-none]="!isMenuOpen()"
      (click)="closeMenu()"
      aria-hidden="true">
    </div>

    <aside
      class="md:hidden fixed top-0 right-0 z-[1000] h-[100dvh] w-[80%] max-w-[300px] bg-[var(--bg-page)] shadow-2xl pt-20 pb-6 px-6 transition-transform duration-300"
      [class.translate-x-full]="!isMenuOpen()"
      [style.visibility]="isMenuOpen() ? 'visible' : 'hidden'" 
    >
      <nav class="flex-1 overflow-y-auto flex flex-col gap-2 no-scrollbar">
        @if (isLoggedIn()) {
          <div class="mb-6 p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] flex items-center gap-4">
            <div class="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {{ userInitials() }}
            </div>
            <div class="overflow-hidden">
              <span class="block text-sm font-bold text-[var(--text-main)] truncate">{{ displayName() }}</span>
              <span class="block text-xs font-semibold text-blue-600 dark:text-blue-400">{{ roleLabel() }}</span>
            </div>
          </div>
        }

        @for (link of currentNavLinks(); track link.label) {
          @if (link.isDisabled) {
            <span class="flex items-center px-4 py-3 rounded-xl text-base font-medium text-[var(--text-dim)] opacity-50 cursor-not-allowed">
              {{ link.label }}
            </span>
          } @else if (link.route) {
            <a [routerLink]="link.route" 
               [queryParams]="link.queryParams"
               (click)="closeMenu()"
               routerLinkActive="bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold"
               [routerLinkActiveOptions]="link.queryParams ? { matrixParams: 'ignored', queryParams: 'exact', paths: 'subset', fragment: 'ignored' } : { exact: false }"
               class="flex items-center px-4 py-3 rounded-xl text-base font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-surface)] cursor-pointer">
              {{ link.label }}
            </a>
          } @else {
            <button (click)="scrollTo(link.fragment!); closeMenu()"
                    class="flex items-center px-4 py-3 rounded-xl text-base font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-surface)] text-left cursor-pointer">
              {{ link.label }}
            </button>
          }
        }

        <div class="mt-auto pt-6 border-t border-[var(--border)]">
          @if (isLoggedIn()) {
            <button (click)="logout()" class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-600 font-semibold hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer">
              <i class="ri-logout-box-line"></i> Log Out
            </button>
          } @else {
            <a routerLink="/auth/login" (click)="closeMenu()" class="block w-full px-4 py-3 rounded-xl font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-surface)] mb-2 cursor-pointer text-center">Sign In</a>
            <a routerLink="/auth/register" (click)="closeMenu()" class="block w-full text-center rounded-xl bg-blue-600 text-white py-3 font-bold cursor-pointer shadow-lg shadow-blue-600/20">Get Started</a>
          }
        </div>
      </nav>
    </aside>
  `,
  styles: [`
    :host { 
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      z-index: 2000; /* Highest priority */
      transform: translateZ(0);
      backface-visibility: hidden;
    }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { scrollbar-width: none; }
  `]
})
export class Navbar {
  private auth = inject(AuthService);
  private profile = inject(UserProfileService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private document = inject(DOCUMENT);
  private ngZone = inject(NgZone);

  isLoggedIn = this.auth.isLoggedIn;
  isMenuOpen = signal(false); 
  isScrolled = signal(false);

  currentNavLinks = computed(() => {
    const role = this.auth.currentUser()?.role;
    return role ? NAV_CONFIG[role] : NAV_CONFIG['GUEST'];
  });

  displayName = computed(() => {
    const p = this.profile.profile();
    if (p && p.firstName) {
        return `${p.firstName} ${p.lastName || ''}`.trim();
    }
    return this.auth.currentUser()?.email.split('@')[0] || 'Guest';
  });

  userInitials = computed(() => {
    const name = this.displayName();
    return name.slice(0, 2).toUpperCase();
  });

  roleLabel = computed(() => {
    const role = this.auth.currentUser()?.role;
    switch (role) {
      case UserRole.ADMIN: return 'Administrator';
      case UserRole.INTERPRETER: return 'Interpreter';
      case UserRole.CLIENT: return 'Client';
      default: return '';
    }
  });

  dashboardRoute = computed(() => {
    const role = this.auth.currentUser()?.role;
    if (!role) return '/';
    if (role === UserRole.ADMIN) return '/dashboard/admin';
    if (role === UserRole.INTERPRETER) return '/dashboard/interpreter/home';
    if (role === UserRole.CLIENT) return '/dashboard/client/home';
    return '/';
  });

  constructor() {
    afterNextRender(() => {
      this.checkScroll();
      
      this.ngZone.runOutsideAngular(() => {
        fromEvent(window, 'scroll', { passive: true })
          .pipe(
            throttleTime(20),
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe(() => {
            this.ngZone.run(() => this.checkScroll());
          });
      });

      if (this.auth.isLoggedIn() && !this.profile.snapshot) {
          this.profile.loadProfile();
      }
    });
  }

  private checkScroll() {
    // Aggressive check: if scroll is 0 and menu is closed, stay transparent.
    // If ANY scroll happens OR menu is open, show background.
    const scrolled = window.scrollY > 10;
    if (this.isScrolled() !== scrolled) {
      this.isScrolled.set(scrolled);
    }
  }

  toggleMenu() {
    const newState = !this.isMenuOpen();
    this.isMenuOpen.set(newState);
    this.updateBodyScroll(newState);
  }

  closeMenu() {
    if (this.isMenuOpen()) {
      this.isMenuOpen.set(false);
      this.updateBodyScroll(false);
    }
  }

  private updateBodyScroll(disable: boolean) {
    if (disable) {
      this.document.body.style.overflow = 'hidden';
    } else {
      this.document.body.style.overflow = '';
    }
  }

  handleLogoClick() {
    this.closeMenu();
    this.router.navigate([this.isLoggedIn() ? this.dashboardRoute() : '/']);
  }

  logout() {
    this.closeMenu();
    this.auth.logout();
    this.profile.clear();
  }

  scrollTo(id: string) {
    if (this.router.url !== '/') {
      this.router.navigate(['/']).then(() =>
        setTimeout(() => this.doScroll(id), 100)
      );
    } else {
      this.doScroll(id);
    }
  }

  private doScroll(id: string) {
    const el = this.document.getElementById(id);
    if (!el) return;
    const headerHeight = 64; 
    const offset = el.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }
}