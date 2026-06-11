export type DocumentFormat = 'PDF' | 'ZIP' | 'CODE_REPO' | 'FLASHCARDS';
export type DocumentStatus = 'DRAFT' | 'SCANNING' | 'LIVE' | 'DELISTED' | 'UNDER_REVIEW';

export interface ContentAsset {
  id: string;
  sellerId: string;
  localCourseId: string;
  title: string;
  description: string;
  format: DocumentFormat;
  status: DocumentStatus;
  
  fileUrl: string;
  previewUrl?: string;
  pageCount: number;
  
  priceAmount: number; 
  currency: string;
  isSubscriptionEligible: boolean;

  viewCount: number;
  purchaseCount: number;
  compositeRating: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// NEW: Handles AI Flashcards and Translations
export interface DerivativeAsset extends ContentAsset {
  parentAssetId: string;
  derivativeType: 'TRANSLATION' | 'FLASHCARD_DECK' | 'STUDY_GUIDE';
  targetLanguage?: string; // For translations
  aiConfidenceScore: number;
}

// NEW: Handles full-course packages
export interface ContentBundle {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  assetIds: string[]; // Links to multiple ContentAssets
  discountPercentage: number;
  bundledPriceAmount: number;
  status: DocumentStatus;
}
