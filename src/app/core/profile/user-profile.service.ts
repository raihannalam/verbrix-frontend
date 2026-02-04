import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs';

export interface CurrentUserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  // Ensure these match exactly what your backend sends (e.g., 'CLIENT' vs 'ROLE_CLIENT')
  role: 'CLIENT' | 'INTERPRETER' | 'ADMIN'; 
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  // Signal to hold the profile data
  private profileSignal = signal<CurrentUserProfile | null>(null);

  // Read-only signal for components
  profile = this.profileSignal.asReadonly();

  // Helper: easy access to current value without subscription
  get snapshot() {
    return this.profileSignal();
  }

  loadProfile() {
    // Prevent duplicate loading if we already have data
    if (this.profileSignal()) return;

    this.http.get<CurrentUserProfile>(`${this.API_URL}/user/security/me`)
      .pipe(
        tap(data => {
          // Normalize role if backend sends 'ROLE_CLIENT' but front-end expects 'CLIENT'
          if (data.role && data.role.startsWith('ROLE_')) {
            // @ts-ignore
            data.role = data.role.replace('ROLE_', '');
          }
          console.log('Profile Loaded:', data); // Debugging
        })
      )
      .subscribe({
        next: (profile) => this.profileSignal.set(profile),
        error: (err) => {
          console.error('Failed to load user profile', err);
          this.profileSignal.set(null);
        }
      });
  }

  clear() {
    this.profileSignal.set(null);
  }
}