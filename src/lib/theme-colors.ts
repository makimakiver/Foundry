/**
 * Theme Color Mapping Helper
 * Maps static Foundry³ colors to CSS custom properties that adapt to light/dark themes
 */

export const themeColors = {
  // Background colors
  'bg-[#0D0E10]': 'bg-background',
  'bg-[#1E1F24]': 'bg-card',
  'bg-[#1E1F24]/80': 'bg-card/80',
  'bg-[#1E1F24]/30': 'bg-card/30',
  
  // Text colors
  'text-[#E8E9EB]': 'text-foreground',
  'text-[#A0A2A8]': 'text-muted-foreground',
  
  // Border colors
  'border-[#E8E9EB]/10': 'border-border',
  'border-[#E8E9EB]/20': 'border-border',
  
  // Placeholder text
  'placeholder:text-[#A0A2A8]': 'placeholder:text-muted-foreground',
  
  // Focus/hover states
  'focus:bg-[#0D0E10]': 'focus:bg-muted',
  'focus:text-[#E8E9EB]': 'focus:text-foreground',
  'hover:bg-[#1E1F24]': 'hover:bg-card',
  'hover:text-[#E8E9EB]': 'hover:text-foreground',
} as const;

/**
 * Brand colors that stay the same in both themes
 */
export const brandColors = {
  electricCyan: '#00E0FF',
  foundryOrange: '#FF6B00',
  neonMagenta: '#C04BFF',
  mintGreen: '#00FFA3',
  crimsonPulse: '#FF3366',
} as const;
