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
    <app-navbar class="sticky top-0 z-50 block w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60"></app-navbar>

    <main class="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans antialiased transition-colors duration-300">

      <section class="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden border-b border-slate-100 dark:border-slate-800">
        <div class="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        
        <div class="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col lg:flex-row gap-12 lg:gap-8 items-center">
            <div class="flex-1 text-center lg:text-left">
              <div class="inline-flex items-center rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/20 px-3 py-1 text-sm font-medium text-violet-800 dark:text-violet-300 mb-8 mx-auto lg:mx-0 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors cursor-pointer">
                <span class="flex h-2 w-2 rounded-full bg-violet-600 dark:bg-violet-400 mr-2 animate-pulse"></span>
                <span>Verified Interpreters Worldwide</span>
                <i class="ri-arrow-right-s-line ml-1"></i>
              </div>
              
              <h1 class="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 text-balance">
                Global healthcare, <br>
                <span class="text-violet-600 dark:text-violet-400">fluent in every language.</span>
              </h1>
              
              <p class="text-lg sm:text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-pretty">
                Don't let language barriers compromise your health. Connect with verified medical interpreters for guidance before you travel and support when you arrive.
              </p>
              
              <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button (click)="handleGetStarted()" class="h-12 px-8 rounded-lg bg-violet-600 text-white font-semibold text-base shadow-sm hover:bg-violet-500 transition-all">
                  Find an Interpreter
                </button>
                <button class="h-12 px-8 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-base shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-all">
                  <i class="ri-play-circle-line text-xl text-slate-400"></i> View Demo
                </button>
              </div>
            </div>

            <div class="flex-1 w-full relative lg:h-auto">
              <div class="absolute -top-24 -right-24 w-96 h-96 bg-violet-200 dark:bg-violet-900/30 rounded-full blur-3xl opacity-50 -z-10"></div>
              
              <div class="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-slide-up">
                <div class="h-10 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center px-4 gap-2">
                  <div class="w-3 h-3 rounded-full bg-red-400/80"></div>
                  <div class="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                  <div class="w-3 h-3 rounded-full bg-green-400/80"></div>
                  <div class="ml-4 h-5 w-64 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600"></div>
                </div>
                
                <div class="p-6 grid grid-cols-12 gap-6 bg-slate-50/50 dark:bg-slate-950/50">
                  <div class="col-span-3 space-y-3 hidden sm:block">
                    <div class="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                    <div class="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded mt-6"></div>
                    <div class="h-4 w-3/4 bg-slate-100 dark:bg-slate-800 rounded"></div>
                    <div class="h-4 w-5/6 bg-slate-100 dark:bg-slate-800 rounded"></div>
                  </div>
                  
                  <div class="col-span-12 sm:col-span-9 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm relative">
                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80" class="w-full h-48 sm:h-64 object-cover rounded-lg opacity-90 hover:opacity-100 transition" alt="Interpreter">
                    <div class="absolute bottom-4 right-4 w-24 h-32 sm:w-32 sm:h-40 bg-slate-900 rounded-lg border-2 border-white dark:border-slate-700 shadow-lg overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80" class="w-full h-full object-cover opacity-90" alt="Patient">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="py-10 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Connecting patients to top facilities</p>
          <div class="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
             <span class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><i class="ri-hospital-line"></i> MEDCLINIC</span>
             <span class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><i class="ri-pulse-line"></i> HEALTHPLUS</span>
             <span class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><i class="ri-heart-pulse-line"></i> CAREGLOBAL</span>
             <span class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><i class="ri-stethoscope-line"></i> DOCTORIA</span>
          </div>
        </div>
      </section>

      <section id="how-it-works" class="py-24 bg-slate-50 dark:bg-slate-900 scroll-mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div class="text-center max-w-3xl mx-auto mb-20">
            <h2 class="text-base font-semibold leading-7 text-violet-600 dark:text-violet-400">How It Works</h2>
            <p class="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Seamless care, step by step.</p>
            <p class="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
              From your home country to the hospital and back. We bridge the gap so you can focus on healing.
            </p>
          </div>

          <div class="space-y-16">
            
            <div class="relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-2">
              <div class="p-8 lg:p-16 flex flex-col justify-center order-2 lg:order-1">
                <div class="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-300 mb-6">
                   <span class="font-bold text-xl">1</span>
                </div>
                <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Discovery & Pre-Travel</h3>
                <p class="text-lg text-slate-500 dark:text-slate-400 mb-6">
                  Before you book a flight, book an expert. Find interpreters who know the medical landscape, can explain costs, and guide your visa process.
                </p>
                <ul class="space-y-3">
                  <li class="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <i class="ri-check-line text-green-500 text-lg"></i> Filter by Medical Specialty
                  </li>
                  <li class="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <i class="ri-check-line text-green-500 text-lg"></i> Get Cost Estimations Early
                  </li>
                </ul>
              </div>
              
              <div class="bg-slate-50 dark:bg-slate-900/50 border-l border-slate-100 dark:border-slate-800 p-8 lg:p-12 flex items-center justify-center order-1 lg:order-2 overflow-hidden relative">
                <div class="absolute top-0 right-0 w-64 h-64 bg-violet-50 dark:bg-violet-900/20 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                <div class="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-transform hover:scale-[1.02] duration-500">
                  <div class="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
                    <div class="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                      <i class="ri-search-line text-slate-400"></i>
                      <span class="text-sm text-slate-400">Cardiology, Arabic...</span>
                    </div>
                  </div>
                  <div class="p-4 space-y-3">
                    <div class="flex gap-4 p-3 rounded-lg border border-violet-100 dark:border-violet-900/50 bg-violet-50/30 dark:bg-violet-900/10">
                      <div class="w-10 h-10 rounded-full bg-slate-300 flex-shrink-0 bg-[url('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&q=80')] bg-cover"></div>
                      <div class="flex-1">
                        <div class="h-4 w-32 bg-slate-900 dark:bg-slate-200 rounded mb-2"></div>
                        <div class="flex gap-2">
                          <div class="h-3 w-12 bg-violet-200 dark:bg-violet-800 rounded"></div>
                          <div class="h-3 w-16 bg-green-200 dark:bg-green-800 rounded"></div>
                        </div>
                      </div>
                      <div class="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs"><i class="ri-check-line"></i></div>
                    </div>
                    <div class="flex gap-4 p-3 rounded-lg border border-slate-100 dark:border-slate-800 opacity-50">
                      <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
                      <div class="flex-1">
                        <div class="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                        <div class="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-2">
              <div class="bg-slate-50 dark:bg-slate-900/50 border-r border-slate-100 dark:border-slate-800 p-8 lg:p-12 flex items-center justify-center overflow-hidden relative">
                 <div class="absolute inset-0 bg-violet-600/5 dark:bg-violet-600/10 blur-3xl"></div>
                 <div class="w-full max-w-md bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden relative aspect-video">
                    <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80" class="absolute inset-0 w-full h-full object-cover opacity-90 dark:opacity-80" alt="Doctor">
                    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                      <button class="w-10 h-10 rounded-full bg-white/40 dark:bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/60 dark:hover:bg-white/30 transition text-white"><i class="ri-mic-line"></i></button>
                      <button class="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:bg-red-600 transition text-white"><i class="ri-phone-end-line"></i></button>
                      <button class="w-10 h-10 rounded-full bg-white/40 dark:bg-white/20 backdrop-blur flex items-center justify-center hover:bg-white/60 dark:hover:bg-white/30 transition text-white"><i class="ri-video-on-line"></i></button>
                    </div>
                    <div class="absolute top-4 left-4 bg-black/40 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-green-400 border border-green-500/30 flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> On-Ground Support
                    </div>
                 </div>
              </div>

              <div class="p-8 lg:p-16 flex flex-col justify-center">
                <div class="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-300 mb-6">
                   <span class="font-bold text-xl">2</span>
                </div>
                <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">During Treatment</h3>
                <p class="text-lg text-slate-500 dark:text-slate-400 mb-6">
                  Your interpreter meets you at the airport, helps with hospital admission, and translates every doctor interaction. No confusion, no fraud.
                </p>
                <div class="flex gap-4">
                  <div class="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300">In-Person</div>
                  <div class="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-300">Video Call</div>
                </div>
              </div>
            </div>

            <div class="relative bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-2">
              <div class="p-8 lg:p-16 flex flex-col justify-center order-2 lg:order-1">
                <div class="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-300 mb-6">
                   <span class="font-bold text-xl">3</span>
                </div>
                <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Secure Settlement</h3>
                <p class="text-lg text-slate-500 dark:text-slate-400 mb-6">
                  No hidden middleman fees. You pay the platform, and we release funds to the interpreter only after service is delivered.
                </p>
                <button class="text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                  View Security Guarantee <i class="ri-arrow-right-line"></i>
                </button>
              </div>
              
              <div class="bg-slate-50 dark:bg-slate-900/50 border-l border-slate-100 dark:border-slate-800 p-8 lg:p-12 flex items-center justify-center order-1 lg:order-2 relative">
                <div class="absolute bottom-0 left-0 w-32 h-32 bg-violet-100 dark:bg-violet-900/30 rounded-full blur-3xl opacity-60"></div>
                <div class="w-64 bg-white dark:bg-slate-900 rounded-none md:rounded-lg shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-200 dark:border-slate-800 p-6 relative">
                  <div class="absolute -top-2 left-0 w-full h-4 bg-white dark:bg-slate-900 [mask-image:linear-gradient(45deg,transparent_50%,#000_50%),linear-gradient(-45deg,transparent_50%,#000_50%)] [mask-size:16px_16px] [mask-repeat:repeat-x]"></div>
                  <div class="text-center mb-6">
                    <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i class="ri-check-line text-2xl"></i>
                    </div>
                    <div class="text-sm text-slate-500 dark:text-slate-400 font-medium">Escrow Released</div>
                    <div class="text-3xl font-bold text-slate-900 dark:text-white mt-1">$150.00</div>
                  </div>
                  <div class="space-y-3 border-t border-dashed border-slate-200 dark:border-slate-800 pt-4 text-xs">
                     <div class="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Service</span>
                      <span class="font-medium text-slate-900 dark:text-white">Daily Assistance</span>
                    </div>
                    <div class="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Interpreter</span>
                      <span class="font-medium text-slate-900 dark:text-white">Ahmed K.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section id="patients" class="py-24 bg-white dark:bg-slate-950 scroll-mt-16 border-t border-slate-100 dark:border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div class="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300 mb-6">
                   For Patients
                </div>
                <h2 class="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                  Medical travel <br>without the fear.
                </h2>
                <p class="text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                   Traveling for treatment is stressful. Middlemen overcharge, language barriers isolate you, and uncertainty is high. Verbrix replaces that with trust.
                </p>
                
                <div class="space-y-6">
                   <div class="flex gap-4">
                      <div class="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                         <i class="ri-shield-check-line text-xl"></i>
                      </div>
                      <div>
                         <h4 class="text-lg font-bold text-slate-900 dark:text-white">No Exploitation</h4>
                         <p class="text-slate-500 dark:text-slate-400 mt-1">
                            Connect directly with verified professionals. No random agents or hidden commissions.
                         </p>
                      </div>
                   </div>
                   <div class="flex gap-4">
                      <div class="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                         <i class="ri-map-pin-user-line text-xl"></i>
                      </div>
                      <div>
                         <h4 class="text-lg font-bold text-slate-900 dark:text-white">End-to-End Support</h4>
                         <p class="text-slate-500 dark:text-slate-400 mt-1">
                            Your interpreter guides you from your home country, meets you at the airport, and stays until you return.
                         </p>
                      </div>
                   </div>
                </div>

                <div class="mt-10">
                   <button (click)="handleGetStarted()" class="h-12 px-8 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors">
                      Start Your Journey
                   </button>
                </div>
              </div>

              <div class="relative">
                 <div class="absolute -inset-4 bg-gradient-to-r from-blue-100 to-violet-100 dark:from-blue-900/20 dark:to-violet-900/20 rounded-3xl blur-2xl opacity-50"></div>
                 <div class="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
                    <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80" alt="Comforting Medical Consultation" class="w-full h-auto object-cover">
                    <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                       <blockquote class="text-white font-medium italic">
                          "I didn't know which hospital to choose. My interpreter explained everything before I even left Iraq."
                       </blockquote>
                       <div class="mt-2 text-white/80 text-sm font-bold">- Ahmed, Cardiac Patient</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      <section id="interpreters" class="py-24 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white scroll-mt-16 relative overflow-hidden">
         <div class="absolute top-0 right-0 -mt-20 -mr-20 w-[500px] h-[500px] bg-violet-600/10 dark:bg-violet-600/20 rounded-full blur-[100px]"></div>
         <div class="absolute bottom-0 left-0 -mb-20 -ml-20 w-[500px] h-[500px] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[100px]"></div>

         <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div class="text-center max-w-3xl mx-auto mb-16">
               <div class="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-500/20 border border-violet-200 dark:border-violet-500/30 px-3 py-1 text-sm font-medium text-violet-700 dark:text-violet-300 mb-6">
                  For Interpreters
               </div>
               <h2 class="text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">Grow your practice globally.</h2>
               <p class="text-lg text-slate-600 dark:text-slate-400">
                  Stop relying on random hospital calls. Build long-term relationships with international patients and get paid securely.
               </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div class="bg-white dark:bg-slate-900/50 backdrop-blur border border-slate-200 dark:border-slate-800 p-8 rounded-2xl hover:border-slate-300 dark:hover:bg-slate-900 transition-colors">
                  <div class="w-12 h-12 bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-white rounded-lg flex items-center justify-center mb-6">
                     <i class="ri-global-line text-2xl"></i>
                  </div>
                  <h3 class="text-xl font-bold mb-3 text-slate-900 dark:text-white">Global Visibility</h3>
                  <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                     Don't just work locally. Patients from the Middle East, CIS, and Africa are looking for you before they travel.
                  </p>
               </div>

               <div class="bg-white dark:bg-slate-900/50 backdrop-blur border border-slate-200 dark:border-slate-800 p-8 rounded-2xl hover:border-slate-300 dark:hover:bg-slate-900 transition-colors">
                  <div class="w-12 h-12 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-white rounded-lg flex items-center justify-center mb-6">
                     <i class="ri-secure-payment-line text-2xl"></i>
                  </div>
                  <h3 class="text-xl font-bold mb-3 text-slate-900 dark:text-white">Guaranteed Payment</h3>
                  <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                     Earn an upfront Assignment Fee plus daily service commissions. Money is held in escrow, so you never chase payments.
                  </p>
               </div>

               <div class="bg-white dark:bg-slate-900/50 backdrop-blur border border-slate-200 dark:border-slate-800 p-8 rounded-2xl hover:border-slate-300 dark:hover:bg-slate-900 transition-colors">
                  <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-white rounded-lg flex items-center justify-center mb-6">
                     <i class="ri-shake-hands-line text-2xl"></i>
                  </div>
                  <h3 class="text-xl font-bold mb-3 text-slate-900 dark:text-white">Build Trust</h3>
                  <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                     Establish your profile with reviews and certifications. High ratings lead to more direct bookings and higher fees.
                  </p>
               </div>
            </div>

            <div class="mt-16 text-center">
               <button (click)="handleGetStarted()" class="h-14 px-10 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-violet-600/25 transition-all transform hover:-translate-y-1">
                  Join as an Interpreter
               </button>
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