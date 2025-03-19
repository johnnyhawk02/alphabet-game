import { memo } from 'react';

interface LetterOptionsProps {
  options: string[];
  visibleLetters: string[];
  highlightedLetter: string | null;
  audioPlaying: boolean;
  optionsVisible: boolean;
  onLetterClick: (letter: string) => void;
}

/**
 * Component for displaying letter options during gameplay
 */
export const LetterOptions = memo(({
  options,
  visibleLetters,
  highlightedLetter,
  audioPlaying,
  optionsVisible,
  onLetterClick
}: LetterOptionsProps) => {
  return (
    <div className={`letter-options w-full pb-safe transition-opacity duration-500 relative z-10 ${optionsVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex justify-center gap-4 md:gap-6 p-4">
        {options.map((letter) => (
          <button
            key={letter}
            onClick={() => !audioPlaying && onLetterClick(letter)}
            disabled={audioPlaying || !optionsVisible || !visibleLetters.includes(letter)}
            className={`w-[25vw] h-[25vw] max-w-[140px] max-h-[140px] rounded-full bg-white text-gray-700 text-4xl md:text-6xl font-bold shadow-lg 
                     flex items-center justify-center border-4 relative
                     transition-all duration-500
                     ${!visibleLetters.includes(letter) ? 'opacity-0' : 'animate-[fade-in_500ms_ease-in-out_forwards]'}
                     ${highlightedLetter === letter ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300/50'}
                     ${!audioPlaying && visibleLetters.includes(letter) ? 'hover:bg-gray-50 active:scale-95 hover:border-gray-400' : ''}
                     disabled:cursor-not-allowed`}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
});

LetterOptions.displayName = 'LetterOptions';