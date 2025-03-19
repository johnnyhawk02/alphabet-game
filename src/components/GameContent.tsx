import { ImageCard } from './ImageCard';
import { LetterOptions } from './LetterOptions';
import { AlphabetData } from '../types/types';

interface GameContentProps {
  currentImage: AlphabetData | null;
  feedback: string;
  options: string[];
  visibleLetters: string[];
  highlightedLetter: string | null;
  audioPlaying: boolean;
  optionsVisible: boolean;
  onLetterClick: (letter: string) => void;
}

/**
 * Component for displaying the main gameplay content
 */
export const GameContent = ({
  currentImage,
  feedback,
  options,
  visibleLetters,
  highlightedLetter,
  audioPlaying,
  optionsVisible,
  onLetterClick
}: GameContentProps) => {
  return (
    <div className="flex flex-col items-center justify-between h-full gap-4">
      <div className="flex-1 w-full flex items-center justify-center">
        <ImageCard currentImage={currentImage} feedback={feedback} />
      </div>
      
      <LetterOptions 
        options={options}
        visibleLetters={visibleLetters}
        highlightedLetter={highlightedLetter}
        audioPlaying={audioPlaying}
        optionsVisible={optionsVisible}
        onLetterClick={onLetterClick}
      />
    </div>
  );
};