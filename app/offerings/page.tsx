'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Gig } from '../types';
import { AppShell } from '../components/AppShell';
import { PrimaryButton } from '../components/PrimaryButton';
import { SkillTag } from '../components/SkillTag';

export default function Offerings() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [newGig, setNewGig] = useState({
    title: '',
    description: '',
    payoutAmount: 0,
    skills: '',
  });

  const { data: gigs, isLoading } = useQuery<Gig[]>({
    queryKey: ['gigs'],
    queryFn: async () => {
      const res = await fetch('/api/gigs');
      return res.json();
    },
  });

  const createGigMutation = useMutation({
    mutationFn: async (gigData: Omit<Gig, 'gigId'>) => {
      const res = await fetch('/api/gigs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gigData),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
      setNewGig({
        title: '',
        description: '',
        payoutAmount: 0,
        skills: '',
      });
    },
  });

  const userCreatedGigs = gigs?.filter(gig => gig.createdByUserId === address) || [];

  const handleCreateGig = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) return;
    
    createGigMutation.mutate({
      title: newGig.title,
      description: newGig.description,
      payoutAmount: Number(newGig.payoutAmount),
      skills: newGig.skills.split(',').map(s => s.trim()),
      createdByUserId: address,
      status: 'open',
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <AppShell>
      <h2 className="text-2xl font-bold mb-6">My Offerings</h2>
      
      <div className="mb-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Create New Gig</h3>
        
        <form onSubmit={handleCreateGig} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={newGig.title}
              onChange={e => setNewGig({...newGig, title: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={newGig.description}
              onChange={e => setNewGig({...newGig, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Payout Amount ($)</label>
            <input
              type="number"
              value={newGig.payoutAmount}
              onChange={e => setNewGig({...newGig, payoutAmount: Number(e.target.value)})}
              className="w-full px-3 py-2 border rounded-md"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
            <input
              type="text"
              value={newGig.skills}
              onChange={e => setNewGig({...newGig, skills: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g. design, development, marketing"
              required
            />
          </div>
          
          <div>
            <PrimaryButton type="submit" disabled={createGigMutation.isPending}>
              {createGigMutation.isPending ? 'Creating...' : 'Create Gig'}
            </PrimaryButton>
          </div>
        </form>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">My Created Gigs</h3>
        
        {isLoading ? (
          <div className="text-center py-4">Loading gigs...</div>
        ) : userCreatedGigs.length > 0 ? (
          <div className="space-y-4">
            {userCreatedGigs.map(gig => (
              <div key={gig.gigId} className="border p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium">{gig.title}</h4>
                    <p className="text-gray-600 mt-1">{gig.description}</p>
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      {gig.skills?.map(skill => (
                        <SkillTag key={skill} skill={skill} />
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">${gig.payoutAmount}</div>
                    <div className="text-sm mt-1 px-2 py-1 rounded-full bg-gray-100 inline-block">
                      {gig.status}
                    </div>
                  </div>
                </div>
                
                {gig.completedByUserId && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm text-gray-500">
                      Assigned to: {gig.completedByUserId.substring(0, 6)}...{gig.completedByUserId.substring(38)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You haven't created any gigs yet.</p>
        )}
      </div>
    </AppShell>
  );
}

