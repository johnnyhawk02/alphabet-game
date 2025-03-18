import { useEffect, useState } from 'react';

export const useStandaloneMode = () => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if the app is running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('ios-app://');

    // Detect iOS
    const ios = /ipad|iphone|ipod/.test(window.navigator.userAgent.toLowerCase()) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    setIsStandalone(standalone);
    setIsIOS(ios);

    // Listen for changes in display mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle iOS-specific behaviors
  useEffect(() => {
    if (isIOS) {
      // Prevent bounce effect on iOS
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      
      // Handle safe areas for notched devices
      document.body.style.paddingTop = 'env(safe-area-inset-top)';
      document.body.style.paddingBottom = 'env(safe-area-inset-bottom)';
    }
    
    return () => {
      if (isIOS) {
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.paddingTop = '';
        document.body.style.paddingBottom = '';
      }
    };
  }, [isIOS]);

  return { isStandalone, isIOS };
};