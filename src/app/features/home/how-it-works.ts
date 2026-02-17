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
    <app-navbar class="sticky top-0 z-50 block w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60" />

    <main class="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans antialiased transition-colors duration-300">
      
      <section class="relative pt-24 pb-12 lg:pt-32 lg:pb-20 overflow-hidden border-b border-slate-100 dark:border-slate-800">
         <div class="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
         
         <div class="max-w-4xl mx-auto px-4 text-center">
            <div class="inline-flex items-center rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/20 px-3 py-1 text-sm font-medium text-violet-800 dark:text-violet-300 mb-8 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors">
              <span class="flex h-2 w-2 rounded-full bg-violet-600 dark:bg-violet-400 mr-2 animate-pulse"></span>
              The Verbrix Ecosystem
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 text-balance">
              Not just translation. <br>
              <span class="text-violet-600 dark:text-violet-400">Total advocacy.</span>
            </h1>

            <p class="text-lg sm:text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Most apps are for ordering coffee. Verbrix is for undergoing surgery. We bridge the gap with medically vetted professionals and secure financial protection.
            </p>

            <div class="inline-flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 relative" role="group" aria-label="User Type Toggle">
               <div class="absolute inset-y-1.5 transition-all duration-300 ease-out rounded-xl shadow-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-[calc(50%-6px)]"
                    [class.translate-x-0]="currentView() === 'patient'"
                    [class.translate-x-full]="currentView() === 'interpreter'"
                    [class.left-1.5]="true">
               </div>
               
               <button (click)="toggleView('patient')" 
                       [attr.aria-pressed]="currentView() === 'patient'"
                       class="relative z-10 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 min-w-[140px] flex items-center justify-center gap-2"
                       [class.text-slate-900]="currentView() === 'patient'"
                       [class.dark:text-white]="currentView() === 'patient'"
                       [class.text-slate-500]="currentView() !== 'patient'">
                  <i class="ri-user-heart-line text-lg"></i> I am a Patient
               </button>
               
               <button (click)="toggleView('interpreter')"
                       [attr.aria-pressed]="currentView() === 'interpreter'"
                       class="relative z-10 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 min-w-[140px] flex items-center justify-center gap-2"
                       [class.text-slate-900]="currentView() === 'interpreter'"
                       [class.dark:text-white]="currentView() === 'interpreter'"
                       [class.text-slate-500]="currentView() !== 'interpreter'">
                  <i class="ri-global-line text-lg"></i> I am an Interpreter
               </button>
            </div>
         </div>
      </section>

      <section class="py-24 bg-white dark:bg-slate-950">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

          @if (currentView() === 'patient') {
            <div class="animate-slide-up space-y-24">
              
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                 <div>
                    <div class="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-300 mb-6 font-bold text-xl">1</div>
                    <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Targeted Discovery</h3>
                    <p class="text-lg text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                       Don't just search for "Spanish." Search for <strong>"Spanish" + "Cardiology"</strong>. Our engine filters for interpreters who know the specific vocabulary of your condition.
                    </p>
                    <ul class="space-y-3">
                       <li class="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                          <i class="ri-check-line text-green-500 text-lg"></i> Filter by Medical Specialty
                       </li>
                       <li class="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                          <i class="ri-check-line text-green-500 text-lg"></i> View Verified Credentials
                       </li>
                    </ul>
                 </div>
                 
                 <div class="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 lg:p-12 relative overflow-hidden flex items-center justify-center">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-violet-200/40 dark:bg-violet-900/20 rounded-full blur-3xl opacity-60"></div>
                    
                    <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 transform transition-transform hover:scale-[1.02] duration-500">
                       <div class="h-2 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                       <div class="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                          <div class="px-3 py-1.5 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-xs font-medium border border-violet-100 dark:border-violet-800">Cardiology</div>
                          <div class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-medium">Spanish</div>
                       </div>
                       <div class="space-y-3 pt-2">
                          <div class="flex items-center gap-3">
                             <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800"></div>
                             <div class="space-y-1.5 flex-1">
                                <div class="h-2 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                <div class="h-2 w-1/2 bg-slate-100 dark:bg-slate-800 rounded"></div>
                             </div>
                             <i class="ri-verified-badge-fill text-blue-500 text-xl"></i>
                          </div>
                          <div class="flex items-center gap-3 opacity-50">
                             <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800"></div>
                             <div class="space-y-1.5 flex-1">
                                <div class="h-2 w-2/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                <div class="h-2 w-1/3 bg-slate-100 dark:bg-slate-800 rounded"></div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                 <div class="lg:order-2">
                    <div class="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-300 mb-6 font-bold text-xl">2</div>
                    <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">"Fort Knox" Booking</h3>
                    <p class="text-lg text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                       We eliminate scams. You pay Verbrix, not the interpreter directly. We hold funds in a secure escrow vault. The interpreter is only paid <strong>after</strong> the service is delivered.
                    </p>
                 </div>

                 <div class="lg:order-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 lg:p-12 relative overflow-hidden flex items-center justify-center">
                    <div class="absolute bottom-0 left-0 w-64 h-64 bg-green-200/40 dark:bg-green-900/20 rounded-full blur-3xl opacity-60"></div>
                    
                    <div class="relative w-full max-w-xs bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 text-center transform transition-transform hover:scale-[1.02] duration-500">
                       <div class="w-14 h-14 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i class="ri-shield-check-line text-2xl"></i>
                       </div>
                       <div class="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Funds Secured</div>
                       <div class="text-3xl font-bold text-slate-900 dark:text-white mt-1 mb-6">$150.00</div>
                       <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-xs text-left border border-slate-100 dark:border-slate-700 space-y-2">
                          <div class="flex justify-between">
                             <span class="text-slate-500">Status</span>
                             <span class="text-green-600 font-bold">Held in Escrow</span>
                          </div>
                          <div class="flex justify-between">
                             <span class="text-slate-500">Release</span>
                             <span class="text-slate-900 dark:text-slate-200">Post-Session</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                 <div>
                    <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-300 mb-6 font-bold text-xl">3</div>
                    <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">HD Medical Video</h3>
                    <p class="text-lg text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                       Connect instantly via our HIPAA-compliant video system. No external apps needed. Features include screen sharing for medical records and chat translation.
                    </p>
                 </div>

                 <div class="bg-slate-900 rounded-3xl p-4 lg:p-6 relative overflow-hidden shadow-2xl border border-slate-800 flex flex-col aspect-video justify-between">
                    <div class="absolute inset-0 flex items-center justify-center opacity-10">
                       <i class="ri-hospital-line text-9xl text-white"></i>
                    </div>
                    <div class="flex justify-between items-start z-10">
                       <div class="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs flex items-center gap-2">
                          <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> REC
                       </div>
                       <div class="w-24 h-32 bg-slate-800 rounded-lg border border-slate-700 shadow-lg"></div>
                    </div>
                    
                    <div class="flex justify-center gap-4 z-10 mb-2">
                       <div class="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors cursor-pointer border border-slate-700"><i class="ri-mic-line"></i></div>
                       <div class="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors cursor-pointer border border-slate-700"><i class="ri-video-on-line"></i></div>
                       <div class="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-colors cursor-pointer shadow-lg shadow-red-500/20"><i class="ri-phone-end-line"></i></div>
                    </div>
                 </div>
              </div>
            </div>
          }

          @if (currentView() === 'interpreter') {
             <div class="animate-slide-up space-y-24">
               
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                   <div>
                      <div class="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-300 mb-6 font-bold text-xl">1</div>
                      <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Command Higher Rates</h3>
                      <p class="text-lg text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                         Generic translators compete on price. Verbrix interpreters compete on <strong>expertise</strong>. Upload your certifications to unlock premium badges and set your own hourly rates.
                      </p>
                   </div>
                   
                   <div class="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 lg:p-12 relative overflow-hidden flex items-center justify-center">
                      <div class="absolute top-0 right-0 w-64 h-64 bg-orange-200/40 dark:bg-orange-900/20 rounded-full blur-3xl opacity-60"></div>
                      
                      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-64 overflow-hidden transform transition-transform hover:scale-[1.02] duration-500">
                         <div class="h-20 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 relative">
                            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white dark:bg-slate-800 p-1">
                               <div class="w-full h-full rounded-full bg-slate-200 dark:bg-slate-700"></div>
                            </div>
                         </div>
                         <div class="pt-8 pb-6 px-4 text-center">
                            <div class="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-2"></div>
                            <div class="flex justify-center gap-2 mb-4">
                               <span class="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] rounded font-bold border border-green-200 dark:border-green-800">VERIFIED</span>
                               <span class="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] rounded font-bold border border-orange-200 dark:border-orange-800">TOP RATED</span>
                            </div>
                            <div class="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-center px-2">
                               <span class="text-xs text-slate-500">Hourly Rate</span>
                               <span class="font-bold text-slate-900 dark:text-white">$65/hr</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                   <div class="lg:order-2">
                      <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-300 mb-6 font-bold text-xl">2</div>
                      <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Smart Workspace</h3>
                      <p class="text-lg text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                         Our video interface is built for interpreters. Get live glossaries, auto-note taking tools, and crystal clear audio so you never miss a nuance.
                      </p>
                   </div>

                   <div class="lg:order-1 bg-slate-900 rounded-3xl p-4 lg:p-6 relative overflow-hidden shadow-2xl border border-slate-800 flex flex-col aspect-video justify-between">
                      <div class="absolute inset-0 flex items-center justify-center opacity-10">
                         <i class="ri-video-chat-fill text-9xl text-white"></i>
                      </div>
                      <div class="flex justify-between items-start z-10">
                         <div class="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">
                            ON AIR
                         </div>
                         <div class="flex gap-2">
                           <div class="w-24 h-20 bg-slate-800 rounded border border-slate-700"></div>
                         </div>
                      </div>
                      <div class="z-10 bg-slate-800/80 backdrop-blur-md p-3 rounded-xl border border-slate-700">
                          <div class="text-xs text-slate-400 mb-1">Incoming Terms</div>
                          <div class="text-sm text-white font-mono">"Myocardial infarction" -> "Infarto de miocardio"</div>
                      </div>
                   </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                   <div>
                      <div class="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-300 mb-6 font-bold text-xl">3</div>
                      <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Business Tools Included</h3>
                      <p class="text-lg text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                         Track your earnings, manage your schedule, and export tax-ready invoices from one beautiful dashboard. We handle the paperwork so you can focus on interpreting.
                      </p>
                   </div>
                   
                   <div class="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 lg:p-12 relative overflow-hidden flex items-end justify-center">
                      <div class="bg-white dark:bg-slate-900 w-full max-w-sm rounded-t-xl shadow-lg border-x border-t border-slate-200 dark:border-slate-800 p-6 pb-0">
                         <div class="flex justify-between items-end mb-4">
                            <div>
                               <div class="text-xs text-slate-500 uppercase">Earnings</div>
                               <div class="text-2xl font-bold text-slate-900 dark:text-white">$1,240</div>
                            </div>
                            <div class="text-green-500 text-sm font-bold">+12% <i class="ri-arrow-up-line"></i></div>
                         </div>
                         <div class="flex gap-3 items-end h-32">
                            <div class="flex-1 bg-violet-100 dark:bg-violet-900/20 rounded-t h-[40%]"></div>
                            <div class="flex-1 bg-violet-100 dark:bg-violet-900/20 rounded-t h-[60%]"></div>
                            <div class="flex-1 bg-violet-100 dark:bg-violet-900/20 rounded-t h-[30%]"></div>
                            <div class="flex-1 bg-violet-600 dark:bg-violet-500 rounded-t h-[85%] relative group">
                               <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">Today</div>
                            </div>
                            <div class="flex-1 bg-violet-100 dark:bg-violet-900/20 rounded-t h-[50%]"></div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          }

        </div>
      </section>

      <section class="py-20 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-3xl mx-auto mb-16">
               <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Technical Confidence</h2>
               <p class="text-lg text-slate-500 dark:text-slate-400">
                 Robust tools built for sensitive medical communication.
               </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <div class="p-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:shadow-violet-900/5 transition-all duration-300">
                  <div class="w-12 h-12 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-600 dark:text-violet-400 text-2xl mb-6">
                    <i class="ri-video-chat-line"></i>
                  </div>
                  <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-3">LiveKit Video Engine</h3>
                  <p class="text-slate-500 dark:text-slate-400 leading-relaxed">High-definition, low-latency video with expiring security tokens for maximum privacy.</p>
               </div>
               
               <div class="p-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:shadow-violet-900/5 transition-all duration-300">
                  <div class="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 text-2xl mb-6">
                    <i class="ri-admin-line"></i>
                  </div>
                  <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-3">Admin Governance</h3>
                  <p class="text-slate-500 dark:text-slate-400 leading-relaxed">Every document and certification is manually reviewed. Disputes are handled by humans.</p>
               </div>

               <div class="p-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:shadow-violet-900/5 transition-all duration-300">
                  <div class="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 text-2xl mb-6">
                    <i class="ri-chat-private-line"></i>
                  </div>
                  <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-3">Ephemeral Chat</h3>
                  <p class="text-slate-500 dark:text-slate-400 leading-relaxed">Messages vanish and connections are strictly severed after the medical case is closed.</p>
               </div>
            </div>
        </div>
      </section>

      <section class="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
         <div class="max-w-5xl mx-auto relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-50 dark:bg-slate-900">
            <div class="relative z-10 px-6 py-16 md:py-20 text-center">
              <h2 class="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
                Ready to join the network?
              </h2>
              <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Experience healthcare without borders. Whether you need help or offer help, Verbrix is your platform.
              </p>
              
              <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a routerLink="/auth/register" class="h-14 px-8 rounded-xl bg-violet-600 text-white font-semibold text-lg hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20 active:scale-95 flex items-center justify-center w-full sm:w-auto">
                  Get Started Now
                </a>
              </div>
            </div>
         </div>
      </section>

    </main>
    <app-footer />
  `,
  styles: [`
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-up {
      animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class HowItWorksComponent {
  currentView = signal<ViewMode>('patient');

  toggleView(mode: ViewMode) {
    this.currentView.set(mode);
  }
}