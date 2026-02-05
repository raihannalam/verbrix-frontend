import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../layout/navbar';
import { Footer } from '../layout/footer';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, Navbar, Footer],
  template: `
    <app-navbar class="sticky top-0 z-50 block w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800"></app-navbar>

    <main class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        
        <div class="mb-10 border-b border-slate-100 dark:border-slate-800 pb-8">
           <span class="text-violet-600 dark:text-violet-400 text-sm font-bold tracking-wider uppercase">Legal</span>
           <h1 class="text-3xl md:text-4xl font-bold mt-2 text-slate-900 dark:text-white">Privacy Policy</h1>
           <p class="text-slate-500 dark:text-slate-400 mt-2">Last Updated: February 5, 2026</p>
        </div>

        <div class="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
          <p>
            At Verbrix, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website or use our mobile application.
          </p>
          
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">1. Information We Collect</h3>
          <p>
            We collect information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services or otherwise when you contact us.
          </p>
          <ul class="list-disc pl-5 space-y-2 mt-4">
            <li><strong>Personal Data:</strong> Name, email address, phone number, and medical qualifications (for interpreters).</li>
            <li><strong>Payment Data:</strong> Data necessary to process your payment if you make purchases, such as your payment instrument number.</li>
            <li><strong>Health Data:</strong> Minimal health context provided voluntarily by patients during the booking process.</li>
          </ul>

          <h3 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">2. How We Use Your Information</h3>
          <p>
            We use personal information collected via our Services for a variety of business purposes described below:
          </p>
          <ul class="list-disc pl-5 space-y-2 mt-4">
            <li>To facilitate account creation and logon process.</li>
            <li>To send you administrative information.</li>
            <li>To fulfill and manage your orders and bookings.</li>
            <li>To enforce our terms, conditions, and policies.</li>
          </ul>
        </div>

      </div>
    </main>
    <app-footer />
  `
})
export class PrivacyPolicyComponent {}