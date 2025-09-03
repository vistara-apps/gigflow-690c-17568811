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
      skills?: string[];
      skillsRequired?: string[];
      payoutAmount: number; // in USD or ETH, but for simplicity number
      status: 'open' | 'in-progress' | 'accepted' | 'completed';
      createdByUserId?: string;
      postedByUserId?: string;
      completedByUserId?: string;
      createdAt: string;
      updatedAt?: string;
      completedAt?: string;
    }
