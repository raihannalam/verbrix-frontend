import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

declare var Razorpay: any;

export interface OrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/api/v1`;

  // 1. Create Order
  createConsultationOrder(relationshipId: number) {
    return this.http.post<OrderResponse>(
      `${this.apiUrl}/payments/consultation/${relationshipId}`, 
      {}
    );
  }

  // 🟢 2. Verify Payment (Crucial for Database Update)
  verifyPayment(response: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments/verify`, {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature
    });
  }

  // 3. Open Gateway
  openGateway(order: OrderResponse, userEmail: string, onSuccess: (res: any) => void, onFailure: (err: any) => void) {
    this.loadRazorpayScript().then(() => {
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Verbrix',
        description: 'Consultation Fee',
        order_id: order.razorpayOrderId,
        prefill: { email: userEmail },
        theme: { color: '#2563eb' },
        handler: (response: any) => {
          // Send to backend for verification
          this.verifyPayment(response).subscribe({
             next: (verifyRes) => onSuccess(verifyRes),
             error: (err) => onFailure(err)
          });
        },
        modal: {
          ondismiss: () => onFailure('Payment cancelled')
        }
      };
      
      const rzp = new Razorpay(options);
      rzp.on('payment.failed', (response: any) => onFailure(response.error));
      rzp.open();

    }).catch(err => onFailure(err));
  }

  private loadRazorpayScript(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof Razorpay === 'function') return resolve();
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }
}