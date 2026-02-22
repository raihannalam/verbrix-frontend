import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
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

    // 🟢 CRITICAL FOR PROD: Do NOT attach the token to auth endpoints.
    // This allows the /refresh-token call to reach api.verbrix.com "clean"
    // so the server can use the HttpOnly cookie instead of a dead Bearer header.
    const isAuthRequest = request.url.includes('/api/v1/auth/');

    if (token && !isAuthRequest) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError(error => {
        // Ignore errors from the background status check to prevent logout loops
        const isStatusRequest = request.url.includes('/interpreters/me/status');

        if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthRequest && !isStatusRequest) {
          return this.handle401Error(request, next);
        }

        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<unknown>, token: string) {
    return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((tokenResponse) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(tokenResponse.accessToken);
          // Retry original request with the new fresh token
          return next.handle(this.addToken(request, tokenResponse.accessToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next('FAILED');
          this.authService.logout(); // Refresh failed (cookie gone/expired) -> Kick to Login
          return throwError(() => err);
        })
      );
    } else {
      // If a refresh is already in progress, wait for it to finish and use the new token
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(jwt => {
          if (jwt === 'FAILED') return throwError(() => new Error('Refresh failed'));
          return next.handle(this.addToken(request, jwt!));
        })
      );
    }
  }
}
