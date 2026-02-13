import {
  Component,
  computed,
  inject,
  signal,
  afterNextRender,
  DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';
import { fromEvent } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { UserProfileService } from '../../core/profile/user-profile.service';
import { UserRole } from '../../core/models/auth.models';

interface NavLink {
  label: string;
  route?: string;
  fragment?: string;
  isDisabled?: boolean;
}

// 1. UPDATED ROUTING CONFIGURATION
// Matches the provided routes definition
const NAV_CONFIG: Record<string, NavLink[]> = {
  [UserRole.ADMIN]: [
    { label: 'Overview', route: '/dashboard/admin/home' },
    { label: 'Users', isDisabled: true },
    { label: 'Reports', isDisabled: true },
    { label: 'Messages', route: '/messages' }, // Fixed: Points to standalone chat
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
  class="fixed z-[100] transition-all duration-300
         top-0 inset-x-0 h-16
         md:top-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 
         md:w-[calc(100%-2rem)] md:max-w-7xl md:h-16
         md:rounded-full md:border md:border-[var(--border)] md:shadow-lg md:backdrop-blur-xl md:bg-[var(--bg-glass)]"
  [class.bg-transparent]="!isScrolled() && !isMenuOpen()"
  [class.bg-[var(--bg-glass)]]="isScrolled() && !isMenuOpen()"
  [class.backdrop-blur-md]="isScrolled() && !isMenuOpen()"
  [class.bg-[var(--bg-page)]]="isMenuOpen()"
>
  <div class="absolute bottom-0 inset-x-0 h-px bg-[var(--border)] md:hidden"
       [class.opacity-0]="!isScrolled() && !isMenuOpen()">
  </div>

  <div class="container mx-auto h-full px-4 sm:px-6 flex items-center justify-between relative z-10 whitespace-nowrap">
    
    <a (click)="handleLogoClick()" class="flex items-center select-none cursor-pointer">
      <img src="/assets/images/logo.png" alt="Verbrix logo" class="h-7 w-auto object-contain" />
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
             routerLinkActive="text-blue-600 bg-blue-50 dark:bg-blue-900/20 font-semibold"
             class="px-4 py-2 rounded-full text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-blue-600 hover:bg-[var(--bg-surface)] cursor-pointer">
            {{ link.label }}
          </a>
        } @else {
          <button (click)="scrollTo(link.fragment!)"
                  class="px-4 py-2 rounded-full text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-blue-600 hover:bg-[var(--bg-surface)] cursor-pointer">
            {{ link.label }}
          </button>
        }
      }
    </nav>

    <div class="flex items-center gap-3">
      @if (isLoggedIn()) {
        <div class="hidden md:flex items-center gap-4 pl-4 border-l border-[var(--border)]">
          <a [routerLink]="dashboardRoute()" class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div class="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
              {{ userInitials() }}
            </div>
            <div class="flex flex-col leading-none">
              <span class="text-sm font-bold text-[var(--text-main)]">{{ displayName() }}</span>
              <span class="text-[10px] uppercase tracking-wide font-bold text-[var(--text-muted)]">{{ roleLabel() }}</span>
            </div>
          </a>
          <button (click)="logout()" class="h-8 w-8 rounded-full flex items-center justify-center text-[var(--text-dim)] transition-colors hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer" title="Sign Out">
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
             class="inline-flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm font-semibold shadow-lg shadow-blue-600/25 cursor-pointer whitespace-nowrap transition-colors">
             Get Started
          </a>
        </div>
      }

      <button (click)="toggleMenu()" class="md:hidden flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-main)] hover:bg-[var(--bg-surface)] cursor-pointer">
        <i [class]="isMenuOpen() ? 'ri-close-line text-2xl' : 'ri-menu-4-line text-2xl'"></i>
      </button>
    </div>
  </div>
</header>

<div
  class="md:hidden fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300"
  [class.opacity-0]="!isMenuOpen()"
  [class.pointer-events-none]="!isMenuOpen()"
  (click)="closeMenu()">
</div>

<aside
  class="md:hidden fixed top-0 right-0 z-[95] h-[100dvh] w-[80%] max-w-[300px] bg-[var(--bg-page)] shadow-2xl pt-20 pb-6 px-6 transition-transform duration-300"
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
        <a [routerLink]="link.route" (click)="closeMenu()"
           routerLinkActive="bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold"
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
        <a routerLink="/auth/register" (click)="closeMenu()" class="block w-full text-center rounded-xl bg-blue-600 text-white py-3 font-bold cursor-pointer">Get Started</a>
      }
    </div>
  </nav>
</aside>
`,
  styles: [`
    :host { display: block; }
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
    if (role === UserRole.ADMIN) return '/dashboard/admin/home';
    if (role === UserRole.INTERPRETER) return '/dashboard/interpreter/home';
    if (role === UserRole.CLIENT) return '/dashboard/client/home';
    return '/';
  });

  constructor() {
    afterNextRender(() => {
      this.checkScroll();
      fromEvent(window, 'scroll', { passive: true })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.checkScroll());

      if (this.auth.isLoggedIn() && !this.profile.snapshot) {
          this.profile.loadProfile();
      }
    });
  }

  private checkScroll() {
    this.isScrolled.set(window.scrollY > 10);
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
    const offset = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }
}