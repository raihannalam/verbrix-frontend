import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Navbar } from '../layout/navbar'; // Adjust path as needed
import { AdminService } from '../../core/services/admin.service'; // Adjust path as needed
import { InterpreterSummaryResponse } from '../../admin/models/admin.models'; // Adjust path as needed

type AdminView = 'OVERVIEW' | 'APPROVALS' | 'USERS' | 'FINANCIALS';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, Navbar, FormsModule, DatePipe, RouterModule],
  template: `
    <app-navbar></app-navbar>

    <div class="min-h-screen bg-[#f8f9fa] dark:bg-[#0b0c0f] pt-20 flex transition-colors duration-300">
      
      <aside class="w-64 bg-white dark:bg-[#181a1f] border-r border-gray-200 dark:border-gray-800 fixed left-0 top-20 bottom-0 z-10 flex flex-col transition-colors duration-300">
        <div class="p-6">
          <h2 class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Operations</h2>
          <nav class="space-y-1">
            <button (click)="currentView.set('OVERVIEW')"
                    [class]="currentView() === 'OVERVIEW' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1f2229]'"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors">
              <i class="ri-dashboard-line text-lg"></i> Overview
            </button>
            <button (click)="currentView.set('APPROVALS')"
                    [class]="currentView() === 'APPROVALS' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1f2229]'"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors">
              <i class="ri-user-follow-line text-lg"></i> 
              Approvals
              @if (pendingCount() > 0) {
                <span class="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{{ pendingCount() }}</span>
              }
            </button>
            <button (click)="currentView.set('USERS')"
                    [class]="currentView() === 'USERS' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1f2229]'"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors">
              <i class="ri-group-line text-lg"></i> Users & Clients
            </button>
            <button (click)="currentView.set('FINANCIALS')"
                    [class]="currentView() === 'FINANCIALS' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1f2229]'"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors">
              <i class="ri-money-dollar-circle-line text-lg"></i> Financials
            </button>
          </nav>
        </div>
        
        <div class="mt-auto p-6 border-t border-gray-100 dark:border-gray-800">
           <div class="bg-gray-50 dark:bg-[#1f2229] rounded-xl p-4 border border-gray-100 dark:border-gray-800">
              <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">System Health</p>
              <div class="flex items-center gap-2 mt-1">
                 <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 <span class="text-sm font-bold text-gray-900 dark:text-white">Operational</span>
              </div>
           </div>
        </div>
      </aside>

      <main class="flex-1 ml-64 p-8 transition-all duration-300">
        
        @if (currentView() === 'OVERVIEW') {
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

              <div class="bg-white dark:bg-[#181a1f] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 transition-colors">
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
           </div>
        }

        @else if (currentView() === 'APPROVALS') {
          <div class="space-y-6 animate-fade-in">
            <div class="flex justify-between items-center">
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
        }

        @else if (currentView() === 'USERS') {
           <div class="flex flex-col items-center justify-center h-[60vh] text-gray-400 dark:text-gray-600 animate-fade-in">
              <i class="ri-tools-line text-4xl mb-4"></i>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">User Management</h2>
              <p>Module coming soon.</p>
           </div>
        }
        @else if (currentView() === 'FINANCIALS') {
           <div class="flex flex-col items-center justify-center h-[60vh] text-gray-400 dark:text-gray-600 animate-fade-in">
              <i class="ri-bank-card-line text-4xl mb-4"></i>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">Financial Reports</h2>
              <p>Module coming soon.</p>
           </div>
        }

      </main>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class AdminDashboard implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);

  // View State
  currentView = signal<AdminView>('OVERVIEW');
  
  // Data State
  interpreters = signal<InterpreterSummaryResponse[]>([]);
  filterStatus = signal<'ACTION_REQUIRED' | 'VERIFIED'>('ACTION_REQUIRED');

  // Computed Values
  pendingCount = computed(() => 
    this.interpreters().filter(i => i.status === 'PENDING' || i.status === 'CHANGES_REQUESTED').length
  );

  filteredInterpreters = computed(() => {
    const list = this.interpreters();
    if (this.filterStatus() === 'ACTION_REQUIRED') {
        // Group Pending AND Changes Requested together
        return list.filter(i => i.status === 'PENDING' || i.status === 'CHANGES_REQUESTED');
    } else {
        return list.filter(i => i.status === 'VERIFIED' || i.status === 'REJECTED');
    }
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.adminService.getAllInterpreters().subscribe({
      next: (data) => this.interpreters.set(data),
      error: (e) => console.error('Load failed', e)
    });
  }

  navigateToReview(id: number) {
    this.router.navigate(['/dashboard/admin/interpreters', id]);
  }
}