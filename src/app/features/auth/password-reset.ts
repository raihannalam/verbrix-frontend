import { Component, inject, signal, OnDestroy } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth.service';
import { EmailRequest, PasswordResetRequest, OtpVerificationResponse } from '../../core/models/auth.models';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen w-full flex bg-bg-page">
      
      <div class="hidden lg:flex lg:w-1/2 relative bg-brand-surface overflow-hidden items-center justify-center p-12">
        <div class="absolute inset-0">
          <div class="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500 blur-[150px] opacity-20 rounded-full mix-blend-multiply"></div>
          <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500 blur-[150px] opacity-20 rounded-full mix-blend-multiply"></div>
        </div>

        <div class="relative z-10 max-w-lg text-center">
          <div class="mb-8">
            <a routerLink="/" class="block hover:opacity-80 transition-opacity">
              <img src="assets/images/logo.png" alt="Verbrix" class="h-16 w-auto mx-auto drop-shadow-lg" />
            </a>
          </div>
          <h2 class="text-3xl font-bold text-text-main mb-4">Secure Account Recovery</h2>
          <p class="text-lg text-text-muted leading-relaxed">
            We use secure OTP verification to ensure only you can access your account. Your safety is our priority.
          </p>
        </div>
      </div>

      <div class="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        <a routerLink="/auth/login" class="absolute top-6 left-6 flex items-center gap-2 text-text-muted hover:text-brand transition-colors lg:hidden touch-manipulation">
           <i class="ri-arrow-left-line"></i>
           <span class="text-sm font-bold">Back to Login</span>
        </a>

        <div class="w-full max-w-md animate-fade-in-up">
          
          <div class="text-center mb-10">
            <h1 class="text-3xl font-bold text-text-main mb-2">Reset Password</h1>
            <p class="text-text-muted">
              @if (step() === 'enterEmail') { Enter your email to receive a code. }
              @else if (step() === 'enteredOtp') { Enter the code sent to your email. }
              @else { Create a strong new password. }
            </p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">

            @if (step() === 'enterEmail') {
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-wider text-text-muted">Email Address</label>
                <div class="relative">
                  <input type="email" formControlName="email" class="w-full h-12 pl-10 px-4 rounded-xl bg-bg-surface border border-transparent text-text-main focus:bg-bg-page focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all placeholder:text-text-dim" placeholder="name@email.com" />
                  <i class="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"></i>
                </div>
                @if (form.controls.email.invalid && form.controls.email.touched) {
                  <p class="text-xs text-red-500 font-medium">Please enter a valid email.</p>
                }
              </div>

              <button type="submit" [disabled]="loading() || form.controls.email.invalid" class="w-full h-12 rounded-xl bg-brand text-white font-bold text-base shadow-lg hover:bg-brand-hover active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center touch-manipulation">
                {{ loading() ? 'Sending Code...' : 'Send Verification Code' }}
              </button>
            }

            @if (step() === 'enteredOtp') {
              <div class="space-y-4">
                <div class="p-4 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 text-sm flex items-start gap-3">
                  <i class="ri-mail-lock-line text-lg mt-0.5"></i>
                  <div>
                    <span class="font-bold">Check your inbox</span><br/>
                    We sent a 6-digit code to <span class="font-semibold">{{ form.controls.email.value }}</span>
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-bold uppercase tracking-wider text-text-muted">Verification Code</label>
                  <input type="text" formControlName="otp" maxlength="6" class="w-full h-12 px-4 rounded-xl bg-bg-surface border border-transparent text-text-main focus:bg-bg-page focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all placeholder:text-text-dim text-center text-2xl tracking-[0.5em] font-mono" placeholder="••••••" />
                </div>

                <div class="flex items-center justify-between text-sm">
                  @if (canResend()) {
                    <button type="button" (click)="resendOtp()" class="text-brand font-semibold hover:underline touch-manipulation">Resend Code</button>
                  } @else {
                    <span class="text-text-muted">Resend in {{ countdown() }}s</span>
                  }
                </div>

                <button type="submit" [disabled]="loading() || form.controls.otp.invalid" class="w-full h-12 rounded-xl bg-brand text-white font-bold text-base shadow-lg hover:bg-brand-hover active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-2 touch-manipulation">
                  {{ loading() ? 'Verifying...' : 'Verify Code' }}
                </button>
                
                <button type="button" (click)="step.set('enterEmail')" class="w-full text-sm text-text-muted hover:text-text-main mt-2 touch-manipulation">Change Email</button>
              </div>
            }

            @if (step() === 'setPassword') {
              <div class="space-y-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold uppercase tracking-wider text-text-muted">New Password</label>
                  <div class="relative">
                    <input 
                      [type]="showPassword() ? 'text' : 'password'" 
                      formControlName="newPassword" 
                      class="w-full h-12 px-4 pl-10 pr-10 rounded-xl bg-bg-surface border border-transparent text-text-main focus:bg-bg-page focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all placeholder:text-text-dim" 
                      placeholder="Min. 6 characters" 
                    />
                    <i class="ri-lock-password-line absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"></i>
                    <button type="button" (click)="togglePassword()" class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main touch-manipulation">
                      <i [class]="showPassword() ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
                    </button>
                  </div>
                </div>

                <button type="submit" [disabled]="loading() || form.controls.newPassword.invalid" class="w-full h-12 rounded-xl bg-brand text-white font-bold text-base shadow-lg hover:bg-brand-hover active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-4 touch-manipulation">
                  {{ loading() ? 'Resetting...' : 'Set New Password' }}
                </button>
              </div>
            }

          </form>

          @if (errorMessage()) {
            <div class="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-3 animate-fade-in-up">
              <i class="ri-error-warning-fill text-lg"></i>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          @if (successMessage()) {
            <div class="mt-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-medium flex items-center gap-3 animate-fade-in-up">
              <i class="ri-checkbox-circle-fill text-lg"></i>
              <span>{{ successMessage() }}</span>
            </div>
          }

          <p class="text-center mt-8 text-text-muted">
            Remembered your password? 
            <a routerLink="/auth/login" class="font-semibold text-brand hover:text-brand-hover hover:underline touch-manipulation">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; transform: translateY(10px); }
    @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
  `]
})
export class PasswordReset implements OnDestroy {

  private meta = inject(Meta);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  step = signal<'enterEmail' | 'enteredOtp' | 'setPassword'>('enterEmail');
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showPassword = signal(false);
  
  canResend = signal(false);
  countdown = signal(60);
  private timerRef: any;
  private preAuthToken: string | null = null;

  form = this.fb.group({
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    otp: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]),
    newPassword: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(6)])
  });

  // --- NEW: Native Form Submission Routing ---
  onSubmit() {
    if (this.step() === 'enterEmail') {
      if (this.form.controls.email.valid && !this.loading()) {
        this.requestOtp();
      }
    } else if (this.step() === 'enteredOtp') {
      if (this.form.controls.otp.valid && !this.loading()) {
        this.verifyOtp();
      }
    } else if (this.step() === 'setPassword') {
      if (this.form.controls.newPassword.valid && !this.loading()) {
        this.resetPassword();
      }
    }
  }

  requestOtp() {
    this.clearMessages();
    const email = this.form.controls.email.value;
    if (!email) return;

    this.loading.set(true);
    const req: EmailRequest = { email };

    this.auth.requestPasswordReset(req).pipe(take(1)).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.successMessage.set(res.message);
        this.step.set('enteredOtp');
        this.startOtpTimer();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to send verification code.');
      }
    });
  }

  private startOtpTimer() {
    this.canResend.set(false);
    this.countdown.set(60);
    if (this.timerRef) clearInterval(this.timerRef);

    this.timerRef = setInterval(() => {
      this.countdown.update(c => c - 1);
      if (this.countdown() <= 0) {
        this.canResend.set(true);
        clearInterval(this.timerRef);
      }
    }, 1000);
  }

  resendOtp() {
    if (this.canResend()) this.requestOtp();
  }

  verifyOtp() {
    this.clearMessages();
    const { email, otp } = this.form.getRawValue();
    if (!email || !otp) return;

    this.loading.set(true);
    this.auth.verifyOtp({ email, otp }).pipe(take(1)).subscribe({
      next: (res: OtpVerificationResponse) => {
        this.loading.set(false);
        this.successMessage.set(res.message);
        this.preAuthToken = res.preAuthToken;
        this.step.set('setPassword');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Invalid verification code.');
      }
    });
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  resetPassword() {
    this.clearMessages();
    const newPassword = this.form.controls.newPassword.value;
    if (!newPassword || !this.preAuthToken) return;

    this.loading.set(true);
    const req: PasswordResetRequest = { newPassword, preAuthToken: this.preAuthToken };

    this.auth.completePasswordReset(req).pipe(take(1)).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.successMessage.set(res.message);
        this.form.reset();
        this.step.set('enterEmail');
        this.preAuthToken = null;
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Password reset failed.');
      }
    });
  }

  private clearMessages() {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  ngOnInit() {

  this.meta.updateTag({
    name: 'robots',
    content: 'noindex, nofollow'
  });

}

ngOnDestroy() {

  if (this.timerRef) {
    clearInterval(this.timerRef);
  }

  this.meta.removeTag('name="robots" content="noindex, nofollow"');

}

}