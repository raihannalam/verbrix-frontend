import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// --- Interfaces ---

export interface ConnectRequest {
  // FIXED: Matches Java 'private Long interpreterProfileId;'
  interpreterProfileId: number; 
  initialMessage: string;
}

export interface LanguageAbility {
  language: string;
  proficiency: string;
}

export interface InterpreterProfile {
  id: number;
  firstName: string;
  lastName: string;
  bio: string;
  profilePictureUrl?: string;
  introVideoUrl?: string;
  experienceYears?: number;
  consultationFees?: number;
  consultationFee?: number;
  specializations: string[];
  languages: LanguageAbility[];
  rating: number;
  ratingCount: number;
  online: boolean;
  available: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getInterpreterById(id: string | number): Observable<InterpreterProfile> {
    return this.http.get<InterpreterProfile>(`${this.apiUrl}/clients/interpreters/${id}`);
  }

  connectToInterpreter(request: ConnectRequest): Observable<any> {
    // Matches @PostMapping("/connect") in RelationshipController
    return this.http.post(`${this.apiUrl}/relationships/connect`, request);
  }
}