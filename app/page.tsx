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
          // First update the gig status
          const res = await fetch('/api/gigs', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gigId, status: 'completed', completedByUserId: address }),
          });
          if (!res.ok) throw new Error('Failed to complete gig');
          const updatedGig = await res.json();
          
          // Then create a transaction record
          const txRes = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              gigId: updatedGig.gigId,
              fromUserId: updatedGig.postedByUserId,
              toUserId: address,
              amount: updatedGig.payoutAmount,
            }),
          });
          
          if (!txRes.ok) throw new Error('Failed to create transaction record');
          const transaction = await txRes.json();
          
          return { gig: updatedGig, transaction };
        },
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ['gigs'] });
          
          // Process the blockchain transaction
          const { gig, transaction } = data;
          
          // Calculate amount after commission
          const amountAfterCommission = gig.payoutAmount * (1 - 0.025); // 2.5% commission
          
          // Send the transaction
          sendTransaction({
            to: address as `0x${string}`,
            value: parseEther(amountAfterCommission.toString()),
            onSuccess(data) {
              // Update the transaction record with the tx hash
              fetch('/api/transactions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  transactionId: transaction.transactionId,
                  txHash: data.hash,
                }),
              });
            },
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
