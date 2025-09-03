'use client';

import { useMemo } from 'react';
import { Gig } from '../types';

interface PerformanceMetricsProps {
  completedGigs: Gig[];
  allGigs: Gig[];
}

export function PerformanceMetrics({ completedGigs, allGigs }: PerformanceMetricsProps) {
  // Calculate skill-based metrics
  const skillMetrics = useMemo(() => {
    const metrics: Record<string, { count: number, earnings: number }> = {};
    
    // Count completed gigs and earnings by skill
    completedGigs.forEach(gig => {
      gig.skillsRequired.forEach(skill => {
        if (!metrics[skill]) {
          metrics[skill] = { count: 0, earnings: 0 };
        }
        metrics[skill].count += 1;
        metrics[skill].earnings += gig.payoutAmount;
      });
    });
    
    // Calculate demand score (1-10) based on how many open gigs require this skill
    const skillDemand: Record<string, number> = {};
    const openGigs = allGigs.filter(gig => gig.status === 'open');
    
    openGigs.forEach(gig => {
      gig.skillsRequired.forEach(skill => {
        if (!skillDemand[skill]) {
          skillDemand[skill] = 0;
        }
        skillDemand[skill] += 1;
      });
    });
    
    // Convert to array and sort by earnings
    return Object.entries(metrics)
      .map(([skill, data]) => ({
        skill,
        count: data.count,
        earnings: data.earnings,
        averageEarnings: data.earnings / data.count,
        demandScore: Math.min(10, Math.ceil((skillDemand[skill] || 0) * 10 / Math.max(1, openGigs.length)))
      }))
      .sort((a, b) => b.earnings - a.earnings);
  }, [completedGigs, allGigs]);
  
  // Calculate completion rate
  const completionRate = useMemo(() => {
    const userGigs = allGigs.filter(gig => 
      gig.completedByUserId === completedGigs[0]?.completedByUserId
    );
    
    if (userGigs.length === 0) return 0;
    
    return (completedGigs.length / userGigs.length) * 100;
  }, [completedGigs, allGigs]);
  
  if (skillMetrics.length === 0) {
    return (
      <div className="bg-surface p-4 rounded-lg shadow-card text-center">
        <p>Complete gigs to see your performance metrics.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-surface p-4 rounded-lg shadow-card">
      <h3 className="text-display mb-4">Performance Insights</h3>
      
      <div className="mb-4">
        <p className="font-semibold">Completion Rate: {completionRate.toFixed(0)}%</p>
        <p>Completed Gigs: {completedGigs.length}</p>
      </div>
      
      <h4 className="font-semibold mb-2">Top Skills by Earnings</h4>
      <div className="space-y-3">
        {skillMetrics.slice(0, 5).map((metric, index) => (
          <div key={index} className="border-b pb-2">
            <div className="flex justify-between">
              <span className="font-medium">{metric.skill}</span>
              <span>${metric.earnings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Completed: {metric.count}</span>
              <span>Avg: ${metric.averageEarnings.toFixed(2)}</span>
            </div>
            <div className="mt-1">
              <div className="text-xs flex justify-between">
                <span>Demand Score:</span>
                <span>{metric.demandScore}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-accent h-2 rounded-full" 
                  style={{ width: `${metric.demandScore * 10}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

