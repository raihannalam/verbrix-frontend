import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { InterpreterSummaryResponse } from '../models/admin.models';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fade-in">

      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Platform Overview</h1>

        @if (errorMessage()) {
          <div class="px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <i class="ri-error-warning-line"></i>
            <span>{{ errorMessage() }}</span>
          </div>
        }
      </div>

      @if (isLoading()) {
        <div class="flex flex-col items-center justify-center min-h-[400px] text-gray-400 dark:text-gray-500 space-y-4">
          <div class="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500"></div>
          <p class="text-sm font-medium animate-pulse">Loading dashboard metrics...</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div class="bg-white dark:bg-[#181a1f] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors flex flex-col min-h-[160px]">
            <div class="flex justify-between items-start mb-4">
              <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                <i class="ri-user-star-line text-xl"></i>
              </div>
            </div>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white">{{ interpreters().length }}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Total Interpreters</p>
          </div>

          <div class="bg-white dark:bg-[#181a1f] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors flex flex-col justify-center items-center min-h-[160px]">
            <i class="ri-hospital-line text-3xl text-gray-300 dark:text-gray-600 mb-2"></i>
            <h3 class="text-lg font-bold text-gray-400 dark:text-gray-500 italic">Coming Soon</h3>
            <p class="text-gray-400 dark:text-gray-600 text-sm mt-1">Registered Clients</p>
          </div>

          <div class="bg-white dark:bg-[#181a1f] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors flex flex-col justify-center items-center min-h-[160px]">
            <i class="ri-exchange-dollar-line text-3xl text-gray-300 dark:text-gray-600 mb-2"></i>
            <h3 class="text-lg font-bold text-gray-400 dark:text-gray-500 italic">Coming Soon</h3>
            <p class="text-gray-400 dark:text-gray-600 text-sm mt-1">Platform Revenue</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 transition-colors min-h-[250px] flex flex-col">
            <h3 class="font-bold text-gray-900 dark:text-white mb-4">Recent System Activity</h3>
            <div class="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
              <i class="ri-time-line text-4xl mb-3 opacity-50"></i>
              <span class="font-medium italic">Activity feed coming soon</span>
            </div>
          </div>

          <div class="bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 transition-colors min-h-[250px] flex flex-col">
            <h3 class="font-bold text-gray-900 dark:text-white mb-4">System Status</h3>
            <div class="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
              <i class="ri-dashboard-line text-4xl mb-3 opacity-50"></i>
              <span class="font-medium italic">Status metrics coming soon</span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class AdminOverviewComponent implements OnInit {
  private adminService = inject(AdminService);

  // State Signals
  interpreters = signal<InterpreterSummaryResponse[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.adminService.getAllInterpreters().subscribe({
      next: (data) => {
        this.interpreters.set(data);
        this.isLoading.set(false);
      },
      error: (e) => {
        console.error('Error fetching interpreters:', e);
        this.errorMessage.set('Failed to load interpreter data. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }
}
