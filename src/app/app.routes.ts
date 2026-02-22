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
    title: 'Medical Interpreters in India | Verbrix',
    data: {
      description: 'Find verified medical interpreters for medical tourism in India. Verbrix provides secure real-time translation, patient support, and healthcare communication.',
      breadcrumb: 'Home'
    }
  },
  {
    path: 'how-it-works',
    loadComponent: () => import('./features/home/how-it-works').then(m => m.HowItWorksComponent),
    title: 'How Verbrix Works | Medical Interpreter Platform',
    data: {
      description: 'Learn how Verbrix connects international patients with certified medical interpreters in India for secure, real-time healthcare communication.',
      breadcrumb: 'How It Works'
    }
  },
  {
    path: 'about',
    loadComponent: () => import('./features/home/about').then(m => m.AboutUsComponent),
    title: 'About Us | Verbrix Team',
    data: {
      description: 'Meet the team behind Verbrix. We are dedicated to bridging the language gap in healthcare for international patients and medical tourists in India.',
      breadcrumb: 'About Us'
    }
  },
  {
    path: 'legal/privacy',
    loadComponent: () => import('./features/legal/privacy-policy').then(m => m.PrivacyPolicyComponent),
    title: 'Privacy Policy | Verbrix',
    data: {
      description: 'Read the Verbrix Privacy Policy to understand how we securely collect, use, and protect your personal and healthcare-related data.',
      breadcrumb: 'Privacy Policy'
    }
  },
  {
    path: 'legal/terms',
    loadComponent: () => import('./features/legal/terms-of-service').then(m => m.TermsOfServiceComponent),
    title: 'Terms of Service | Verbrix',
    data: {
      description: 'Review the terms and conditions for using the Verbrix medical interpretation platform for clients and interpreters.',
      breadcrumb: 'Terms of Service'
    }
  },
  {
    path: 'legal/deletion',
    loadComponent: () => import('./features/legal/data-deletion').then(m => m.DataDeletionComponent),
    title: 'Data Deletion Policy | Verbrix',
    data: {
      description: 'Learn how to request the deletion of your Verbrix account and personal data in accordance with our data protection policies.',
      breadcrumb: 'Data Deletion'
    }
  },
  {
    path: 'interpreters/browse',
    loadComponent: () => import('./features/interpreters/pages/public-interpreters').then(m => m.FindInterpreterComponent),
    title: 'Find Medical Interpreters in India | Verbrix',
    data: {
      description: 'Browse our directory of verified medical interpreters in India. Find translation specialists for Arabic, Russian, French, and more.',
      breadcrumb: 'Browse Interpreters'
    }
  },

  // 2. AUTHENTICATION
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes),
    data: { breadcrumb: 'Authentication' }
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/user-profile').then(m => m.UserProfileComponent),
    canActivate: [authGuard],
    title: 'Profile | Verbrix',
    data: {
      description: 'Manage your Verbrix profile, update your personal information, and configure your account settings.',
      breadcrumb: 'My Profile'
    }
  },

  // 3. INTERPRETER APPLICATION FLOW
  {
    path: 'interpreters/apply',
    loadComponent: () => import('./features/interpreters/pages/app-apply-interpreter').then(m => m.InterpreterApplyComponent),
    canActivate: [authGuard],
    title: 'Apply as Medical Interpreter | Verbrix',
    data: {
      description: 'Join Verbrix as a certified medical interpreter. Apply to help international patients navigate healthcare in India.',
      breadcrumb: 'Apply as Interpreter'
    }
  },
  {
    path: 'interpreters/re-apply',
    loadComponent: () => import('./features/interpreters/pages/app-apply-interpreter').then(m => m.InterpreterApplyComponent),
    canActivate: [authGuard],
    title: 'Update Interpreter Application | Verbrix',
    data: {
      description: 'Update or resubmit your medical interpreter application for the Verbrix platform.',
      breadcrumb: 'Update Application'
    }
  },

  // 4. DISCOVERY & PROFILES
  {
    path: 'interpreters/find',
    loadComponent: () => import('./features/interpreters/pages/find-interpreter').then(m => m.FindInterpreterComponent),
    canActivate: [authGuard],
    title: 'Search Interpreters | Verbrix',
    data: {
      description: 'Search and filter our network of verified medical interpreters to find the perfect match for your healthcare needs.',
      breadcrumb: 'Search Interpreters'
    }
  },
  {
    path: 'interpreters/:id',
    loadComponent: () => import('./features/interpreters/pages/interpreters-details').then(m => m.InterpreterDetailsComponent),
    canActivate: [authGuard],
    title: 'Interpreter Profile | Verbrix',
    data: {
      description: 'View detailed profiles, qualifications, and reviews of verified medical interpreters on Verbrix.',
      breadcrumb: 'Interpreter Profile'
    }
  },

  // 5. MESSAGING
  {
    path: 'messages',
    loadComponent: () => import('./features/communication/chat/chat-page').then(m => m.ChatPageComponent),
    canActivate: [authGuard],
    title: 'Messages & Conversations | Verbrix',
    data: {
      description: 'Securely communicate with medical interpreters or patients through the encrypted Verbrix messaging system.',
      breadcrumb: 'Messages'
    }
  },

  // 6. DASHBOARD ZONES
  {
    path: 'dashboard',
    canActivate: [authGuard],
    data: { breadcrumb: 'Dashboard' },
    children: [
      {
        path: 'client',
        canActivate: [roleGuard],
        data: { expectedRoles: [UserRole.CLIENT], breadcrumb: 'Client' },
        children: [
          {
            path: 'home',
            loadComponent: () => import('./features/client/pages/client-dashboard').then(m => m.ClientDashboard),
            title: 'Client Dashboard | Verbrix',
            data: {
              description: 'Manage your interpretation requests, view upcoming appointments, and track your healthcare communication.',
              breadcrumb: 'Overview'
            }
          },
          { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
      },
      {
        path: 'interpreter',
        canActivate: [roleGuard],
        data: { expectedRoles: [UserRole.INTERPRETER], breadcrumb: 'Interpreter' },
        children: [
          {
            path: 'home',
            loadComponent: () => import('./features/interpreters/pages/interpreter-dashboard').then(m => m.InterpreterDashboard),
            title: 'Interpreter Dashboard | Verbrix',
            data: {
              description: 'Manage your interpreter schedule, respond to client requests, and oversee your active assignments.',
              breadcrumb: 'Overview'
            }
          },
          { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { expectedRoles: [UserRole.ADMIN], breadcrumb: 'Admin' },
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
      }
    ]
  },

  // 7. GLOBAL FALLBACK
  {
    path: '**',
    loadComponent: () => import('./core/errors/not-found').then(m => m.NotFoundComponent),
    title: 'Page Not Found | Verbrix',
    data: { description: 'The page you are looking for does not exist. Return to the Verbrix homepage to find medical interpreters.' }
  }
];
