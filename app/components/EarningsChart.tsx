'use client';

import { useMemo } from 'react';
import { Gig } from '../types';

interface EarningsChartProps {
  completedGigs: Gig[];
}

export function EarningsChart({ completedGigs }: EarningsChartProps) {
  const monthlyEarnings = useMemo(() => {
    const earnings: Record<string, number> = {};
    
    completedGigs.forEach(gig => {
      if (!gig.completedAt) return;
      
      const date = new Date(gig.completedAt);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!earnings[monthYear]) {
        earnings[monthYear] = 0;
      }
      
      earnings[monthYear] += gig.payoutAmount;
    });
    
    return earnings;
  }, [completedGigs]);

  // Simple bar chart visualization
  return (
    <div className="mt-6 mb-8">
      <h3 className="text-lg font-medium mb-4">Earnings Over Time</h3>
      <div className="flex items-end h-40 gap-2">
        {Object.entries(monthlyEarnings).map(([month, amount]) => (
          <div key={month} className="flex flex-col items-center">
            <div 
              className="bg-blue-500 w-12 rounded-t-md" 
              style={{ 
                height: `${Math.max(20, (amount / 1000) * 100)}px`,
              }}
            ></div>
            <div className="text-xs mt-1">{month}</div>
            <div className="text-xs font-medium">${amount}</div>
          </div>
        ))}
        {Object.keys(monthlyEarnings).length === 0 && (
          <div className="text-gray-500 w-full text-center">
            No earnings data available yet
          </div>
        )}
      </div>
    </div>
  );
}

