    'use client';

    import { ButtonHTMLAttributes, forwardRef } from 'react';
    import { cn } from '../../lib/utils.js';

    export const PrimaryButton = forwardRef<
      HTMLButtonElement,
      ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'disabled' }
    >(({ className, variant = 'default', disabled, ...props }, ref) => {
      return (
        <button
          ref={ref}
          disabled={disabled}
          className={cn(
            'px-4 py-2 rounded-md transition duration-base ease-ease',
            variant === 'default' ? 'bg-accent text-white hover:bg-opacity-90' : '',
            variant === 'disabled' || disabled ? 'bg-gray-300 cursor-not-allowed' : '',
            className
          )}
          {...props}
        />
      );
    });
    PrimaryButton.displayName = 'PrimaryButton';
  