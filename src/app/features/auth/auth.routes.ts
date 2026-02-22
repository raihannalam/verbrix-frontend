import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login').then(m => m.LoginComponent),
    title: 'Sign In | Verbrix',
    data: {
      description: 'Sign in to your Verbrix account to manage your medical interpretation requests or access your interpreter dashboard.',
      breadcrumb: 'Sign In'
    }
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register').then(m => m.RegisterComponent),
    title: 'Create Account | Verbrix',
    data: {
      description: 'Create a Verbrix account to connect with verified medical interpreters in India or apply to join our translation network.',
      breadcrumb: 'Create Account'
    }
  },
  {
    path: 'password-reset',
    loadComponent: () => import('./pages/password-reset').then(m => m.PasswordReset),
    title: 'Reset Password | Verbrix',
    data: {
      description: 'Reset the password for your Verbrix account securely to regain access to your medical interpreter or client profile.',
      breadcrumb: 'Reset Password'
    }
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
