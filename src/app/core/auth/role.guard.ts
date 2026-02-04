import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { UserRole } from '../models/auth.models';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Retrieve required roles from Route Data
  const expectedRoles = route.data['expectedRoles'] as UserRole[];

  if (!expectedRoles || expectedRoles.length === 0) {
    console.error('RoleGuard Configuration Error: No expectedRoles defined for route', route.url);
    return false;
  }

  // 2. Synchronous User Check (Signals)
  const user = authService.currentUser();

  // A. Not logged in? -> Login
  if (!user || !user.role) {
    return router.createUrlTree(['/auth/login'], { 
      queryParams: { returnUrl: state.url } 
    });
  }

  // B. Has correct role? -> Allow
  if (expectedRoles.includes(user.role)) {
    return true;
  }

  // C. Logged in but wrong role? -> Dashboard (Prevent infinite loops)
  console.warn(`Access Denied: User role '${user.role}' is not authorized for this route.`);
  return router.createUrlTree(['/dashboard']);
};