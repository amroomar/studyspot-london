/**
 * CityContext — manages the active city (London / Bristol)
 * Applies city-specific CSS color variables and provides city data
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type CityId = 'london' | 'bristol';

export interface CityConfig {
  id: CityId;
  name: string;
  tagline: string;
  lat: number;
  lng: number;
  zoom: number;
}

export const CITIES: Record<CityId, CityConfig> = {
  london: {
    id: 'london',
    name: 'London',
    tagline: 'Discover 310+ curated cafes, libraries, and hidden gems across London.',
    lat: 51.515,
    lng: -0.09,
    zoom: 12,
  },
  bristol: {
    id: 'bristol',
    name: 'Bristol',
    tagline: 'Discover 100+ curated cafes, libraries, and hidden gems across Bristol.',
    lat: 51.4545,
    lng: -2.5879,
    zoom: 13,
  },
};

// Bristol color overrides — teal/harbour blue palette
const BRISTOL_COLORS = {
  light: {
    '--primary': 'oklch(0.48 0.12 220)',
    '--primary-foreground': 'oklch(0.98 0.005 220)',
    '--accent': 'oklch(0.65 0.12 180)',
    '--accent-foreground': 'oklch(0.22 0.015 220)',
    '--ring': 'oklch(0.48 0.12 220)',
    '--chart-1': 'oklch(0.48 0.12 220)',
    '--chart-2': 'oklch(0.65 0.12 180)',
    '--chart-3': 'oklch(0.55 0.08 200)',
  },
  dark: {
    '--primary': 'oklch(0.65 0.12 220)',
    '--primary-foreground': 'oklch(0.12 0.01 220)',
    '--accent': 'oklch(0.6 0.12 180)',
    '--accent-foreground': 'oklch(0.12 0.01 220)',
    '--ring': 'oklch(0.65 0.12 220)',
    '--chart-1': 'oklch(0.65 0.12 220)',
    '--chart-2': 'oklch(0.6 0.12 180)',
    '--chart-3': 'oklch(0.55 0.08 200)',
  },
};

// London defaults (restore from CSS)
const LONDON_COLORS = {
  light: {
    '--primary': 'oklch(0.42 0.06 145)',
    '--primary-foreground': 'oklch(0.98 0.005 75)',
    '--accent': 'oklch(0.72 0.1 75)',
    '--accent-foreground': 'oklch(0.22 0.015 60)',
    '--ring': 'oklch(0.42 0.06 145)',
    '--chart-1': 'oklch(0.42 0.06 145)',
    '--chart-2': 'oklch(0.72 0.1 75)',
    '--chart-3': 'oklch(0.58 0.05 145)',
  },
  dark: {
    '--primary': 'oklch(0.62 0.06 145)',
    '--primary-foreground': 'oklch(0.12 0.01 60)',
    '--accent': 'oklch(0.72 0.1 75)',
    '--accent-foreground': 'oklch(0.12 0.01 60)',
    '--ring': 'oklch(0.62 0.06 145)',
    '--chart-1': 'oklch(0.62 0.06 145)',
    '--chart-2': 'oklch(0.72 0.1 75)',
    '--chart-3': 'oklch(0.58 0.05 145)',
  },
};

interface CityContextValue {
  city: CityId;
  cityConfig: CityConfig;
  setCity: (city: CityId) => void;
}

const CityContext = createContext<CityContextValue>({
  city: 'london',
  cityConfig: CITIES.london,
  setCity: () => {},
});

export function CityProvider({ children }: { children: ReactNode }) {
  const [city, setCityState] = useState<CityId>(() => {
    const stored = localStorage.getItem('studyspot-city');
    return (stored === 'bristol' ? 'bristol' : 'london') as CityId;
  });

  const setCity = (newCity: CityId) => {
    setCityState(newCity);
    localStorage.setItem('studyspot-city', newCity);
  };

  // Apply city-specific CSS variables
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    const colors = city === 'bristol'
      ? (isDark ? BRISTOL_COLORS.dark : BRISTOL_COLORS.light)
      : (isDark ? LONDON_COLORS.dark : LONDON_COLORS.light);

    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Also update sidebar colors to match
    root.style.setProperty('--sidebar-primary', colors['--primary']);
    root.style.setProperty('--sidebar-primary-foreground', colors['--primary-foreground']);
    root.style.setProperty('--sidebar-ring', colors['--ring']);
  }, [city]);

  // Re-apply when theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      const colors = city === 'bristol'
        ? (isDark ? BRISTOL_COLORS.dark : BRISTOL_COLORS.light)
        : (isDark ? LONDON_COLORS.dark : LONDON_COLORS.light);

      const root = document.documentElement;
      Object.entries(colors).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
      root.style.setProperty('--sidebar-primary', colors['--primary']);
      root.style.setProperty('--sidebar-primary-foreground', colors['--primary-foreground']);
      root.style.setProperty('--sidebar-ring', colors['--ring']);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [city]);

  return (
    <CityContext.Provider value={{ city, cityConfig: CITIES[city], setCity }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  return useContext(CityContext);
}
