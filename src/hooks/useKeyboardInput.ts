import { useEffect, useRef } from 'react';

interface UseKeyboardInputProps {
  onKeyPress: (key: string) => void;
  isEnabled: boolean;
  isGameStarted: boolean;
  onEnterPress?: () => void;
}

export const useKeyboardInput = ({ onKeyPress, isEnabled, isGameStarted, onEnterPress }: UseKeyboardInputProps) => {
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (isProcessingRef.current) return;

      const key = event.key.toLowerCase();
      
      // Handle Enter key for starting game
      if ((key === 'enter' || key === 'return') && !isGameStarted && onEnterPress) {
        onEnterPress();
        return;
      }

      // Handle letter keys during game
      if (isEnabled && /^[a-z]$/.test(key)) {
        isProcessingRef.current = true;
        await onKeyPress(key);
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 500);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEnabled, isGameStarted, onKeyPress, onEnterPress]);

  return isProcessingRef.current;
};