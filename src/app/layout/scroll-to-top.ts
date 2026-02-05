import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="scrollToTop()"
      [class.opacity-100]="isVisible()"
      [class.opacity-0]="!isVisible()"
      [class.translate-y-0]="isVisible()"
      [class.translate-y-10]="!isVisible()"
      class="fixed bottom-8 right-8 z-[90] 
             flex items-center justify-center w-12 h-12 rounded-full
             bg-white/80 dark:bg-slate-900/80 backdrop-blur-md
             border border-slate-200 dark:border-slate-700 shadow-sm
             text-violet-600 dark:text-violet-400
             transition-all duration-500 ease-out
             hover:bg-violet-50 dark:hover:bg-slate-800
             hover:border-violet-200 dark:hover:border-violet-900
             hover:shadow-md hover:-translate-y-1
             focus:outline-none focus:ring-2 focus:ring-violet-500/30"
      aria-label="Scroll to top"
    >
      <i class="ri-arrow-up-s-line text-2xl"></i>
    </button>
  `,
  styles: [`
    button.opacity-0 {
      pointer-events: none;
    }
  `]
})
export class ScrollToTopComponent {
  isVisible = signal(false);

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isVisible.set(window.scrollY > 300);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}