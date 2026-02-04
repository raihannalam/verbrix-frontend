import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Synchronous check using Signals
  // We check the computed signal 'isLoggedIn()' which is very efficient.
  // We also double-check getAccessToken() to ensure the token hasn't been manually cleared.
  if (authService.isLoggedIn() && authService.getAccessToken()) {
    return true;
  }

  // 2. Not authenticated? Redirect to login with return URL
  return router.createUrlTree(['/auth/login'], { 
    queryParams: { returnUrl: state.url } 
  });
};