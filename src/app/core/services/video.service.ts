import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VideoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Calls VideoCallController.joinCall
  getCallToken(relationshipId: number) {
    return this.http.post(
      `${this.apiUrl}/video/${relationshipId}/join`, 
      {}, 
      { responseType: 'text' } // Token is returned as a plain string
    );
  }
}