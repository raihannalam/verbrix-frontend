import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { map, catchError, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getAccessToken();

  // 1. If we have a token and it's NOT expired, let them right in.
  if (token && !authService.isTokenExpired(token)) {
    return true;
  }

  // 2. 🟢 THE FIX: If token exists but IS expired, PAUSE the router!
  // Wait for the background refresh request to finish before deciding.
  if (token && authService.isTokenExpired(token)) {
    return authService.refreshToken().pipe(
      map(() => true), // Refresh worked! Resume routing and load the page.
      catchError(() => {
        // Refresh failed (cookie died). Kick to login.
        return of(router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } }));
      })
    );
  }

  // 3. No token at all.
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
};
