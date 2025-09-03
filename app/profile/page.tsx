'use client';

import { useAccount } from 'wagmi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '../types.js';
import { AppShell } from '../components/AppShell.js';
import { PrimaryButton } from '../components/PrimaryButton.js';
import { SkillTag } from '../components/SkillTag.js';
import { FarcasterProfile } from '../components/FarcasterProfile.js';
import { useState } from 'react';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';

export default function Profile() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [newSkill, setNewSkill] = useState('');
  const [username, setUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['user', address],
    queryFn: async () => {
      if (!address) return null;
      const res = await fetch(`/api/users?userId=${address}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
    enabled: !!address,
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User> & { userId: string }) => {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error('Failed to update user');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user', address] }),
  });

  const addSkill = () => {
    if (newSkill && user) {
      if (!user.skills.includes(newSkill)) {
        const updatedSkills = [...user.skills, newSkill];
        updateUserMutation.mutate({ userId: user.userId, skills: updatedSkills });
      }
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    if (user) {
      const updatedSkills = user.skills.filter(skill => skill !== skillToRemove);
      updateUserMutation.mutate({ userId: user.userId, skills: updatedSkills });
    }
  };

  const updateUsername = () => {
    if (user && username) {
      updateUserMutation.mutate({ userId: user.userId, username });
      setIsEditingUsername(false);
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    queryClient.setQueryData(['user', address], updatedUser);
  };

  if (!address) {
    return (
      <AppShell>
        <h2 className="text-display mb-4">Connect Wallet to View Profile</h2>
        <ConnectWallet />
      </AppShell>
    );
  }

  if (isLoading) {
    return (
      <AppShell>
        <h2 className="text-display mb-4">Loading Profile...</h2>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <h2 className="text-display mb-4">Profile Not Found</h2>
        <p>There was an error loading your profile.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h2 className="text-display mb-4">Your Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-surface p-4 rounded-lg shadow-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Profile Information</h3>
            {!isEditingUsername && (
              <PrimaryButton 
                onClick={() => {
                  setUsername(user.username || '');
                  setIsEditingUsername(true);
                }}
                className="text-sm px-3 py-1"
              >
                Edit
              </PrimaryButton>
            )}
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600">Wallet Address</p>
            <p className="font-mono text-sm break-all">{user.walletAddress}</p>
          </div>
          
          {isEditingUsername ? (
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm text-gray-600 mb-1">
                Username
              </label>
              <div className="flex">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-grow p-2 border rounded-l-md"
                  placeholder="Enter username"
                />
                <PrimaryButton 
                  onClick={updateUsername} 
                  className="rounded-l-none"
                >
                  Save
                </PrimaryButton>
                <button
                  onClick={() => setIsEditingUsername(false)}
                  className="ml-2 px-3 py-2 border rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-sm text-gray-600">Username</p>
              <p className="font-medium">{user.username || 'Not set'}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm text-gray-600">Member Since</p>
            <p>{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <FarcasterProfile user={user} onUpdate={handleUserUpdate} />
      </div>
      
      <div className="bg-surface p-4 rounded-lg shadow-card mb-6">
        <h3 className="font-semibold text-lg mb-4">Your Skills</h3>
        
        <div className="flex flex-wrap mb-4">
          {user.skills.map((skill) => (
            <div key={skill} className="flex items-center mr-2 mb-2">
              <SkillTag skill={skill} />
              <button
                onClick={() => removeSkill(skill)}
                className="ml-1 text-xs text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
          {user.skills.length === 0 && (
            <p className="text-gray-500">No skills added yet. Add skills to showcase your abilities.</p>
          )}
        </div>
        
        <div className="flex">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="flex-grow p-2 border rounded-l-md"
            placeholder="Add a skill"
          />
          <PrimaryButton onClick={addSkill} className="rounded-l-none">
            Add Skill
          </PrimaryButton>
        </div>
      </div>
    </AppShell>
  );
}
