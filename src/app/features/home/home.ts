import { Component, inject, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { UserRole } from '../../core/models/auth.models';
import { Footer } from '../../layout/footer/footer';
import { Navbar } from "../../layout/navbar/navbar";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, Footer, Navbar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!isRedirecting()) {
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
                </div>

                <h1 class="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 text-balance">
                  Global healthcare, <br>
                  <span class="text-violet-600 dark:text-violet-400">fluent in every language.</span>
                </h1>

                <p class="text-lg sm:text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-pretty">
                  Don't let language barriers compromise your health. Connect with verified medical interpreters for guidance before you travel and support when you arrive.
                </p>

                <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a routerLink="/interpreters/browse"
                     class="flex items-center justify-center h-12 px-8 rounded-lg bg-violet-600 text-white font-semibold">
                    Find an Interpreter
                  </a>
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

                    <div class="col-span-12 sm:col-span-9 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative group p-2">
                      <div class="rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          ngSrc="assets/home/videocall.jpg"
                          width="1200"
                          height="800"
                          alt="Medical Interpreter Video Call"
                          priority
                          class="w-full h-auto object-cover"
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        @defer (on viewport) {
          <section class="py-10 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Connecting patients to top facilities</h2>
              <div class="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-75 grayscale transition-all duration-500">
                <img ngSrc="assets/hospitals-logo/apollo.svg" width="140" height="56" alt="Apollo Hospitals India" title="Apollo Hospitals" class="h-10 md:h-14 w-auto object-contain mix-blend-multiply dark:mix-blend-screen dark:invert dark:contrast-200">
                <img ngSrc="assets/hospitals-logo/fortis.png" width="120" height="40" alt="Fortis Healthcare India" title="Fortis Healthcare" class="h-8 md:h-10 w-auto object-contain mix-blend-multiply dark:mix-blend-screen dark:invert dark:contrast-200">
                <img ngSrc="assets/hospitals-logo/max.png" width="120" height="40" alt="Max Healthcare India" title="Max Healthcare" class="h-8 md:h-10 w-auto object-contain mix-blend-multiply dark:mix-blend-screen dark:invert dark:contrast-200">
                <img ngSrc="assets/hospitals-logo/manipal.png" width="140" height="48" alt="Manipal Hospitals India" title="Manipal Hospitals" class="h-10 md:h-12 w-auto object-contain mix-blend-multiply dark:mix-blend-screen dark:invert dark:contrast-200">
                <img ngSrc="assets/hospitals-logo/medanta.svg" width="120" height="40" alt="Medanta The Medicity" title="Medanta" class="h-8 md:h-10 w-auto object-contain mix-blend-multiply dark:mix-blend-screen dark:invert dark:contrast-200">
              </div>
            </div>
          </section>
        } @placeholder {
          <div class="h-[140px] w-full bg-white dark:bg-slate-950"></div>
        }

        @defer (on viewport) {
          <section class="py-24 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex flex-col md:flex-row gap-12 items-center">
                <div class="flex-1 space-y-8">
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                    <i class="ri-map-pin-line"></i> Global Coverage
                  </div>
                  <h2 class="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">From the World <br> to <span class="text-indigo-600">India's Medical Hubs</span></h2>
                  <p class="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                    Whether you are coming from the Middle East, CIS countries, or Africa, our interpreters are stationed in every major medical city.
                  </p>

                  <div class="grid grid-cols-2 gap-4 pt-4">
                    <div class="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div class="w-2 h-2 rounded-full bg-red-500"></div>
                      <span class="font-semibold text-slate-700 dark:text-slate-300">New Delhi (NCR)</span>
                    </div>
                    <div class="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div class="w-2 h-2 rounded-full bg-red-500"></div>
                      <span class="font-semibold text-slate-700 dark:text-slate-300">Mumbai</span>
                    </div>
                    <div class="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div class="w-2 h-2 rounded-full bg-red-500"></div>
                      <span class="font-semibold text-slate-700 dark:text-slate-300">Chennai</span>
                    </div>
                    <div class="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div class="w-2 h-2 rounded-full bg-red-500"></div>
                      <span class="font-semibold text-slate-700 dark:text-slate-300">Bangalore</span>
                    </div>
                  </div>
                </div>

                <div class="flex-1 relative p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-full">
                  <div class="rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      ngSrc="assets/home/globalmap.jpg"
                      width="1200"
                      height="800"
                      alt="Global Medical Patient Connectivity Map"
                      class="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
                    >
                  </div>
                </div>
              </div>
            </div>
          </section>
        } @placeholder {
          <div class="h-[600px] w-full bg-slate-50 dark:bg-slate-900/50"></div>
        }

        @defer (on viewport) {
          <section id="how-it-works" class="py-24 bg-white dark:bg-slate-950 scroll-mt-16">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="text-center max-w-3xl mx-auto mb-20">
                <span class="text-base font-semibold leading-7 text-violet-600 dark:text-violet-400">How It Works</span>
                <h2 class="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Seamless care, step by step.</h2>
                <p class="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
                  From your home country to the hospital and back. We bridge the gap so you can focus on healing.
                </p>
              </div>

              <div class="space-y-16">

                <div class="relative bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-2">
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

                  <div class="bg-slate-50 dark:bg-slate-900/50 border-l border-slate-200 dark:border-slate-800 p-8 lg:p-12 flex items-center justify-center order-1 lg:order-2 relative overflow-hidden">
                    <div class="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-violet-200/40 dark:bg-violet-900/30 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                    <div class="relative w-full max-w-sm">
                      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl">
                        <div class="p-4 border-b border-slate-100 dark:border-slate-800">
                          <div class="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                            <i class="ri-search-line text-slate-400"></i>
                            <span class="text-sm text-slate-400">Cardiology, Arabic...</span>
                          </div>
                        </div>
                        <div class="p-4 space-y-3">
                          <div class="flex gap-4 p-3 rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/20">
                            <div class="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-800">
                              <img ngSrc="assets/home/lady_vcall.jpg" width="40" height="40" alt="Interpreter Avatar" class="w-full h-full object-cover">
                            </div>
                            <div class="flex-1">
                              <div class="h-4 w-32 bg-slate-800 dark:bg-slate-200 rounded mb-2"></div>
                              <div class="flex gap-2">
                                <div class="h-3 w-12 bg-violet-300 dark:bg-violet-700 rounded"></div>
                                <div class="h-3 w-16 bg-green-300 dark:bg-green-700 rounded"></div>
                              </div>
                            </div>
                            <div class="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs">
                              <i class="ri-check-line"></i>
                            </div>
                          </div>
                          <div class="flex gap-4 p-3 rounded-lg border border-slate-200 dark:border-slate-700 opacity-60">
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
                </div>

                <div class="relative bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                  <div class="border-r border-slate-200 dark:border-slate-800 p-8 lg:p-12 flex items-center justify-center relative overflow-hidden order-1 lg:order-1">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-violet-100 dark:bg-violet-900/20 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                    <div class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
                      <img ngSrc="assets/home/airport.jpg" width="800" height="600" alt="Interpreter Airport Pickup in India" class="w-full h-auto object-cover">
                    </div>
                  </div>
                  <div class="p-8 lg:p-16 flex flex-col justify-center order-2 lg:order-2">
                    <div class="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-300 mb-6">
                      <span class="font-bold text-xl">2</span>
                    </div>
                    <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">We Meet You There</h3>
                    <p class="text-lg text-slate-500 dark:text-slate-400 mb-6">
                      The moment you step out of the airport, your interpreter is there. No confusing taxi rides, no lost-in-translation moments at the reception desk.
                    </p>
                    <div class="flex flex-wrap gap-4">
                      <ul class="space-y-3">
                        <li class="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                          <i class="ri-check-line text-green-500 text-lg"></i> Airport Pickup & Drop-off
                        </li>
                        <li class="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                          <i class="ri-check-line text-green-500 text-lg"></i> Hospital Navigation Assistance & Hotel Check-in Support
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div class="relative bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                  <div class="p-8 lg:p-16 flex flex-col justify-center order-2 lg:order-1">
                    <div class="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-300 mb-6">
                      <span class="font-bold text-xl">3</span>
                    </div>
                    <h3 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">Secure Settlement</h3>
                    <p class="text-lg text-slate-500 dark:text-slate-400 mb-6">
                      No hidden middleman fees. You pay the platform, and we release funds to the interpreter only after service is delivered.
                    </p>
                    <button class="text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-2 hover:gap-3 transition-all group w-fit">
                      View Security Guarantee
                      <i class="ri-arrow-right-line group-hover:ml-2 transition-all"></i>
                    </button>
                  </div>

                  <div class="bg-slate-50 dark:bg-slate-900/50 border-l border-slate-200 dark:border-slate-800 p-8 lg:p-12 flex items-center justify-center order-1 lg:order-2 relative overflow-hidden">
                    <div class="absolute bottom-0 left-0 w-40 h-40 bg-violet-100 dark:bg-violet-900/30 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                    <div class="relative w-full max-w-xs bg-white dark:bg-slate-900 rounded-lg shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-200 dark:border-slate-800 p-6 overflow-hidden transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
                      <div class="absolute -top-2 left-0 w-full h-4 bg-white dark:bg-slate-900 [mask-image:linear-gradient(45deg,transparent_50%,#000_50%),linear-gradient(-45deg,transparent_50%,#000_50%)] [mask-size:16px_16px] [mask-repeat:repeat-x]"></div>
                      <div class="text-center mb-6">
                        <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
                          <i class="ri-check-line text-2xl"></i>
                        </div>
                        <div class="text-sm text-slate-500 dark:text-slate-400 font-medium">Escrow Released</div>
                        <div class="text-3xl font-bold text-slate-900 dark:text-white mt-1">₹ 6000.00</div>
                      </div>
                      <div class="space-y-3 border-t border-dashed border-slate-200 dark:border-slate-800 pt-4 text-xs">
                        <div class="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>Service</span>
                          <span class="font-medium text-slate-900 dark:text-white">Weekly Assistance</span>
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

            <div class="mt-8 flex justify-center">
              <a routerLink="/how-it-works"
                 class="inline-flex items-center justify-center h-10 px-6 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer">
                Learn More About The Process
              </a>
            </div>

          </section>
        } @placeholder {
          <div class="h-[800px] w-full bg-white dark:bg-slate-950"></div>
        }

        @defer (on viewport) {
          <section class="py-20 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 class="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Speaking your language.</h2>
              <p class="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12">
                Our interpreters are native speakers who understand not just the words, but the culture and medical nuance.
              </p>

              <div class="flex flex-wrap justify-center gap-8 md:gap-12">
                <div class="group flex flex-col items-center gap-3">
                  <img ngSrc="https://flagcdn.com/w160/sa.png" width="64" height="48" alt="Arabic Medical Interpreter" title="Arabic" class="w-16 h-12 rounded-lg object-cover shadow-sm border border-slate-200 dark:border-slate-700 group-hover:scale-110 transition-transform">
                  <span class="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-violet-600">Arabic</span>
                </div>
                <div class="group flex flex-col items-center gap-3">
                  <img ngSrc="https://flagcdn.com/w160/ru.png" width="64" height="48" alt="Russian Medical Interpreter" title="Russian" class="w-16 h-12 rounded-lg object-cover shadow-sm border border-slate-200 dark:border-slate-700 group-hover:scale-110 transition-transform">
                  <span class="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-violet-600">Russian</span>
                </div>
                <div class="group flex flex-col items-center gap-3">
                  <img ngSrc="https://flagcdn.com/w160/bd.png" width="64" height="48" alt="Bengali Medical Interpreter" title="Bengali" class="w-16 h-12 rounded-lg object-cover shadow-sm border border-slate-200 dark:border-slate-700 group-hover:scale-110 transition-transform">
                  <span class="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-violet-600">Bengali</span>
                </div>
                <div class="group flex flex-col items-center gap-3">
                  <img ngSrc="https://flagcdn.com/w160/fr.png" width="64" height="48" alt="French Medical Interpreter" title="French" class="w-16 h-12 rounded-lg object-cover shadow-sm border border-slate-200 dark:border-slate-700 group-hover:scale-110 transition-transform">
                  <span class="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-violet-600">French</span>
                </div>
                <div class="group flex flex-col items-center gap-3">
                  <img ngSrc="https://flagcdn.com/w160/uz.png" width="64" height="48" alt="Uzbek Medical Interpreter" title="Uzbek" class="w-16 h-12 rounded-lg object-cover shadow-sm border border-slate-200 dark:border-slate-700 group-hover:scale-110 transition-transform">
                  <span class="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-violet-600">Uzbek</span>
                </div>
                <div class="group flex flex-col items-center gap-3">
                  <img ngSrc="https://flagcdn.com/w160/af.png" width="64" height="48" alt="Pashto Medical Interpreter" title="Pashto" class="w-16 h-12 rounded-lg object-cover shadow-sm border border-slate-200 dark:border-slate-700 group-hover:scale-110 transition-transform">
                  <span class="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-violet-600">Pashto</span>
                </div>
                <div class="group flex flex-col items-center gap-3">
                  <div class="w-16 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 font-bold group-hover:scale-110 transition-transform shadow-sm">+40</div>
                  <span class="text-sm font-medium text-slate-600 dark:text-slate-400">More</span>
                </div>
              </div>
            </div>
          </section>
        } @placeholder {
          <div class="h-[300px] w-full bg-slate-50 dark:bg-slate-900"></div>
        }

        @defer (on viewport) {
          <section id="patients" class="py-24 bg-white dark:bg-slate-950 scroll-mt-16 border-t border-slate-100 dark:border-slate-800">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                <div class="order-1 lg:order-1">
                  <div class="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300 mb-6">
                    For Patients
                  </div>
                  <h2 class="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                    Medical travel <br>without the fear.
                  </h2>
                  <p class="text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed text-pretty">
                    Traveling for treatment is stressful. Middlemen overcharge, language barriers isolate you, and uncertainty is high. Verbrix replaces that with trust.
                  </p>

                  <div class="space-y-6">
                    <div class="flex gap-4 group">
                      <div class="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <i class="ri-shield-check-line text-xl"></i>
                      </div>
                      <div>
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white">No Exploitation</h3>
                        <p class="text-slate-500 dark:text-slate-400 mt-1">
                          Connect directly with verified professionals. No random agents or hidden commissions.
                        </p>
                      </div>
                    </div>
                    <div class="flex gap-4 group">
                      <div class="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <i class="ri-map-pin-user-line text-xl"></i>
                      </div>
                      <div>
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white">End-to-End Support</h3>
                        <p class="text-slate-500 dark:text-slate-400 mt-1">
                          Your interpreter guides you from your home country, meets you at the airport, and stays until you return.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="mt-10 flex flex-wrap gap-4">
                    <button (click)="handleGetStarted()" class="h-12 px-8 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 active:scale-95">
                      Start Your Journey
                    </button>
                  </div>
                </div>

                <div class="order-2 lg:order-2 relative p-8 lg:p-12 flex items-center justify-center overflow-hidden">
                  <div class="absolute top-0 right-0 w-64 h-64 bg-violet-100 dark:bg-violet-900/20 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
                  <div class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
                    <img ngSrc="assets/home/consultation.jpg" width="800" height="600" alt="Patient Consultation with Interpreter" class="w-full h-auto object-cover">
                  </div>
                </div>
              </div>
            </div>
          </section>
        } @placeholder {
          <div class="h-[600px] w-full bg-white dark:bg-slate-950"></div>
        }

        @defer (on viewport) {
          <section id="interpreters" class="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-900/50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                <div class="order-2 lg:order-1 rounded-xl overflow-hidden relative w-full">
                  <img ngSrc="assets/home/interpreter.jpg" width="1200" height="800" alt="Medical Interpreter Growing Practice" class="w-full h-auto object-cover">
                </div>

                <div class="order-1 lg:order-2 text-center md:text-left">
                  <div class="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-500/20 border border-violet-200 dark:border-violet-500/30 px-3 py-1 text-sm font-medium text-violet-700 dark:text-violet-300 mb-6">
                    For Interpreters
                  </div>
                  <h2 class="text-3xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white leading-tight">Grow your practice globally.</h2>
                  <p class="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                    Stop relying on random hospital calls. Build long-term relationships with international patients and get paid securely.
                  </p>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-left">
                    <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <i class="ri-global-line text-2xl text-violet-600 mb-2"></i>
                      <h3 class="font-bold text-slate-900 dark:text-white">Global Visibility</h3>
                      <p class="text-sm text-slate-500">Reach patients worldwide.</p>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <i class="ri-wallet-3-line text-2xl text-green-600 mb-2"></i>
                      <h3 class="font-bold text-slate-900 dark:text-white">Guaranteed Pay</h3>
                      <p class="text-sm text-slate-500">Secure escrow settlement.</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </section>
        } @placeholder {
          <div class="h-[500px] w-full bg-slate-50 dark:bg-slate-900/50"></div>
        }

        @defer (on viewport) {
          <section class="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950">
            <div class="max-w-5xl mx-auto relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-50 dark:bg-slate-900">
              <div class="relative z-10 px-6 py-16 md:py-20 text-center">
                <h2 class="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
                  Ready to bridge the gap?
                </h2>
                <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                  Join thousands of patients and providers accessing global healthcare without the language barrier.
                </p>

                <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button (click)="handleGetStarted()" aria-label="Get Started with Verbrix" class="h-14 px-8 rounded-xl bg-violet-600 text-white font-semibold text-lg hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20 active:scale-95">
                    Get Started Now
                  </button>
                </div>
              </div>
            </div>
          </section>
        } @placeholder {
          <div class="h-[300px] w-full bg-white dark:bg-slate-950"></div>
        }

      </main>

      @defer (on viewport) {
        <app-footer />
      } @placeholder {
        <div class="h-[200px] w-full bg-white dark:bg-slate-950"></div>
      }
    }
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
export class Home implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);

  isRedirecting = signal<boolean>(false);

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      const user = this.auth.currentUser();

      if (user) {
        this.isRedirecting.set(true);
        this.navigateToDashboard(user);
      } else {
        this.isRedirecting.set(false);
      }
    }
  }

  handleGetStarted() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/register']);
      return;
    }

    const user = this.auth.currentUser();
    if (user) {
      this.navigateToDashboard(user);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  private navigateToDashboard(user: any) {
    const dashboardMap: Record<string, string> = {
      [UserRole.ADMIN]: '/dashboard/admin/home',
      [UserRole.INTERPRETER]: '/dashboard/interpreter/home',
      [UserRole.CLIENT]: '/dashboard/client/home'
    };

    const targetUrl = dashboardMap[user.role] || '/dashboard';
    this.router.navigate([targetUrl], { replaceUrl: true });
  }
}
