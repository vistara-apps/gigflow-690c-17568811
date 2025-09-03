'use client';

import { useMemo } from 'react';
import { Gig } from '../types';

interface EarningsChartProps {
  completedGigs: Gig[];
}

export function EarningsChart({ completedGigs }: EarningsChartProps) {
  // Group earnings by month
  const monthlyEarnings = useMemo(() => {
    const earnings: Record<string, number> = {};
    
    completedGigs.forEach(gig => {
      if (gig.completedAt) {
        const date = new Date(gig.completedAt);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!earnings[monthYear]) {
          earnings[monthYear] = 0;
        }
        
        earnings[monthYear] += gig.payoutAmount;
      }
    });
    
    // Sort by date
    return Object.entries(earnings)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({ 
        month: formatMonth(month), 
        amount 
      }));
  }, [completedGigs]);
  
  // Format month from YYYY-MM to Month YYYY
  function formatMonth(monthYear: string) {
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  
  // Find the maximum earnings for scaling
  const maxEarnings = useMemo(() => {
    if (monthlyEarnings.length === 0) return 100;
    return Math.max(...monthlyEarnings.map(item => item.amount)) * 1.1; // Add 10% padding
  }, [monthlyEarnings]);
  
  if (monthlyEarnings.length === 0) {
    return (
      <div className="bg-surface p-4 rounded-lg shadow-card text-center">
        <p>No earnings data available yet.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-surface p-4 rounded-lg shadow-card">
      <h3 className="text-display mb-4">Earnings Over Time</h3>
      
      <div className="h-64 flex items-end space-x-2">
        {monthlyEarnings.map((item, index) => {
          const height = `${(item.amount / maxEarnings) * 100}%`;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full flex justify-center">
                <div 
                  className="bg-accent w-full max-w-[40px] rounded-t-sm" 
                  style={{ height }}
                ></div>
              </div>
              <div className="text-xs mt-2 rotate-45 origin-left">{item.month}</div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 text-center">
        <p className="font-semibold">Total Earnings: ${monthlyEarnings.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}</p>
      </div>
    </div>
  );
}

