import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs';

export interface ChatMessage {
  id: string; // Ensure this is unique from backend
  senderId: number;
  senderEmail: string;
  recipientId: number;
  content: string;
  timestamp: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' | 'PAYMENT_REQUEST';
  fileUrl?: string;
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
      map(response => response.content.reverse()) // Reverse so oldest is top
    );
  }

  joinVideoCall(relationshipId: number) {
    return this.http.post(`${this.apiUrl}/video/${relationshipId}/join`, {}, { responseType: 'text' });
  }

  uploadAttachment(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/files/upload`, formData);
  }
}