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
  private readonly DEVICE_ID_KEY = 'vx_device_id';

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

  // --- DEVICE TRACKING HELPERS ---

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem(this.DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = (window.crypto && typeof window.crypto.randomUUID === 'function')
        ? window.crypto.randomUUID()
        : this.generateFallbackUUID();

      localStorage.setItem(this.DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }

  private getDeviceDetails(): string {
    const ua = navigator.userAgent || '';
    let client = 'Unknown Browser';
    let os = 'Unknown OS';
    let version = '';

    // 1. Detect OS
    if (ua.includes('Win')) {
      os = 'Windows';
    } else if (ua.includes('Android')) {
      os = 'Android';
    } else if (ua.includes('iPhone') || ua.includes('iPod')) {
      os = 'iOS (iPhone)';
    } else if (ua.includes('iPad') || (ua.includes('Mac') && navigator && navigator.maxTouchPoints > 1)) {
      os = 'iOS (iPad)';
    } else if (ua.includes('Mac')) {
      os = 'macOS';
    } else if (ua.includes('CrOS')) {
      os = 'Chrome OS';
    } else if (ua.includes('Linux')) {
      os = 'Linux';
    }

    // 2. Detect Native Mobile Apps
    const isIOSWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua);
    const isAndroidWebView = ua.includes('wv') || (ua.includes('Android') && ua.includes('Version/'));
    const isCapacitor = ua.includes('Capacitor');
    const isCordova = ua.includes('Cordova');

    if (isIOSWebView || isAndroidWebView || isCapacitor || isCordova) {
      return `Native App on ${os}`;
    }

    // 3. Detect Browsers & Versions
    if (ua.includes('SamsungBrowser')) {
      client = 'Samsung Internet';
      version = (ua.match(/SamsungBrowser\/([\d.]+)/) || [])[1] || '';
    } else if (ua.includes('UCBrowser')) {
      client = 'UC Browser';
      version = (ua.match(/UCBrowser\/([\d.]+)/) || [])[1] || '';
    } else if (ua.includes('YaBrowser')) {
      client = 'Yandex';
      version = (ua.match(/YaBrowser\/([\d.]+)/) || [])[1] || '';
    } else if (ua.includes('OPR') || ua.includes('Opera')) {
      client = 'Opera';
      version = (ua.match(/(?:OPR|Opera)\/([\d.]+)/) || [])[1] || '';
    } else if (ua.includes('Edg')) {
      client = 'Edge';
      version = (ua.match(/Edg\/([\d.]+)/) || [])[1] || '';
    } else if (ua.includes('Firefox') || ua.includes('FxiOS')) {
      client = 'Firefox';
      version = (ua.match(/(?:Firefox|FxiOS)\/([\d.]+)/) || [])[1] || '';
    } else if (ua.includes('Chrome') || ua.includes('CriOS')) {
      client = 'Chrome';
      version = (ua.match(/(?:Chrome|CriOS)\/([\d.]+)/) || [])[1] || '';
    } else if (ua.includes('Safari') && ua.includes('Version')) {
      client = 'Safari';
      version = (ua.match(/Version\/([\d.]+)/) || [])[1] || '';
    }

    const majorVersion = version ? ` ${version.split('.')[0]}` : '';
    return `${client}${majorVersion} on ${os}`;
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
    return this.http.post<LoginResponse>(`${this.API_URL}/register/complete`, payload, { withCredentials: true })
      .pipe(tap(response => this.handleLoginSuccess(response)));
  }

  login(data: Omit<LoginRequest, 'deviceId' | 'deviceDetails'>): Observable<LoginResponse> {
    const payload: LoginRequest = {
      ...data,
      deviceId: this.getOrCreateDeviceId(),
      deviceDetails: this.getDeviceDetails()
    };
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, payload, { withCredentials: true })
      .pipe(tap(response => this.handleLoginSuccess(response)));
  }

  socialLogin(data: Omit<SocialLoginRequest, 'deviceId' | 'deviceDetails'>): Observable<LoginResponse> {
    const payload: SocialLoginRequest = {
      ...data,
      deviceId: this.getOrCreateDeviceId(),
      deviceDetails: this.getDeviceDetails()
    };
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
    // 🟢 FIX: Send null instead of {} to prevent Spring Boot @Valid crash
    this.http.post(`${this.API_URL}/logout`, null, { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe();

    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  logoutAll(): Observable<any> {
    // 🟢 FIX: Send null instead of {}
    return this.http.post(`${this.API_URL}/logout-all`, null, { withCredentials: true })
      .pipe(
        tap(() => {
          this.clearSession();
          this.router.navigate(['/auth/login']);
        }),
        catchError((err) => {
          this.clearSession();
          this.router.navigate(['/auth/login']);
          return throwError(() => err);
        })
      );
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    // 🟢 FIX: Send null instead of {} to prevent Spring Boot @Valid crash
    return this.http.post<RefreshTokenResponse>(`${this.API_URL}/refresh-token`, null, { withCredentials: true })
      .pipe(
        tap(response => {
          this.setAccessToken(response.accessToken);
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
