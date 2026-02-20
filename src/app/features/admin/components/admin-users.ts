import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center h-[60vh] text-gray-400 dark:text-gray-600 animate-fade-in">
      <i class="ri-tools-line text-4xl mb-4"></i>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">User Management</h2>
      <p>Module coming soon.</p>
    </div>
  `,
  styles: [`.animate-fade-in { animation: fadeIn 0.4s ease-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`]
})
export class AdminUsersComponent {}
