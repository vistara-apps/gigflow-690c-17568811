/**
 * Design tokens for the GigFlow application
 * 
 * This file contains the design tokens as specified in the PRD.
 * These tokens are used to maintain consistent styling throughout the application.
 */

export const designTokens = {
  /**
   * Layout tokens
   */
  layout: {
    grid: 'No fixed grid for a freeform MiniApp layout, but focus on vertical rhythm and spacing.',
    container: 'max-w-full px-4 py-4',
  },
  
  /**
   * Motion tokens
   */
  motion: {
    easing: 'cubic-bezier(0.22,1,0.36,1)',
    duration: {
      base: 250,
      fast: 150,
    },
  },
  
  /**
   * Color tokens
   */
  colors: {
    bg: 'hsl(210 40% 96.1%)',
    accent: 'hsl(208 92.3% 53%)',
    primary: 'hsl(240 9.8% 46.1%)',
    surface: 'hsl(0 0% 100%)',
  },
  
  /**
   * Border radius tokens
   */
  radius: {
    lg: 16,
    md: 10,
    sm: 6,
  },
  
  /**
   * Shadow tokens
   */
  shadows: {
    card: '0 4px 12px hsla(0, 0%, 0%, 0.08)',
  },
  
  /**
   * Spacing tokens
   */
  spacing: {
    lg: 20,
    md: 12,
    sm: 8,
  },
  
  /**
   * Typography tokens
   */
  typography: {
    body: 'text-base leading-6',
    display: 'text-xl font-semibold',
  },
};

/**
 * CSS variables for design tokens
 * 
 * These variables can be used in the global CSS file to make the design tokens
 * available as CSS variables throughout the application.
 */
export const cssVariables = `
  :root {
    /* Colors */
    --color-bg: ${designTokens.colors.bg};
    --color-accent: ${designTokens.colors.accent};
    --color-primary: ${designTokens.colors.primary};
    --color-surface: ${designTokens.colors.surface};
    
    /* Border Radius */
    --radius-lg: ${designTokens.radius.lg}px;
    --radius-md: ${designTokens.radius.md}px;
    --radius-sm: ${designTokens.radius.sm}px;
    
    /* Shadows */
    --shadow-card: ${designTokens.shadows.card};
    
    /* Spacing */
    --spacing-lg: ${designTokens.spacing.lg}px;
    --spacing-md: ${designTokens.spacing.md}px;
    --spacing-sm: ${designTokens.spacing.sm}px;
    
    /* Motion */
    --easing: ${designTokens.motion.easing};
    --duration-base: ${designTokens.motion.duration.base}ms;
    --duration-fast: ${designTokens.motion.duration.fast}ms;
  }
`;

