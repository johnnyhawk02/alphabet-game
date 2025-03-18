import { AlphabetData } from '../types/types';
import { useEffect, useState, useRef } from 'react';

interface ImageCardProps {
  currentImage: AlphabetData | null;
  feedback: string;
}

export const ImageCard = ({ currentImage, feedback }: ImageCardProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    setIsImageLoaded(false);
    setIsVisible(false);
    
    if (currentImage) {
      const img = new Image();
      img.onload = () => {
        setIsImageLoaded(true);
        // Only show the image once it's loaded
        setTimeout(() => setIsVisible(true), 50);
      };
      img.src = currentImage.image;
    }
  }, [currentImage]);
  
  if (!currentImage) return null;
  
  const word = currentImage.image.split('/').pop()?.split('.')[0].toLowerCase() || '';
  const isWrong = feedback.startsWith('Wrong');
  const isCorrect = feedback.startsWith('Correct');
  
  return (
    <div className="w-full md:w-4/5 max-h-[60vh] flex items-center justify-center p-2 md:p-4">
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div 
          className={`w-full max-w-[min(90vw,60vh)] aspect-square flex flex-col items-center justify-between rounded-2xl overflow-hidden bg-white shadow-xl relative 
            transition-all duration-500 ease-in-out
            ${isWrong ? 'animate-[shake_0.5s_ease-in-out]' : ''}
            ${!isVisible || !isImageLoaded ? 'opacity-0' : 'opacity-100'}
            ${isCorrect ? 'animate-[fade-out_0.5s_ease-in-out_forwards_2.7s]' : ''}`}
        >
          <div className="w-full h-full p-3 md:p-4">
            <img 
              ref={imgRef}
              src={currentImage.image} 
              alt={currentImage.letter} 
              className={`w-full h-full object-contain drop-shadow-xl transition-opacity duration-500`}
              onLoad={() => setIsImageLoaded(true)}
            />
          </div>
          
          <div className={`absolute bottom-0 w-full bg-white/90 backdrop-blur-sm py-2 md:py-3 px-4 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-3xl md:text-4xl lg:text-5xl text-gray-700 font-bold text-center">{word}</p>
          </div>
          
          {isWrong && (
            <div className="absolute inset-0 bg-red-500/20 animate-[wrong-overlay_0.5s_ease-in-out]" />
          )}
          
          {isCorrect && (
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
          )}
        </div>
      </div>
    </div>
  );
};