export type VerificationStatus = 'UNVERIFIED' | 'PENDING_EMAIL' | 'VERIFIED' | 'REJECTED' | 'BANNED';
export type KYCStatus = 'NOT_STARTED' | 'PENDING_REVIEW' | 'APPROVED' | 'FAILED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  
  // Layer 1: University Trust
  universityId?: string;
  verificationStatus: VerificationStatus;
  
  // Security
  mfaEnabled: boolean;
  lastLoginIp?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface SellerProfile {
  userId: string;
  
  // Layer 2: Financial Trust
  kycStatus: KYCStatus;
  stripeAccountId?: string;
  
  // Layer 3: Behavioral Trust
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  
  // Gamification & Reputation
  level: number;
  xpPoints: number;
  badges: string[]; // e.g., 'TOP_CONTRIBUTOR', 'ALUMNI'
  overallRating: number;
}
