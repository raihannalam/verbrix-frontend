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

  // 2. AUTHENTICATION (Login, Register, OTP, Password Reset)
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

  // 3. INTERPRETER APPLICATION FLOW (Top-level access)
  // Accessible via: /interpreters/apply or /interpreters/re-apply
  // These hit the 'apply' and 're-apply' endpoints in InterpreterController
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

  // 4. SECURE DASHBOARD ZONES
  {
    path: 'dashboard',
    canActivate: [authGuard], 
    children: [
      
      // 🟦 CLIENT ZONE (Role: CLIENT)
      {
        path: 'client',
        canActivate: [roleGuard],
        data: { expectedRoles: [UserRole.CLIENT] }, 
        children: [
          { 
            path: 'home', 
            loadComponent: () => import('./features/dashboards/client-dashboard').then(m => m.ClientDashboard),
            title: 'My Dashboard | Verbrix'
          },
          { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
      },

      // 🟧 INTERPRETER ZONE (Role: INTERPRETER)
      // Finalized once Admin calls approveInterpreter in AdminInterpreterServiceImpl
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

      // 🟥 ADMIN ZONE (Role: ADMIN)
      // Manages verification using AdminInterpreterService
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

  {
    path: 'messages',
    loadComponent: () => import('./features/components/chat-room')
      .then(m => m.ChatRoomComponent),
    canActivate: [authGuard] // Ensure user is logged in
  },

  // 5. SHARED & SECURITY ROUTES
  // {
  //   path: 'settings/security',
  //   canActivate: [authGuard],
  //   // loadComponent: () => import('./features/settings/security-settings').then(m => m.SecuritySettings),
  //   title: 'Security & Devices | Verbrix'
  // },

  // 6. GLOBAL CATCH-ALL
  { path: '**', redirectTo: '' }
];