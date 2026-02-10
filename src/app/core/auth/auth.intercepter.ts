import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);
  
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getAccessToken();
    
    // 1. Identify Auth Endpoints (No token needed usually)
    const isAuthEndpoint = request.url.includes('/auth/login') || 
                           request.url.includes('/auth/refresh-token') ||
                           request.url.includes('/auth/register') ||
                           request.url.includes('/auth/social-login');

    // 🔴 FIX: Validate token existence AND length to prevent "Invalid compact JWT" backend error
    // "null" string or empty string will fail this check.
    const isValidToken = token && token.length > 20;

    if (isValidToken && !isAuthEndpoint) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError(error => {
        // 2. Handle 401s ONLY if it's not a login/auth attempt
        if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthEndpoint) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<unknown>, token: string) {
    return request.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((tokenResponse) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(tokenResponse.accessToken);
          return next.handle(this.addToken(request, tokenResponse.accessToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          // 🔴 Only logout if the REFRESH itself fails. 
          // If a random API call fails (e.g. wrong role), do NOT logout, just throw error.
          this.authService.logout(); 
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(this.addToken(request, jwt!));
        })
      );
    }
  }
}