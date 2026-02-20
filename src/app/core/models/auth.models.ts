export enum UserRole {
  ADMIN = 'ROLE_ADMIN',
  INTERPRETER = 'ROLE_INTERPRETER',
  CLIENT = 'ROLE_CLIENT'
}

export interface User {
  email: string;
  role: UserRole; // Enforces SINGLE role per user
  id?: string;
}

// --- DTOs Matching Backend ---

export interface LoginRequest {
  email?: string;
  password?: string;
  deviceId: string; // 🟢 NEW: Required for backend device tracking
  deviceDetails?: string;
}

export interface SocialLoginRequest {
  idToken: string; // From Firebase
  provider: 'google';
  deviceId: string; // 🟢 NEW
  deviceDetails?: string; //
}

export interface EmailRequest {
  email: string;
}

export interface OtpVerificationRequest {
  email: string;
  otp: string;
}

export interface RegistrationRequest {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  preAuthToken: string;
  deviceId: string; // 🟢 NEW
  deviceDetails?: string;// CRITICAL: Required for completeRegistration
}

export interface PasswordResetRequest {
  preAuthToken: string; // CRITICAL: Required for completePasswordReset
  newPassword?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// --- Responses ---

export interface LoginResponse {
  email: string;
  roles: string[]; // Backend returns list, we strictly extract ONE
  jwtToken: string;
  refreshToken: string;
}

export interface OtpVerificationResponse {
  message: string;
  preAuthToken: string; // captured for next step
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface MessageResponse {
  message: string;
}
