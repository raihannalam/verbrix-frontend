import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// Keep this declaration
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
  private apiUrl = environment.apiUrl;

  // 1. Create Order
  createConsultationOrder(relationshipId: number) {
    return this.http.post<OrderResponse>(
      `${this.apiUrl}/payments/consultation/${relationshipId}`, 
      {}
    );
  }

  // 2. Open Gateway (Now with Script Loading)
  openGateway(order: OrderResponse, userEmail: string, onSuccess: (res: any) => void, onFailure: (err: any) => void) {
    
    // Check if SDK is loaded
    this.loadRazorpayScript().then(() => {
      
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Verbrix Health',
        description: 'Consultation Fee',
        order_id: order.razorpayOrderId,
        prefill: { email: userEmail },
        theme: { color: '#2563eb' },
        handler: (response: any) => {
          console.log('Razorpay Response:', response);
          onSuccess(response);
        },
        modal: {
          ondismiss: () => onFailure('Payment cancelled by user')
        }
      };

      try {
        const rzp = new Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          console.error('Razorpay Failure:', response.error);
          onFailure(response.error);
        });
        rzp.open();
      } catch (e) {
        console.error('Razorpay Initialization Failed:', e);
        onFailure('Payment system error');
      }

    }).catch(err => {
      console.error(err);
      onFailure('Could not load payment gateway. Please check your internet connection.');
    });
  }

  // Helper: Lazy Load Script
  private loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof Razorpay === 'function') {
        resolve(); // Already loaded
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject('Razorpay SDK failed to load');
      document.body.appendChild(script);
    });
  }
}