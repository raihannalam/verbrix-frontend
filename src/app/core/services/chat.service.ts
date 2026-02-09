import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs';

export interface ChatMessage {
  id: string;
  senderId: number;
  senderEmail: string;
  recipientId: number;
  content: string;
  timestamp: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' | 'PAYMENT_REQUEST'; // Updated types
  fileUrl?: string; // Optional URL for attachments
  isRead: boolean;
  relationshipId: number;

  paymentDetails?: {
    amount: number;
    description: string;
    status: 'PENDING' | 'PAID';
    };
}



@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/api/v1`;

  getMyRelationships() {
    return this.http.get<any[]>(`${this.apiUrl}/relationships/mine`);
  }

  getChatHistory(relationshipId: number, page = 0) {
    return this.http.get<any>(`${this.apiUrl}/chat/${relationshipId}/history?page=${page}`).pipe(
      map(response => response.content.reverse())
    );
  }

  joinVideoCall(relationshipId: number) {
    return this.http.post(`${this.apiUrl}/video/${relationshipId}/join`, {}, { responseType: 'text' });
  }

  // 🟢 NEW: Upload File
  uploadAttachment(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    // Assuming you have a FileController at /api/v1/files/upload
    return this.http.post<{ url: string }>(`${this.apiUrl}/files/upload`, formData);
  }
}