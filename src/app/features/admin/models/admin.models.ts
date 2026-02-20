// src/app/admin/models/admin.models.ts

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'CHANGES_REQUESTED';

export interface InterpreterSummaryResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: VerificationStatus;
  createdAt: string; // ISO Date string
}

export interface LanguageAbility {
  language: string; // Enum Key e.g., 'EN', 'HI'
  proficiency: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  proofUrl?: string;
}

export interface CertificationAdminResponse {
  id: number;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  fileUrl: string;
  status: VerificationStatus;
  rejectionReason?: string;
}

export interface InterpreterDetailResponse {
  // Identity
  id: number;
  firstName: string;
  lastName: string;
  bio: string;

  // Experience
  experienceYears: number;
  experienceMonths: number;

  // Account
  userId: number;
  email: string;

  // Assets
  profilePictureUrl: string;
  governmentIdUrl: string;
  governmentIdType: string;
  governmentIdDetails: string;
  introVideoUrl: string;

  // Status
  status: VerificationStatus;
  available: boolean;
  online: boolean;
  lastSeenAt: string;
  rejectionReason?: string;

  // Skills
  languageAbilities: LanguageAbility[];
  specializations: string[]; // Enum Keys e.g., 'CARDIOLOGY'
  certifications: CertificationAdminResponse[];

  // Financials
  consultationFee: number;
  serviceAgreementFee: number;
  recurringFeeAmount: number;
  recurringFeeFrequency: string;

  // Audit
  createdAt: string;
  lastModified: string;
}

export interface AdminRemarkRequest {
  message: string;
}

// Helper to map Enum keys to readable labels (matches your Java Enums)
export const SPECIALIZATION_LABELS: Record<string, string> = {
  GENERAL_PRACTICE: "General Practice & Family Medicine",
  CARDIOLOGY: "Cardiology & Vascular Medicine",
  DERMATOLOGY: "Dermatology",
  PEDIATRICS: "Pediatrics",
  // ... Add others as needed
};

export const LANGUAGE_LABELS: Record<string, string> = {
  EN: "English",
  HI: "Hindi",
  ES: "Spanish",
  FR: "French",
  // ... Add others as needed
};
