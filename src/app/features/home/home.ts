import { Component, inject, ChangeDetectionStrategy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { UserRole } from '../../core/models/auth.models';
import { Footer } from '../layout/footer';
import { Navbar } from "../layout/navbar";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Footer, Navbar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navbar class="sticky top-0 z-50 block w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60"></app-navbar>

    <main class="w-full bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans antialiased transition-colors duration-300">

      <section class="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden border-b border-gray-100 dark:border-gray-800">
        <div class="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-gray-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        
        <div class="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col lg:flex-row gap-12 lg:gap-8 items-center">
            <div class="flex-1 text-center lg:text-left">
              <div class="inline-flex items-center rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/20 px-3 py-1 text-sm font-medium text-violet-800 dark:text-violet-300 mb-8 mx-auto lg:mx-0 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors cursor-pointer">
                <span class="flex h-2 w-2 rounded-full bg-violet-600 dark:bg-violet-400 mr-2 animate-pulse"></span>
                <span>New: 24/7 Pediatric Support</span>
                <i class="ri-arrow-right-s-line ml-1"></i>
              </div>
              
              <h1 class="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 text-balance">
                Global healthcare, <br>
                <span class="text-violet-600 dark:text-violet-400">fluent in every language.</span>
              </h1>
              
              <p class="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-pretty">
                Securely connect with certified medical interpreters in seconds. HIPAA-compliant video calls for patients and providers worldwide.
              </p>
              
              <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button (click)="handleGetStarted()" class="h-12 px-8 rounded-lg bg-violet-600 text-white font-semibold text-base shadow-sm hover:bg-violet-500 transition-all">
                  Find an Interpreter
                </button>
                <button class="h-12 px-8 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-semibold text-base shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2 transition-all">
                  <i class="ri-play-circle-line text-xl text-gray-400"></i> View Demo
                </button>
              </div>
            </div>

            <div class="flex-1 w-full relative lg:h-auto">
              <div class="absolute -top-24 -right-24 w-96 h-96 bg-violet-200 dark:bg-violet-900/30 rounded-full blur-3xl opacity-50 -z-10"></div>
              
              <div class="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden animate-slide-up">
                <div class="h-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center px-4 gap-2">
                  <div class="w-3 h-3 rounded-full bg-red-400/80"></div>
                  <div class="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                  <div class="w-3 h-3 rounded-full bg-green-400/80"></div>
                  <div class="ml-4 h-5 w-64 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"></div>
                </div>
                
                <div class="p-6 grid grid-cols-12 gap-6 bg-gray-50/50 dark:bg-gray-950/50">
                  <div class="col-span-3 space-y-3 hidden sm:block">
                    <div class="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                    <div class="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded mt-6"></div>
                    <div class="h-4 w-3/4 bg-gray-100 dark:bg-gray-800 rounded"></div>
                    <div class="h-4 w-5/6 bg-gray-100 dark:bg-gray-800 rounded"></div>
                  </div>
                  
                  <div class="col-span-12 sm:col-span-9 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-2 shadow-sm relative">
                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80" class="w-full h-48 sm:h-64 object-cover rounded-lg opacity-90 hover:opacity-100 transition" alt="Interpreter">
                    <div class="absolute bottom-4 right-4 w-24 h-32 sm:w-32 sm:h-40 bg-gray-900 rounded-lg border-2 border-white dark:border-gray-700 shadow-lg overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80" class="w-full h-full object-cover opacity-90" alt="Patient">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-10 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Trusted by leading healthcare networks</p>
          <div class="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
             <span class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><i class="ri-hospital-line"></i> MEDCLINIC</span>
             <span class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><i class="ri-pulse-line"></i> HEALTHPLUS</span>
             <span class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><i class="ri-heart-pulse-line"></i> CAREGLOBAL</span>
             <span class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><i class="ri-stethoscope-line"></i> DOCTORIA</span>
          </div>
        </div>
      </section>

      <section class="py-24 bg-gray-50 dark:bg-gray-900">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div class="text-center max-w-3xl mx-auto mb-20">
            <h2 class="text-base font-semibold leading-7 text-violet-600 dark:text-violet-400">How it works</h2>
            <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Seamless care, step by step.</p>
            <p class="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">From finding a specialist to the final consultation, our platform keeps everything contained, secure, and simple.</p>
          </div>

          <div class="space-y-16">
            
            <div class="relative bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-2">
              <div class="p-8 lg:p-16 flex flex-col justify-center order-2 lg:order-1">
                <div class="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-300 mb-6">
                   <span class="font-bold text-xl">1</span>
                </div>
                <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Discovery</h3>
                <p class="text-lg text-gray-500 dark:text-gray-400 mb-6">Filter by language, medical specialty, and real-time availability. View detailed certifications before you book.</p>
                <ul class="space-y-3">
                  <li class="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <i class="ri-check-line text-green-500 text-lg"></i> 150+ Languages Supported
                  </li>
                  <li class="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <i class="ri-check-line text-green-500 text-lg"></i> Real-time "Online" Status
                  </li>
                </ul>
              </div>
              
              <div class="bg-gray-50 dark:bg-gray-900/50 border-l border-gray-100 dark:border-gray-800 p-8 lg:p-12 flex items-center justify-center order-1 lg:order-2 overflow-hidden relative">
                <div class="absolute top-0 right-0 w-64 h-64 bg-violet-50 dark:bg-violet-900/20 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

                <div class="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden transform transition-transform hover:scale-[1.02] duration-500">
                  <div class="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
                    <div class="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                      <i class="ri-search-line text-gray-400"></i>
                      <span class="text-sm text-gray-400">Cardiology, Spanish...</span>
                    </div>
                  </div>
                  <div class="p-4 space-y-3">
                    <div class="flex gap-4 p-3 rounded-lg border border-violet-100 dark:border-violet-900/50 bg-violet-50/30 dark:bg-violet-900/10">
                      <div class="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 bg-[url('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&q=80')] bg-cover"></div>
                      <div class="flex-1">
                        <div class="h-4 w-32 bg-gray-900 dark:bg-gray-200 rounded mb-2"></div>
                        <div class="flex gap-2">
                          <div class="h-3 w-12 bg-violet-200 dark:bg-violet-800 rounded"></div>
                          <div class="h-3 w-16 bg-green-200 dark:bg-green-800 rounded"></div>
                        </div>
                      </div>
                      <div class="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs"><i class="ri-check-line"></i></div>
                    </div>
                    <div class="flex gap-4 p-3 rounded-lg border border-gray-100 dark:border-gray-800 opacity-50">
                      <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
                      <div class="flex-1">
                        <div class="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div class="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded"></div>
                      </div>
                    </div>
                     <div class="flex gap-4 p-3 rounded-lg border border-gray-100 dark:border-gray-800 opacity-50">
                      <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
                      <div class="flex-1">
                        <div class="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div class="h-3 w-12 bg-gray-100 dark:bg-gray-800 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="relative bg-slate-900 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 text-white">
              <div class="bg-slate-800/50 p-8 lg:p-12 flex items-center justify-center overflow-hidden relative">
                 <div class="absolute inset-0 bg-violet-600/10 blur-3xl"></div>
                 
                 <div class="w-full max-w-md bg-slate-800 rounded-xl border border-slate-700 shadow-2xl overflow-hidden relative aspect-video">
                    <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80" class="absolute inset-0 w-full h-full object-cover opacity-80" alt="Doctor">
                    
                    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                      <button class="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition"><i class="ri-mic-line"></i></button>
                      <button class="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:bg-red-600 transition"><i class="ri-phone-end-line"></i></button>
                      <button class="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/30 transition"><i class="ri-video-on-line"></i></button>
                    </div>

                    <div class="absolute top-4 left-4 bg-black/40 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-green-400 border border-green-500/30 flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Encrypted: AES-256
                    </div>
                 </div>
              </div>

              <div class="p-8 lg:p-16 flex flex-col justify-center">
                <div class="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white mb-6">
                   <span class="font-bold text-xl">2</span>
                </div>
                <h3 class="text-3xl font-bold mb-4">Secure Connection</h3>
                <p class="text-lg text-slate-400 mb-6">Our browser-based platform works seamlessly on phones, tablets, and laptops. No downloads required—just click the link.</p>
                <div class="flex gap-4">
                  <div class="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">HTTPS/TLS 1.3</div>
                  <div class="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">Low Latency</div>
                </div>
              </div>
            </div>

            <div class="relative bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-2">
              <div class="p-8 lg:p-16 flex flex-col justify-center order-2 lg:order-1">
                <div class="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-300 mb-6">
                   <span class="font-bold text-xl">3</span>
                </div>
                <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Automated Settlement</h3>
                <p class="text-lg text-gray-500 dark:text-gray-400 mb-6">Sessions are timed automatically. Payments are released from escrow only after the service is successfully delivered.</p>
                <button class="text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                  View Payment Security <i class="ri-arrow-right-line"></i>
                </button>
              </div>
              
              <div class="bg-gray-50 dark:bg-gray-900/50 border-l border-gray-100 dark:border-gray-800 p-8 lg:p-12 flex items-center justify-center order-1 lg:order-2 relative">
                <div class="absolute bottom-0 left-0 w-32 h-32 bg-violet-100 dark:bg-violet-900/30 rounded-full blur-3xl opacity-60"></div>

                <div class="w-64 bg-white dark:bg-gray-900 rounded-none md:rounded-lg shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-gray-200 dark:border-gray-800 p-6 relative">
                  <div class="absolute -top-2 left-0 w-full h-4 bg-white dark:bg-gray-900 [mask-image:linear-gradient(45deg,transparent_50%,#000_50%),linear-gradient(-45deg,transparent_50%,#000_50%)] [mask-size:16px_16px] [mask-repeat:repeat-x]"></div>

                  <div class="text-center mb-6">
                    <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i class="ri-check-line text-2xl"></i>
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400 font-medium">Payment Successful</div>
                    <div class="text-3xl font-bold text-gray-900 dark:text-white mt-1">$45.00</div>
                  </div>
                  
                  <div class="space-y-3 border-t border-dashed border-gray-200 dark:border-gray-800 pt-4 text-xs">
                    <div class="flex justify-between text-gray-500 dark:text-gray-400">
                      <span>Duration</span>
                      <span class="font-medium text-gray-900 dark:text-white">30 mins</span>
                    </div>
                    <div class="flex justify-between text-gray-500 dark:text-gray-400">
                      <span>Interpreter</span>
                      <span class="font-medium text-gray-900 dark:text-white">Dr. Sarah J.</span>
                    </div>
                    <div class="flex justify-between text-gray-500 dark:text-gray-400">
                      <span>Date</span>
                      <span class="font-medium text-gray-900 dark:text-white">Feb 12, 2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section class="py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto relative rounded-[2.5rem] 
              bg-gradient-to-br from-indigo-100 via-sky-100 to-blue-200
              dark:from-indigo-900/40 dark:via-sky-900/30 dark:to-blue-900/40
              overflow-hidden shadow-xl">

    <div class="absolute inset-0 opacity-10 
                bg-[radial-gradient(circle_at_1px_1px,#64748b_1px,transparent_0)] 
                [background-size:18px_18px]"></div>

    <div class="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 
                bg-sky-300/30 rounded-full blur-[120px]"></div>
    <div class="absolute bottom-0 left-0 -mb-24 -ml-24 w-96 h-96 
                bg-indigo-300/30 rounded-full blur-[120px]"></div>

    <div class="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center 
                p-10 sm:p-16 lg:p-24">

      <div>
        <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold 
                   text-slate-900 dark:text-white tracking-tight mb-6">
          Ready to bridge the gap?
        </h2>

        <p class="text-slate-600 dark:text-slate-300 text-lg mb-8 max-w-md">
          Join thousands of patients and providers accessing global healthcare
          without the language barrier.
        </p>

        <div class="flex flex-col sm:flex-row gap-4">
          <button
            (click)="handleGetStarted()"
            class="h-14 px-8 rounded-xl 
                   bg-gradient-to-r from-indigo-500 to-sky-500
                   text-white font-semibold text-lg
                   hover:from-indigo-400 hover:to-sky-400
                   transition-all shadow-md active:scale-95">
            Get Started Now
          </button>

          <button
            class="h-14 px-8 rounded-xl 
                   bg-white/70 dark:bg-slate-900/60
                   border border-slate-300 dark:border-slate-700
                   text-slate-800 dark:text-slate-200
                   font-semibold text-lg
                   hover:bg-white dark:hover:bg-slate-900
                   transition-all">
            Contact Sales
          </button>
        </div>
      </div>

      <div class="hidden lg:grid grid-cols-2 gap-4">
        <div class="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm
                    p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div class="text-3xl font-bold text-slate-900 dark:text-white mb-1">98%</div>
          <div class="text-slate-600 dark:text-slate-400 text-sm">Satisfaction Rate</div>
        </div>

        <div class="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm
                    p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div class="text-3xl font-bold text-slate-900 dark:text-white mb-1">2 min</div>
          <div class="text-slate-600 dark:text-slate-400 text-sm">Avg. Connect Time</div>
        </div>

        <div class="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm
                    p-6 rounded-2xl border border-slate-200 dark:border-slate-700 col-span-2">
          <div class="flex items-center gap-3 mb-2">
            <div class="flex -space-x-2">
              <div class="w-8 h-8 rounded-full bg-sky-400 border-2 border-white"></div>
              <div class="w-8 h-8 rounded-full bg-indigo-400 border-2 border-white"></div>
              <div class="w-8 h-8 rounded-full bg-teal-400 border-2 border-white"></div>
            </div>
            <div class="text-slate-900 dark:text-white font-semibold">10k+ Sessions</div>
          </div>
          <div class="text-slate-600 dark:text-slate-400 text-sm">
            Secured via escrow-based settlement
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

    </main>
    <app-footer *ngIf="footerReady" />
  `,
  styles: [`
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-up {
      animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class Home implements AfterViewInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  footerReady = false;

  ngAfterViewInit() {
    // Wait for the next macro-task to ensure view painting is complete
    setTimeout(() => {
      this.footerReady = true;
      this.cdr.markForCheck();
    }, 0);
  }

  handleGetStarted() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/register']);
      return;
    }

    const user = this.auth.currentUser();
    
    if (user) {
      const dashboardMap: Record<string, string> = {
        [UserRole.ADMIN]: '/dashboard/admin/home',
        [UserRole.INTERPRETER]: '/dashboard/interpreter/home',
        [UserRole.CLIENT]: '/dashboard/client/home'
      };
      
      this.router.navigate([dashboardMap[user.role] || '/dashboard']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}