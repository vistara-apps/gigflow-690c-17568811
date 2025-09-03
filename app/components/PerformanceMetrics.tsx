'use client';

import { useMemo } from 'react';
import { Gig } from '../types';

interface PerformanceMetricsProps {
  completedGigs: Gig[];
}

export function PerformanceMetrics({ completedGigs }: PerformanceMetricsProps) {
  const metrics = useMemo(() => {
    const totalEarnings = completedGigs.reduce((sum, gig) => sum + gig.payoutAmount, 0);
    const averageEarnings = completedGigs.length > 0 ? totalEarnings / completedGigs.length : 0;
    
    // Calculate completion time (in days) for each gig
    const completionTimes = completedGigs
      .filter(gig => gig.createdAt && gig.completedAt)
      .map(gig => {
        const createdDate = new Date(gig.createdAt as string);
        const completedDate = new Date(gig.completedAt as string);
        const diffTime = Math.abs(completedDate.getTime() - createdDate.getTime());
        return diffTime / (1000 * 60 * 60 * 24); // Convert to days
      });
    
    const averageCompletionTime = completionTimes.length > 0 
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
      : 0;
    
    return {
      totalGigs: completedGigs.length,
      totalEarnings,
      averageEarnings,
      averageCompletionTime
    };
  }, [completedGigs]);

  return (
    <div className="mt-6 bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-3 rounded shadow-sm">
          <div className="text-sm text-gray-500">Total Gigs Completed</div>
          <div className="text-xl font-semibold">{metrics.totalGigs}</div>
        </div>
        
        <div className="bg-white p-3 rounded shadow-sm">
          <div className="text-sm text-gray-500">Total Earnings</div>
          <div className="text-xl font-semibold">${metrics.totalEarnings.toFixed(2)}</div>
        </div>
        
        <div className="bg-white p-3 rounded shadow-sm">
          <div className="text-sm text-gray-500">Average Earnings per Gig</div>
          <div className="text-xl font-semibold">${metrics.averageEarnings.toFixed(2)}</div>
        </div>
        
        <div className="bg-white p-3 rounded shadow-sm">
          <div className="text-sm text-gray-500">Avg. Completion Time</div>
          <div className="text-xl font-semibold">{metrics.averageCompletionTime.toFixed(1)} days</div>
        </div>
      </div>
    </div>
  );
}

