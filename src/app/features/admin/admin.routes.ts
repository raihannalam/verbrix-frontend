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

      // 2. Overview Route
      {
        path: 'home',
        loadComponent: () => import('./components/admin-overview').then(m => m.AdminOverviewComponent),
        title: 'Admin Overview | Verbrix',
        data: {
          description: 'Admin dashboard overview for managing the Verbrix medical interpreter platform, user activity, and system metrics.',
          breadcrumb: 'Overview'
        }
      },

      // 3. Approvals
      {
        path: 'approvals',
        loadComponent: () => import('./components/admin-approvals').then(m => m.AdminApprovalsComponent),
        title: 'Approvals Queue | Verbrix',
        data: {
          description: 'Review and approve medical interpreter applications to ensure high-quality healthcare translation services on Verbrix.',
          breadcrumb: 'Approvals Queue'
        }
      },

      // 4. Users
      {
        path: 'users',
        loadComponent: () => import('./components/admin-users').then(m => m.AdminUsersComponent),
        title: 'User Management | Verbrix',
        data: {
          description: 'Manage registered clients and medical interpreters on the Verbrix platform.',
          breadcrumb: 'User Management'
        }
      },

      // 5. Financials
      {
        path: 'financials',
        loadComponent: () => import('./components/admin-financials').then(m => m.AdminFinancialsComponent),
        title: 'Financial Reports | Verbrix',
        data: {
          description: 'Review financial reports, transactions, and earnings for the Verbrix medical interpretation platform.',
          breadcrumb: 'Financials'
        }
      },

      // 6. Details
      {
        path: 'interpreters/:id',
        loadComponent: () => import('./components/interpreter-details-admin')
          .then(m => m.InterpreterDetailComponent),
        title: 'Review Application | Verbrix',
        data: {
          description: 'Review detailed application and credential information for medical interpreter candidates on Verbrix.',
          breadcrumb: 'Review Application'
        }
      }
    ]
  }
];
