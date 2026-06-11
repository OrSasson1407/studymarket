export type RequestBountyStatus = 'OPEN' | 'CLAIMED' | 'SUBMITTED' | 'APPROVED' | 'EXPIRED';

export interface ContentBounty {
  id: string;
  localCourseId: string;
  requesterId: string;
  title: string;
  description: string;
  bountyAmount: number; // e.g., 99 ILS
  deadline: Date;
  status: RequestBountyStatus;
  
  claimedBySellerId?: string;
  submittedAssetId?: string; // The newly created content that fulfills the bounty
  
  createdAt: Date;
}

export interface TutoringSlot {
  id: string;
  sellerId: string; // The tutor
  localCourseId: string;
  startTime: Date;
  durationMinutes: 30 | 60;
  priceAmount: number;
  status: 'AVAILABLE' | 'BOOKED' | 'COMPLETED' | 'CANCELLED';
  bookedByUserId?: string;
}
