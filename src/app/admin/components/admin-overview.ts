import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { AdminService } from '../../core/services/admin.service'; 
import { InterpreterSummaryResponse } from '../../admin/models/admin.models';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Platform Overview</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white dark:bg-[#181a1f] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
            <div class="flex justify-between items-start mb-4">
                <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400"><i class="ri-user-star-line text-xl"></i></div>
                <span class="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-xs font-bold">+12%</span>
            </div>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white">{{ interpreters().length }}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Total Interpreters</p>
          </div>
          
          <div class="bg-white dark:bg-[#181a1f] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
            <div class="flex justify-between items-start mb-4">
                <div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400"><i class="ri-hospital-line text-xl"></i></div>
                <span class="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-xs font-bold">+5%</span>
            </div>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white">856</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Registered Clients</p>
          </div>

          <div class="bg-white dark:bg-[#181a1f] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
            <div class="flex justify-between items-start mb-4">
                <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400"><i class="ri-exchange-dollar-line text-xl"></i></div>
                <span class="text-gray-400 dark:text-gray-500 text-xs">This Month</span>
            </div>
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white">$42,500</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Platform Revenue</p>
          </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 transition-colors">
            <h3 class="font-bold text-gray-900 dark:text-white mb-4">Recent System Activity</h3>
            <div class="space-y-4">
                <div class="flex items-center gap-4 text-sm border-b border-gray-50 dark:border-gray-800 pb-3">
                  <span class="w-20 text-gray-400">10:42 AM</span>
                  <span class="font-bold text-gray-900 dark:text-white">New Client Registration</span>
                  <span class="text-gray-500 dark:text-gray-400">Dr. Sarah Smith joined the platform.</span>
                </div>
                <div class="flex items-center gap-4 text-sm border-b border-gray-50 dark:border-gray-800 pb-3">
                  <span class="w-20 text-gray-400">09:15 AM</span>
                  <span class="font-bold text-blue-600 dark:text-blue-400">Payout Processed</span>
                  <span class="text-gray-500 dark:text-gray-400">Weekly payouts initiated for 150 interpreters.</span>
                </div>
            </div>
          </div>

          <div class="bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 transition-colors">
            <h3 class="font-bold text-gray-900 dark:text-white mb-4">System Status</h3>
            <div class="bg-green-50 dark:bg-green-900/10 rounded-xl p-4 border border-green-100 dark:border-green-900/30">
                <p class="text-xs text-green-600 dark:text-green-400 font-medium">All Systems Operational</p>
                <div class="flex items-center gap-2 mt-2">
                  <span class="relative flex h-3 w-3">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <span class="text-sm font-bold text-gray-900 dark:text-white">Active</span>
                </div>
            </div>
          </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class AdminOverviewComponent implements OnInit {
  private adminService = inject(AdminService);
  interpreters = signal<InterpreterSummaryResponse[]>([]);

  ngOnInit() {
    this.adminService.getAllInterpreters().subscribe({
      next: (data) => this.interpreters.set(data),
      error: (e) => console.error(e)
    });
  }
}