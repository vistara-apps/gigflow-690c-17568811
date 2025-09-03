    'use client';

    import { useAccount } from 'wagmi';
    import { useQuery } from '@tanstack/react-query';
    import { Gig } from '../types.js';
    import { AppShell } from '../components/AppShell.js';

    export default function Earnings() {
      const { address } = useAccount();

      const { data: gigs } = useQuery<Gig[]>({
        queryKey: ['gigs'],
        queryFn: async () => {
          const res = await fetch('/api/gigs');
          return res.json();
        },
      });

      const completedGigs = gigs?.filter((gig) => gig.completedByUserId === address && gig.status === 'completed') || [];

      const totalEarnings = completedGigs.reduce((sum, gig) => sum + gig.payoutAmount, 0);

      return (
        <AppShell>
          <h2 className="text-display mb-4">Earnings Dashboard</h2>
          <p>Total Earnings: ${totalEarnings}</p>
          <ul>
            {completedGigs.map((gig) => (
              <li key={gig.gigId}>
                {gig.title} - ${gig.payoutAmount} - Completed on {gig.completedAt}
              </li>
            ))}
          </ul>
          {/* Lite Performance Insights */}
          <h3 className="mt-4">Performance Insights</h3>
          <p>Completed Gigs: {completedGigs.length}</p>
          <p>Average Earnings: ${completedGigs.length > 0 ? (totalEarnings / completedGigs.length).toFixed(2) : 0}</p>
        </AppShell>
      );
    }
  