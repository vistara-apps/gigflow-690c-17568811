export interface User {
  userId: string; // wallet address
  username?: string;
  walletAddress: string;
  skills: string[];
  createdAt: string;
  farcasterId?: string;
  farcasterUsername?: string;
}

export interface Gig {
  gigId: string;
  title: string;
  description: string;
  skillsRequired: string[];
  payoutAmount: number; // in USD or ETH, but for simplicity number
  status: 'open' | 'accepted' | 'completed';
  postedByUserId: string;
  completedByUserId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Offering {
  offeringId: string;
  userId: string;
  title: string;
  description: string;
  skills: string[];
  basePrice: number;
  availability: 'available' | 'busy' | 'unavailable';
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  transactionId: string;
  gigId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  commission: number;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PerformanceMetric {
  skillName: string;
  gigsCompleted: number;
  averageEarnings: number;
  demandScore: number; // 1-10 scale
}
