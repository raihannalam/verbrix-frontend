import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  standalone: true,
  selector: 'app-not-found',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-200/20 dark:bg-violet-900/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
      <div class="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/20 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] dark:[mask-image:radial-gradient(ellipse_at_center,rgba(255,255,255,0.2),transparent)]"></div>
    </div>

    <section class="min-h-screen flex items-center justify-center p-4">
      <div class="max-w-md w-full text-center space-y-8 relative z-10">
        
        <div class="relative w-64 h-64 mx-auto animate-float">
          <div class="absolute inset-0 bg-gradient-to-tr from-violet-100 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-full shadow-2xl border border-white/50 dark:border-slate-700 backdrop-blur-sm flex items-center justify-center">
             
             <svg class="w-32 h-32 text-violet-500 dark:text-violet-400 drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" class="opacity-20" />
                <path d="M22 12h-4l-3 9L13 17" /> <path d="M9 3l-3 9H2" /> <circle cx="11" cy="12" r="2" class="fill-red-500 stroke-none animate-ping" />
                <path d="M10 12h2" class="stroke-white dark:stroke-slate-900" />
             </svg>

             <div class="absolute -top-4 -right-4 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 rotate-12">
                <span class="font-bold text-slate-900 dark:text-white">404</span>
             </div>
             <div class="absolute -bottom-2 -left-4 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 -rotate-6">
                <span class="text-xs font-mono text-slate-500">Error_Not_Found</span>
             </div>
          </div>
        </div>

        <div class="space-y-4">
          <h1 class="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Connection Lost
          </h1>
          <p class="text-lg text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            We couldn't find the page you were looking for. It might have been moved or doesn't exist.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <a routerLink="/" class="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-violet-600 text-white font-semibold shadow-lg shadow-violet-600/20 hover:bg-violet-500 hover:-translate-y-0.5 transition-all active:scale-95">
            Return Home
          </a>
          <button (click)="goBack()" class="inline-flex items-center justify-center h-12 px-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95">
            Go Back
          </button>
        </div>

      </div>
    </section>
  `,
  styles: [`
    .animate-blob { animation: blob 7s infinite; }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animation-delay-2000 { animation-delay: 2s; }
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
    .bg-grid-slate-200 {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23e2e8f0'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
    }
    .dark .bg-grid-slate-800 {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%231e293b'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
    }
  `]
})
export class NotFoundComponent implements OnInit, OnDestroy {
  private meta = inject(Meta);
  private title = inject(Title);
  
  goBack() {
    window.history.back();
  }

  ngOnInit() {
    this.title.setTitle('Page Not Found | Verbrix');
    
    // SEO FIX: Tell Google this page should not be indexed
    this.meta.addTag({ name: 'robots', content: 'noindex, nofollow' });
    this.meta.addTag({ name: 'prerender-status-code', content: '404' });
  }

  ngOnDestroy() {
    // CRITICAL: Remove tags when user navigates away to a valid page
    this.meta.removeTag('name="robots"');
    this.meta.removeTag('name="prerender-status-code"');
  }
}