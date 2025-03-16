import { AlphabetData } from '../types/types';
import { useEffect, useState, useRef } from 'react';

interface ImageCardProps {
  currentImage: AlphabetData | null;
  feedback: string;
}

export const ImageCard = ({ currentImage, feedback }: ImageCardProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    // Reset image loaded state when current image changes
    setIsImageLoaded(false);
    
    // Preload the image
    if (currentImage) {
      const img = new Image();
      img.onload = () => setIsImageLoaded(true);
      img.src = currentImage.image;
    }
  }, [currentImage]);
  
  if (!currentImage) return null;
  
  const word = currentImage.image.split('/').pop()?.split('.')[0].toLowerCase() || '';
  const isWrong = feedback.startsWith('Wrong');
  const isCorrect = feedback.startsWith('Correct');
  
  return (
    <div className="relative">
      <div className="flex flex-col items-center">
        <div className={`w-[280px] h-[280px] md:w-[350px] md:h-[350px] flex flex-col items-center justify-between rounded-2xl overflow-hidden bg-white shadow-xl relative 
          ${isWrong ? 'animate-[shake_0.5s_ease-in-out]' : ''}
          ${isCorrect ? 'animate-[pop-and-scale_1.2s_ease-in-out,normal-size_0.5s_ease-out_1.2s,wait_1s_1.7s,shrink_0.5s_ease-in-out_2.7s]' : 'animate-[zoom-in_0.5s_ease-out]'}`}>
          {/* Image is rendered but initially invisible until loaded */}
          <div className={`w-full h-full transition-opacity duration-100 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <img 
              ref={imgRef}
              src={currentImage.image} 
              alt={currentImage.letter} 
              className="w-full h-full object-contain p-4"
              onLoad={() => setIsImageLoaded(true)}
            />
          </div>
          
          <div className="absolute bottom-0 w-full bg-white backdrop-blur-sm py-2 px-4">
            <p className="text-lg md:text-xl text-gray-700 font-medium text-center">{word}</p>
          </div>
          
          {isWrong && (
            <div className="absolute inset-0 bg-red-500/20 animate-[wrong-overlay_0.5s_ease-in-out]" />
          )}
          
          {isCorrect && (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full relative">
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute bg-yellow-300/60 w-8 h-8 rounded-full sparkle"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '1.2s'
                      }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};