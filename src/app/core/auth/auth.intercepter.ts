// src/app/core/auth/auth.interceptor.ts
import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment'; // Adjust path as needed

// 🟢 Module-level variables maintain state across requests without needing a Class
let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

// Helper function to clone request and add token
const addToken = (request: HttpRequest<unknown>, token: string): HttpRequest<unknown> => {
  return request.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
};

// Helper function to handle the 401 queueing logic
const handle401Error = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<unknown>> => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      catchError((err) => {
        isRefreshing = false;
        refreshTokenSubject.next('FAILED');
        // authService.refreshToken() already handles logout routing internally
        return throwError(() => err);
      }),
      switchMap((tokenResponse: any) => { // Adjust type based on your token response model
        isRefreshing = false;
        refreshTokenSubject.next(tokenResponse.accessToken);
        return next(addToken(request, tokenResponse.accessToken));
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(jwt => {
        if (jwt === 'FAILED') return throwError(() => new Error('Refresh token failed'));
        return next(addToken(request, jwt!));
      })
    );
  }
};

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // 🟢 CRITICAL SECURITY: Only attach tokens to YOUR backend, never to 3rd party APIs
  const isApiUrl = request.url.startsWith(environment.apiUrl);
  const isAuthRequest = request.url.includes('/api/v1/auth/');

  let modifiedRequest = request;

  // Attach token if it's our API, not an auth request, and we have a token
  if (isApiUrl && token && !isAuthRequest) {
    modifiedRequest = addToken(request, token);
  }

  // Note: Functional interceptors use next(req) instead of next.handle(req)
  return next(modifiedRequest).pipe(
    catchError((error: any) => {
      const isStatusRequest = request.url.includes('/interpreters/me/status');

      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isAuthRequest &&
        !isStatusRequest
      ) {
        return handle401Error(modifiedRequest, next, authService);
      }

      return throwError(() => error);
    })
  );
};
