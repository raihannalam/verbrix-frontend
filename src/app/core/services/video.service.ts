import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VideoService {
  private http = inject(HttpClient);
  // Ensure this points to your base API, e.g., 'http://localhost:8080/api/v1'
  private apiUrl = environment.apiUrl; 

  /**
   * Fetches a LiveKit JWT for the given relationship.
   * responseType: 'text' is required because the backend returns a raw String, not JSON.
   */
  getCallToken(relationshipId: number): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/video/${relationshipId}/join`, 
      {}, // Empty body is required for POST, even if not used
      { responseType: 'text' } // 🟢 Vital: Prevents JSON parsing errors
    );
  }
}