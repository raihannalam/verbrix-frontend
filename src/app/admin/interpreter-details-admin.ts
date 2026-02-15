import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../../app/core/services/admin.service';
import { 
  InterpreterDetailResponse, 
  SPECIALIZATION_LABELS, 
  LANGUAGE_LABELS 
} from '../admin/models/admin.models';

@Component({
  selector: 'app-interpreter-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, RouterLink],
  template: `
    <div class="min-h-screen bg-[#f8f9fa] dark:bg-[#0b0c0f] pb-20">
      
      <header class="bg-white dark:bg-[#181a1f] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <a routerLink="/admin/dashboard" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
              <i class="ri-arrow-left-line text-xl"></i>
            </a>
            <div>
              <h1 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Application #{{ data()?.id }}
                @if(data()?.status === 'VERIFIED') {
                  <span class="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-200">Verified</span>
                } @else if(data()?.status === 'PENDING') {
                   <span class="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full border border-amber-200">Pending Review</span>
                }
              </h1>
              <p class="text-xs text-gray-500">Submitted: {{ data()?.createdAt | date:'medium' }}</p>
            </div>
          </div>

          <div class="flex gap-3">
             <button (click)="rejectApplication()" 
                     class="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-lg transition-colors">
               Reject
             </button>
             <button (click)="requestChanges()" 
                     class="px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-[#252830] dark:border-gray-600 dark:text-gray-200 rounded-lg transition-colors">
               Request Changes
             </button>
             <button (click)="approveApplication()" 
                     [disabled]="!allCertsVerified()"
                     [class.opacity-50]="!allCertsVerified()"
                     class="px-6 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-lg shadow-green-600/20 transition-all flex items-center gap-2">
               <i class="ri-check-double-line"></i> Approve & Activate
             </button>
          </div>
        </div>
      </header>

      @if (data(); as interpreter) {
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
          
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div class="space-y-8">
              
              <div class="bg-white dark:bg-[#181a1f] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div class="flex flex-col items-center text-center">
                  <img [src]="interpreter.profilePictureUrl || 'assets/placeholder.png'" 
                       class="w-32 h-32 rounded-full object-cover border-4 border-gray-50 dark:border-[#252830] shadow-md mb-4">
                  <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ interpreter.firstName }} {{ interpreter.lastName }}</h2>
                  <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">{{ interpreter.email }}</p>
                  
                  <div class="w-full grid grid-cols-2 gap-2 text-center text-sm border-t border-gray-100 dark:border-gray-800 pt-4">
                    <div>
                      <p class="text-gray-400 text-xs uppercase tracking-wider">Experience</p>
                      <p class="font-bold text-gray-900 dark:text-white">{{ interpreter.experienceYears }} Years</p>
                    </div>
                    <div>
                      <p class="text-gray-400 text-xs uppercase tracking-wider">Rate</p>
                      <p class="font-bold text-green-600 dark:text-green-400">{{ interpreter.consultationFee | currency }}</p>
                    </div>
                  </div>
                </div>

                <div class="mt-6 space-y-3">
                   <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest">Verification Assets</h3>
                   
                   <a [href]="interpreter.introVideoUrl" target="_blank" 
                      class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#1f2229] hover:bg-gray-100 dark:hover:bg-[#252830] transition-colors group">
                      <div class="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <i class="ri-play-fill text-xl"></i>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-bold text-gray-900 dark:text-white">Intro Video</p>
                        <p class="text-xs text-gray-500">Click to watch</p>
                      </div>
                      <i class="ri-external-link-line text-gray-400"></i>
                   </a>

                   <a [href]="interpreter.governmentIdUrl" target="_blank" 
                      class="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#1f2229] hover:bg-gray-100 dark:hover:bg-[#252830] transition-colors group">
                      <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <i class="ri-passport-fill text-xl"></i>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-bold text-gray-900 dark:text-white">Govt. ID</p>
                        <p class="text-xs text-gray-500">Identity Proof</p>
                      </div>
                      <i class="ri-external-link-line text-gray-400"></i>
                   </a>
                </div>
              </div>

              <div class="bg-white dark:bg-[#181a1f] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <i class="ri-money-dollar-circle-line"></i> Financial Terms
                </h3>
                <div class="space-y-4 text-sm">
                  <div class="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                    <span class="text-gray-500">Consultation Fee</span>
                    <span class="font-mono font-bold">{{ interpreter.consultationFee | currency }} /min</span>
                  </div>
                  <div class="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
                    <span class="text-gray-500">Service Fee</span>
                    <span class="font-mono font-bold">{{ interpreter.serviceAgreementFee | currency }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-500">Recurring Fee</span>
                    <span class="font-mono font-bold">
                      {{ interpreter.recurringFeeAmount | currency }} 
                      <span class="text-xs text-gray-400">/{{ interpreter.recurringFeeFrequency }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="lg:col-span-2 space-y-8">
              
              <div class="bg-white dark:bg-[#181a1f] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-3">Professional Bio</h3>
                <p class="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                  {{ interpreter.bio }}
                </p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div class="bg-white dark:bg-[#181a1f] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-4">Languages</h3>
                    <div class="space-y-3">
                      @for (lang of interpreter.languageAbilities; track lang.language) {
                        <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#1f2229]">
                          <span class="font-medium text-gray-900 dark:text-white">{{ getLanguageLabel(lang.language) }}</span>
                          <span class="text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">
                            {{ lang.proficiency }}
                          </span>
                        </div>
                      }
                    </div>
                 </div>

                 <div class="bg-white dark:bg-[#181a1f] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-4">Specializations</h3>
                    <div class="flex flex-wrap gap-2">
                      @for (spec of interpreter.specializations; track spec) {
                        <span class="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                          {{ getSpecLabel(spec) }}
                        </span>
                      }
                    </div>
                 </div>
              </div>

              <div class="bg-white dark:bg-[#181a1f] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                 <div class="flex items-center justify-between mb-6">
                    <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">
                      Certifications ({{ interpreter.certifications.length }})
                    </h3>
                    @if (!allCertsVerified()) {
                      <div class="text-xs text-amber-600 dark:text-amber-400 font-bold animate-pulse">
                        ⚠ Action Required
                      </div>
                    }
                 </div>

                 <div class="grid grid-cols-1 gap-4">
                    @for (cert of interpreter.certifications; track cert.id) {
                      <div class="border rounded-xl p-4 transition-all duration-300 relative overflow-hidden"
                           [ngClass]="{
                             'border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10': cert.status === 'VERIFIED',
                             'border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10': cert.status === 'REJECTED',
                             'border-gray-200 dark:border-gray-700': cert.status === 'PENDING'
                           }">
                           
                           @if (cert.status === 'VERIFIED') {
                              <div class="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">VERIFIED</div>
                           }

                           <div class="flex items-start justify-between">
                              <div class="flex gap-4">
                                 <div class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-[#252830] flex items-center justify-center text-gray-400">
                                    <i class="ri-file-certificate-line text-2xl"></i>
                                 </div>
                                 <div>
                                    <h4 class="font-bold text-gray-900 dark:text-white">{{ cert.name }}</h4>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ cert.issuingOrganization }}</p>
                                    <div class="flex gap-3 mt-2 text-xs text-gray-400">
                                       <span><i class="ri-calendar-line"></i> Issued: {{ cert.issueDate | date:'mediumDate' }}</span>
                                       @if (cert.credentialId) {
                                          <span><i class="ri-hashtag"></i> ID: {{ cert.credentialId }}</span>
                                       }
                                    </div>
                                    @if (cert.rejectionReason) {
                                      <p class="mt-2 text-xs text-red-600 font-medium">Reason: {{ cert.rejectionReason }}</p>
                                    }
                                 </div>
                              </div>

                              <div class="flex flex-col items-end gap-2">
                                 <a [href]="cert.fileUrl" target="_blank" 
                                    class="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                                    View Document <i class="ri-external-link-line"></i>
                                 </a>
                                 
                                 @if (cert.status === 'PENDING') {
                                   <div class="flex gap-2 mt-2">
                                     <button (click)="verifyCert(cert.id)" 
                                             class="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 transition-colors"
                                             title="Verify">
                                       <i class="ri-check-line"></i>
                                     </button>
                                     <button (click)="rejectCert(cert.id)" 
                                             class="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 transition-colors"
                                             title="Reject">
                                       <i class="ri-close-line"></i>
                                     </button>
                                   </div>
                                 }
                              </div>
                           </div>
                      </div>
                    }
                 </div>
              </div>

            </div>
          </div>

        </main>
      } @else {
        <div class="flex justify-center items-center h-64">
           <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class InterpreterDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminService = inject(AdminService);
  
  data = signal<InterpreterDetailResponse | null>(null);

  // Helper getters for template
  allCertsVerified = computed(() => {
     const d = this.data();
     if (!d || d.certifications.length === 0) return false;
     return d.certifications.every(c => c.status === 'VERIFIED');
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) this.loadData(id);
    });
  }

  loadData(id: number) {
    this.adminService.getInterpreterDetails(id).subscribe({
      next: (res) => this.data.set(res),
      error: () => this.router.navigate(['/admin/dashboard']) // Fallback
    });
  }

  // --- Actions ---

  verifyCert(certId: number) {
    this.adminService.verifyCertification(certId).subscribe(() => {
      // Optimistic update or reload
      this.reload();
    });
  }

  rejectCert(certId: number) {
    const reason = prompt("Please provide a reason for rejecting this document:");
    if (reason) {
      this.adminService.rejectCertification(certId, reason).subscribe(() => this.reload());
    }
  }

  approveApplication() {
    if (!this.data()) return;
    if (confirm('Are you sure you want to approve this interpreter? They will be live immediately.')) {
      this.adminService.approveInterpreter(this.data()!.id).subscribe(() => {
        alert('Interpreter Approved!');
        this.router.navigate(['/admin/dashboard']);
      });
    }
  }

  requestChanges() {
    if (!this.data()) return;
    const reason = prompt("What changes does the applicant need to make?");
    if (reason) {
      this.adminService.requestChanges(this.data()!.id, reason).subscribe(() => {
        alert('Changes requested.');
        this.router.navigate(['/admin/dashboard']);
      });
    }
  }

  rejectApplication() {
    if (!this.data()) return;
    const reason = prompt("Reason for permanent rejection? This cannot be undone.");
    if (reason) {
      this.adminService.rejectPermanently(this.data()!.id, reason).subscribe(() => {
        alert('Application Rejected.');
        this.router.navigate(['/admin/dashboard']);
      });
    }
  }

  reload() {
    if (this.data()) this.loadData(this.data()!.id);
  }

  // --- Display Helpers ---
  getSpecLabel(key: string): string {
    return SPECIALIZATION_LABELS[key] || key;
  }
  
  getLanguageLabel(key: string): string {
    return LANGUAGE_LABELS[key] || key;
  }
}