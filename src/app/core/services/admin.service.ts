import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { 
  InterpreterSummaryResponse, 
  InterpreterDetailResponse, 
  AdminRemarkRequest 
} from '../../admin/models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/interpreters`;

  // --- List View ---
  getAllInterpreters(status?: string): Observable<InterpreterSummaryResponse[]> {
    const url = status ? `${this.apiUrl}?status=${status}` : this.apiUrl;
    return this.http.get<InterpreterSummaryResponse[]>(url);
  }

  // --- Detail View ---
  getInterpreterDetails(id: number): Observable<InterpreterDetailResponse> {
    return this.http.get<InterpreterDetailResponse>(`${this.apiUrl}/${id}`);
  }

  // --- Application Actions ---
  approveInterpreter(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/approve`, {});
  }

  requestChanges(id: number, message: string): Observable<any> {
    const body: AdminRemarkRequest = { message };
    return this.http.post(`${this.apiUrl}/${id}/request-changes`, body);
  }

  rejectPermanently(id: number, message: string): Observable<any> {
    const body: AdminRemarkRequest = { message };
    return this.http.post(`${this.apiUrl}/${id}/reject`, body);
  }

  // --- Document Verification ---
  verifyCertification(certId: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/certifications/${certId}/verify`, {});
  }

  rejectCertification(certId: number, message: string): Observable<any> {
    const body: AdminRemarkRequest = { message };
    return this.http.patch(`${this.apiUrl}/certifications/${certId}/reject`, body);
  }
}