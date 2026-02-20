import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getAccessToken();

    // OPTIONAL: Prevent attaching tokens to auth endpoints to avoid 401s completely
    // const isAuthEndpoint = request.url.includes('/auth/');
    // if (token && !isAuthEndpoint) { ... }

    // Current logic (Attaches token to everything if it exists)
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError(error => {
        // 🟢 FIX 1: EXCLUDE ALL AUTH ENDPOINTS
        // We must include 'social-login', 'register', etc. so the interceptor
        // doesn't try to refresh a token when we are actually trying to log in.
        const isAuthRequest =
            request.url.includes('auth/login') ||
            request.url.includes('auth/social-login') ||
            request.url.includes('auth/register') ||
            request.url.includes('auth/refresh-token');

        // 🟢 FIX 2: Ignore the Status endpoint
        const isStatusRequest = request.url.includes('/interpreters/me/status');

        if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthRequest && !isStatusRequest) {
          return this.handle401Error(request, next);
        }

        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<unknown>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
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

          // Debugging Log
          console.error('Auto-Logout triggered by 401 from URL:', request.url);

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
