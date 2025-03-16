import { AlphabetData } from '../types/types';

interface ImageCardProps {
  currentImage: AlphabetData | null;
  feedback: string;
}

export const ImageCard = ({ currentImage, feedback }: ImageCardProps) => {
  if (!currentImage) return null;
  
  const word = currentImage.image.split('/').pop()?.split('.')[0].toLowerCase() || '';
  
  return (
    <div className="relative">
      <div className="flex flex-col items-center">
        <div className="w-[280px] h-[280px] md:w-[350px] md:h-[350px] flex flex-col items-center justify-between rounded-2xl overflow-hidden bg-white shadow-xl relative">
          <img src={currentImage.image} alt={currentImage.letter} className="w-full h-full object-contain p-4" />
          <div className="absolute bottom-0 w-full bg-white/80 backdrop-blur-sm py-2 px-4">
            <p className="text-lg md:text-xl text-gray-700 font-medium text-center">{word}</p>
          </div>
        </div>
      </div>
      {feedback && (
        <div className={`absolute inset-0 flex items-center justify-center text-lg md:text-2xl font-bold ${
          feedback.startsWith('Correct') ? 'text-green-600' : 'text-red-600'
        } bg-white/80 backdrop-blur-sm rounded-lg`}>
          {feedback}
        </div>
      )}
    </div>
  );
};