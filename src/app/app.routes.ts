import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { UserRole } from './core/models/auth.models';

export const routes: Routes = [

  // 1. ROOT & PUBLIC ROUTES
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home').then(m => m.Home),
    title: 'Medical Interpreters in India | Verbrix'
  },

  {
    path: 'how-it-works',
    loadComponent: () => import('./features/home/how-it-works').then(m => m.HowItWorksComponent),
    title: 'How Verbrix Works | Medical Interpreter Platform'
  },

  {
    path: 'about',
    loadComponent: () => import('./features/home/about').then(m => m.AboutUsComponent),
    title: 'About Us | Verbrix Team'
  },

  {
    path: 'legal/privacy',
    loadComponent: () => import('./features/legal/privacy-policy').then(m => m.PrivacyPolicyComponent),
    title: 'Privacy Policy | Verbrix'
  },

  {
    path: 'legal/terms',
    loadComponent: () => import('./features/legal/terms-of-service').then(m => m.TermsOfServiceComponent),
    title: 'Terms of Service | Verbrix'
  },

  {
    path: 'legal/deletion',
    loadComponent: () => import('./features/legal/data-deletion').then(m => m.DataDeletionComponent),
    title: 'Data Deletion Policy | Verbrix'
  },

  {
    path: 'interpreters/browse',
    // Note: Verify the exported class name in public-interpreters.ts
    loadComponent: () => import('./features/interpreters/pages/public-interpreters')
      .then(m => m.FindInterpreterComponent),
    title: 'Find Medical Interpreters in India | Verbrix'
  },


  // 2. AUTHENTICATION
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  {
    path: 'profile',
    loadComponent: () => import('./features/profile/user-profile').then(m => m.UserProfileComponent),
    canActivate: [authGuard],
    title: 'Profile | Verbrix'
  },


  // 3. INTERPRETER APPLICATION FLOW
  {
    path: 'interpreters/apply',
    loadComponent: () => import('./features/interpreters/pages/app-apply-interpreter')
      .then(m => m.InterpreterApplyComponent),
    canActivate: [authGuard],
    title: 'Apply as Medical Interpreter | Verbrix'
  },

  {
    path: 'interpreters/re-apply',
    loadComponent: () => import('./features/interpreters/pages/app-apply-interpreter')
      .then(m => m.InterpreterApplyComponent),
    canActivate: [authGuard],
    title: 'Update Interpreter Application | Verbrix'
  },


  // 4. DISCOVERY & PROFILES

  {
    path: 'interpreters/find',
    loadComponent: () => import('./features/interpreters/pages/find-interpreter')
      .then(m => m.FindInterpreterComponent),
    canActivate: [authGuard],
    title: 'Search Interpreters | Verbrix'
  },

  {
    path: 'interpreters/:id',
    loadComponent: () => import('./features/interpreters/pages/interpreters-details')
      .then(m => m.InterpreterDetailsComponent),
    canActivate: [authGuard],
    title: 'Interpreter Profile | Verbrix'
  },


  // 5. MESSAGING

  {
    path: 'messages',
    loadComponent: () => import('./features/communication/chat/chat-page')
      .then(m => m.ChatPageComponent),
    canActivate: [authGuard],
    title: 'Messages & Conversations | Verbrix'
  },


  // -----------------------------------------------------------
  // 6. DASHBOARD ZONES
  // -----------------------------------------------------------

  {
    path: 'dashboard',
    canActivate: [authGuard],
    children: [

      // CLIENT
      {
        path: 'client',
        canActivate: [roleGuard],
        data: { expectedRoles: [UserRole.CLIENT] },
        children: [
          {
            path: 'home',
            loadComponent: () => import('./features/client/pages/client-dashboard')
              .then(m => m.ClientDashboard),
            title: 'Client Dashboard | Verbrix'
          },
          { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
      },


      // INTERPRETER
      {
        path: 'interpreter',
        canActivate: [roleGuard],
        data: { expectedRoles: [UserRole.INTERPRETER] },
        children: [
          {
            path: 'home',
            loadComponent: () => import('./features/interpreters/pages/interpreter-dashboard')
              .then(m => m.InterpreterDashboard),
            title: 'Interpreter Dashboard | Verbrix'
          },
          { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
      },


      // -------------------------------------------------------
      // ADMIN (USING SEPARATE ROUTE FILE)
      // -------------------------------------------------------
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { expectedRoles: [UserRole.ADMIN] },
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
      }

    ]
  },


  // 7. GLOBAL FALLBACK
  {
    path: '**',
    loadComponent: () =>
      import('./core/errors/not-found')
        .then(m => m.NotFoundComponent),
    title: 'Page Not Found | Verbrix'
  }

];
