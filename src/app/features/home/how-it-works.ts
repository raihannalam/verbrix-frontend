import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '../layout/navbar';
import { Footer } from '../layout/footer';

type ViewMode = 'patient' | 'interpreter';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-violet-200/20 dark:bg-violet-900/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
      <div class="absolute top-0 right-1/4 w-96 h-96 bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
    </div>

    <app-navbar class="sticky top-0 z-50 block w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors duration-300" />

    <main class="w-full text-slate-900 dark:text-slate-50 font-sans antialiased selection:bg-violet-200 dark:selection:bg-violet-900">

      <section class="relative pt-16 pb-12 lg:pt-28 lg:pb-24 border-b border-slate-100 dark:border-slate-800/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div class="text-center max-w-4xl mx-auto mb-12 lg:mb-20">
            <div class="inline-flex items-center rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 mb-8 shadow-sm">
              <span class="flex h-2 w-2 rounded-full bg-violet-600 dark:bg-violet-400 mr-2.5 animate-pulse"></span>
              The Verbrix Ecosystem
            </div>
            
            <h1 class="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 sm:mb-8 text-balance">
              Not just a translator. <br class="hidden sm:block">
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">A medical advocate.</span>
            </h1>
            
            <p class="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Most translation apps are built for tourists ordering coffee. Verbrix is built for patients undergoing surgery. We bridge the gap with <strong class="text-slate-900 dark:text-slate-200 font-semibold">medically vetted professionals</strong>.
            </p>
          </div>

          <div class="grid md:grid-cols-3 gap-6 lg:gap-8">
            <div class="group bg-white dark:bg-slate-900/50 p-6 lg:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300 hover:shadow-lg hover:shadow-violet-900/5">
              <div class="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <i class="ri-pulse-line"></i>
              </div>
              <h3 class="font-bold text-xl text-slate-900 dark:text-white mb-3">Medical Fluency</h3>
              <p class="text-slate-500 dark:text-slate-400 leading-relaxed">
                Verbrix interpreters understand terminology like <em>"Myocardial Infarction"</em> vs <em>"Heart Attack"</em>, ensuring precision.
              </p>
            </div>

            <div class="group bg-white dark:bg-slate-900/50 p-6 lg:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300 hover:shadow-lg hover:shadow-violet-900/5">
              <div class="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <i class="ri-shield-keyhole-line"></i>
              </div>
              <h3 class="font-bold text-xl text-slate-900 dark:text-white mb-3">Escrow Protection</h3>
              <p class="text-slate-500 dark:text-slate-400 leading-relaxed">
                Funds are held safely in Escrow and only released when the medical session is successfully completed.
              </p>
            </div>

            <div class="group bg-white dark:bg-slate-900/50 p-6 lg:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300 hover:shadow-lg hover:shadow-violet-900/5">
              <div class="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400 text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <i class="ri-verified-badge-line"></i>
              </div>
              <h3 class="font-bold text-xl text-slate-900 dark:text-white mb-3">Vetted Humans</h3>
              <p class="text-slate-500 dark:text-slate-400 leading-relaxed">
                We verify Government IDs and Medical Certifications manually. No bots, just trusted experts.
              </p>
            </div>
          </div>

        </div>
      </section>

      <section class="py-12 lg:py-24 bg-slate-50/50 dark:bg-slate-950/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          <div class="flex flex-col items-center">
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-8">How it works for you</h2>
            <div class="w-full sm:w-auto p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row">
              <button 
                (click)="toggleView('patient')"
                [class.bg-violet-50]="currentView() === 'patient'"
                [class.text-violet-700]="currentView() === 'patient'"
                [class.dark:bg-violet-900/30]="currentView() === 'patient'"
                [class.dark:text-violet-300]="currentView() === 'patient'"
                [class.border-violet-100]="currentView() === 'patient'"
                [class.dark:border-violet-800]="currentView() === 'patient'"
                class="w-full sm:w-auto px-8 py-4 sm:py-3 rounded-xl text-base font-semibold transition-all duration-200 border border-transparent flex items-center justify-center gap-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              >
                <i class="ri-user-heart-line text-xl"></i> I am a Patient
              </button>
              <button 
                (click)="toggleView('interpreter')"
                [class.bg-violet-50]="currentView() === 'interpreter'"
                [class.text-violet-700]="currentView() === 'interpreter'"
                [class.dark:bg-violet-900/30]="currentView() === 'interpreter'"
                [class.dark:text-violet-300]="currentView() === 'interpreter'"
                [class.border-violet-100]="currentView() === 'interpreter'"
                [class.dark:border-violet-800]="currentView() === 'interpreter'"
                class="w-full sm:w-auto px-8 py-4 sm:py-3 rounded-xl text-base font-semibold transition-all duration-200 border border-transparent flex items-center justify-center gap-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              >
                <i class="ri-global-line text-xl"></i> I am an Interpreter
              </button>
            </div>
          </div>

          @if (currentView() === 'patient') {
            <div class="animate-fade-in space-y-24 lg:space-y-32">
              
              <div class="flex flex-col lg:flex-row items-center gap-10 lg:gap-24">
                <div class="flex-1 order-2 lg:order-1">
                  <div class="flex items-center gap-4 mb-6">
                    <div class="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold text-lg">01</div>
                    <span class="text-sm font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">Find an Expert</span>
                  </div>
                  <h3 class="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">Medical Specialization Discovery</h3>
                  <p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                    Don't just search for "Spanish." Search for <span class="text-slate-900 dark:text-white font-medium">"Spanish" + "Cardiology"</span>. Our engine filters for interpreters who know the specific vocabulary of your condition.
                  </p>
                  <ul class="space-y-4">
                    <li class="flex items-start gap-3.5">
                      <i class="ri-checkbox-circle-fill text-violet-600 mt-1"></i>
                      <span class="text-slate-700 dark:text-slate-300">Filter by Specialty (Oncology, Pediatrics, etc.)</span>
                    </li>
                    <li class="flex items-start gap-3.5">
                      <i class="ri-checkbox-circle-fill text-violet-600 mt-1"></i>
                      <span class="text-slate-700 dark:text-slate-300">View verified medical credentials</span>
                    </li>
                  </ul>
                </div>
                <div class="flex-1 order-1 lg:order-2 w-full max-w-lg lg:max-w-none">
                  <div class="aspect-square sm:aspect-[4/3] rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-2xl">
                    <div class="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
                    
                    <div class="absolute top-1/4 left-8 right-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 border border-slate-100 dark:border-slate-700 transform transition-transform hover:scale-[1.02] duration-500 z-10">
                       <div class="flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-3 mb-3">
                          <i class="ri-search-line text-slate-400"></i>
                          <div class="h-2 w-32 bg-slate-200 dark:bg-slate-600 rounded-full"></div>
                       </div>
                       <div class="flex gap-2">
                          <span class="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs rounded-full font-medium">Cardiology</span>
                          <span class="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-full">Spanish</span>
                       </div>
                    </div>

                    <div class="absolute top-[45%] left-12 right-12 space-y-3 opacity-90">
                       <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex-shrink-0"></div>
                          <div class="space-y-2 w-full">
                             <div class="h-2 w-24 bg-slate-200 dark:bg-slate-600 rounded"></div>
                             <div class="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded"></div>
                          </div>
                          <i class="ri-verified-badge-fill text-blue-500 text-lg ml-auto"></i>
                       </div>
                       <div class="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/50 flex-shrink-0"></div>
                          <div class="space-y-2 w-full">
                             <div class="h-2 w-20 bg-slate-200 dark:bg-slate-600 rounded"></div>
                             <div class="h-1.5 w-3/4 bg-slate-100 dark:bg-slate-700 rounded"></div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex flex-col lg:flex-row items-center gap-10 lg:gap-24">
                 <div class="flex-1 order-1 lg:order-1 w-full max-w-lg lg:max-w-none">
                  <div class="aspect-square sm:aspect-[4/3] rounded-3xl bg-indigo-50 dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 relative overflow-hidden shadow-2xl flex items-center justify-center">
                    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-100/50 via-transparent to-transparent dark:from-indigo-900/20"></div>
                    
                    <div class="relative z-10">
                       <svg class="w-48 h-48 drop-shadow-2xl text-indigo-500 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                          <path class="fill-indigo-50 dark:fill-slate-800" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          <path class="stroke-indigo-600 dark:stroke-indigo-300" d="M9 12l2 2 4-4"/>
                       </svg>
                       <div class="absolute -top-4 -right-4 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-2 animate-bounce duration-[3000ms]">
                          <div class="w-2 h-2 rounded-full bg-green-500"></div>
                          <span class="text-xs font-bold text-slate-700 dark:text-slate-200">Secure</span>
                       </div>
                    </div>
                  </div>
                </div>
                <div class="flex-1 order-2 lg:order-2">
                  <div class="flex items-center gap-4 mb-6">
                    <div class="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg">02</div>
                    <span class="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Payment Safety</span>
                  </div>
                  <h3 class="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">"Fort Knox" Booking</h3>
                  <p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                    We eliminate scams. You pay Verbrix, not the interpreter directly. We hold funds in a secure escrow vault. The interpreter is only paid <strong class="text-indigo-600 dark:text-indigo-400">after</strong> the service is delivered.
                  </p>
                </div>
              </div>

              <div class="flex flex-col lg:flex-row items-center gap-10 lg:gap-24">
                <div class="flex-1 order-2 lg:order-1">
                  <div class="flex items-center gap-4 mb-6">
                    <div class="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold text-lg">03</div>
                    <span class="text-sm font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">Connect</span>
                  </div>
                  <h3 class="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">HD Medical Video</h3>
                  <p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                    Connect instantly via our HIPAA-compliant video system. No external apps needed. Features include screen sharing for medical records and chat translation.
                  </p>
                </div>
                <div class="flex-1 order-1 lg:order-2 w-full max-w-lg lg:max-w-none">
                  <div class="aspect-square sm:aspect-[4/3] rounded-3xl bg-slate-900 border border-slate-800 relative overflow-hidden shadow-2xl flex flex-col">
                    <div class="flex-1 relative bg-slate-800 m-2 rounded-2xl overflow-hidden group">
                       <div class="absolute inset-0 flex items-center justify-center opacity-30">
                          <i class="ri-user-smile-line text-9xl text-slate-600"></i>
                       </div>
                       <div class="absolute top-4 right-4 w-24 h-32 bg-slate-700 rounded-lg border-2 border-slate-600 shadow-lg"></div>
                       
                       <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-700">
                          <div class="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white cursor-pointer transition-colors"><i class="ri-phone-end-line"></i></div>
                          <div class="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white cursor-pointer transition-colors"><i class="ri-mic-line"></i></div>
                          <div class="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white cursor-pointer transition-colors"><i class="ri-video-on-line"></i></div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          }

          @if (currentView() === 'interpreter') {
            <div class="animate-fade-in space-y-24 lg:space-y-32">
              
              <div class="flex flex-col lg:flex-row items-center gap-10 lg:gap-24">
                <div class="flex-1 order-2 lg:order-1">
                  <div class="flex items-center gap-4 mb-6">
                     <div class="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-700 dark:text-orange-300 font-bold text-lg">01</div>
                     <span class="text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">Your Profile</span>
                  </div>
                  <h3 class="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">Command Higher Rates</h3>
                  <p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    Generic translators compete on price. Verbrix interpreters compete on <strong>expertise</strong>. Upload your certifications to unlock premium badges and set your own hourly rates.
                  </p>
                </div>
                <div class="flex-1 order-1 lg:order-2 w-full max-w-lg lg:max-w-none">
                   <div class="aspect-square sm:aspect-[4/3] rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-2xl p-6 flex items-center justify-center">
                      <div class="w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                         <div class="h-20 bg-orange-100 dark:bg-orange-900/30 relative">
                            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white dark:bg-slate-800 p-1">
                               <div class="w-full h-full rounded-full bg-slate-200 dark:bg-slate-600"></div>
                            </div>
                         </div>
                         <div class="pt-8 pb-6 px-4 text-center">
                            <div class="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-2"></div>
                            <div class="flex justify-center gap-2 mb-4">
                               <div class="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded font-bold">VERIFIED</div>
                               <div class="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded font-bold">TOP RATED</div>
                            </div>
                            <div class="border-t border-slate-100 dark:border-slate-700 pt-3 flex justify-between items-center px-2">
                               <span class="text-xs text-slate-500">Rate</span>
                               <span class="font-bold text-slate-900 dark:text-white">$50/hr</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              <div class="flex flex-col lg:flex-row items-center gap-10 lg:gap-24">
                <div class="flex-1 order-1 lg:order-1 w-full max-w-lg lg:max-w-none">
                   <div class="aspect-square sm:aspect-[4/3] rounded-3xl bg-green-50 dark:bg-slate-900 border border-green-100 dark:border-slate-800 relative overflow-hidden shadow-2xl flex items-center justify-center">
                      <div class="text-center relative z-10">
                         <div class="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl mb-6 mx-auto shadow-lg shadow-green-500/30">
                            <i class="ri-check-line"></i>
                         </div>
                         <div class="bg-white dark:bg-slate-800 px-6 py-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 inline-flex items-center gap-3">
                            <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span class="font-mono font-bold text-slate-700 dark:text-slate-200">$120.00 Received</span>
                         </div>
                      </div>
                   </div>
                </div>
                <div class="flex-1 order-2 lg:order-2">
                  <div class="flex items-center gap-4 mb-6">
                     <div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-lg">02</div>
                     <span class="text-sm font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">Guaranteed Pay</span>
                  </div>
                  <h3 class="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">No More Chasing Invoices</h3>
                  <p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    We secure payment <strong>before</strong> you start. Once the session ends, funds are released to your wallet instantly. Focus on interpreting, not debt collecting.
                  </p>
                </div>
              </div>

              <div class="flex flex-col lg:flex-row items-center gap-10 lg:gap-24">
                <div class="flex-1 order-2 lg:order-1">
                  <div class="flex items-center gap-4 mb-6">
                     <div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-lg">03</div>
                     <span class="text-sm font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">Business Tools</span>
                  </div>
                  <h3 class="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">Dashboard & Analytics</h3>
                  <p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    Track your earnings, manage your schedule, and export tax-ready invoices from one beautiful dashboard.
                  </p>
                </div>
                <div class="flex-1 order-1 lg:order-2 w-full max-w-lg lg:max-w-none">
                   <div class="aspect-square sm:aspect-[4/3] rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-2xl p-6 lg:p-10 flex items-end">
                      <div class="w-full h-3/4 bg-white dark:bg-slate-800 rounded-t-xl shadow border-t border-x border-slate-100 dark:border-slate-700 p-4 relative">
                         <div class="flex gap-4 items-end h-full px-2 pb-2">
                            <div class="w-1/4 h-[40%] bg-purple-100 dark:bg-purple-900/30 rounded-t-lg"></div>
                            <div class="w-1/4 h-[60%] bg-purple-200 dark:bg-purple-900/50 rounded-t-lg"></div>
                            <div class="w-1/4 h-[50%] bg-purple-100 dark:bg-purple-900/30 rounded-t-lg"></div>
                            <div class="w-1/4 h-[85%] bg-purple-600 rounded-t-lg relative group">
                               <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  $450 Today
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>

            </div>
          }

        </div>
      </section>

      <section class="py-16 lg:py-24 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-16">
               <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Technical Confidence</h2>
               <p class="text-lg text-slate-500 dark:text-slate-400">
                 Robust tools built for sensitive medical communication.
               </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
               <div class="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <i class="ri-video-chat-line text-3xl text-violet-600 mb-4 block"></i>
                  <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-2">LiveKit Video Engine</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400">High-def, low-latency video with expiring security tokens.</p>
               </div>
               
               <div class="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <i class="ri-admin-line text-3xl text-red-600 mb-4 block"></i>
                  <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-2">Admin Governance</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400">Manual review of documents and dispute resolution.</p>
               </div>

               <div class="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <i class="ri-chat-private-line text-3xl text-green-600 mb-4 block"></i>
                  <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-2">Ephemeral Chat</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400">Messages vanish and connections sever after cases close.</p>
               </div>
               
               </div>
        </div>
      </section>

      <section class="py-20 lg:py-32 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
         <div class="max-w-4xl mx-auto text-center px-4">
            <h2 class="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-8">Ready to join the network?</h2>
            <div class="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
               <a routerLink="/auth/register" class="inline-flex items-center justify-center h-14 px-8 rounded-xl bg-violet-600 text-white font-semibold text-lg shadow-xl shadow-violet-600/20 hover:bg-violet-500 hover:-translate-y-1 transition-all active:scale-95 w-full sm:w-auto">
                  Get Started Now
               </a>
               <a routerLink="/contact" class="inline-flex items-center justify-center h-14 px-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all w-full sm:w-auto">
                  Contact Sales
               </a>
            </div>
         </div>
      </section>

    </main>
    <app-footer />
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    
    .animate-blob {
      animation: blob 7s infinite;
    }
    .animation-delay-2000 {
      animation-delay: 2s;
    }
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }

    .bg-grid-slate-200 {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%23e2e8f0'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
    }
    .dark .bg-grid-slate-800 {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%231e293b'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
    }
  `]
})
export class HowItWorksComponent {
  currentView = signal<ViewMode>('patient');

  toggleView(mode: ViewMode) {
    this.currentView.set(mode);
  }
}