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
        // 🟢 FIX: Catch errors for the refresh token call FIRST
        catchError((err) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next('FAILED');
          // (Note: authService.refreshToken() already calls this.logout() internally, so we don't need to do it twice)
          return throwError(() => err);
        }),
        // 🟢 FIX: Then, switch to the retried request.
        // Any 404s or 500s here will NOT trigger the catchError above.
        switchMap((tokenResponse) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(tokenResponse.accessToken);
          return next.handle(this.addToken(request, tokenResponse.accessToken));
        })
      );
    } else {
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
