import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="relative border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-xl pt-16 pb-10 overflow-hidden">
      
      <div class="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div class="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-violet-500/10 dark:bg-violet-500/20 blur-[100px] rounded-full opacity-50"></div>
      </div>

      <div class="container mx-auto px-5 md:px-8">
        
        <div class="grid grid-cols-2 md:grid-cols-12 gap-y-12 gap-x-8 mb-16">
          
          <div class="col-span-2 md:col-span-12 lg:col-span-4 flex flex-col gap-6">
            <a routerLink="/" class="flex items-center gap-3 transition-opacity hover:opacity-80 w-fit">
              <img src="assets/images/logo.png" alt="Verbrix" class="h-8 w-auto" />
              <span class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Verbrix</span>
            </a>
            
            <p class="text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm text-sm md:text-base">
              Breaking down language barriers in healthcare. We connect patients with certified interpreters for seamless medical journeys.
            </p>

            <div class="flex gap-3">
              @for (social of socialLinks; track social.name) {
                <a [href]="social.url" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   [attr.aria-label]="social.name"
                   class="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-violet-600 hover:border-violet-600 dark:hover:text-violet-400 dark:hover:border-violet-400 hover:-translate-y-1 transition-all duration-300 shadow-sm">
                  <i [class]="social.icon + ' text-lg'"></i>
                </a>
              }
            </div>
          </div>

          <div class="hidden lg:block lg:col-span-2"></div>

          <div class="col-span-1 md:col-span-4 lg:col-span-2">
            <h4 class="font-bold mb-6 text-xs uppercase tracking-widest text-violet-600 dark:text-violet-400">Product</h4>
            <ul class="space-y-4">
              <li><a routerLink="/auth/login" class="text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm font-medium">For Patients</a></li>
              <li><a routerLink="/auth/register" class="text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm font-medium">For Interpreters</a></li>
              <li><a routerLink="/how-it-works" class="text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm font-medium">How it Works</a></li>
              <li><a routerLink="/pricing" class="text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm font-medium">Pricing</a></li>
            </ul>
          </div>

          <div class="col-span-1 md:col-span-4 lg:col-span-2">
            <h4 class="font-bold mb-6 text-xs uppercase tracking-widest text-violet-600 dark:text-violet-400">Company</h4>
            <ul class="space-y-4">
              <li><a routerLink="/about" class="text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm font-medium">About Us</a></li>
              <li><a href="mailto:contact@verbrix.com" class="text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm font-medium">Contact Support</a></li>
              <li><a routerLink="/careers" class="text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm font-medium">Careers</a></li>
              <li><a routerLink="/blog" class="text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm font-medium">Blog</a></li>
            </ul>
          </div>

          <div class="col-span-1 md:col-span-4 lg:col-span-2">
            <h4 class="font-bold mb-6 text-xs uppercase tracking-widest text-violet-600 dark:text-violet-400">Legal</h4>
            <ul class="space-y-4">
              <li><a routerLink="/legal/privacy" class="text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm font-medium">Privacy Policy</a></li>
              <li><a routerLink="/legal/terms" class="text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm font-medium">Terms of Service</a></li>
              <li><a routerLink="/legal/deletion" class="text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm font-medium">Data Deletion</a></li>
            </ul>
          </div>

        </div>

        <div class="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-xs md:text-sm text-slate-400 text-center md:text-left">
            &copy; {{ currentYear }} Verbrix | All rights reserved.
          </p>
          
          <div class="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-500 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>All Systems Operational</span>
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