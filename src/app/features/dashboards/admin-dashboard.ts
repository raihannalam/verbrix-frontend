import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Required for router-outlet
import { Navbar } from '../layout/navbar'; // Adjust path based on your folder structure

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, Navbar, RouterModule],
  template: `
    <app-navbar></app-navbar>

    <div class="min-h-screen bg-[#f8f9fa] dark:bg-[#0b0c0f] pt-20 transition-colors duration-300">
      
      <main class="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        
        <router-outlet></router-outlet>
        
      </main>

    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AdminDashboard {
  // Logic is now delegated to the child components (AdminOverview, AdminApprovals, etc.)
}