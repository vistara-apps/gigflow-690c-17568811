'use client';

import { useState } from 'react';
import { Gig } from '../types';
import { SkillTag } from './SkillTag';
import { PrimaryButton } from './PrimaryButton';
import { formatAddress, formatDate } from '../lib/utils';

interface GigCardProps {
  gig: Gig;
  onAccept: (gigId: string) => void;
  onComplete: (gigId: string) => void;
  isAcceptedByUser: boolean;
}

export function GigCard({ gig, onAccept, onComplete, isAcceptedByUser }: GigCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isOpen = gig.status === 'open';
  const isAccepted = gig.status === 'accepted';
  const isCompleted = gig.status === 'completed';

  const handleAccept = () => {
    onAccept(gig.gigId);
  };

  const handleComplete = () => {
    onComplete(gig.gigId);
  };

  return (
    <div className="border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{gig.title}</h3>
          <p className={`text-sm ${expanded ? '' : 'line-clamp-2'}`}>{gig.description}</p>
          {gig.description.length > 120 && (
            <button 
              onClick={() => setExpanded(!expanded)} 
              className="text-blue-500 text-sm mt-1"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
        <div className="text-right">
          <div className="font-semibold">${gig.payoutAmount.toFixed(2)}</div>
          <div className={`text-sm px-2 py-1 rounded-full inline-block ${
            isOpen ? 'bg-green-100 text-green-800' : 
            isAccepted ? 'bg-yellow-100 text-yellow-800' : 
            'bg-blue-100 text-blue-800'
          }`}>
            {gig.status}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {gig.skills?.map(skill => (
          <SkillTag key={skill} skill={skill} />
        ))}
        {gig.skillsRequired?.map(skill => (
          <SkillTag key={skill} skill={skill} />
        ))}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {gig.createdByUserId && (
            <div>Posted by: {formatAddress(gig.createdByUserId)}</div>
          )}
          {gig.postedByUserId && !gig.createdByUserId && (
            <div>Posted by: {formatAddress(gig.postedByUserId)}</div>
          )}
          <div>Created: {gig.createdAt ? formatDate(gig.createdAt) : 'Unknown'}</div>
        </div>

        <div>
          {isOpen && (
            <PrimaryButton onClick={handleAccept}>
              Accept Gig
            </PrimaryButton>
          )}
          {isAccepted && isAcceptedByUser && (
            <PrimaryButton onClick={handleComplete}>
              Mark Complete
            </PrimaryButton>
          )}
          {isCompleted && (
            <span className="text-green-600 font-medium">Completed</span>
          )}
        </div>
      </div>
    </div>
  );
}

