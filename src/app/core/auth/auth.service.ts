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
  private readonly USER_KEY = 'vx_user';
  private readonly DEVICE_ID_KEY = 'vx_device_id'; // 🟢 NEW: Store device ID

  private accessTokenSignal = signal<string | null>(this.getAccessToken());
  public readonly accessToken = this.accessTokenSignal.asReadonly();

  private currentUserSignal = signal<User | null>(null);
  public readonly currentUser = this.currentUserSignal.asReadonly();

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
          this.accessTokenSignal.set(token);
        } catch { this.logout(); }
      }
    }
  }

  // --- DEVICE TRACKING HELPERS (🟢 NEW) ---

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem(this.DEVICE_ID_KEY);
    if (!deviceId) {
      // FIX: Use 'typeof' to satisfy TypeScript's strict compiler checks
      // while safely falling back if randomUUID is missing at runtime (e.g., on HTTP)
      deviceId = (window.crypto && typeof window.crypto.randomUUID === 'function')
        ? window.crypto.randomUUID()
        : this.generateFallbackUUID();

      localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }

  private getDeviceDetails(): string {
    const ua = navigator.userAgent;
    let browser = 'Unknown Browser';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Chrome') || ua.includes('CriOS')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge') || ua.includes('Edg/')) browser = 'Edge';

    const os = navigator.platform || 'Unknown OS';
    return `Angular Web App (${browser} on ${os})`;
  }

  private generateFallbackUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // --- API METHODS ---

  requestRegistrationOtp(data: EmailRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.API_URL}/register/request-otp`, data);
  }

  verifyOtp(data: OtpVerificationRequest): Observable<OtpVerificationResponse> {
    return this.http.post<OtpVerificationResponse>(`${this.API_URL}/verify-otp`, data);
  }

  completeRegistration(data: Omit<RegistrationRequest, 'deviceId' | 'deviceDetails'>): Observable<LoginResponse> {
    const payload: RegistrationRequest = {
      ...data,
      deviceId: this.getOrCreateDeviceId(),
      deviceDetails: this.getDeviceDetails()
    };
    // 🟢 CRITICAL: withCredentials tells browser to accept the Set-Cookie header
    return this.http.post<LoginResponse>(`${this.API_URL}/register/complete`, payload, { withCredentials: true })
      .pipe(tap(response => this.handleLoginSuccess(response)));
  }

  login(data: Omit<LoginRequest, 'deviceId' | 'deviceDetails'>): Observable<LoginResponse> {
    const payload: LoginRequest = {
      ...data,
      deviceId: this.getOrCreateDeviceId(),
      deviceDetails: this.getDeviceDetails()
    };
    // 🟢 CRITICAL: withCredentials
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, payload, { withCredentials: true })
      .pipe(tap(response => this.handleLoginSuccess(response)));
  }

  socialLogin(data: Omit<SocialLoginRequest, 'deviceId' | 'deviceDetails'>): Observable<LoginResponse> {
    const payload: SocialLoginRequest = {
      ...data,
      deviceId: this.getOrCreateDeviceId(),
      deviceDetails: this.getDeviceDetails()
    };
    // 🟢 CRITICAL: withCredentials
    return this.http.post<LoginResponse>(`${this.API_URL}/social-login`, payload, { withCredentials: true })
      .pipe(tap(response => this.handleLoginSuccess(response)));
  }

  requestPasswordReset(data: EmailRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.API_URL}/password/request-reset`, data);
  }

  completePasswordReset(data: PasswordResetRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.API_URL}/password/complete-reset`, data);
  }

  logout(): void {
    // 🟢 The browser automatically sends the HttpOnly cookie, so body is empty
    this.http.post(`${this.API_URL}/logout`, {}, { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe();

    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    // 🟢 No token in body. The backend reads the `verbrix_refresh` cookie automatically
    return this.http.post<RefreshTokenResponse>(`${this.API_URL}/refresh-token`, {}, { withCredentials: true })
      .pipe(
        tap(response => {
          this.setAccessToken(response.accessToken);
          // 🟢 Notice we NO LONGER save the refresh token to memory!

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

  private handleLoginSuccess(response: LoginResponse): void {
    const role = this.extractStrictRole(response.roles);
    const user: User = { email: response.email, role: role };

    this.setAccessToken(response.jwtToken);
    // 🟢 Removed setRefreshToken()

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
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
    this.accessTokenSignal.set(token);
  }

  private clearSession(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    // 🟢 Removed REFRESH_TOKEN_KEY removal
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
