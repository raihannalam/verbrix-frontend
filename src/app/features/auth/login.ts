import { Component, inject, signal, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UserRole, SocialLoginRequest } from '../../core/models/auth.models';
import { initializeApp, getApps } from 'firebase/app';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen w-full flex bg-bg-page">
      <div class="hidden lg:flex lg:w-1/2 relative bg-brand-surface overflow-hidden items-center justify-center p-12">
        <div class="absolute inset-0">
          <div class="absolute top-0 left-0 w-[500px] h-[500px] bg-brand blur-[150px] opacity-20 rounded-full mix-blend-multiply"></div>
          <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-400 blur-[150px] opacity-20 rounded-full mix-blend-multiply"></div>
        </div>

        <div class="relative z-10 max-w-lg text-center">
          <div class="mb-8">
            <a routerLink="/" class="block hover:opacity-80 transition-opacity">
              <img src="assets/images/logo.png" alt="Verbrix" class="h-16 w-auto mx-auto drop-shadow-lg" loading="eager" />
            </a>
          </div>
          <blockquote class="text-2xl font-bold text-text-main leading-relaxed mb-6">
            "Verbrix removed the fear of traveling for my surgery. I knew exactly what to expect before I even boarded the plane."
          </blockquote>
          <cite class="text-lg text-text-muted not-italic font-medium">— Ahmed Al-Fayed, Patient from Iraq</cite>
        </div>
      </div>

      <div class="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        <a routerLink="/" class="absolute top-6 left-6 flex items-center gap-2 text-text-muted hover:text-brand transition-colors lg:hidden">
           <i class="ri-arrow-left-line"></i>
           <span class="text-sm font-bold">Back to Home</span>
        </a>

        <div class="w-full max-w-md animate-fade-in-up">
          <div class="text-center mb-10">
            <h1 class="text-3xl font-bold text-text-main mb-2">Welcome back</h1>
            <p class="text-text-muted">Enter your details to access your dashboard.</p>
          </div>

          <button 
            type="button" 
            (click)="loginWithGoogle()" 
            [disabled]="loading()"
            class="w-full h-12 rounded-xl border border-border bg-bg-surface hover:bg-bg-page hover:border-border-hover flex items-center justify-center gap-3 text-text-main font-semibold transition-all active:scale-[0.98] disabled:opacity-50 touch-manipulation">
            <img src="assets/images/google-icon.svg" width="20" height="20" alt="Google" />
            <span>Continue with Google</span>
          </button>

          <div class="relative my-8">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-border"></div></div>
            <div class="relative flex justify-center text-sm"><span class="px-2 bg-bg-page text-text-muted">or sign in with email</span></div>
          </div>

          <form [formGroup]="form" (ngSubmit)="login()" class="space-y-5">
            <div class="space-y-1">
              <label for="email" class="text-sm font-semibold text-text-main">Email Address</label>
              <div class="relative">
                <input 
                  #emailInput
                  id="email" 
                  type="email" 
                  formControlName="email" 
                  placeholder="name@email.com"
                  class="w-full h-12 pl-10 pr-4 rounded-xl bg-bg-surface border border-transparent text-text-main focus:bg-bg-page focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all placeholder:text-text-dim"
                  [class.ring-2]="emailControl.invalid && emailControl.touched"
                  [class.ring-red-500/20]="emailControl.invalid && emailControl.touched"
                  [class.border-red-500]="emailControl.invalid && emailControl.touched"
                />
                <i class="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"></i>
              </div>
              @if (emailControl.invalid && emailControl.touched) {
                <p class="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
                  <i class="ri-error-warning-line"></i>
                  <span>Please enter a valid email address</span>
                </p>
              }
            </div>

            <div class="space-y-1">
              <label for="password" class="text-sm font-semibold text-text-main">Password</label>
              <div class="relative">
                <input 
                  #passwordInput
                  id="password" 
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password" 
                  placeholder="Min. 6 characters"
                  class="w-full h-12 pl-10 pr-10 rounded-xl bg-bg-surface border border-transparent text-text-main focus:bg-bg-page focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all placeholder:text-text-dim"
                  [class.ring-2]="passwordControl.invalid && passwordControl.touched"
                  [class.ring-red-500/20]="passwordControl.invalid && passwordControl.touched"
                  [class.border-red-500]="passwordControl.invalid && passwordControl.touched"
                />
                <i class="ri-lock-password-line absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"></i>
                
                <button 
                  type="button" 
                  (click)="togglePassword()" 
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main focus:outline-none touch-manipulation"
                  tabindex="-1"
                >
                  <i [class]="showPassword() ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
                </button>
              </div>
              @if (passwordControl.invalid && passwordControl.touched) {
                <p class="text-xs text-red-500 font-medium ml-1 flex items-center gap-1">
                  <i class="ri-error-warning-line"></i>
                  <span>Password must be at least 6 characters</span>
                </p>
              }
            </div>

            <div class="flex items-center justify-end">
              <a routerLink="/auth/password-reset" class="text-sm font-medium text-brand hover:text-brand-hover hover:underline touch-manipulation">
                Forgot password?
              </a>
            </div>

            <button 
              type="submit" 
              [disabled]="loading() || form.invalid"
              class="w-full h-12 rounded-xl bg-brand text-white font-bold text-base shadow-lg hover:bg-brand-hover active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation">
              @if (loading()) {
                <i class="ri-loader-4-line animate-spin text-xl"></i>
                <span>Signing in...</span>
              } @else {
                <span>Sign In</span>
              }
            </button>
          </form>

          <p class="text-center mt-8 text-text-muted">
            Don't have an account? 
            <a routerLink="/auth/register" class="font-semibold text-brand hover:text-brand-hover hover:underline touch-manipulation">
              Create an account
            </a>
          </p>

          @if (errorMessage()) {
            <div class="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-3 animate-shake">
              <i class="ri-error-warning-fill text-lg"></i>
              <span>{{ errorMessage() }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in-up { 
      animation: fadeInUp 0.5s ease-out forwards; 
      opacity: 0; 
      transform: translateY(10px); 
    }
    @keyframes fadeInUp { 
      to { opacity: 1; transform: translateY(0); } 
    }
    .animate-shake {
      animation: shake 0.4s ease-in-out;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-8px); }
      75% { transform: translateX(8px); }
    }
  `]
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);

  form = new FormGroup({
    email: new FormControl('', { 
      nonNullable: true, 
      validators: [Validators.required, Validators.email] 
    }),
    password: new FormControl('', { 
      nonNullable: true, 
      validators: [Validators.required, Validators.minLength(6)] 
    }),
  });

  get emailControl() { return this.form.controls.email; }
  get passwordControl() { return this.form.controls.password; }

  ngOnInit() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.errorMessage.set(null));
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  login(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.errorMessage.set(null);

    this.auth.login({ email, password })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.navigateBasedOnRole(res.roles);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err?.error?.message || 'Invalid email or password. Please try again.');
        }
      });
  }

  async loginWithGoogle(): Promise<void> {
    if (this.loading()) return;

    this.errorMessage.set(null);
    this.loading.set(true);

    try {
      if (!getApps().length) initializeApp(environment.firebaseConfig);
      
      const provider = new GoogleAuthProvider();
      const authInstance = getAuth();
      const result = await signInWithPopup(authInstance, provider);
      const idToken = await result.user.getIdToken();

      const req: SocialLoginRequest = {
        idToken: idToken,
        provider: 'google'
      };

      this.auth.socialLogin(req)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            this.loading.set(false);
            this.navigateBasedOnRole(res.roles);
          },
          error: (err) => {
            this.loading.set(false);
            this.errorMessage.set(err?.error?.message || 'Google sign-in failed. Please try again.');
          }
        });
    } catch (e: any) {
      this.loading.set(false);
      if (e.code !== 'auth/popup-closed-by-user') {
        this.errorMessage.set(e?.message || 'Google authentication failed. Please try again.');
      }
    }
  }

  private navigateBasedOnRole(roles: string[]) {
    if (roles.includes(UserRole.ADMIN)) {
      this.router.navigate(['/dashboard/admin/home']);
    } else if (roles.includes(UserRole.INTERPRETER)) {
      this.router.navigate(['/dashboard/interpreter/home']);
    } else if (roles.includes(UserRole.CLIENT)) {
      this.router.navigate(['/dashboard/client/home']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}