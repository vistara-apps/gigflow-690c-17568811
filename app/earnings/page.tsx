'use client';

import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { Gig } from '../types.js';
import { AppShell } from '../components/AppShell.js';
import { EarningsChart } from '../components/EarningsChart.js';
import { PerformanceMetrics } from '../components/PerformanceMetrics.js';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';

export default function Earnings() {
  const { address } = useAccount();

  const { data: gigs, isLoading } = useQuery<Gig[]>({
    queryKey: ['gigs'],
    queryFn: async () => {
      const res = await fetch('/api/gigs');
      if (!res.ok) throw new Error('Failed to fetch gigs');
      return res.json();
    },
  });

  const completedGigs = gigs?.filter(
    (gig) => gig.completedByUserId === address && gig.status === 'completed'
  ) || [];

  const totalEarnings = completedGigs.reduce((sum, gig) => sum + gig.payoutAmount, 0);

  if (!address) {
    return (
      <AppShell>
        <h2 className="text-display mb-4">Connect Wallet to View Earnings</h2>
        <ConnectWallet />
      </AppShell>
    );
  }

  if (isLoading) {
    return (
      <AppShell>
        <h2 className="text-display mb-4">Earnings Dashboard</h2>
        <div className="text-center p-4">Loading your earnings data...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h2 className="text-display mb-4">Earnings Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-surface p-4 rounded-lg shadow-card">
          <h3 className="font-semibold text-lg mb-2">Summary</h3>
          <p className="text-2xl font-bold mb-2">${totalEarnings.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Total Earnings</p>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-lg font-semibold">{completedGigs.length}</p>
              <p className="text-sm text-gray-600">Completed Gigs</p>
            </div>
            <div>
              <p className="text-lg font-semibold">
                ${completedGigs.length > 0 ? (totalEarnings / completedGigs.length).toFixed(2) : '0.00'}
              </p>
              <p className="text-sm text-gray-600">Average Per Gig</p>
            </div>
          </div>
        </div>
        
        <PerformanceMetrics completedGigs={completedGigs} allGigs={gigs || []} />
      </div>
      
      <EarningsChart completedGigs={completedGigs} />
      
      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-2">Recent Transactions</h3>
        {completedGigs.length > 0 ? (
          <div className="bg-surface rounded-lg shadow-card overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gig</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completedGigs
                  .sort((a, b) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime())
                  .slice(0, 5)
                  .map((gig) => (
                    <tr key={gig.gigId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{gig.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">${gig.payoutAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {gig.completedAt ? new Date(gig.completedAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-surface p-4 rounded-lg shadow-card text-center">
            <p>No completed gigs yet. Start earning by accepting gigs from the marketplace!</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
