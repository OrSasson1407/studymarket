export type FlagReason = 'COPYRIGHT' | 'INACCURATE' | 'EXAM_LEAK' | 'POOR_QUALITY' | 'OTHER';
export type DisputeStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED_REFUNDED' | 'RESOLVED_DISMISSED';

export interface ContentFlag {
  id: string;
  contentId: string;
  reporterId: string; // Can be a user or 'SYSTEM_AI'
  reason: FlagReason;
  description: string;
  status: 'PENDING_REVIEW' | 'ACTION_TAKEN' | 'DISMISSED';
  createdAt: Date;
}

export interface TransactionDispute {
  id: string;
  transactionId: string; // Links to LedgerEntry
  buyerId: string;
  sellerId: string;
  reason: string;
  status: DisputeStatus;
  resolutionNotes?: string;
  openedAt: Date;
  resolvedAt?: Date;
}
