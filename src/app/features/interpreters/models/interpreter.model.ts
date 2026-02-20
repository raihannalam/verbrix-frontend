export interface LanguageAbility {
  language: string; 
  proficiency: string; // e.g., 'NATIVE', 'C2', etc.
}

export interface Interpreter {
  id: number;
  firstName: string;
  lastName: string;
  bio: string;
  profilePictureUrl?: string;
  introVideoUrl?: string;
  
  experienceYears: number;
  experienceMonths: number;
  consultationFees: number;
  
  specializations: string[]; // e.g. ["CARDIOLOGY", "PEDIATRICS"]
  languages: LanguageAbility[];
  
  rating: number;
  ratingCount: number;
  
  online: boolean;
  available: boolean;
  lastSeenAt?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}