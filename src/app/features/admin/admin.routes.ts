import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    // The Root Admin Route (Shell)
    // Matches: /dashboard/admin
    path: '',
    loadComponent: () => import('./pages/admin-dashboard').then(m => m.AdminDashboard),
    children: [

      // 1. Redirect empty path to 'home'
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      // 2. Overview Route (Changed from 'home' to 'overview')
      {
        path: 'home',
        loadComponent: () => import('./components/admin-overview').then(m => m.AdminOverviewComponent),
        title: 'Admin Overview | Verbrix'
      },

      // 3. Approvals
      {
        path: 'approvals',
        loadComponent: () => import('./components/admin-approvals').then(m => m.AdminApprovalsComponent),
        title: 'Approvals Queue | Verbrix'
      },

      // 4. Users
      {
        path: 'users',
        loadComponent: () => import('./components/admin-users').then(m => m.AdminUsersComponent),
        title: 'User Management | Verbrix'
      },
        // 5. Financials
      {
        path: 'financials',
        loadComponent: () => import('./components/admin-financials').then(m => m.AdminFinancialsComponent),
        title: 'Financial Reports | Verbrix'
      },

      // 6. Details
      {
        path: 'interpreters/:id',
        loadComponent: () => import('./components/interpreter-details-admin')
          .then(m => m.InterpreterDetailComponent),
        title: 'Review Application | Verbrix'
      }
    ]
  }
];
