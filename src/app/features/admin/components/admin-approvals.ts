import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { InterpreterSummaryResponse } from '../models/admin.models';

@Component({
  selector: 'app-admin-approvals',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Application Queue</h1>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Review and verify interpreter credentials.</p>
          </div>

          <div class="flex bg-white dark:bg-[#181a1f] p-1 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
            <button (click)="filterStatus.set('ACTION_REQUIRED')"
                    [class]="filterStatus() === 'ACTION_REQUIRED'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1f2229]'"
                    class="px-4 py-2 rounded-md text-xs font-bold transition-all">
                Action Required ({{ pendingCount() }})
            </button>
            <button (click)="filterStatus.set('VERIFIED')"
                    [class]="filterStatus() === 'VERIFIED'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1f2229]'"
                    class="px-4 py-2 rounded-md text-xs font-bold transition-all">
                History / Verified
            </button>
          </div>
      </div>

      <div class="bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-50 dark:bg-[#1f2229] border-b border-gray-200 dark:border-gray-800 text-xs uppercase text-gray-500 dark:text-gray-400 font-bold tracking-wider">
              <tr>
                <th class="px-6 py-4">Applicant</th>
                <th class="px-6 py-4">Submission Date</th>
                <th class="px-6 py-4">Current Status</th>
                <th class="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              @for (user of filteredInterpreters(); track user.id) {
                <tr class="hover:bg-gray-50 dark:hover:bg-[#252830] transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500 dark:text-gray-300">
                          {{ user.firstName.charAt(0) }}
                        </div>
                        <div>
                          <div class="font-bold text-gray-900 dark:text-white">{{ user.firstName }} {{ user.lastName }}</div>
                          <div class="text-xs text-gray-500 dark:text-gray-400">{{ user.email }}</div>
                        </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{{ user.createdAt | date:'mediumDate' }}</td>
                  <td class="px-6 py-4">
                    @if (user.status === 'PENDING') {
                        <span class="bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">New Application</span>
                    } @else if (user.status === 'CHANGES_REQUESTED') {
                        <span class="bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">Resubmitted</span>
                    } @else if (user.status === 'VERIFIED') {
                        <span class="bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">Verified</span>
                    } @else if (user.status === 'REJECTED') {
                        <span class="bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">Rejected</span>
                    }
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button (click)="navigateToReview(user.id)"
                            class="text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline flex items-center gap-1 ml-auto">
                        Review Application <i class="ri-arrow-right-line"></i>
                    </button>
                  </td>
                </tr>
              }
              @if (filteredInterpreters().length === 0) {
                  <tr><td colspan="4" class="p-12 text-center text-gray-400 dark:text-gray-500">No applications found in this category.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class AdminApprovalsComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);

  interpreters = signal<InterpreterSummaryResponse[]>([]);
  filterStatus = signal<'ACTION_REQUIRED' | 'VERIFIED'>('ACTION_REQUIRED');

  pendingCount = computed(() =>
    this.interpreters().filter(i => i.status === 'PENDING' || i.status === 'CHANGES_REQUESTED').length
  );

  filteredInterpreters = computed(() => {
    const list = this.interpreters();
    if (this.filterStatus() === 'ACTION_REQUIRED') {
        return list.filter(i => i.status === 'PENDING' || i.status === 'CHANGES_REQUESTED');
    } else {
        return list.filter(i => i.status === 'VERIFIED' || i.status === 'REJECTED');
    }
  });

  ngOnInit() {
    this.adminService.getAllInterpreters().subscribe({
      next: (data) => this.interpreters.set(data),
      error: (e) => console.error(e)
    });
  }

  navigateToReview(id: number) {
    this.router.navigate(['/dashboard/admin/interpreters', id]);
  }
}
