import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Synchronous check: Signals are updated immediately from localStorage in the constructor
  if (authService.isLoggedIn() && authService.getAccessToken()) {
    return true;
  }

  // Not authenticated, redirect to login
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
};
