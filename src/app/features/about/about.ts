import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../layout/navbar';
import { Footer } from '../layout/footer';

interface TeamMember {
  name: string;
  role: string;
  description: string;
  gender: 'male' | 'female'; // used for placeholder avatar logic
  email?: string;
  phone?: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, Navbar, Footer],
  template: `
    <app-navbar class="sticky top-0 z-50 block w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60"></app-navbar>

    <main class="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans antialiased transition-colors duration-300">
      
      <section class="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden border-b border-slate-100 dark:border-slate-800">
        <div class="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div class="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-violet-500/10 dark:bg-violet-900/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-900/20 rounded-full blur-3xl"></div>
        
        <div class="max-w-4xl mx-auto px-4 text-center reveal-item">
          <div class="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 px-3 py-1 text-sm font-medium text-violet-700 dark:text-violet-300 mb-6">
            Our Mission
          </div>
          <h1 class="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
            Reimagining communication <br>
            <span class="text-violet-600 dark:text-violet-400">in healthcare.</span>
          </h1>
          <p class="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Our mission is to eliminate language barriers so that every patient, anywhere in the world, can receive care with clarity, dignity, and understanding. We empower interpreters and healthcare providers through secure, human-centered technology.
          </p>
        </div>
      </section>

      <section id="values" class="py-24 relative bg-slate-50 dark:bg-slate-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header class="text-center max-w-2xl mx-auto mb-16 reveal-item">
            <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">What Drives Us</h2>
            <p class="text-lg text-slate-600 dark:text-slate-400">
              Everything we build starts with empathy and ends with trust. These values guide our design, development, and the relationships we build every day.
            </p>
          </header>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="reveal-item p-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-300 shadow-sm hover:shadow-md">
              <div class="w-12 h-12 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center text-2xl mb-6">
                <i class="ri-heart-2-line"></i>
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Empathy First</h3>
              <p class="text-slate-500 dark:text-slate-400 leading-relaxed">
                We believe technology should feel human. Every interaction we design aims to understand, support, and empower people on both sides of care.
              </p>
            </div>

            <div class="reveal-item p-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-300 shadow-sm hover:shadow-md" style="transition-delay: 100ms">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-2xl mb-6">
                <i class="ri-shield-check-line"></i>
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Integrity & Security</h3>
              <p class="text-slate-500 dark:text-slate-400 leading-relaxed">
                We protect what matters most — trust and privacy. Our systems are built with transparency and end-to-end data security at their core.
              </p>
            </div>

            <div class="reveal-item p-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-300 shadow-sm hover:shadow-md" style="transition-delay: 200ms">
              <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center text-2xl mb-6">
                <i class="ri-lightbulb-flash-line"></i>
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Innovation with Purpose</h3>
              <p class="text-slate-500 dark:text-slate-400 leading-relaxed">
                We don’t chase trends — we create solutions that make real communication simpler, faster, and more accessible across languages and cultures.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="team" class="py-24 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header class="text-center max-w-2xl mx-auto mb-16 reveal-item">
            <span class="text-violet-600 dark:text-violet-400 font-semibold tracking-wider uppercase text-sm">The Team</span>
            <h2 class="text-3xl font-bold text-slate-900 dark:text-white mt-2 mb-4">Built by People Who Care</h2>
            <p class="text-lg text-slate-600 dark:text-slate-400">
              We’re a passionate team of developers and designers driven by one shared goal — to make healthcare communication effortless.
            </p>
          </header>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div 
              class="reveal-item group bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-violet-200 dark:hover:border-violet-900 transition-all"
              *ngFor="let member of team; let i = index"
              [style.transition-delay]="(i * 100) + 'ms'"
            >
              <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <span class="grayscale group-hover:grayscale-0 transition-all duration-300">
                    {{ member.gender === 'male' ? '👨‍💻' : '👩‍💻' }}
                </span>
              </div>

              <div class="text-center">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ member.name }}</h3>
                <p class="text-sm font-medium text-violet-600 dark:text-violet-400 mb-3">{{ member.role }}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                  {{ member.description }}
                </p>

                <div class="flex justify-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                  <a *ngIf="member.email" [href]="'mailto:' + member.email" class="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-violet-100 hover:text-violet-600 transition-colors border border-slate-100 dark:border-slate-700">
                    <i class="ri-mail-line"></i>
                  </a>
                  <a *ngIf="member.phone" [href]="'tel:' + member.phone" class="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-violet-100 hover:text-violet-600 transition-colors border border-slate-100 dark:border-slate-700">
                    <i class="ri-phone-line"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        
        <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-200/40 dark:bg-violet-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200/40 dark:bg-indigo-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        
        <div class="relative z-10 max-w-4xl mx-auto px-4 text-center reveal-item">
          <h2 class="text-3xl md:text-4xl font-bold mb-6 text-slate-900 dark:text-white">Join Our Journey</h2>
          <p class="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
            We’re always looking for passionate minds — whether you’re a developer, designer, or healthcare innovator — to help us shape the future.
          </p>
          
          <a href="mailto:contact@verbrix.com" class="inline-flex items-center justify-center h-14 px-8 rounded-full bg-violet-600 text-white font-bold text-lg hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-600/25 transition-all transform hover:-translate-y-1">
            Contact Us
          </a>
        </div>
      </section>

    </main>

    <app-footer />
  `,
  styles: [`
    .reveal-item {
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.8s cubic-bezier(0.5, 0, 0, 1);
    }
    
    .reveal-item.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `]
})
export class AboutUsComponent implements AfterViewInit {
  @ViewChildren('revealItem') revealItems!: QueryList<ElementRef>;

  team: TeamMember[] = [
    {
      name: 'Raihan Alam',
      role: 'Lead Full Stack Engineer',
      description: 'Architecting robust backend systems with Spring Boot while driving seamless full-stack integration across Angular interfaces for a secure, high-performance platform.',
      gender: 'male',
      email: 'alamraihan94@gmail.com'
    },
    {
      name: 'Nancy Goyal',
      role: 'Android Developer',
      description: 'Developing native Android applications using Kotlin and XML, aiming for smooth performance and simple, intuitive user experiences.',
      gender: 'female',
      email: 'nancy@verbrix.com'
    },
    {
      name: 'Sameer Saifi',
      role: 'Frontend Developer',
      description: 'Creating responsive and user-friendly interfaces with Angular, focusing on performance optimization and clean code structure.',
      gender: 'male',
      email: 'sameer@verbrix.com'
    },
    {
      name: 'Stuti',
      role: 'UI/UX Developer',
      description: 'Designing and building modern interfaces with a focus on usability standards and visual consistency.',
      gender: 'female',
      email: 'stuti@verbrix.com'
    }
  ];

  ngAfterViewInit() {
    this.setupIntersectionObserver();
  }

  private setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); 
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px' 
    });

    const elements = document.querySelectorAll('.reveal-item');
    elements.forEach(el => observer.observe(el));
  }
}