import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { take } from 'rxjs/operators';
import { environment } from '../../../environments/environment'; // Ensure this path is correct
import { AuthService } from '../../core/auth/auth.service';
import { 
  RegistrationRequest, 
  OtpVerificationResponse, 
  UserRole,
  SocialLoginRequest 
} from '../../core/models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen w-full flex bg-bg-page">
      
      <div class="hidden lg:flex lg:w-1/2 relative bg-brand-surface overflow-hidden items-center justify-center p-12">
        <div class="absolute inset-0">
          <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-400 blur-[150px] opacity-20 rounded-full mix-blend-multiply"></div>
          <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand blur-[150px] opacity-20 rounded-full mix-blend-multiply"></div>
        </div>

        <div class="relative z-10 max-w-lg text-center">
          <a routerLink="/" class="mb-8 block hover:opacity-80 transition-opacity">
            <img src="assets/images/logo.png" alt="Verbrix" class="h-16 w-auto mx-auto drop-shadow-lg" />
          </a>
          <blockquote class="text-2xl font-bold text-text-main leading-relaxed mb-6">
            "I built my entire freelance practice on Verbrix. The global reach allowed me to work from home while helping patients worldwide."
          </blockquote>
          <cite class="text-lg text-text-muted not-italic font-medium">— Sarah Johnson, Certified Medical Interpreter</cite>
        </div>
      </div>

      <div class="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        <a routerLink="/" class="absolute top-6 left-6 flex items-center gap-2 text-text-muted hover:text-brand transition-colors lg:hidden">
           <i class="ri-arrow-left-line"></i>
           <span class="text-sm font-bold">Back to Home</span>
        </a>

        <div class="w-full max-w-md animate-fade-in-up">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-text-main mb-2">Create an account</h1>
            <p class="text-text-muted">
              @if (step() === 'enterEmail') { Enter your details to get started. }
              @else if (step() === 'enteredOtp') { We sent a code to your email. }
              @else { Set a secure password. }
            </p>
          </div>

          @if (step() === 'enterEmail') {
            <button 
              type="button" 
              (click)="registerWithGoogle()" 
              [disabled]="loading()"
              class="w-full h-12 rounded-xl border border-border bg-bg-surface hover:bg-bg-page hover:border-border-hover flex items-center justify-center gap-3 text-text-main font-semibold transition-all active:scale-[0.98] disabled:opacity-50 mb-8">
              <img src="assets/images/google-icon.svg" width="20" height="20" alt="Google" />
              <span>Sign up with Google</span>
            </button>

            <div class="relative mb-8">
              <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-border"></div></div>
              <div class="relative flex justify-center text-sm"><span class="px-2 bg-bg-page text-text-muted">or register with email</span></div>
            </div>
          }

          <form [formGroup]="form" class="space-y-5">
            
            @if (step() === 'enterEmail') {
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold uppercase tracking-wider text-text-muted">First Name</label>
                  <input type="text" formControlName="firstName" class="w-full h-12 px-4 rounded-xl bg-bg-surface border border-transparent text-text-main focus:bg-bg-page focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all placeholder:text-text-dim" placeholder="Jane" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold uppercase tracking-wider text-text-muted">Last Name</label>
                  <input type="text" formControlName="lastName" class="w-full h-12 px-4 rounded-xl bg-bg-surface border border-transparent text-text-main focus:bg-bg-page focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all placeholder:text-text-dim" placeholder="Doe" />
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-xs font-bold uppercase tracking-wider text-text-muted">Email Address</label>
                <div class="relative">
                  <input type="email" formControlName="email" class="w-full h-12 px-4 pl-10 rounded-xl bg-bg-surface border border-transparent text-text-main focus:bg-bg-page focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all placeholder:text-text-dim" placeholder="jane@example.com" />
                  <i class="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"></i>
                </div>
              </div>

              <button type="button" (click)="requestOtp()" [disabled]="loading() || invalidStep1()" class="w-full h-12 rounded-xl bg-brand text-white font-bold text-base shadow-lg hover:bg-brand-hover active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-4">
                {{ loading() ? 'Sending Code...' : 'Send Verification Code' }}
              </button>
            }

            @if (step() === 'enteredOtp') {
              <div class="space-y-4">
                <div class="p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 text-sm flex items-start gap-3">
                  <i class="ri-mail-send-line text-lg mt-0.5"></i>
                  <div>
                    <span class="font-bold">Check your email</span><br/>
                    We sent a 6-digit code to <span class="font-semibold">{{ form.get('email')?.value }}</span>
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-bold uppercase tracking-wider text-text-muted">Verification Code</label>
                  <input type="text" formControlName="otp" maxlength="6" class="w-full h-12 px-4 rounded-xl bg-bg-surface border border-transparent text-text-main focus:bg-bg-page focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all placeholder:text-text-dim text-center text-2xl tracking-[0.5em] font-mono" placeholder="000000" />
                </div>

                <div class="flex items-center justify-between text-sm">
                  @if (canResend()) {
                    <button type="button" (click)="resendOtp()" class="text-brand font-semibold hover:underline">Resend Code</button>
                  } @else {
                    <span class="text-text-muted">Resend in {{ countdown() }}s</span>
                  }
                </div>

                <button type="button" (click)="continueAfterOtp()" [disabled]="loading() || form.controls['otp'].invalid" class="w-full h-12 rounded-xl bg-brand text-white font-bold text-base shadow-lg hover:bg-brand-hover active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-2">
                  {{ loading() ? 'Verifying...' : 'Verify & Continue' }}
                </button>
                
                <button type="button" (click)="step.set('enterEmail')" class="w-full text-sm text-text-muted hover:text-text-main mt-2">Change Email</button>
              </div>
            }

            @if (step() === 'setPassword') {
              <div class="space-y-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold uppercase tracking-wider text-text-muted">Create Password</label>
                  <div class="relative">
                    <input 
                      [type]="showPassword() ? 'text' : 'password'" 
                      formControlName="password" 
                      class="w-full h-12 px-4 pl-10 pr-10 rounded-xl bg-bg-surface border border-transparent text-text-main focus:bg-bg-page focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all placeholder:text-text-dim" 
                      placeholder="Min. 6 characters" 
                    />
                    <i class="ri-lock-password-line absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"></i>
                    <button type="button" (click)="togglePassword()" class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main">
                      <i [class]="showPassword() ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
                    </button>
                  </div>
                </div>

                <div class="space-y-3 pt-2">
                  <label class="flex items-start gap-3 cursor-pointer group">
                    <div class="relative flex items-center">
                      <input type="checkbox" formControlName="isAdult" class="peer h-5 w-5 appearance-none rounded border border-border bg-bg-surface checked:bg-brand checked:border-brand transition-all" />
                      <i class="ri-check-line absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 text-sm pointer-events-none"></i>
                    </div>
                    <span class="text-sm text-text-secondary group-hover:text-text-main transition-colors select-none">I confirm I am 18 years or older.</span>
                  </label>

                  <label class="flex items-start gap-3 cursor-pointer group">
                    <div class="relative flex items-center">
                      <input type="checkbox" formControlName="acceptedPolicies" class="peer h-5 w-5 appearance-none rounded border border-border bg-bg-surface checked:bg-brand checked:border-brand transition-all" />
                      <i class="ri-check-line absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 text-sm pointer-events-none"></i>
                    </div>
                    <span class="text-sm text-text-secondary group-hover:text-text-main transition-colors select-none">I agree to the Terms of Service.</span>
                  </label>
                </div>

                <button type="button" (click)="register()" [disabled]="loading() || form.invalid" class="w-full h-12 rounded-xl bg-brand text-white font-bold text-base shadow-lg hover:bg-brand-hover active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-4">
                  {{ loading() ? 'Creating Account...' : 'Complete Registration' }}
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

          <p class="text-center mt-8 text-text-muted">
            Already have an account? 
            <a routerLink="/auth/login" class="font-semibold text-brand hover:text-brand-hover hover:underline">Sign in</a>
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
export class RegisterComponent implements OnDestroy { // Renamed to Standard Convention
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  step = signal<'enterEmail' | 'enteredOtp' | 'setPassword'>('enterEmail');
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);
  canResend = signal(false);
  countdown = signal(60);
  private timerRef: any;
  private preAuthToken: string | null = null;

  form = this.fb.group({
    firstName: this.fb.nonNullable.control('', Validators.required),
    lastName: this.fb.nonNullable.control('', Validators.required),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    otp: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(6)]),
    isAdult: this.fb.nonNullable.control(false, Validators.requiredTrue),
    acceptedPolicies: this.fb.nonNullable.control(false, Validators.requiredTrue),
  });

  constructor() {
    if (!getApps().length) initializeApp(environment.firebaseConfig);
  }

  invalidStep1() {
    const { firstName, lastName, email } = this.form.controls;
    return firstName.invalid || lastName.invalid || email.invalid;
  }

  requestOtp(): void {
    this.errorMessage.set(null);
    const email = this.form.controls.email.value;
    if (!email) return;

    this.loading.set(true);
    
    // CORRECTION 1: Method name matches AuthService (requestRegistrationOtp)
    this.auth.requestRegistrationOtp({ email }).pipe(take(1)).subscribe({
      next: (res) => {
        this.loading.set(false);
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

  continueAfterOtp() {
    const { email, otp } = this.form.getRawValue();
    if (!email || !otp) return;

    this.errorMessage.set(null);
    this.loading.set(true);

    this.auth.verifyOtp({ email, otp }).pipe(take(1)).subscribe({
      next: (res: OtpVerificationResponse) => {
        this.loading.set(false);
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

  register() {
    if (this.form.invalid || !this.preAuthToken) return;

    this.errorMessage.set(null);
    this.loading.set(true);

    const req: RegistrationRequest = {
      email: this.form.controls.email.value,
      password: this.form.controls.password.value,
      firstName: this.form.controls.firstName.value,
      lastName: this.form.controls.lastName.value,
      preAuthToken: this.preAuthToken,
    };

    this.auth.completeRegistration(req).pipe(take(1)).subscribe({
      next: (res) => {
        this.loading.set(false);
        // CORRECTION 3: Explicit internal navigation logic
        this.navigateBasedOnRole(res.roles);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Registration failed.');
      }
    });
  }

  async registerWithGoogle() {
    this.errorMessage.set(null);
    this.loading.set(true);
    try {
      const provider = new GoogleAuthProvider();
      const authInstance = getAuth();
      const result = await signInWithPopup(authInstance, provider);
      const idToken = await result.user.getIdToken();

      // CORRECTION 2: STRICT SocialLoginRequest (added provider)
      const req: SocialLoginRequest = {
        idToken: idToken,
        provider: 'google'
      };

      this.auth.socialLogin(req).subscribe({
        next: (res) => {
          this.loading.set(false);
          // CORRECTION 3: Explicit internal navigation logic
          this.navigateBasedOnRole(res.roles);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err?.error?.message || 'Google sign-up failed.');
        }
      });
    } catch (e: any) {
      this.loading.set(false);
      this.errorMessage.set(e?.message || 'Google sign-up canceled.');
    }
  }

  // --- NEW: Internal Redirect Logic ---
  private navigateBasedOnRole(roles: string[]) {
    // We check the RAW strings from backend to decide strictly
    if (roles.includes(UserRole.ADMIN)) {
      this.router.navigate(['/dashboard/admin/home']);
    } else if (roles.includes(UserRole.INTERPRETER)) {
      this.router.navigate(['/dashboard/interpreter/home']);
    } else if (roles.includes(UserRole.CLIENT)) {
      this.router.navigate(['/dashboard/client/home']);
    } else {
      // Fallback
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy() {
    if (this.timerRef) clearInterval(this.timerRef);
  }
}