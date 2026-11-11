/**
 * Utility to generate SVG Data URI app icons if user doesn't have an external image file
 */
export const generateSvgAppIcon = (name: string, bgGradient: [string, string] = ['#2563eb', '#1d4ed8']): string => {
  const clean = (name || 'APP').trim();
  const parts = clean.split(/\s+/);
  const initials = parts.length >= 2 
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : clean.substring(0, 2).toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradient[0]}" />
        <stop offset="100%" stop-color="${bgGradient[1]}" />
      </linearGradient>
      <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
    </defs>
    <rect width="200" height="200" rx="44" fill="url(#grad)" />
    <rect width="200" height="100" rx="44" fill="url(#shine)" />
    <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4" />
    <text x="50%" y="54%" font-family="system-ui, -apple-system, Roboto, sans-serif" font-size="72" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" letter-spacing="2">
      ${initials}
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const DEFAULT_PRESET_GRADIENTS: Array<{ name: string; colors: [string, string] }> = [
  { name: 'Android Blue', colors: ['#2563eb', '#1d4ed8'] },
  { name: 'Emerald Teal', colors: ['#10b981', '#0f766e'] },
  { name: 'Purple Royal', colors: ['#8b5cf6', '#6d28d9'] },
  { name: 'Sunset Amber', colors: ['#f59e0b', '#d97706'] },
  { name: 'Crimson Red', colors: ['#ef4444', '#b91c1c'] },
  { name: 'Cyan Modern', colors: ['#06b6d4', '#0284c7'] }
];
