    export interface User {
      userId: string; // wallet address
      username?: string;
      walletAddress: string;
      skills: string[];
      createdAt: string;
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
  