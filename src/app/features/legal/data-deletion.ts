import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../layout/navbar';
import { Footer } from '../layout/footer';

@Component({
  selector: 'app-data-deletion',
  standalone: true,
  imports: [CommonModule, Navbar, Footer],
  template: `
    <app-navbar class="sticky top-0 z-50 block w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800"></app-navbar>

    <main class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        
        <div class="mb-10 border-b border-slate-100 dark:border-slate-800 pb-8">
           <span class="text-violet-600 dark:text-violet-400 text-sm font-bold tracking-wider uppercase">User Rights</span>
           <h1 class="text-3xl md:text-4xl font-bold mt-2 text-slate-900 dark:text-white">Data Deletion Instructions</h1>
           <p class="text-slate-500 dark:text-slate-400 mt-2">Compliance: GDPR & CCPA</p>
        </div>

        <div class="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
          <p>
             According to the General Data Protection Regulation (GDPR) and other applicable privacy laws, you have the right to request the deletion of your personal data held by Verbrix.
          </p>

          <h3 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">How to Request Deletion</h3>
          <p>You can request the deletion of your account and associated data through one of the following methods:</p>
          
          <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700 mt-4 mb-6">
            <h4 class="font-bold text-slate-900 dark:text-white mb-2">Option 1: In-App Request</h4>
            <ol class="list-decimal pl-5 space-y-2 text-sm">
              <li>Log in to your Verbrix account.</li>
              <li>Go to <strong>Settings > Security & Privacy</strong>.</li>
              <li>Scroll to the bottom and click <strong>"Delete Account"</strong>.</li>
            </ol>
          </div>

          <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
             <h4 class="font-bold text-slate-900 dark:text-white mb-2">Option 2: Email Request</h4>
             <p class="text-sm mb-3">
               If you cannot access your account, please email our Data Protection Officer directly.
             </p>
             <a href="mailto:support@verbrix.com" class="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold">
               <i class="ri-mail-send-line"></i> support@verbrix.com
             </a>
             <p class="text-xs text-slate-500 mt-2">Subject: "Data Deletion Request - [Your Email]"</p>
          </div>

          <h3 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">What happens next?</h3>
          <p>
            Once we receive your request, your data will be queued for deletion. This process typically takes up to 30 days. We may retain certain data for legal or regulatory purposes (e.g., invoice records) as required by law.
          </p>
        </div>

      </div>
    </main>
    <app-footer />
  `
})
export class DataDeletionComponent {}