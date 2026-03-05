import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { Navbar } from '../../layout/navbar/navbar';
import { Footer } from '../../layout/footer/footer';

type ViewMode = 'patient' | 'interpreter';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, Navbar, Footer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navbar class="sticky top-0 z-50 block w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60" />

    <main class="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans antialiased transition-colors duration-300 selection:bg-violet-200 selection:text-violet-900 dark:selection:bg-violet-900 dark:selection:text-white">

      <section class="pt-24 pb-12 lg:pt-32 lg:pb-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-8">

            <div class="max-w-2xl">
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
                How Verbrix Works
              </h1>

            </div>

            <div class="w-full sm:w-auto inline-flex bg-white dark:bg-slate-950 p-1.5 rounded-full border border-slate-200 dark:border-slate-800 relative shadow-sm shrink-0">
              <div class="absolute inset-y-1.5 transition-all duration-300 ease-out rounded-full shadow-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 w-[calc(50%-6px)]"
                   [class.translate-x-0]="currentView() === 'patient'"
                   [class.translate-x-full]="currentView() === 'interpreter'"
                   [class.left-1.5]="true">
              </div>

              <button (click)="toggleView('patient')"
                      [attr.aria-pressed]="currentView() === 'patient'"
                      class="relative z-10 flex-1 sm:flex-none px-4 sm:px-8 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap"
                      [class.text-violet-700]="currentView() === 'patient'"
                      [class.dark:text-violet-400]="currentView() === 'patient'"
                      [class.text-slate-500]="currentView() !== 'patient'">
                <i class="ri-user-heart-line text-base sm:text-lg"></i> Patient
              </button>

              <button (click)="toggleView('interpreter')"
                      [attr.aria-pressed]="currentView() === 'interpreter'"
                      class="relative z-10 flex-1 sm:flex-none px-4 sm:px-8 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap"
                      [class.text-blue-700]="currentView() === 'interpreter'"
                      [class.dark:text-blue-400]="currentView() === 'interpreter'"
                      [class.text-slate-500]="currentView() !== 'interpreter'">
                <i class="ri-speak-line text-base sm:text-lg"></i> Interpreter
              </button>
            </div>

          </div>
        </div>
      </section>

      <section class="py-12 lg:py-20 min-h-[800px]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          @if (currentView() === 'patient') {
            <div class="animate-fade-in flex flex-col lg:flex-row gap-8 lg:gap-16">

              <div class="w-full lg:w-1/3 shrink-0">
                <div class="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 gap-3 lg:gap-4 snap-x snap-mandatory hide-scrollbar lg:sticky lg:top-32">

                  <button (click)="activePatientStep.set(1)" class="snap-start shrink-0 lg:w-full text-left p-4 lg:p-5 rounded-2xl border transition-all duration-300 group" [class]="activePatientStep() === 1 ? 'bg-white dark:bg-slate-900 border-violet-500 dark:border-violet-500 shadow-md' : 'bg-transparent border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-800'">
                    <div class="text-xs font-bold tracking-widest uppercase mb-1 transition-colors" [class]="activePatientStep() === 1 ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'">Phase 1</div>
                    <div class="text-sm sm:text-base font-bold transition-colors" [class]="activePatientStep() === 1 ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'">Remote Pre-Consult</div>
                  </button>

                  <button (click)="activePatientStep.set(2)" class="snap-start shrink-0 lg:w-full text-left p-4 lg:p-5 rounded-2xl border transition-all duration-300 group" [class]="activePatientStep() === 2 ? 'bg-white dark:bg-slate-900 border-violet-500 dark:border-violet-500 shadow-md' : 'bg-transparent border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-800'">
                    <div class="text-xs font-bold tracking-widest uppercase mb-1 transition-colors" [class]="activePatientStep() === 2 ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'">Phase 2</div>
                    <div class="text-sm sm:text-base font-bold transition-colors" [class]="activePatientStep() === 2 ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'">Visa & Preparation</div>
                  </button>

                  <button (click)="activePatientStep.set(3)" class="snap-start shrink-0 lg:w-full text-left p-4 lg:p-5 rounded-2xl border transition-all duration-300 group" [class]="activePatientStep() === 3 ? 'bg-white dark:bg-slate-900 border-violet-500 dark:border-violet-500 shadow-md' : 'bg-transparent border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-800'">
                    <div class="text-xs font-bold tracking-widest uppercase mb-1 transition-colors" [class]="activePatientStep() === 3 ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'">Phase 3</div>
                    <div class="text-sm sm:text-base font-bold transition-colors" [class]="activePatientStep() === 3 ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'">Arrival & 24/7 Support</div>
                  </button>

                  <button (click)="activePatientStep.set(4)" class="snap-start shrink-0 lg:w-full text-left p-4 lg:p-5 rounded-2xl border transition-all duration-300 group" [class]="activePatientStep() === 4 ? 'bg-white dark:bg-slate-900 border-violet-500 dark:border-violet-500 shadow-md' : 'bg-transparent border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-800'">
                    <div class="text-xs font-bold tracking-widest uppercase mb-1 transition-colors" [class]="activePatientStep() === 4 ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'">Phase 4</div>
                    <div class="text-sm sm:text-base font-bold transition-colors" [class]="activePatientStep() === 4 ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'">Digital Health Tracking</div>
                  </button>

                </div>
              </div>

              <div class="w-full lg:w-2/3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 sm:p-10 shadow-lg min-h-[600px] relative overflow-hidden">

                @if (activePatientStep() === 1) {
                  <div class="animate-fade-in h-full flex flex-col">
                    <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Remote Pre-Travel Consultation</h2>
                    <p class="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                      Your journey begins from the comfort of your home country. Search our network for a verified interpreter who specializes in your specific medical condition (e.g., Cardiology, Oncology). Securely connect via video to translate your initial medical documents and receive a comprehensive, accurate treatment estimate from Indian hospitals before booking any flights.
                    </p>

                    <div class="mt-auto relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-inner">
                      <img ngSrc="assets/how-it-works/video_call_h.jpg" fill class="object-cover opacity-85" alt="Pre-Travel Video Consultation">
                      <div class="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-4 flex items-center justify-between shadow-lg">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-400"><i class="ri-vidicon-fill text-xl"></i></div>
                          <div>
                            <div class="text-sm font-bold text-slate-900 dark:text-white">Secure Home Consult</div>
                            <div class="text-xs text-slate-500">Estimates & Case Review</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }

                @if (activePatientStep() === 2) {
                  <div class="animate-fade-in h-full flex flex-col">
                    <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Visa & Logistics Preparation</h2>
                    <p class="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                      Once you are ready to proceed with treatment in India, your interpreter transforms into your personal administrative advocate. They will communicate directly with the Indian hospital to secure your official Medical Invitation Letter, translate all necessary paperwork for your Medical Visa application, and help you seamlessly coordinate your flight and arrival dates.
                    </p>

                    <div class="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                        <div class="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4"><i class="ri-article-line text-2xl"></i></div>
                        <h4 class="font-bold text-slate-900 dark:text-white mb-2">Hospital Invitation</h4>
                        <p class="text-sm text-slate-500">Interpreter procures and translates the official letter required for travel.</p>
                      </div>
                      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                        <div class="w-12 h-12 rounded-full bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4"><i class="ri-passport-line text-2xl"></i></div>
                        <h4 class="font-bold text-slate-900 dark:text-white mb-2">Visa Application</h4>
                        <p class="text-sm text-slate-500">Assistance with navigating the Indian medical visa requirements and forms.</p>
                      </div>
                    </div>
                  </div>
                }

                @if (activePatientStep() === 3) {
                  <div class="animate-fade-in h-full flex flex-col">
                    <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">24/7 On-Ground Support Retainer</h2>
                    <p class="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                      The moment you land in India, your recurring retainer begins. Your interpreter is there for you in person. They will pick you up from the airport, assist with hotel check-ins, navigate the complex Indian hospital admissions process with you, and remain on-call 24/7 for any translation needs throughout your entire stay until you safely depart.
                    </p>

                    <div class="mt-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                      <div class="flex justify-between items-center mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <div class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Status</div>
                          <div class="text-xl font-bold text-slate-900 dark:text-white">Active Retainer</div>
                        </div>
                        <span class="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded border border-green-200 dark:border-green-800/50">PROTECTED IN ESCROW</span>
                      </div>

                      <ul class="space-y-4">
                        <li class="flex items-center gap-4">
                          <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-slate-600 dark:text-slate-400"><i class="ri-flight-land-line"></i></div>
                          <div class="flex-1">
                            <div class="font-bold text-slate-900 dark:text-white">Airport & Commute</div>
                            <div class="text-sm text-slate-500">Personalized pickup and daily travel assistance.</div>
                          </div>
                        </li>
                        <li class="flex items-center gap-4">
                          <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-slate-600 dark:text-slate-400"><i class="ri-hospital-line"></i></div>
                          <div class="flex-1">
                            <div class="font-bold text-slate-900 dark:text-white">Hospital Navigation</div>
                            <div class="text-sm text-slate-500">In-person translation with doctors and nurses.</div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                }

                @if (activePatientStep() === 4) {
                  <div class="animate-fade-in h-full flex flex-col">
                    <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Your Digital Health Journey</h2>
                    <p class="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                      Every critical step of your medical journey is digitized on the Verbrix platform. When you return to your home country, you aren't left in the dark. You can permanently access your complete chat history, review translated doctor's discharge instructions, and easily schedule remote follow-up video calls with the same interpreter.
                    </p>

                    <div class="mt-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                      <div class="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div class="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 flex items-center justify-center text-green-600 dark:text-green-400"><i class="ri-folder-history-line text-2xl"></i></div>
                        <div>
                          <div class="text-lg font-bold text-slate-900 dark:text-white">Medical Journey Log</div>
                          <div class="text-sm text-slate-500">Permanent Record Access</div>
                        </div>
                      </div>

                      <div class="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-5 text-left">
                        <div class="text-xs text-slate-500 uppercase font-bold mb-2">Discharge Instructions (Translated)</div>
                        <p class="text-slate-700 dark:text-slate-300 font-medium border-l-4 border-violet-500 pl-4 py-1">
                          "Patient is cleared for travel. Continue prescribed medication for 14 days and schedule a virtual follow-up via Verbrix next month."
                        </p>
                      </div>
                    </div>
                  </div>
                }

              </div>
            </div>
          }

          @if (currentView() === 'interpreter') {
            <div class="animate-fade-in flex flex-col lg:flex-row gap-8 lg:gap-16">

              <div class="w-full lg:w-1/3 shrink-0">
                <div class="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 gap-3 lg:gap-4 snap-x snap-mandatory hide-scrollbar lg:sticky lg:top-32">

                  <button (click)="activeInterpreterStep.set(1)" class="snap-start shrink-0 lg:w-full text-left p-4 lg:p-5 rounded-2xl border transition-all duration-300 group" [class]="activeInterpreterStep() === 1 ? 'bg-white dark:bg-slate-900 border-blue-500 dark:border-blue-500 shadow-md' : 'bg-transparent border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800'">
                    <div class="text-xs font-bold tracking-widest uppercase mb-1 transition-colors" [class]="activeInterpreterStep() === 1 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'">Phase 1</div>
                    <div class="text-sm sm:text-base font-bold transition-colors" [class]="activeInterpreterStep() === 1 ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'">Profile & Global Reach</div>
                  </button>

                  <button (click)="activeInterpreterStep.set(2)" class="snap-start shrink-0 lg:w-full text-left p-4 lg:p-5 rounded-2xl border transition-all duration-300 group" [class]="activeInterpreterStep() === 2 ? 'bg-white dark:bg-slate-900 border-blue-500 dark:border-blue-500 shadow-md' : 'bg-transparent border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800'">
                    <div class="text-xs font-bold tracking-widest uppercase mb-1 transition-colors" [class]="activeInterpreterStep() === 2 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'">Phase 2</div>
                    <div class="text-sm sm:text-base font-bold transition-colors" [class]="activeInterpreterStep() === 2 ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'">Virtual Consultations</div>
                  </button>

                  <button (click)="activeInterpreterStep.set(3)" class="snap-start shrink-0 lg:w-full text-left p-4 lg:p-5 rounded-2xl border transition-all duration-300 group" [class]="activeInterpreterStep() === 3 ? 'bg-white dark:bg-slate-900 border-blue-500 dark:border-blue-500 shadow-md' : 'bg-transparent border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800'">
                    <div class="text-xs font-bold tracking-widest uppercase mb-1 transition-colors" [class]="activeInterpreterStep() === 3 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'">Phase 3</div>
                    <div class="text-sm sm:text-base font-bold transition-colors" [class]="activeInterpreterStep() === 3 ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'">On-Ground Retainers</div>
                  </button>

                  <button (click)="activeInterpreterStep.set(4)" class="snap-start shrink-0 lg:w-full text-left p-4 lg:p-5 rounded-2xl border transition-all duration-300 group" [class]="activeInterpreterStep() === 4 ? 'bg-white dark:bg-slate-900 border-blue-500 dark:border-blue-500 shadow-md' : 'bg-transparent border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800'">
                    <div class="text-xs font-bold tracking-widest uppercase mb-1 transition-colors" [class]="activeInterpreterStep() === 4 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'">Phase 4</div>
                    <div class="text-sm sm:text-base font-bold transition-colors" [class]="activeInterpreterStep() === 4 ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'">Escrow & Billing</div>
                  </button>

                </div>
              </div>

              <div class="w-full lg:w-2/3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 sm:p-10 shadow-lg min-h-[600px] relative overflow-hidden">

                @if (activeInterpreterStep() === 1) {
                  <div class="animate-fade-in h-full flex flex-col">
                    <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Establish Your Global Practice</h2>
                    <p class="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                      Tap into the booming medical tourism market. Create an expert profile detailing your specific medical knowledge and language proficiencies. After uploading your credentials, our compliance team verifies your account, unlocking premium badges and allowing you to set your own competitive hourly rates.
                    </p>

                    <div class="mt-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-center max-w-md mx-auto w-full">
                      <div class="w-20 h-20 rounded-full bg-white dark:bg-slate-950 border-4 border-slate-100 dark:border-slate-800 mx-auto mb-4 flex items-center justify-center">
                        <i class="ri-user-star-line text-slate-400 text-3xl"></i>
                      </div>
                      <div class="text-xl font-bold text-slate-900 dark:text-white mb-2">Verified Expert Profile</div>
                      <div class="flex justify-center gap-2 mb-6">
                        <span class="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-lg border border-green-200 dark:border-green-800/50 font-bold"><i class="ri-shield-check-fill mr-1"></i> COMPLIANCE PASSED</span>
                      </div>
                      <div class="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center">
                        <span class="text-sm font-bold text-slate-500 uppercase tracking-wide">Your Set Rate</span>
                        <span class="text-2xl font-bold text-slate-900 dark:text-white">₹ 2,000/hr</span>
                      </div>
                    </div>
                  </div>
                }

                @if (activeInterpreterStep() === 2) {
                  <div class="animate-fade-in h-full flex flex-col">
                    <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Virtual Pre-Consultations</h2>
                    <p class="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                      Your work starts before the patient ever boards a plane. Accept incoming requests based on your availability. Use our secure, browser-based clinical video workspace to consult with patients in their home country, translate initial medical estimates, and guide them through the complex Indian medical visa process.
                    </p>

                    <div class="mt-auto relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-inner">
                      <img ngSrc="assets/how-it-works/video_call_h.jpg" fill class="object-cover opacity-85" alt="Providing Pre-Travel Translation">
                      <div class="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-4 flex items-center justify-between shadow-lg">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400"><i class="ri-translate-2 text-xl"></i></div>
                          <div>
                            <div class="text-sm font-bold text-slate-900 dark:text-white">Active Session</div>
                            <div class="text-xs text-slate-500">Live Glossary Enabled</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }

                @if (activeInterpreterStep() === 3) {
                  <div class="animate-fade-in h-full flex flex-col">
                    <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Highly Profitable On-Ground Retainers</h2>
                    <p class="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                      Transform a one-off video call into a lucrative, long-term relationship. When the patient arrives in India, shift your agreement to a daily or weekly recurring retainer. Provide crucial hands-on support, including airport transfers, negotiating with hospital administration, managing hotel staff, and remaining on-call 24/7.
                    </p>

                    <div class="mt-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                      <div class="flex justify-between items-center mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <div class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Client Agreement</div>
                          <div class="text-xl font-bold text-slate-900 dark:text-white">Daily Retainer Active</div>
                        </div>
                        <i class="ri-hand-heart-fill text-blue-500 text-4xl"></i>
                      </div>

                      <div class="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                        <div class="flex items-center gap-3 mb-2">
                          <i class="ri-hospital-line text-blue-500 text-xl"></i>
                          <span class="font-bold text-slate-900 dark:text-white">On-Ground Assignment Details</span>
                        </div>
                        <p class="text-sm text-slate-600 dark:text-slate-400">Tasked with full translation coverage during patient's 14-day recovery period at Apollo Hospitals, plus local commute assistance.</p>
                      </div>
                    </div>
                  </div>
                }

                @if (activeInterpreterStep() === 4) {
                  <div class="animate-fade-in h-full flex flex-col">
                    <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Secure Escrow & Automated Billing</h2>
                    <p class="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                      Focus purely on your patient's care, not on chasing payments. Client funds are locked in our secure Escrow vault upfront and released directly to your wallet based on the agreed timeline. The system automatically tracks your earnings and generates perfectly formatted, GST-compliant invoices for your tax records.
                    </p>

                    <div class="mt-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                      <div class="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div class="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 flex items-center justify-center text-green-600 dark:text-green-400"><i class="ri-wallet-3-fill text-2xl"></i></div>
                        <div>
                          <div class="text-lg font-bold text-slate-900 dark:text-white">Business Dashboard</div>
                          <div class="text-sm text-slate-500">Automated Accounting & Ledger</div>
                        </div>
                      </div>

                      <div class="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-5 text-left">
                        <div class="flex justify-between items-end mb-4">
                          <div>
                            <div class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Escrow Released</div>
                            <div class="text-2xl font-bold text-green-600 dark:text-green-400">+ ₹ 14,000.00</div>
                          </div>
                          <i class="ri-check-double-line text-green-500 text-2xl"></i>
                        </div>

                        <div class="border-t border-slate-200 dark:border-slate-700 pt-4 flex justify-between items-center text-sm">
                          <span class="text-slate-600 dark:text-slate-400"><i class="ri-receipt-line mr-1"></i> GST Invoice Generated</span>
                          <span class="text-violet-600 dark:text-violet-400 font-bold cursor-pointer hover:underline">Download PDF</span>
                        </div>
                      </div>
                    </div>
                  </div>
                }

              </div>

            </div>
          }

        </div>
      </section>

      <section class="py-24 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-16">
            <h2 class="text-sm font-bold tracking-widest text-violet-600 dark:text-violet-400 uppercase mb-3">Platform Ecosystem</h2>
            <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Everything you need in one place.</h3>
            <p class="text-lg text-slate-500 dark:text-slate-400">
              Verbrix provides the infrastructure to make cross-border medical interpretation secure, compliant, and deeply organized.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div class="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xl mb-4"><i class="ri-vidicon-line"></i></div>
              <h4 class="font-bold text-slate-900 dark:text-white mb-2">Browser-Based HD Video</h4>
              <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Zero downloads required. Join secure, encrypted medical consultations instantly from any device.</p>
            </div>

            <div class="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div class="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-xl mb-4"><i class="ri-shield-keyhole-line"></i></div>
              <h4 class="font-bold text-slate-900 dark:text-white mb-2">Escrow Protection</h4>
              <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Both parties are financially safe. Clients pay upfront into a secure vault, released only upon service delivery.</p>
            </div>

            <div class="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl mb-4"><i class="ri-history-line"></i></div>
              <h4 class="font-bold text-slate-900 dark:text-white mb-2">Permanent Digital Logs</h4>
              <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Never lose a medical instruction. All chat translations and documentation are saved securely for follow-up care.</p>
            </div>

            <div class="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div class="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xl mb-4"><i class="ri-receipt-line"></i></div>
              <h4 class="font-bold text-slate-900 dark:text-white mb-2">GST Compliant Billing</h4>
              <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Fully automated ledger system generates precise, tax-ready invoices for every transaction on the platform.</p>
            </div>
          </div>
        </div>
      </section>

      @defer (on viewport) {
        <section class="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
          <div class="max-w-4xl mx-auto text-center">
            <h2 class="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
              Ready to start your journey?
            </h2>
            <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Join the premier platform connecting international patients with specialized medical interpreters in India.
            </p>

            <div class="flex justify-center">
              <a routerLink="/auth/register" class="h-14 px-10 rounded-full bg-violet-600 text-white font-bold text-lg hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20 active:scale-95 flex items-center justify-center w-full sm:w-auto">
                Create Free Account
              </a>
            </div>
          </div>
        </section>
      } @placeholder {
        <div class="h-[400px] w-full bg-white dark:bg-slate-950"></div>
      }

    </main>

    @defer (on viewport) {
      <app-footer />
    } @placeholder {
      <div class="h-[200px] w-full bg-white dark:bg-slate-950"></div>
    }
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.4s ease-out forwards;
    }

    /* Hide scrollbar for mobile tabs */
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `]
})
export class HowItWorksComponent {
  currentView = signal<ViewMode>('patient');

  // Signals for tracking active tabs
  activePatientStep = signal<number>(1);
  activeInterpreterStep = signal<number>(1);

  toggleView(mode: ViewMode) {
    this.currentView.set(mode);
    // Optional: Reset steps when switching views
    if (mode === 'patient') this.activePatientStep.set(1);
    if (mode === 'interpreter') this.activeInterpreterStep.set(1);
  }
}
