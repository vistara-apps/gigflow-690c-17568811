'use client';

import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { Gig } from '../types';
import { AppShell } from '../components/AppShell';

export default function Insights() {
  const { address } = useAccount();

  const { data: gigs, isLoading } = useQuery<Gig[]>({
    queryKey: ['gigs'],
    queryFn: async () => {
      const res = await fetch('/api/gigs');
      return res.json();
    },
  });

  const userGigs = gigs?.filter(gig => 
    gig.createdByUserId === address || gig.completedByUserId === address
  ) || [];

  const createdGigs = userGigs.filter(gig => gig.createdByUserId === address);
  const completedGigs = userGigs.filter(gig => gig.completedByUserId === address && gig.status === 'completed');
  const inProgressGigs = userGigs.filter(gig => gig.completedByUserId === address && gig.status === 'in-progress');

  return (
    <AppShell>
      <h2 className="text-2xl font-bold mb-6">Insights Dashboard</h2>
      
      {isLoading ? (
        <div className="text-center py-8">Loading insights...</div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Created Gigs</h3>
              <p className="text-3xl font-bold">{createdGigs.length}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Completed Gigs</h3>
              <p className="text-3xl font-bold">{completedGigs.length}</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2">In Progress</h3>
              <p className="text-3xl font-bold">{inProgressGigs.length}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            {userGigs.length > 0 ? (
              <ul className="space-y-2">
                {userGigs
                  .sort((a, b) => {
                    const dateA = new Date(a.updatedAt || a.createdAt || '');
                    const dateB = new Date(b.updatedAt || b.createdAt || '');
                    return dateB.getTime() - dateA.getTime();
                  })
                  .slice(0, 5)
                  .map(gig => (
                    <li key={gig.gigId} className="border-b pb-2">
                      <div className="font-medium">{gig.title}</div>
                      <div className="text-sm text-gray-600">
                        Status: {gig.status} | 
                        {gig.createdByUserId === address ? ' Created by you' : ' Assigned to you'}
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-gray-500">No activity yet</p>
            )}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Skills Breakdown</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(
                new Set(
                  userGigs.flatMap(gig => gig.skills || [])
                )
              ).map(skill => (
                <div key={skill} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                  {skill}
                </div>
              ))}
              {userGigs.flatMap(gig => gig.skills || []).length === 0 && (
                <p className="text-gray-500">No skills data available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

