'use client';

import { useAccount } from 'wagmi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Offering } from '../types.js';
import { AppShell } from '../components/AppShell.js';
import { OfferingForm } from '../components/OfferingForm.js';
import { PrimaryButton } from '../components/PrimaryButton.js';
import { SkillTag } from '../components/SkillTag.js';
import { useState } from 'react';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';

export default function Offerings() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingOffering, setEditingOffering] = useState<Offering | undefined>(undefined);

  // Fetch user's offerings
  const { data: offerings, isLoading } = useQuery<Offering[]>({
    queryKey: ['offerings', address],
    queryFn: async () => {
      if (!address) return [];
      const res = await fetch(`/api/offerings?userId=${address}`);
      if (!res.ok) throw new Error('Failed to fetch offerings');
      return res.json();
    },
    enabled: !!address,
  });

  // Delete offering mutation
  const deleteMutation = useMutation({
    mutationFn: async (offeringId: string) => {
      const res = await fetch(`/api/offerings?offeringId=${offeringId}&userId=${address}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete offering');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offerings', address] });
    },
  });

  const handleCreateSuccess = (offering: Offering) => {
    queryClient.invalidateQueries({ queryKey: ['offerings', address] });
    setShowForm(false);
    setEditingOffering(undefined);
  };

  const startEditing = (offering: Offering) => {
    setEditingOffering(offering);
    setShowForm(true);
  };

  const handleDelete = async (offeringId: string) => {
    if (window.confirm('Are you sure you want to delete this offering?')) {
      await deleteMutation.mutateAsync(offeringId);
    }
  };

  if (!address) {
    return (
      <AppShell>
        <h2 className="text-display mb-4">Connect Wallet to Manage Offerings</h2>
        <ConnectWallet />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-display">Your Skill Offerings</h2>
        <PrimaryButton onClick={() => {
          setEditingOffering(undefined);
          setShowForm(!showForm);
        }}>
          {showForm && !editingOffering ? 'Cancel' : 'Create New Offering'}
        </PrimaryButton>
      </div>

      {showForm && (
        <OfferingForm 
          userId={address} 
          existingOffering={editingOffering}
          onSuccess={handleCreateSuccess} 
        />
      )}

      {isLoading ? (
        <div className="flex justify-center p-4">Loading your offerings...</div>
      ) : offerings && offerings.length > 0 ? (
        <div className="space-y-4">
          {offerings.map((offering) => (
            <div key={offering.offeringId} className="bg-surface p-4 rounded-lg shadow-card">
              <div className="flex justify-between">
                <h3 className="text-display">{offering.title}</h3>
                <span className={`px-2 py-1 rounded-md text-sm ${
                  offering.availability === 'available' 
                    ? 'bg-green-100 text-green-800' 
                    : offering.availability === 'busy'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {offering.availability.charAt(0).toUpperCase() + offering.availability.slice(1)}
                </span>
              </div>
              <p className="my-2">{offering.description}</p>
              <div className="flex flex-wrap my-2">
                {offering.skills.map((skill) => (
                  <SkillTag key={skill} skill={skill} />
                ))}
              </div>
              <p className="font-semibold">Base Price: ${offering.basePrice}</p>
              <div className="flex justify-end space-x-2 mt-2">
                <PrimaryButton 
                  onClick={() => startEditing(offering)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Edit
                </PrimaryButton>
                <PrimaryButton 
                  onClick={() => handleDelete(offering.offeringId)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete
                </PrimaryButton>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p>You haven't created any offerings yet.</p>
          {!showForm && (
            <PrimaryButton onClick={() => setShowForm(true)} className="mt-2">
              Create Your First Offering
            </PrimaryButton>
          )}
        </div>
      )}
    </AppShell>
  );
}

