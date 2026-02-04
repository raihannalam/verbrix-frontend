import { Injectable, computed, signal, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment'; 
import { 
  LoginRequest, 
  LoginResponse, 
  User, 
  UserRole, 
  RefreshTokenResponse, 
  EmailRequest, 
  MessageResponse, 
  OtpVerificationRequest, 
  OtpVerificationResponse, 
  RegistrationRequest, 
  PasswordResetRequest, 
  SocialLoginRequest 
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // 1. Dependencies (Modern 'inject' style)
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = `${environment.apiBaseUrl}/api/v1/auth`;
  private readonly ACCESS_TOKEN_KEY = 'vx_access_token';
  private readonly REFRESH_TOKEN_KEY = 'vx_refresh_token';
  private readonly USER_KEY = 'vx_user';

  // ----------------------------------------------------
  // 2. STATE MANAGEMENT (SIGNALS)
  // ----------------------------------------------------
  
  // The core state container
  private currentUserSignal = signal<User | null>(null);

  // Public read-only signal for components to consume
  public readonly currentUser = this.currentUserSignal.asReadonly();

  // Computed Signals (Derived state - efficient & automatic)
  public readonly isLoggedIn = computed(() => !!this.currentUser());
  public readonly isClient = computed(() => this.currentUser()?.role === UserRole.CLIENT);
  public readonly isInterpreter = computed(() => this.currentUser()?.role === UserRole.INTERPRETER);
  public readonly isAdmin = computed(() => this.currentUser()?.role === UserRole.ADMIN);

  constructor() {
    this.loadUserFromStorage();
  }

  // ----------------------------------------------------
  // 3. API METHODS
  // ----------------------------------------------------

  requestRegistrationOtp(data: EmailRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.API_URL}/register/request-otp`, data);
  }

  verifyOtp(data: OtpVerificationRequest): Observable<OtpVerificationResponse> {
    return this.http.post<OtpVerificationResponse>(`${this.API_URL}/verify-otp`, data);
  }

  completeRegistration(data: RegistrationRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/register/complete`, data)
      .pipe(tap(response => this.handleLoginSuccess(response)));
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, data)
      .pipe(tap(response => this.handleLoginSuccess(response)));
  }

  socialLogin(data: SocialLoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/social-login`, data)
      .pipe(tap(response => this.handleLoginSuccess(response)));
  }

  requestPasswordReset(data: EmailRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.API_URL}/password/request-reset`, data);
  }

  completePasswordReset(data: PasswordResetRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.API_URL}/password/complete-reset`, data);
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();
    
    // 1. Attempt backend invalidation (fire & forget style)
    if (refreshToken) {
      this.http.post(`${this.API_URL}/logout`, { refreshToken })
        .pipe(catchError(() => of(null))) // Ignore errors on logout
        .subscribe();
    }

    // 2. Clear local state
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout(); // Force logout if no token exists
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<RefreshTokenResponse>(`${this.API_URL}/refresh-token`, { refreshToken })
      .pipe(
        tap(response => {
          this.setAccessToken(response.accessToken);
          this.setRefreshToken(response.refreshToken);
        }),
        catchError(err => {
          // Critical: If refresh fails (expired/invalid), wipe session immediately
          this.logout();
          return throwError(() => err);
        })
      );
  }

  // ----------------------------------------------------
  // 4. HELPERS & STORAGE
  // ----------------------------------------------------

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private handleLoginSuccess(response: LoginResponse): void {
    // 1. Strict Role Extraction
    const role = this.extractStrictRole(response.roles);
    
    const user: User = {
      email: response.email,
      role: role
    };

    // 2. Persist Data
    this.setAccessToken(response.accessToken);
    this.setRefreshToken(response.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    // 3. Update Signal State
    this.currentUserSignal.set(user);
  }

  private extractStrictRole(roles: string[]): UserRole {
    if (roles.includes(UserRole.ADMIN)) return UserRole.ADMIN;
    if (roles.includes(UserRole.INTERPRETER)) return UserRole.INTERPRETER;
    if (roles.includes(UserRole.CLIENT)) return UserRole.CLIENT;
    
    throw new Error('Security Error: User has no recognized role.');
  }

  private setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  private clearSession(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Clear Signal State
    this.currentUserSignal.set(null);
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        // Validate integrity of stored user data
        if (user && user.role && Object.values(UserRole).includes(user.role)) {
          this.currentUserSignal.set(user);
        } else {
          this.clearSession(); // Data corrupted/tampered
        }
      } catch (e) {
        console.error('Storage parse error', e);
        this.clearSession();
      }
    }
  }
}