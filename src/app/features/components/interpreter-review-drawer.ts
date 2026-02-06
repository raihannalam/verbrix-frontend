import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-interpreter-review-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="interpreter" class="fixed inset-0 z-[110] flex justify-end">
      <div (click)="onClose.emit()" class="absolute inset-0 bg-black/40 backdrop-blur-md animate-fade-in"></div>
      
      <div class="relative w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-slide-in overflow-y-auto">
        
        <div class="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-30">
          <div>
            <h2 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Application Review</h2>
            <p class="text-xs text-gray-500 font-bold uppercase tracking-widest">UID: #{{interpreter.id}}</p>
          </div>
          <button (click)="onClose.emit()" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full dark:text-white">
            <i class="ri-close-line text-2xl"></i>
          </button>
        </div>

        <div class="p-6 space-y-8">
          <section class="flex gap-6 items-center">
            <img [src]="interpreter.profilePictureUrl" class="w-24 h-24 rounded-3xl object-cover border-4 border-gray-50 dark:border-slate-800 shadow-xl">
            <div class="space-y-1">
              <h3 class="text-xl font-bold dark:text-white">{{interpreter.firstName}} {{interpreter.lastName}}</h3>
              <p class="text-blue-600 font-bold text-sm">{{interpreter.email}}</p>
              <div class="flex gap-2 pt-2">
                <span class="px-2 py-1 bg-gray-100 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-bold rounded">EXP: {{interpreter.experienceYears}}Y</span>
                <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 text-[10px] font-bold rounded">RATING: {{interpreter.rating || 'New'}}</span>
              </div>
            </div>
          </section>

          <section>
            <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Personal Bio</h4>
            <div class="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl italic text-sm text-gray-600 dark:text-slate-300 border dark:border-slate-700">
              "{{interpreter.bio}}"
            </div>
          </section>

          <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Specializations</h4>
              <div class="flex flex-wrap gap-2">
                <span *ngFor="let s of interpreter.specializations" class="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-xs font-bold rounded-lg border border-blue-100 dark:border-blue-900/40">{{s}}</span>
              </div>
            </div>
            <div>
              <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Language Abilities</h4>
              <div class="flex flex-wrap gap-2">
                <span *ngFor="let l of interpreter.languageAbilities" class="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg">{{l}}</span>
              </div>
            </div>
          </section>

          <section class="p-4 bg-blue-600 rounded-3xl text-white shadow-lg shadow-blue-600/20">
             <h4 class="text-[10px] font-black uppercase tracking-widest mb-4 opacity-80">Financial Summary</h4>
             <div class="flex justify-between items-end">
                <div>
                   <p class="text-xs">Consultation Fee</p>
                   <p class="text-2xl font-black">₹{{interpreter.consultationFee}}</p>
                </div>
                <div class="text-right">
                   <p class="text-xs">Service Agreement</p>
                   <p class="text-lg font-bold">₹{{interpreter.serviceAgreementFee}}</p>
                </div>
             </div>
          </section>

          <section>
            <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Certifications ({{interpreter.certifications.length}})</h4>
            <div class="space-y-3">
              <div *ngFor="let cert of interpreter.certifications" class="p-4 border dark:border-slate-700 rounded-2xl flex justify-between items-center">
                <div>
                  <p class="font-bold dark:text-white text-sm">{{cert.name}}</p>
                  <p class="text-xs text-gray-500">{{cert.issuingOrganization}}</p>
                </div>
                <div class="flex gap-2">
                   <a [href]="cert.fileUrl" target="_blank" class="p-2 bg-gray-100 dark:bg-slate-800 rounded-xl"><i class="ri-attachment-2"></i></a>
                   <button *ngIf="cert.status === 'PENDING'" (click)="verifyCert(cert.id)" class="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-lg">Verify</button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="p-6 border-t dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 sticky bottom-0 z-30">
          <div class="grid grid-cols-2 gap-4">
             <button (click)="approve()" class="py-4 bg-green-600 text-white rounded-2xl font-bold shadow-xl shadow-green-600/20">Approve Application</button>
             <button (click)="onClose.emit()" class="py-4 bg-white dark:bg-slate-800 dark:text-white border dark:border-slate-700 rounded-2xl font-bold">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-slide-in { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
    .animate-fade-in { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class InterpreterReviewDrawerComponent {
  @Input() interpreter: any;
  @Output() onClose = new EventEmitter<void>();
  @Output() onUpdate = new EventEmitter<void>();

  private adminService = inject(AdminService);

  verifyCert(id: number) {
    this.adminService.verifyCertification(id).subscribe(() => {
       this.interpreter.certifications = this.interpreter.certifications.map((c: any) => 
         c.id === id ? {...c, status: 'VERIFIED'} : c
       );
    });
  }

  approve() {
    if(!confirm("Approve this interpreter?")) return;
    this.adminService.approveInterpreter(this.interpreter.id).subscribe(() => {
      this.onUpdate.emit();
      this.onClose.emit();
    });
  }
}