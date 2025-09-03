'use client';

import { useState } from 'react';
import { PrimaryButton } from './PrimaryButton';
import { SkillTag } from './SkillTag';
import { ProgressIndicator } from './ProgressIndicator';
import { Offering } from '../types';

interface OfferingFormProps {
  userId: string;
  existingOffering?: Offering;
  onSuccess: (offering: Offering) => void;
}

export function OfferingForm({ userId, existingOffering, onSuccess }: OfferingFormProps) {
  const [title, setTitle] = useState(existingOffering?.title || '');
  const [description, setDescription] = useState(existingOffering?.description || '');
  const [basePrice, setBasePrice] = useState(existingOffering?.basePrice?.toString() || '');
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState<string[]>(existingOffering?.skills || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!existingOffering;

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const offeringData = {
        userId,
        title,
        description,
        skills,
        basePrice: parseFloat(basePrice),
        ...(isEditing && { offeringId: existingOffering.offeringId }),
      };

      const response = await fetch('/api/offerings', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offeringData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save offering');
      }

      const savedOffering = await response.json();
      onSuccess(savedOffering);
      
      if (!isEditing) {
        // Reset form if creating a new offering
        setTitle('');
        setDescription('');
        setBasePrice('');
        setSkills([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-surface p-4 rounded-lg shadow-card">
      <h3 className="text-display mb-2">{isEditing ? 'Edit Offering' : 'Create New Offering'}</h3>
      
      {error && <div className="bg-red-100 text-red-700 p-2 rounded-md">{error}</div>}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="What service are you offering?"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="Describe your service in detail..."
          rows={4}
          required
        />
      </div>
      
      <div>
        <label htmlFor="basePrice" className="block text-sm font-medium mb-1">
          Base Price ($)
        </label>
        <input
          id="basePrice"
          type="number"
          min="0"
          step="0.01"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="5.00"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Skills</label>
        <div className="flex flex-wrap mb-2">
          {skills.map((skill) => (
            <div key={skill} className="flex items-center mr-2 mb-2">
              <SkillTag skill={skill} />
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-1 text-xs text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="flex-grow p-2 border rounded-l-md"
            placeholder="Add a skill"
          />
          <button
            type="button"
            onClick={addSkill}
            className="bg-accent text-white px-3 py-2 rounded-r-md"
          >
            Add
          </button>
        </div>
      </div>
      
      <div className="flex justify-end">
        <PrimaryButton type="submit" disabled={loading}>
          {loading ? <ProgressIndicator /> : isEditing ? 'Update Offering' : 'Create Offering'}
        </PrimaryButton>
      </div>
    </form>
  );
}

