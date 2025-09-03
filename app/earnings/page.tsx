'use client';

    import { useAccount } from 'wagmi';
    import { useQuery } from '@tanstack/react-query';
    import { Gig } from '../types';
    import { AppShell } from '../components/AppShell';
    import { EarningsChart } from '../components/EarningsChart';
    import { PerformanceMetrics } from '../components/PerformanceMetrics';

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
          {/* Enhanced Performance Insights */}
          <EarningsChart completedGigs={completedGigs} />
          <PerformanceMetrics completedGigs={completedGigs} />
        </AppShell>
      );
    }
