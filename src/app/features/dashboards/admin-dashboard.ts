import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../layout/navbar';
import { AdminService } from '../../core/services/admin.service';
import { InterpreterListComponent } from '../components/interpreter-list';
import { InterpreterReviewDrawerComponent } from '../components/interpreter-review-drawer';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    Navbar, 
    InterpreterListComponent, 
    InterpreterReviewDrawerComponent
  ],
  template: `
    <app-navbar></app-navbar>

    <div class="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <main class="max-w-7xl mx-auto pt-28 md:pt-36 px-4 pb-12">
        
        <header class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div class="space-y-1">
            <h1 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Admin Portal
            </h1>
            <p class="text-gray-500 dark:text-slate-400 font-medium">
              Verbrix Interpreter Verification & Management
            </p>
          </div>
          
          <div class="flex items-center gap-3">
             <div class="px-4 py-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl shadow-sm">
                <span class="text-xs font-bold text-gray-400 uppercase mr-2">Total Interpreters:</span>
                <span class="font-bold dark:text-white">{{interpreters().length}}</span>
             </div>
          </div>
        </header>

        <app-interpreter-list 
          [interpreters]="interpreters()" 
          [loading]="isLoadingList()"
          (onReview)="openReview($event)">
        </app-interpreter-list>

      </main>
    </div>

    <app-interpreter-review-drawer
      [interpreter]="selectedInterpreter()"
      (onClose)="closeReview()"
      (onUpdate)="loadData()">
    </app-interpreter-review-drawer>
  `
})
export class AdminDashboard implements OnInit {
  private adminService = inject(AdminService);

  interpreters = signal<any[]>([]);
  isLoadingList = signal(true);
  selectedInterpreter = signal<any>(null);

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
    });
  }

  closeReview() {
    this.selectedInterpreter.set(null);
  }
}