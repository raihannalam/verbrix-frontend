import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { UserRole } from './core/models/auth.models';
import { InterpreterApplyComponent } from './features/components/app-apply-interpreter';

export const routes: Routes = [
  // 1. ROOT & PUBLIC ROUTES
  { 
    path: '', 
    pathMatch: 'full', 
    loadComponent: () => import('./features/home/home').then(m => m.Home),
    title: 'Verbrix - Healthcare Translation' 
  },

  // 2. AUTHENTICATION
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about').then(m => m.AboutUsComponent)
  },
  {
    path: 'legal/privacy',
    loadComponent: () => import('./features/legal/privacy-policy').then(m => m.PrivacyPolicyComponent)
  },
  {
    path: 'legal/terms',
    loadComponent: () => import('./features/legal/terms-of-service').then(m => m.TermsOfServiceComponent)
  },
  {
    path: 'legal/deletion',
    loadComponent: () => import('./features/legal/data-deletion').then(m => m.DataDeletionComponent)
  },
  {
    path: 'interpreters/browse', 
    loadComponent: () => import('./features/public/public-interpreters')
      .then(m => m.FindInterpreterComponent),
    title: 'Browse Interpreters | Verbrix'
  },

  // 3. INTERPRETER APPLICATION FLOW
  { 
    path: 'interpreters/apply', 
    component: InterpreterApplyComponent,
    canActivate: [authGuard],
    title: 'Interpreter Application | Verbrix'
  },
  { 
    path: 'interpreters/re-apply', 
    component: InterpreterApplyComponent,
    canActivate: [authGuard],
    title: 'Update Application | Verbrix'
  },

  // -----------------------------------------------------------
  // 4. NEW: DISCOVERY & PROFILES (Accessible by Clients)
  // -----------------------------------------------------------
  {
    path: 'interpreters/find',
    loadComponent: () => import('./features/interpreters/find-interpreter')
      .then(m => m.FindInterpreterComponent),
    canActivate: [authGuard]
  },
  {
    path: 'interpreters/:id',
    loadComponent: () => import('./features/interpreters/interpreters-details')
      .then(m => m.InterpreterDetailsComponent),
    canActivate: [authGuard]
  },

  // -----------------------------------------------------------
  // 5. NEW: MESSAGING (Standalone Page)
  // -----------------------------------------------------------
  {
    path: 'messages',
    // 🔴 Point this to the new ChatLayoutComponent (Full Page)
    loadComponent: () => import('../app/features/chat/chat-page').
      then(m => m.ChatPageComponent),
    canActivate: [authGuard],
    title: 'Messages | Verbrix'
  },

  // -----------------------------------------------------------
  // 6. SECURE DASHBOARD ZONES
  // -----------------------------------------------------------
  {
    path: 'dashboard',
    canActivate: [authGuard], 
    children: [
      
      // 🟦 CLIENT ZONE
      {
        path: 'client',
        canActivate: [roleGuard],
        data: { expectedRoles: [UserRole.CLIENT] }, 
        children: [
          { 
            path: 'home', 
            // 🔴 Ensure this points to the updated ClientDashboard
            loadComponent: () => import('./features/dashboards/client-dashboard').then(m => m.ClientDashboard),
            title: 'My Dashboard | Verbrix'
          },
          { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
      },

      // 🟧 INTERPRETER ZONE
      {
        path: 'interpreter',
        canActivate: [roleGuard],
        data: { expectedRoles: [UserRole.INTERPRETER] },
        children: [
          { 
            path: 'home', 
            loadComponent: () => import('./features/dashboards/interpreter-dashboard').then(m => m.InterpreterDashboard),
            title: 'Interpreter Console | Verbrix'
          },
          { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
      },

      // 🟥 ADMIN ZONE
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { expectedRoles: [UserRole.ADMIN] },
        children: [
          { 
            path: 'home', 
            loadComponent: () => import('./features/dashboards/admin-dashboard').then(m => m.AdminDashboard),
            title: 'Admin Console | Verbrix'
          },
          { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
      }
    ]
  },

  // 7. GLOBAL CATCH-ALL
  { path: '**', redirectTo: '' }
];