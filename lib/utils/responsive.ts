import { useEffect, useState } from 'react';

// Breakpoint definitions (matching Tailwind CSS)
export const breakpoints = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Hook to detect current screen size and responsive breakpoints
 */
export function useResponsive() {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isBreakpoint = (breakpoint: Breakpoint) => {
    return screenSize.width >= breakpoints[breakpoint];
  };

  const isMobile = screenSize.width < breakpoints.md;
  const isTablet = screenSize.width >= breakpoints.md && screenSize.width < breakpoints.lg;
  const isDesktop = screenSize.width >= breakpoints.lg;

  const getCurrentBreakpoint = (): Breakpoint => {
    if (screenSize.width >= breakpoints['2xl']) return '2xl';
    if (screenSize.width >= breakpoints.xl) return 'xl';
    if (screenSize.width >= breakpoints.lg) return 'lg';
    if (screenSize.width >= breakpoints.md) return 'md';
    if (screenSize.width >= breakpoints.sm) return 'sm';
    return 'xs';
  };

  return {
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
    isBreakpoint,
    currentBreakpoint: getCurrentBreakpoint(),
    // Convenience helpers
    isXs: !isBreakpoint('sm'),
    isSm: isBreakpoint('sm') && !isBreakpoint('md'),
    isMd: isBreakpoint('md') && !isBreakpoint('lg'),
    isLg: isBreakpoint('lg') && !isBreakpoint('xl'),
    isXl: isBreakpoint('xl') && !isBreakpoint('2xl'),
    is2xl: isBreakpoint('2xl')
  };
}

/**
 * Hook to detect if user prefers reduced motion
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to detect user's preferred color scheme
 */
export function usePrefersDarkMode() {
  const [prefersDarkMode, setPrefersDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersDarkMode;
}

/**
 * Hook to detect if device supports touch
 */
export function useTouch() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore - for older browsers
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouch();
  }, []);

  return isTouch;
}

/**
 * Hook to detect device orientation
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    handleOrientationChange(); // Initial call
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape'
  };
}

/**
 * Hook to detect network connection status
 */
export function useOnline() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? window.navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook to get device pixel ratio
 */
export function useDevicePixelRatio() {
  const [devicePixelRatio, setDevicePixelRatio] = useState(
    typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleChange = () => {
      setDevicePixelRatio(window.devicePixelRatio || 1);
    };

    // Listen for changes in device pixel ratio
    const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return devicePixelRatio;
}

/**
 * Utility function to get responsive values based on current breakpoint
 */
export function getResponsiveValue<T>(
  values: Partial<Record<Breakpoint, T>>,
  currentBreakpoint: Breakpoint,
  fallback?: T
): T | undefined {
  // Try current breakpoint first
  if (values[currentBreakpoint] !== undefined) {
    return values[currentBreakpoint];
  }

  // Fall back to smaller breakpoints
  const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

  for (let i = currentIndex + 1; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }

  return fallback;
}

/**
 * Utility function to generate responsive class names
 */
export function generateResponsiveClasses(
  baseClass: string,
  responsive: Partial<Record<Breakpoint, string>>
): string {
  let classes = baseClass;

  Object.entries(responsive).forEach(([breakpoint, modifier]) => {
    if (breakpoint === 'xs') {
      classes += ` ${baseClass}-${modifier}`;
    } else {
      classes += ` ${breakpoint}:${baseClass}-${modifier}`;
    }
  });

  return classes;
}

/**
 * Constants for common responsive patterns
 */
export const responsivePatterns = {
  // Grid columns
  gridCols: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
    '2xl': 6
  } as const,

  // Container widths
  container: {
    xs: 'max-w-full',
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl'
  } as const,

  // Spacing scales
  spacing: {
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    '2xl': 16
  } as const,

  // Font sizes
  fontSize: {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  } as const
} as const;

/**
 * Hook to combine multiple responsive utilities
 */
export function useResponsiveDesign() {
  const responsive = useResponsive();
  const prefersReducedMotion = usePrefersReducedMotion();
  const prefersDarkMode = usePrefersDarkMode();
  const isTouch = useTouch();
  const orientation = useOrientation();
  const isOnline = useOnline();
  const devicePixelRatio = useDevicePixelRatio();

  return {
    ...responsive,
    prefersReducedMotion,
    prefersDarkMode,
    isTouch,
    ...orientation,
    isOnline,
    devicePixelRatio,
    // Derived properties
    isHighDensity: devicePixelRatio >= 2,
    isMobileDevice: responsive.isMobile && isTouch,
    shouldReduceAnimations: prefersReducedMotion || responsive.isMobile,
    // Utility functions
    getResponsiveValue: (values: Partial<Record<Breakpoint, any>>, fallback?: any) =>
      getResponsiveValue(values, responsive.currentBreakpoint, fallback)
  };
}