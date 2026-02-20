import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-interpreter-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
      
      <div class="p-4 border-b dark:border-slate-800 flex flex-wrap gap-2">
        <button *ngFor="let s of statuses" 
          (click)="filterStatus.set(s.value)"
          [class]="filterStatus() === s.value ? 'bg-gray-900 dark:bg-white text-white dark:text-black' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'"
          class="px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all">
          {{s.label}}
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gray-50/50 dark:bg-slate-800/50 text-[10px] uppercase text-gray-400 font-black tracking-widest">
            <tr>
              <th class="px-6 py-4">Interpreter</th>
              <th class="px-6 py-4 hidden md:table-cell">Applied Date</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
            <tr *ngFor="let user of filteredInterpreters()" class="group hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
              <td class="px-6 py-4">
                <div class="font-bold text-gray-900 dark:text-slate-100">{{user.firstName}} {{user.lastName}}</div>
                <div class="text-xs text-gray-500 dark:text-slate-500">{{user.email}}</div>
              </td>
              <td class="px-6 py-4 hidden md:table-cell text-sm text-gray-500">{{user.createdAt | date:'mediumDate'}}</td>
              <td class="px-6 py-4">
                <span [class]="getStatusClass(user.status)" class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border border-black/5">
                  {{user.status}}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button (click)="onReview.emit(user.id)" class="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                  Review
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="loading" class="p-12 text-center">
        <div class="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  `
})
export class InterpreterListComponent {
  @Input() interpreters: any[] = [];
  @Input() loading = false;
  @Output() onReview = new EventEmitter<number>();

  filterStatus = signal('');
  statuses = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Verified', value: 'VERIFIED' }
  ];

  filteredInterpreters = computed(() => {
    const status = this.filterStatus();
    return status ? this.interpreters.filter(i => i.status === status) : this.interpreters;
  });

  getStatusClass(status: string) {
    const base = "bg-opacity-10 ";
    if (status === 'VERIFIED') return base + "bg-green-500 text-green-600 border-green-200";
    if (status === 'PENDING') return base + "bg-amber-500 text-amber-600 border-amber-200";
    return base + "bg-red-500 text-red-600 border-red-200";
  }
}