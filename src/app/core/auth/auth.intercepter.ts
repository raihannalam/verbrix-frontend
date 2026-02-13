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

    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError(error => {
        // 🟢 FIX 1: Ignore Auth endpoints
        const isAuthRequest = request.url.includes('auth/login') || request.url.includes('auth/refresh-token');
        
        // 🟢 FIX 2: Ignore the Status endpoint. 
        // If this returns 401 (e.g. slight delay in token), we don't want to log the user out.
        // We just want the dashboard to treat it as "Not Applied Yet" (null).
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
          console.error('Full Error:', err);

          // Logout only if refresh fails
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