import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="border-t border-[var(--border)] bg-[var(--bg-surface)] pt-16 pb-8">
      
      <div class="container mx-auto px-5 sm:px-6">
        
        <div class="grid grid-cols-2 md:grid-cols-12 gap-y-10 gap-x-8 mb-16">
          
          <div class="col-span-2 md:col-span-12 lg:col-span-4 flex flex-col gap-5">
            
            <a routerLink="/" class="flex items-center gap-3 w-fit group select-none cursor-pointer">
              <img src="/assets/images/logo.png" alt="Verbrix" class="h-7 w-auto object-contain transition-transform group-hover:scale-105" />
              <span class="text-lg font-['Outfit'] font-medium tracking-[0.15em] text-[var(--text-main)] uppercase transition-colors group-hover:text-[var(--color-brand)]">
                Verbrix
              </span>
            </a>
            
            <p class="text-[var(--text-muted)] text-sm leading-relaxed max-w-[300px]">
              Breaking down language barriers in healthcare. We connect patients with certified interpreters for seamless medical journeys.
            </p>

            <div class="flex gap-3 mt-2">
              @for (social of socialLinks; track social.name) {
                <a [href]="social.url" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   [attr.aria-label]="social.name"
                   class="h-9 w-9 rounded-full bg-[var(--bg-page)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] transition-all duration-300 hover:border-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white hover:-translate-y-1">
                  <i [class]="social.icon + ' text-lg'"></i>
                </a>
              }
            </div>
          </div>

          <div class="hidden lg:block lg:col-span-2"></div>

          <div class="col-span-1 md:col-span-4 lg:col-span-2">
            <h4 class="font-bold mb-4 text-xs uppercase tracking-widest text-[var(--color-brand)]">Product</h4>
            <ul class="space-y-3">
              <li><a routerLink="/interpreters/browse" class="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--color-brand)] transition-colors">Find Interpreters</a></li>
              <li><a routerLink="/auth/register" class="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--color-brand)] transition-colors">Sign Up</a></li>
              <li><a routerLink="/auth/login" class="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--color-brand)] transition-colors">Sign In</a></li>
              <li><a routerLink="/how-it-works" class="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--color-brand)] transition-colors">How it Works</a></li>
            </ul>
          </div>

          <div class="col-span-1 md:col-span-4 lg:col-span-2">
            <h4 class="font-bold mb-4 text-xs uppercase tracking-widest text-[var(--color-brand)]">Company</h4>
            <ul class="space-y-3">
              <li><a routerLink="/about" class="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--color-brand)] transition-colors">About Us</a></li>
              <li><a href="mailto:contact@verbrix.com" class="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--color-brand)] transition-colors">Contact Support</a></li>
            </ul>
          </div>

          <div class="col-span-1 md:col-span-4 lg:col-span-2">
            <h4 class="font-bold mb-4 text-xs uppercase tracking-widest text-[var(--color-brand)]">Legal</h4>
            <ul class="space-y-3">
              <li><a routerLink="/legal/privacy" class="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--color-brand)] transition-colors">Privacy Policy</a></li>
              <li><a routerLink="/legal/terms" class="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--color-brand)] transition-colors">Terms of Service</a></li>
              <li><a routerLink="/legal/deletion" class="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--color-brand)] transition-colors">Data Deletion</a></li>
            </ul>
          </div>

        </div>

        <div class="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-6">
          <p class="text-xs text-[var(--text-dim)] text-center md:text-left">
            &copy; {{ currentYear }} Verbrix Inc. All rights reserved.
          </p>
          
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-page)] border border-[var(--border)] shadow-sm">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span class="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">Systems Operational</span>
          </div>
        </div>

      </div>
    </footer>
  `
})
export class Footer {
  currentYear = new Date().getFullYear();

  socialLinks = [
    { name: 'Twitter (X)', icon: 'ri-twitter-x-line', url: 'https://twitter.com/verbrixglobal' },
    { name: 'LinkedIn', icon: 'ri-linkedin-fill', url: 'https://linkedin.com/company/verbrixglobal' },
    { name: 'Instagram', icon: 'ri-instagram-line', url: 'https://instagram.com/verbrixglobal' },
    { name: 'Facebook', icon: 'ri-facebook-fill', url: 'https://facebook.com/verbrixglobal' },
  ];
}