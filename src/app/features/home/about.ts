import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../layout/navbar/navbar';
import { Footer } from '../../layout/footer/footer';

interface TeamMember {
  name: string;
  role: string;
  gender: 'male' | 'female';
  email?: string;
  phone?: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, Navbar, Footer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navbar class="sticky top-0 z-50 block w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60" />

    <main class="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans antialiased transition-colors duration-300">

      <section class="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden border-b border-slate-100 dark:border-slate-800">
        <div class="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

        <div class="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div class="inline-flex items-center rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 px-3 py-1 text-sm font-medium text-violet-700 dark:text-violet-300 mb-8 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors">
            <span class="flex h-2 w-2 rounded-full bg-violet-600 dark:bg-violet-400 mr-2.5 animate-pulse"></span>
            Our Mission
          </div>

          <h1 class="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 text-balance">
            Reimagining communication <br>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">in healthcare.</span>
          </h1>

          <p class="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Our mission is to eliminate language barriers so that every patient, anywhere in the world, can receive care with clarity, dignity, and understanding.
          </p>
        </div>
      </section>

      <section id="values" class="py-24 relative bg-slate-50/50 dark:bg-slate-900/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header class="text-center max-w-2xl mx-auto mb-16">
            <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">What Drives Us</h2>
            <p class="text-lg text-slate-600 dark:text-slate-400">
              Everything we build starts with empathy and ends with trust. These values guide our design, development, and the relationships we build every day.
            </p>
          </header>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="p-8 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-violet-900/5 group">
              <div class="w-14 h-14 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                <i class="ri-heart-2-line"></i>
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Empathy First</h3>
              <p class="text-slate-500 dark:text-slate-400 leading-relaxed">
                We believe technology should feel human. Every interaction we design aims to understand, support, and empower people on both sides of care.
              </p>
            </div>

            <div class="p-8 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-violet-900/5 group">
              <div class="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                <i class="ri-shield-check-line"></i>
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Integrity & Security</h3>
              <p class="text-slate-500 dark:text-slate-400 leading-relaxed">
                We protect what matters most - trust and privacy. Our systems are built with transparency and end-to-end data security at their core.
              </p>
            </div>

            <div class="p-8 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-violet-900/5 group">
              <div class="w-14 h-14 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                <i class="ri-lightbulb-flash-line"></i>
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Innovation with Purpose</h3>
              <p class="text-slate-500 dark:text-slate-400 leading-relaxed">
                We don’t chase trends - we create solutions that make real communication simpler, faster, and more accessible across languages and cultures.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="team" class="py-24 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header class="text-center max-w-2xl mx-auto mb-16">
            <span class="text-violet-600 dark:text-violet-400 font-bold tracking-wider uppercase text-xs mb-2 block">The Builders</span>
            <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Built by People Who Care</h2>
            <p class="text-lg text-slate-600 dark:text-slate-400">
              We’re a passionate team of developers and designers driven by one shared goal — to make healthcare communication effortless.
            </p>
          </header>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            @for (member of team; track member.name) {
              <div class="group relative bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300 hover:shadow-xl hover:shadow-violet-900/5 hover:-translate-y-1">

                <div class="w-24 h-24 mx-auto mb-6 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-4xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                   <div class="absolute inset-0 bg-gradient-to-tr from-violet-50/50 to-indigo-50/50 dark:from-violet-900/20 dark:to-indigo-900/20"></div>
                   <span class="relative z-10 filter grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">
                     {{ member.gender === 'male' ? '👨‍💻' : '👩‍💻' }}
                   </span>
                </div>

                <div class="text-center">
                  <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ member.name }}</h3>
                  <p class="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide mb-4">{{ member.role }}</p>


                  <div class="flex justify-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                    @if (member.email) {
                      <a [href]="'mailto:' + member.email" class="w-9 h-9 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-violet-600 transition-all border border-slate-200 dark:border-slate-700" title="Email">
                        <i class="ri-mail-line"></i>
                      </a>
                    }
                    @if (member.phone) {
                      <a [href]="'tel:' + member.phone" class="w-9 h-9 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-green-600 transition-all border border-slate-200 dark:border-slate-700" title="Call">
                        <i class="ri-phone-line"></i>
                      </a>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <section class="py-24 relative bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div class="max-w-4xl mx-auto px-4 text-center">
          <h2 class="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-white">Join Our Journey</h2>
          <p class="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
            We’re always looking for passionate minds - whether you’re a developer, designer, or healthcare innovator - to help us shape the future.
          </p>

          <a href="mailto:contact@verbrix.com" class="inline-flex items-center justify-center h-14 px-10 rounded-xl bg-violet-600 text-white font-semibold text-lg hover:bg-violet-500 hover:shadow-xl hover:shadow-violet-600/20 transition-all transform hover:-translate-y-1 active:scale-95">
            Contact Us
          </a>
        </div>
      </section>

    </main>

    <app-footer />
  `
})
export class AboutUsComponent {

  team: TeamMember[] = [
    {
      name: 'Raihan Alam',
      role: 'Founder & Lead Architect',
      gender: 'male',
      email: 'alamraihan94@gmail.com'
    },
    {
      name: 'Nancy Goyal',
      role: 'Android Developer',
      gender: 'female',
      email: 'nancy@verbrix.com'
    },
    {
      name: 'Sameer Saifi',
      role: 'Frontend Developer',
      gender: 'male',
      email: 'sameer@verbrix.com'
    },
    {
      name: 'Stuti',
      role: 'UI Tester',
      gender: 'female',
      email: 'stuti@verbrix.com'
    }
  ];
}
