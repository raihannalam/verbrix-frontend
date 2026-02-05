import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../layout/navbar';
import { Footer } from '../layout/footer';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [CommonModule, Navbar, Footer],
  template: `
    <app-navbar class="sticky top-0 z-50 block w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800"></app-navbar>

    <main class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        
        <div class="mb-10 border-b border-slate-100 dark:border-slate-800 pb-8">
           <span class="text-violet-600 dark:text-violet-400 text-sm font-bold tracking-wider uppercase">Legal</span>
           <h1 class="text-3xl md:text-4xl font-bold mt-2 text-slate-900 dark:text-white">Terms of Service</h1>
           <p class="text-slate-500 dark:text-slate-400 mt-2">Effective Date: February 5, 2026</p>
        </div>

        <div class="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
          <p>
            These Terms of Service ("Terms") govern your access to and use of the Verbrix website, apps, APIs, and widgets. By accessing or using our Services, you agree to be bound by these Terms.
          </p>

          <h3 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">1. Interpreter Services</h3>
          <p>
            Verbrix acts as a platform to connect patients with independent interpreters. We are not a medical provider. Interpreters are responsible for the accuracy of their translations.
          </p>

          <h3 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">2. User Accounts</h3>
          <p>
            You are responsible for safeguarding the password that you use to access the Services and for any activities or actions under your password. You agree not to disclose your password to any third party.
          </p>

          <h3 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">3. Payments & Refunds</h3>
          <p>
            All payments are processed securely. Refunds are available for cancellations made 24 hours prior to the scheduled booking time. No-shows are not eligible for refunds.
          </p>
          
           <h3 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">4. Prohibited Uses</h3>
           <p>
             You may not use the platform for any illegal activities, including but not limited to fraud, harassment, or transmitting malware.
           </p>
        </div>

      </div>
    </main>
    <app-footer />
  `
})
export class TermsOfServiceComponent {}