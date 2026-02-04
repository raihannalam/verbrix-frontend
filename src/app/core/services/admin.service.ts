import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface AdminRemarkRequest {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  // Matches @RequestMapping("/api/v1/admin/interpreters")
  private apiUrl = `${environment.apiUrl}/admin/interpreters`;

  // Get list of interpreters (optional filter by status)
  getAllInterpreters(status?: string): Observable<any[]> {
    const url = status ? `${this.apiUrl}?status=${status}` : this.apiUrl;
    return this.http.get<any[]>(url);
  }

  // Get full details
  getInterpreterDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Approve Application
  approveInterpreter(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/approve`, {});
  }

  // Request Changes (Reject with feedback)
  requestChanges(id: number, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/request-changes`, { message });
  }

  // Permanently Reject
  rejectPermanently(id: number, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/reject`, { message });
  }

  // Verify a specific certification doc
  verifyCertification(certId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/certifications/${certId}/verify`, {});
  }

  // Reject a certification doc
  rejectCertification(certId: number, message: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/certifications/${certId}/reject`, { message });
  }
}