import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment'; 
import { 
  LoginRequest, LoginResponse, User, UserRole, RefreshTokenResponse, 
  EmailRequest, MessageResponse, OtpVerificationRequest, OtpVerificationResponse, 
  RegistrationRequest, PasswordResetRequest, SocialLoginRequest 
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = `${environment.apiBaseUrl}/api/v1/auth`;
  private readonly ACCESS_TOKEN_KEY = 'vx_access_token';
  private readonly REFRESH_TOKEN_KEY = 'vx_refresh_token';
  private readonly USER_KEY = 'vx_user';

  // 🟢 FIX 1: Create a Signal for the Access Token
  // This allows RealtimeService to "react" when the token changes
  private accessTokenSignal = signal<string | null>(this.getAccessToken());
  public readonly accessToken = this.accessTokenSignal.asReadonly();

  private currentUserSignal = signal<User | null>(null);
  public readonly currentUser = this.currentUserSignal.asReadonly();

  // Computed Signals
  public readonly isLoggedIn = computed(() => !!this.currentUser());
  public readonly isClient = computed(() => this.currentUser()?.role === UserRole.CLIENT);
  public readonly isInterpreter = computed(() => this.currentUser()?.role === UserRole.INTERPRETER);
  public readonly isAdmin = computed(() => this.currentUser()?.role === UserRole.ADMIN);

  constructor() {
    this.initializeUser();
  }

  private initializeUser(): void {
    const userJson = localStorage.getItem(this.USER_KEY);
    const token = this.getAccessToken();

    if (userJson && token) {
      if (this.isTokenExpired(token)) {
        this.refreshToken().subscribe({
            error: () => this.logout() 
        });
      } else {
        try {
            const user = JSON.parse(userJson);
            this.currentUserSignal.set(user);
            // Ensure signal is in sync
            this.accessTokenSignal.set(token); 
        } catch { this.logout(); }
      }
    }
  }

  // --- API METHODS ---

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
    if (refreshToken) {
      this.http.post(`${this.API_URL}/logout`, { refreshToken })
        .pipe(catchError(() => of(null)))
        .subscribe();
    }
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token'));
    }

    return this.http.post<RefreshTokenResponse>(`${this.API_URL}/refresh-token`, { refreshToken })
      .pipe(
        tap(response => {
          this.setAccessToken(response.accessToken);
          this.setRefreshToken(response.refreshToken);
          
          const userJson = localStorage.getItem(this.USER_KEY);
          if (userJson && !this.currentUser()) {
             this.currentUserSignal.set(JSON.parse(userJson));
          }
        }),
        catchError(err => {
          this.logout();
          return throwError(() => err);
        })
      );
  }

  // --- HELPERS ---

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private handleLoginSuccess(response: LoginResponse): void {
    const role = this.extractStrictRole(response.roles);
    const user: User = { email: response.email, role: role };

    this.setAccessToken(response.accessToken);
    this.setRefreshToken(response.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    this.currentUserSignal.set(user);
  }

  private extractStrictRole(roles: string[]): UserRole {
    if (roles.includes(UserRole.ADMIN)) return UserRole.ADMIN;
    if (roles.includes(UserRole.INTERPRETER)) return UserRole.INTERPRETER;
    if (roles.includes(UserRole.CLIENT)) return UserRole.CLIENT;
    throw new Error('Security Error: User has no recognized role.');
  }

  // 🟢 FIX 2: Update the Signal whenever token changes
  private setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    this.accessTokenSignal.set(token); 
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  // 🟢 FIX 3: Clear the Signal on logout
  private clearSession(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.accessTokenSignal.set(null);
  }

  public isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < (Date.now() + 10000); 
    } catch (e) { return true; }
  }
}