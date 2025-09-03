'use client';

import { useState } from 'react';
import { User } from '../types';
import { PrimaryButton } from './PrimaryButton';
import { ProgressIndicator } from './ProgressIndicator';
import { verifyFarcasterIdentity, linkFarcasterAccount } from '../../lib/farcaster';

interface FarcasterProfileProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

export function FarcasterProfile({ user, onUpdate }: FarcasterProfileProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [farcasterId, setFarcasterId] = useState('');
  
  const isLinked = !!user.farcasterId;

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would use the Farcaster API
      // For this demo, we'll simulate the verification process
      const farcasterUser = await verifyFarcasterIdentity(user.walletAddress);
      
      if (farcasterUser) {
        // Link the Farcaster account to the user
        const updatedUser = await linkFarcasterAccount(user.userId, farcasterUser.fid);
        if (updatedUser) {
          onUpdate(updatedUser);
        } else {
          setError('Failed to link Farcaster account');
        }
      } else {
        setError('No Farcaster account found for this wallet address');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleManualLink = async () => {
    if (!farcasterId) {
      setError('Please enter a Farcaster ID');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Update the user with the provided Farcaster ID
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.userId,
          farcasterId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      const updatedUser = await response.json();
      onUpdate(updatedUser);
      setFarcasterId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface p-4 rounded-lg shadow-card">
      <h3 className="text-display mb-2">Farcaster Identity</h3>
      
      {error && <div className="bg-red-100 text-red-700 p-2 rounded-md mb-4">{error}</div>}
      
      {isLinked ? (
        <div>
          <div className="flex items-center mb-4">
            <div className="bg-accent text-white p-2 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Farcaster Account Linked</p>
              <p className="text-sm text-gray-600">ID: {user.farcasterId}</p>
              {user.farcasterUsername && (
                <p className="text-sm text-gray-600">Username: @{user.farcasterUsername}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-4">Link your Farcaster account to enhance your profile and build trust with other users.</p>
          
          <div className="mb-4">
            <PrimaryButton onClick={handleVerify} disabled={loading}>
              {loading ? <ProgressIndicator /> : 'Verify with Farcaster'}
            </PrimaryButton>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-600 mb-2">Or manually enter your Farcaster ID:</p>
            <div className="flex">
              <input
                type="text"
                value={farcasterId}
                onChange={(e) => setFarcasterId(e.target.value)}
                className="flex-grow p-2 border rounded-l-md"
                placeholder="Enter Farcaster ID"
              />
              <PrimaryButton 
                onClick={handleManualLink} 
                disabled={loading || !farcasterId}
                className="rounded-l-none"
              >
                {loading ? <ProgressIndicator /> : 'Link'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

