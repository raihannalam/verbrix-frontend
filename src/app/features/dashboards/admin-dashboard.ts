import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../layout/navbar';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, Navbar, FormsModule],
  template: `
    <app-navbar class="fixed top-0 left-0 h-[72px] w-full z-50"></app-navbar>

    <div class="min-h-screen bg-gray-50 pt-[90px] px-6 pb-12">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Admin Portal</h1>
            <p class="text-gray-500 text-sm">Manage interpreter applications and verifications.</p>
          </div>
          <div class="flex gap-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
            <button (click)="filterStatus.set('')" 
                    [class]="filterStatus() === '' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-50'"
                    class="px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all">
              All
            </button>
            <button (click)="filterStatus.set('PENDING')" 
                    [class]="filterStatus() === 'PENDING' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-50'"
                    class="px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all">
              Pending
            </button>
            <button (click)="filterStatus.set('VERIFIED')" 
                    [class]="filterStatus() === 'VERIFIED' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'"
                    class="px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all">
              Verified
            </button>
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
              <tr>
                <th class="px-6 py-4">Interpreter</th>
                <th class="px-6 py-4">Email</th>
                <th class="px-6 py-4">Applied Date</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @if (isLoadingList()) {
                <tr><td colspan="5" class="p-8 text-center"><div class="animate-spin h-6 w-6 border-2 border-blue-600 rounded-full border-t-transparent mx-auto"></div></td></tr>
              } @else if (filteredInterpreters().length === 0) {
                <tr><td colspan="5" class="p-8 text-center text-gray-400">No interpreters found matching criteria.</td></tr>
              } @else {
                @for (user of filteredInterpreters(); track user.id) {
                  <tr class="hover:bg-gray-50/50 transition-colors group">
                    <td class="px-6 py-4">
                      <div class="font-bold text-gray-900">{{ user.firstName }} {{ user.lastName }}</div>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-600">{{ user.email }}</td>
                    <td class="px-6 py-4 text-sm text-gray-500">{{ user.createdAt | date:'mediumDate' }}</td>
                    <td class="px-6 py-4">
                      <span [ngClass]="{
                        'bg-amber-100 text-amber-800': user.status === 'PENDING',
                        'bg-green-100 text-green-800': user.status === 'VERIFIED',
                        'bg-red-100 text-red-800': user.status === 'REJECTED',
                        'bg-blue-100 text-blue-800': user.status === 'CHANGES_REQUESTED'
                      }" class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-black/5">
                        {{ user.status.replace('_', ' ') }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <button (click)="openReview(user.id)" 
                              class="text-blue-600 font-bold text-sm hover:underline hover:text-blue-700">
                        Review
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

      </div>
    </div>

    @if (selectedInterpreter()) {
      <div class="fixed inset-0 z-[60] flex justify-end">
        <div (click)="closeReview()" class="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"></div>
        
        <div class="relative w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in">
          
          <div class="p-6 border-b border-gray-100 flex justify-between items-start bg-white sticky top-0 z-10">
            <div>
              <h2 class="text-xl font-bold text-gray-900">Application Review</h2>
              <p class="text-sm text-gray-500">ID: #{{ selectedInterpreter().id }} • Applied: {{ selectedInterpreter().createdAt | date }}</p>
            </div>
            <button (click)="closeReview()" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <i class="ri-close-line text-2xl"></i>
            </button>
          </div>

          <div class="p-6 space-y-8 flex-1">
            
            <section>
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Identity & Bio</h3>
              <div class="flex gap-4 items-start">
                <img [src]="selectedInterpreter().profilePictureUrl || 'assets/placeholder.png'" 
                     class="h-20 w-20 rounded-xl object-cover bg-gray-100 border border-gray-200 shadow-sm">
                <div class="flex-1 space-y-2">
                  <h3 class="text-lg font-bold text-gray-900">{{ selectedInterpreter().firstName }} {{ selectedInterpreter().lastName }}</h3>
                  <div class="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-700 italic">
                    "{{ selectedInterpreter().bio }}"
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Introduction</h3>
              <div class="aspect-video bg-gray-900 rounded-xl overflow-hidden relative group shadow-sm border border-gray-200">
                <a [href]="selectedInterpreter().introVideoUrl" target="_blank" 
                   class="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/40 hover:bg-black/30 transition-colors">
                   <div class="h-12 w-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                     <i class="ri-play-fill text-2xl"></i>
                   </div>
                   <span class="font-bold text-sm">Watch Video</span>
                </a>
              </div>
            </section>

            <section>
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Verification Documents</h3>
              <div class="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white transition-colors">
                <div class="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    <i class="ri-passport-line text-xl"></i>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-bold text-gray-900">Government ID / Passport</p>
                  <p class="text-xs text-gray-500">Required for identity verification</p>
                </div>
                <a [href]="selectedInterpreter().governmentIdUrl" target="_blank" class="px-3 py-1.5 text-xs font-bold border border-gray-300 rounded-lg hover:bg-gray-50">
                    View
                </a>
              </div>
            </section>

            <section>
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Certifications</h3>
              
              <div class="space-y-3">
                @for (cert of selectedInterpreter().certifications; track cert.id) {
                  <div class="p-4 rounded-xl border transition-all"
                       [ngClass]="{
                         'border-green-200 bg-green-50/50': cert.status === 'VERIFIED',
                         'border-red-200 bg-red-50/50': cert.status === 'REJECTED',
                         'border-gray-200 bg-white': cert.status === 'PENDING'
                       }">
                    
                    <div class="flex justify-between items-start">
                      <div>
                        <p class="font-bold text-gray-900 text-sm">{{ cert.name }}</p>
                        <p class="text-xs text-gray-500">{{ cert.issuingOrganization }} • Expires: {{ cert.expiryDate || 'N/A' }}</p>
                      </div>
                      @if (cert.status !== 'PENDING') {
                          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border"
                                [ngClass]="cert.status === 'VERIFIED' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'">
                            {{ cert.status }}
                          </span>
                      }
                    </div>

                    <div class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200/50">
                      <a [href]="cert.fileUrl" target="_blank" 
                         class="text-xs font-bold text-gray-600 hover:text-blue-600 flex items-center gap-1">
                        <i class="ri-attachment-2"></i> View File
                      </a>
                      
                      @if (cert.status === 'PENDING') {
                        <div class="flex-1 flex justify-end gap-2">
                            <button (click)="rejectCert(cert.id)" class="px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded-md transition-colors">Reject</button>
                            <button (click)="verifyCert(cert.id)" class="px-3 py-1 text-xs font-bold bg-green-600 text-white hover:bg-green-700 rounded-md shadow-sm transition-colors">Verify</button>
                        </div>
                      }
                    </div>
                  </div>
                }
                @if (selectedInterpreter().certifications.length === 0) {
                    <div class="text-center p-4 border border-dashed border-gray-300 rounded-xl text-gray-400 text-sm">
                        No certifications uploaded.
                    </div>
                }
              </div>
            </section>

          </div>

          <div class="p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0 z-10 space-y-3">
            @if (selectedInterpreter().status === 'PENDING' || selectedInterpreter().status === 'CHANGES_REQUESTED') {
              <div class="grid grid-cols-2 gap-3">
                <button (click)="approveInterpreter()" 
                        class="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-600/20 transition-all flex items-center justify-center gap-2">
                  <i class="ri-check-double-line"></i> Approve Application
                </button>
                <button (click)="showRejectInput.set(!showRejectInput())" 
                        class="w-full py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-bold transition-all">
                  Request Changes
                </button>
              </div>

              @if (showRejectInput()) {
                <div class="mt-3 animate-fade-in bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                  <label class="text-xs font-bold text-gray-500 uppercase mb-1 block">Reason for changes</label>
                  <textarea [(ngModel)]="rejectReason" 
                            class="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                            placeholder="e.g., Profile photo is blurry, Certificate 1 is expired..."></textarea>
                  <div class="flex justify-end gap-2 mt-2">
                    <button (click)="showRejectInput.set(false)" class="text-xs font-bold text-gray-500 hover:text-gray-700 px-2">Cancel</button>
                    <button (click)="requestChanges()" 
                            [disabled]="!rejectReason.trim()"
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50">
                      Send Request
                    </button>
                  </div>
                </div>
              }
            } @else {
              <div class="text-center p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                <p class="text-sm font-medium text-gray-600">
                    Application Status: <span class="font-bold text-gray-900">{{ selectedInterpreter().status }}</span>
                </p>
              </div>
            }
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    .animate-slide-in { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AdminDashboard implements OnInit {
  private adminService = inject(AdminService);

  // State
  interpreters = signal<any[]>([]);
  filterStatus = signal<string>(''); // '' | 'PENDING' | 'VERIFIED'
  isLoadingList = signal(true);
  
  // Selection
  selectedInterpreter = signal<any>(null);
  showRejectInput = signal(false);
  rejectReason = '';

  // Computed
  filteredInterpreters = computed(() => {
    const status = this.filterStatus();
    if (!status) return this.interpreters();
    return this.interpreters().filter(i => i.status === status);
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoadingList.set(true);
    this.adminService.getAllInterpreters().subscribe({
      next: (data) => {
        this.interpreters.set(data);
        this.isLoadingList.set(false);
      },
      error: () => this.isLoadingList.set(false)
    });
  }

  openReview(id: number) {
    this.adminService.getInterpreterDetails(id).subscribe(details => {
      this.selectedInterpreter.set(details);
      this.showRejectInput.set(false);
      this.rejectReason = '';
    });
  }

  closeReview() {
    this.selectedInterpreter.set(null);
  }

  // --- ACTIONS ---

  approveInterpreter() {
    // Validation check: Are all certs verified?
    const pendingCerts = this.selectedInterpreter().certifications.some((c: any) => c.status !== 'VERIFIED');
    if (pendingCerts) {
        if (!confirm('Warning: Some certifications are not verified. Approve anyway?')) return;
    } else {
        if (!confirm('Confirm approval? This will grant the user interpreter access.')) return;
    }

    this.adminService.approveInterpreter(this.selectedInterpreter().id).subscribe({
      next: () => {
        alert('Interpreter Verified Successfully');
        this.closeReview();
        this.loadData(); 
      },
      error: (err) => alert(err.error?.message || 'Failed to approve')
    });
  }

  requestChanges() {
    if (!this.rejectReason.trim()) return;

    this.adminService.requestChanges(this.selectedInterpreter().id, this.rejectReason).subscribe({
      next: () => {
        alert('Change request sent to user.');
        this.closeReview();
        this.loadData();
      },
      error: (err) => alert('Failed to send request')
    });
  }

  verifyCert(certId: number) {
    this.adminService.verifyCertification(certId).subscribe({
      next: () => {
        // Optimistic update
        const current = this.selectedInterpreter();
        const updatedCerts = current.certifications.map((c: any) => 
          c.id === certId ? { ...c, status: 'VERIFIED' } : c
        );
        this.selectedInterpreter.set({ ...current, certifications: updatedCerts });
      }
    });
  }

  rejectCert(certId: number) {
    const reason = prompt("Enter reason for rejection:");
    if (!reason) return;

    this.adminService.rejectCertification(certId, reason).subscribe({
      next: () => {
        const current = this.selectedInterpreter();
        const updatedCerts = current.certifications.map((c: any) => 
          c.id === certId ? { ...c, status: 'REJECTED' } : c
        );
        this.selectedInterpreter.set({ ...current, certifications: updatedCerts });
      }
    });
  }
}