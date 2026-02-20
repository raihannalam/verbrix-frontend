import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap, catchError, of } from 'rxjs';

export interface UserProfileResponse {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePictureUrl?: string;
}

export interface UserDevice {
  id: number;
  deviceIdentifier: string; // e.g., device UUID
  deviceDetails: string;    // e.g., "Chrome on Windows"
  location: string;
  ipAddress: string;
  lastLogin: string;        // ISO Date string
  isVerified: boolean;
}

export interface UserProfileUpdateRequest {
  firstName: string;
  lastName: string;
  phone: string;
  profilePictureUrl?: string; // <-- ADDED THIS
}

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiBaseUrl}/api/v1/users/me`;
  private readonly FILE_API_URL = `${environment.apiBaseUrl}/api/v1/files/upload`; // <-- ADDED THIS
  private readonly SECURITY_API_URL = `${environment.apiBaseUrl}/api/v1/user/security`; // <-- New Base URL
  private readonly AUTH_API_URL = `${environment.apiBaseUrl}/api/v1/auth`;

  profile = signal<UserProfileResponse | null>(null);

  loadProfile(): void {
    this.getProfile().pipe(
      catchError(err => {
        console.error('Failed to load global profile', err);
        return of(null);
      })
    ).subscribe();
  }

  getProfile(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(this.API_URL).pipe(
      tap(data => this.profile.set(data))
    );
  }

  updateProfile(request: UserProfileUpdateRequest): Observable<UserProfileResponse> {
    return this.http.put<UserProfileResponse>(this.API_URL, request).pipe(
      tap(data => this.profile.set(data))
    );
  }

  updatePassword(request: PasswordUpdateRequest): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/password`, request);
  }

  // --- NEW FILE UPLOAD METHOD ---
  uploadFile(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(this.FILE_API_URL, formData);
  }

  getActiveDevices(): Observable<UserDevice[]> {
    return this.http.get<UserDevice[]>(`${this.SECURITY_API_URL}/active-devices`);
  }

  removeDevice(deviceId: number): Observable<void> {
    return this.http.delete<void>(`${this.SECURITY_API_URL}/devices/${deviceId}`);
  }
  logoutAllDevices(): Observable<any> {
    // We send an empty object {} since the RequestBody is not strictly required
    return this.http.post(`${this.AUTH_API_URL}/logout-all`, {});
  }

  clear(): void {
    this.profile.set(null);
  }
}
