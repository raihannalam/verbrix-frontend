import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap, finalize } from 'rxjs';

export interface CurrentUserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CLIENT' | 'INTERPRETER' | 'ADMIN'; 
  // Add other fields you might need (profilePic, balance, etc.)
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  // Signal to hold the profile data
  private profileSignal = signal<CurrentUserProfile | null>(null);
  private loadingSignal = signal<boolean>(false);

  // Read-only signals for components
  profile = this.profileSignal.asReadonly();
  isLoading = this.loadingSignal.asReadonly();

  // Helper: easy access to current value
  get snapshot() {
    return this.profileSignal();
  }

  loadProfile() {
    // Avoid reloading if already loading
    if (this.loadingSignal()) return;

    this.loadingSignal.set(true);

    // Note: Ensure your backend has this endpoint:
    // @GetMapping("/api/v1/user/security/me")
    this.http.get<CurrentUserProfile>(`${this.API_URL}/user/security/me`)
      .pipe(
        tap(data => {
          // Normalize role strings just in case
          if (data.role && String(data.role).startsWith('ROLE_')) {
             // @ts-ignore
             data.role = data.role.replace('ROLE_', '');
          }
        }),
        finalize(() => this.loadingSignal.set(false))
      )
      .subscribe({
        next: (profile) => this.profileSignal.set(profile),
        error: (err) => {
          console.error('Failed to load user profile', err);
          // Don't set null immediately if transient error, logic depends on needs
          // this.profileSignal.set(null); 
        }
      });
  }

  clear() {
    this.profileSignal.set(null);
  }
}