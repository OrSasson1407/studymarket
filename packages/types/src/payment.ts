export type Currency = 'ILS' | 'USD' | 'EUR' | 'GBP' | 'BRL' | 'INR';
export type PaymentMethodType = 'STRIPE_CARD' | 'BIT' | 'PIX' | 'UPI' | 'IDEAL' | 'APPLE_PAY';
export type TransactionStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'DISPUTED';

export interface PPPAdjustment {
  countryCode: string;
  discountMultiplier: number; // e.g., 0.6 for a 40% discount in certain regions
  originalPrice: number;
}

export interface PaymentTransaction {
  id: string;
  buyerId: string;
  sellerId?: string; // Optional (undefined if it's a platform subscription)
  contentId?: string; // Optional (undefined if it's a subscription purchase)
  
  // The 70/30 Split Mechanics
  grossAmount: number; // Total paid by the buyer
  platformFee: number; // 30% retained by StudyMarket
  sellerCut: number;   // 70% credited to the seller
  currency: Currency;
  
  method: PaymentMethodType;
  status: TransactionStatus;
  providerChargeId?: string; // The ID from Stripe/Bit for reconciliation
  
  pppApplied?: PPPAdjustment;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface PayoutRequest {
  id: string;
  sellerId: string;
  amount: number;
  currency: Currency;
  status: 'PENDING_KYC' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REJECTED';
  destinationAccountId: string; // The seller's bank or Stripe Connect ID
  requestedAt: Date;
  processedAt?: Date;
  failureReason?: string;
}

export interface SubscriptionAccess {
  id: string;
  userId: string;
  tier: 'INDIVIDUAL_MONTHLY' | 'INDIVIDUAL_SEMESTER' | 'UNIVERSITY_B2B';
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'EXPIRED';
  providerSubscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}
