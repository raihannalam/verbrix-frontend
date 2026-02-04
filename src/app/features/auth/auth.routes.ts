import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    // 1. Updated path to standard CLI structure: ./login/login.component
    // 2. Updated class name to match: LoginComponent
    loadComponent: () => import('./login').then(m => m.LoginComponent),
    title: 'Sign In | Verbrix'
  },
  {
    path: 'register',
    // 1. Updated path to standard CLI structure: ./register/register.component
    // 2. Updated class name to match: RegisterComponent
    loadComponent: () => import('./register').then(m => m.RegisterComponent),
    title: 'Create Account | Verbrix'
  },
  {
    path: 'password-reset',
    // Assuming standard naming for the password reset component as well
    loadComponent: () => import('./password-reset').then(m => m.PasswordReset),
    title: 'Reset Password | Verbrix'
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];