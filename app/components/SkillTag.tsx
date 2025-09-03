    'use client';

    interface SkillTagProps {
      skill: string;
    }

    export function SkillTag({ skill }: SkillTagProps) {
      return (
        <span className="inline-block bg-accent text-white px-2 py-1 rounded-sm text-sm mr-2 mb-2">
          {skill}
        </span>
      );
    }
  