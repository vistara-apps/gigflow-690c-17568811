    'use client';

    import { useAccount, useSendTransaction } from 'wagmi';
    import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
    import { Gig, User } from './types.js';
    import { GigCard } from './components/GigCard.js';
    import { AppShell } from './components/AppShell.js';
    import { ConnectWallet } from '@coinbase/onchainkit/wallet';
    import { parseEther } from 'viem';

    export default function Home() {
      const { address } = useAccount();
      const queryClient = useQueryClient();

      const { data: user } = useQuery<User>({
        queryKey: ['user', address],
        queryFn: async () => {
          if (!address) return null;
          const res = await fetch(`/api/users?userId=${address}`);
          if (!res.ok) {
            // Create user if not found
            const createRes = await fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: address, walletAddress: address }),
            });
            return createRes.json();
          }
          return res.json();
        },
        enabled: !!address,
      });

      const { data: gigs } = useQuery<Gig[]>({
        queryKey: ['gigs'],
        queryFn: async () => {
          const res = await fetch('/api/gigs');
          if (!res.ok) throw new Error('Failed to fetch gigs');
          return res.json();
        },
      });

      const acceptMutation = useMutation({
        mutationFn: async (gigId: string) => {
          const res = await fetch('/api/gigs', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gigId, status: 'accepted', completedByUserId: address }),
          });
          if (!res.ok) throw new Error('Failed to accept gig');
          return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gigs'] }),
      });

      const completeMutation = useMutation({
        mutationFn: async (gigId: string) => {
          const res = await fetch('/api/gigs', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gigId, status: 'completed', completedByUserId: address }),
          });
          if (!res.ok) throw new Error('Failed to complete gig');
          return res.json();
        },
        onSuccess: (updatedGig: Gig) => {
          queryClient.invalidateQueries({ queryKey: ['gigs'] });
          // Simulate payout (in real, deduct commission)
          sendTransaction({
            to: address as `0x${string}`,
            value: parseEther((updatedGig.payoutAmount * 0.975).toString()), // Deduct 2.5% commission
          });
        },
      });

      const { sendTransaction } = useSendTransaction();

      if (!address) {
        return (
          <AppShell>
            <ConnectWallet />
          </AppShell>
        );
      }

      return (
        <AppShell>
          <h2 className="text-display mb-4">Micro-Gig Marketplace</h2>
          {gigs?.map((gig) => (
            <GigCard
              key={gig.gigId}
              gig={gig}
              onAccept={acceptMutation.mutate}
              onComplete={completeMutation.mutate}
              isAcceptedByUser={gig.completedByUserId === address && gig.status === 'accepted'}
            />
          ))}
        </AppShell>
      );
    }
  