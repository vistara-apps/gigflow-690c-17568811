    'use client';

    import { Gig } from '../types.js';
    import { PrimaryButton } from './PrimaryButton.js';
    import { SkillTag } from './SkillTag.js';
    import { useState } from 'react';

    interface GigCardProps {
      gig: Gig;
      onAccept: (gigId: string) => void;
      onComplete: (gigId: string) => void;
      isAcceptedByUser: boolean;
    }

    export function GigCard({ gig, onAccept, onComplete, isAcceptedByUser }: GigCardProps) {
      const [loading, setLoading] = useState(false);

      const handleAccept = async () => {
        setLoading(true);
        await onAccept(gig.gigId);
        setLoading(false);
      };

      const handleComplete = async () => {
        setLoading(true);
        await onComplete(gig.gigId);
        setLoading(false);
      };

      let variant = 'default';
      if (gig.status === 'completed') variant = 'completed';
      else if (gig.status === 'accepted') variant = 'active';

      return (
        <div className={`p-4 rounded-lg shadow-card bg-surface mb-4 ${variant === 'completed' ? 'opacity-50' : ''}`}>
          <h3 className="text-display">{gig.title}</h3>
          <p className="text-body">{gig.description}</p>
          <div className="flex flex-wrap mt-2">
            {gig.skillsRequired.map((skill) => (
              <SkillTag key={skill} skill={skill} />
            ))}
          </div>
          <p className="mt-2">Payout: ${gig.payoutAmount}</p>
          {gig.status === 'open' && (
            <PrimaryButton onClick={handleAccept} disabled={loading}>
              Accept Gig
            </PrimaryButton>
          )}
          {isAcceptedByUser && gig.status === 'accepted' && (
            <PrimaryButton onClick={handleComplete} disabled={loading}>
              Mark Complete
            </PrimaryButton>
          )}
        </div>
      );
    }
  