'use client';

import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { Gig, PerformanceMetric } from '../types.js';
import { AppShell } from '../components/AppShell.js';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { useMemo } from 'react';

export default function Insights() {
  const { address } = useAccount();

  const { data: gigs, isLoading } = useQuery<Gig[]>({
    queryKey: ['gigs'],
    queryFn: async () => {
      const res = await fetch('/api/gigs');
      if (!res.ok) throw new Error('Failed to fetch gigs');
      return res.json();
    },
  });

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (!gigs || !address) return [];

    const completedGigs = gigs.filter(
      (gig) => gig.completedByUserId === address && gig.status === 'completed'
    );

    const openGigs = gigs.filter((gig) => gig.status === 'open');
    
    // Count skills across all gigs
    const skillCounts: Record<string, { count: number, earnings: number, gigs: number }> = {};
    
    // Process completed gigs
    completedGigs.forEach((gig) => {
      gig.skillsRequired.forEach((skill) => {
        if (!skillCounts[skill]) {
          skillCounts[skill] = { count: 0, earnings: 0, gigs: 0 };
        }
        skillCounts[skill].count += 1;
        skillCounts[skill].earnings += gig.payoutAmount;
        skillCounts[skill].gigs += 1;
      });
    });
    
    // Process open gigs to calculate demand
    openGigs.forEach((gig) => {
      gig.skillsRequired.forEach((skill) => {
        if (!skillCounts[skill]) {
          skillCounts[skill] = { count: 1, earnings: 0, gigs: 0 };
        } else {
          skillCounts[skill].count += 1;
        }
      });
    });
    
    // Convert to array and calculate metrics
    const metrics: PerformanceMetric[] = Object.entries(skillCounts)
      .map(([skillName, data]) => ({
        skillName,
        gigsCompleted: data.gigs,
        averageEarnings: data.gigs > 0 ? data.earnings / data.gigs : 0,
        demandScore: Math.min(10, Math.ceil((data.count * 10) / Math.max(1, gigs.length))),
      }))
      .sort((a, b) => b.demandScore - a.demandScore);
    
    return metrics;
  }, [gigs, address]);

  if (!address) {
    return (
      <AppShell>
        <h2 className="text-display mb-4">Connect Wallet to View Insights</h2>
        <ConnectWallet />
      </AppShell>
    );
  }

  if (isLoading) {
    return (
      <AppShell>
        <h2 className="text-display mb-4">Loading Insights...</h2>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h2 className="text-display mb-4">Performance Insights</h2>
      
      <div className="bg-surface p-4 rounded-lg shadow-card mb-6">
        <h3 className="font-semibold text-lg mb-4">Market Demand & Your Performance</h3>
        
        {performanceMetrics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demand Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gigs Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Earnings</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performanceMetrics.map((metric, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{metric.skillName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2 max-w-[100px]">
                          <div 
                            className="bg-accent h-2 rounded-full" 
                            style={{ width: `${metric.demandScore * 10}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{metric.demandScore}/10</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{metric.gigsCompleted}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      ${metric.averageEarnings.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4">
            <p>No performance data available yet. Complete gigs to see insights.</p>
          </div>
        )}
      </div>
      
      <div className="bg-surface p-4 rounded-lg shadow-card">
        <h3 className="font-semibold text-lg mb-4">Market Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Most In-Demand Skills</h4>
            <ol className="list-decimal pl-5">
              {performanceMetrics.slice(0, 5).map((metric, index) => (
                <li key={index} className="mb-1">
                  {metric.skillName} <span className="text-gray-500 text-sm">(Score: {metric.demandScore}/10)</span>
                </li>
              ))}
            </ol>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Highest Paying Skills</h4>
            <ol className="list-decimal pl-5">
              {[...performanceMetrics]
                .sort((a, b) => b.averageEarnings - a.averageEarnings)
                .slice(0, 5)
                .map((metric, index) => (
                  <li key={index} className="mb-1">
                    {metric.skillName} <span className="text-gray-500 text-sm">(${metric.averageEarnings.toFixed(2)})</span>
                  </li>
                ))}
            </ol>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Your Top Skills</h4>
            <ol className="list-decimal pl-5">
              {[...performanceMetrics]
                .filter(metric => metric.gigsCompleted > 0)
                .sort((a, b) => b.gigsCompleted - a.gigsCompleted)
                .slice(0, 5)
                .map((metric, index) => (
                  <li key={index} className="mb-1">
                    {metric.skillName} <span className="text-gray-500 text-sm">({metric.gigsCompleted} gigs)</span>
                  </li>
                ))}
            </ol>
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-600">
          <p>
            <strong>Demand Score:</strong> Represents how in-demand a skill is in the marketplace on a scale of 1-10.
            Higher scores indicate more gigs requiring this skill.
          </p>
          <p className="mt-2">
            <strong>Tip:</strong> Focus on skills with high demand scores and high average earnings for maximum income potential.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

