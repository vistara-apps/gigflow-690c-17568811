    'use client';

    import { useAccount } from 'wagmi';
    import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
    import { User } from '../types.js';
    import { AppShell } from '../components/AppShell.js';
    import { PrimaryButton } from '../components/PrimaryButton.js';
    import { SkillTag } from '../components/SkillTag.js';
    import { useState } from 'react';

    export default function Profile() {
      const { address } = useAccount();
      const queryClient = useQueryClient();
      const [newSkill, setNewSkill] = useState('');

      const { data: user } = useQuery<User>({
        queryKey: ['user', address],
        queryFn: async () => {
          const res = await fetch(`/api/users?userId=${address}`);
          return res.json();
        },
      });

      const updateSkillsMutation = useMutation({
        mutationFn: async (skills: string[]) => {
          const res = await fetch('/api/users', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: address, skills }),
          });
          if (!res.ok) throw new Error('Failed to update skills');
          return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user', address] }),
      });

      const addSkill = () => {
        if (newSkill && user) {
          const updatedSkills = [...user.skills, newSkill];
          updateSkillsMutation.mutate(updatedSkills);
          setNewSkill('');
        }
      };

      return (
        <AppShell>
          <h2 className="text-display mb-4">Skill Profile</h2>
          <div className="flex flex-wrap">
            {user?.skills.map((skill) => (
              <SkillTag key={skill} skill={skill} />
            ))}
          </div>
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="border rounded-md p-2 mt-4"
            placeholder="Add a skill"
          />
          <PrimaryButton onClick={addSkill} className="ml-2">
            Add Skill
          </PrimaryButton>
        </AppShell>
      );
    }
  