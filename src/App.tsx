import { useState, useEffect, useRef } from 'react';

interface AlphabetData {
  letter: string;
  image: string;
}

interface FailedWord {
  word: string;
  count: number;
}

const AlphabetGameApp = () => {
  const [currentImage, setCurrentImage] = useState<AlphabetData | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffledDeck, setShuffledDeck] = useState<AlphabetData[]>([]);
  const [failedWords, setFailedWords] = useState<FailedWord[]>([]);
  const isProcessingRef = useRef(false);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: AlphabetData[]): AlphabetData[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Get all image files from the directory
  const getImageMap = () => {
    const images = import.meta.glob('/src/images/*.(jpeg|png)');
    const imageMap: { [key: string]: string[] } = {};
    
    Object.keys(images).forEach(path => {
      const fileName = path.split('/').pop()?.toLowerCase() ?? '';
      const letter = fileName[0];  // Get first letter of filename
      
      if (letter && /^[a-z]$/.test(letter)) {
        if (!imageMap[letter]) {
          imageMap[letter] = [];
        }
        imageMap[letter].push(path);
      }
    });
    
    // Convert map to alphabetData format
    return Object.entries(imageMap).map(([letter, paths]) => ({
      letter,
      image: paths[Math.floor(Math.random() * paths.length)]  // Randomly select one image for each letter
    }));
  };

  // Get next letter from shuffled deck
  const getNextLetter = (): AlphabetData => {
    if (shuffledDeck.length === 0) {
      // If deck is empty, reshuffle all images
      const newDeck = shuffleArray(getImageMap());
      setShuffledDeck(newDeck.slice(1)); // Remove first card as we're returning it
      return newDeck[0];
    } else {
      // Take the next card from the deck
      const nextCard = shuffledDeck[0];
      setShuffledDeck(shuffledDeck.slice(1));
      return nextCard;
    }
  };

  // Play audio for current word
  const playCurrentWordAudio = async (letter: string) => {
    try {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      const newAudio = new Audio(`/audio/${letter}.mp3`);
      await newAudio.load();
      setAudio(newAudio);
      await new Promise(resolve => setTimeout(resolve, 100));
      await newAudio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const showNewImage = async () => {
    const newImage = getNextLetter();
    setCurrentImage(newImage);
    await new Promise(resolve => setTimeout(resolve, 100));
    const baseName = newImage.image.split('/').pop()?.split('.')[0].toLowerCase();
    if (baseName) {
      await playCurrentWordAudio(baseName);
    }
  };

  // Start the game
  const startGame = async () => {
    const initialDeck = shuffleArray(getImageMap());
    setShuffledDeck(initialDeck.slice(1));
    setScore(0);
    setLives(3);
    setGameOver(false);
    setIsPlaying(true);
    setFeedback('');
    setFailedWords([]);
    
    setCurrentImage(initialDeck[0]);
    const baseName = initialDeck[0].image.split('/').pop()?.split('.')[0].toLowerCase();
    if (baseName) {
      await playCurrentWordAudio(baseName);
    }
  };

  // Handle keyboard input with debouncing
  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (!isPlaying || gameOver || isProcessingRef.current) return;
      
      const keyPressed = event.key.toLowerCase();
      
      // Check if the pressed key is a letter
      if (/^[a-z]$/.test(keyPressed)) {
        isProcessingRef.current = true;
        await checkAnswer(keyPressed);
        // Add a small delay before allowing next input
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 500);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentImage, isPlaying, gameOver]);
  
  // Add global keyboard handler for Enter key
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Enter' || event.key === 'Return') && !isPlaying && !gameOver) {
        startGame();
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isPlaying, gameOver]);

  // Convert checkAnswer to handle async operation
  const checkAnswer = async (key: string) => {
    if (currentImage && key === currentImage.letter) {
      await handleCorrectAnswer();
    } else {
      await handleWrongAnswer();
    }
  };

  // Handle correct answer
  const handleCorrectAnswer = async () => {
    setScore(score + 10);
    setFeedback('Correct!');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setFeedback('');
    await showNewImage();
  };
  
  // Handle wrong answer
  const handleWrongAnswer = async () => {
    const newLives = lives - 1;
    setLives(newLives);
    
    // Track the failed word
    const currentWord = currentImage?.image.split('/').pop()?.split('.')[0].toLowerCase() || '';
    setFailedWords(prev => {
      const existing = prev.find(fw => fw.word === currentWord);
      if (existing) {
        return prev.map(fw => 
          fw.word === currentWord 
            ? { ...fw, count: fw.count + 1 }
            : fw
        );
      }
      return [...prev, { word: currentWord, count: 1 }];
    });
    
    setFeedback(`Wrong! The correct letter was ${currentImage?.letter.toUpperCase()}`);
    
    if (newLives <= 0) {
      setGameOver(true);
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    setFeedback('');
    await showNewImage();
  };

  // Handle letter button click with debouncing
  const handleLetterClick = async (letter: string) => {
    if (!isPlaying || gameOver || isProcessingRef.current) return;
    isProcessingRef.current = true;
    await checkAnswer(letter);
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 500);
  };
  
  // Create the keyboard
  const renderKeyboard = () => {
    const rows = [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];
    
    return (
      <div className="mt-2 bg-gray-100/50 backdrop-blur-sm p-2 md:p-4 rounded-2xl shadow-lg w-full max-w-[95vw]">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center mb-1 md:mb-2 gap-1">
            {row.map((letter) => (
              <button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                className="w-8 h-8 md:w-12 md:h-12 rounded-lg bg-white text-gray-700 font-bold text-sm md:text-xl shadow-md 
                          hover:bg-gray-50 active:bg-gray-200
                          flex items-center justify-center
                          transform transition-all duration-150 
                          hover:scale-105 active:scale-95
                          focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {letter.toUpperCase()}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Render current image display
  const renderCurrentImage = () => {
    if (!currentImage) return null;
    
    return (
      <div className="w-[280px] h-[280px] md:w-[350px] md:h-[350px] flex items-center justify-center rounded-2xl mb-4 md:mb-6 overflow-hidden bg-white shadow-xl">
        <img src={currentImage.image} alt={currentImage.letter} className="w-full h-full object-contain p-4" />
      </div>
    );
  };
  
  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        setAudio(null);
      }
    };
  }, [audio]);

  return (
    <div className="min-h-screen h-screen w-screen bg-gradient-to-r from-yellow-100 to-orange-100 flex flex-col items-center overflow-hidden">
      <div className="fixed top-2 md:top-4 right-2 md:right-4 flex gap-1 md:gap-4 text-xs md:text-base z-10">
        <div className="bg-white/80 backdrop-blur-sm p-1.5 md:p-3 rounded-lg text-gray-800 shadow-lg">
          <span className="font-bold">Score:</span> {score}
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-1.5 md:p-3 rounded-lg text-gray-800 shadow-lg">
          <span className="font-bold">Lives:</span> {'❤️'.repeat(lives)}
        </div>
      </div>

      <div className="w-full h-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-none md:rounded-2xl shadow-xl flex flex-col items-center p-2 md:p-6">
        <div className="flex-grow w-full flex flex-col justify-center items-center gap-2 md:gap-6">
          {!isPlaying && !gameOver ? (
            <div className="text-center p-4">
              <h2 className="text-lg md:text-2xl font-bold mb-3">Welcome to Alphabet Mystery Box!</h2>
              <p className="mb-4 text-sm md:text-base">Press the letter on your keyboard that matches the image shown.</p>
              <p className="mb-4 text-sm text-gray-600">Press Enter to start</p>
              <button 
                onClick={startGame}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full text-base md:text-xl shadow-lg transition-transform transform hover:scale-105"
              >
                Start Game
              </button>
            </div>
          ) : gameOver ? (
            <div className="text-center p-4">
              <h2 className="text-xl md:text-3xl font-bold mb-3">Game Over!</h2>
              <p className="text-base md:text-xl mb-2">Your Score: {score}</p>
              {failedWords.length > 0 && (
                <div className="mt-4 mb-4">
                  <h3 className="text-lg font-bold mb-2">Words to Practice:</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {failedWords.map(({ word, count }) => (
                      <span key={word} className="bg-red-100 text-red-800 px-2 py-1 rounded">
                        {word} ({count}x)
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <button 
                onClick={startGame}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full text-base md:text-xl shadow-lg transition-transform transform hover:scale-105 mt-4"
              >
                Play Again
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-between w-full max-w-2xl mx-auto gap-2">
              <div className="relative">
                {renderCurrentImage()}
                {feedback && (
                  <div className={`absolute inset-0 flex items-center justify-center text-lg md:text-2xl font-bold ${
                    feedback.startsWith('Correct') ? 'text-green-600' : 'text-red-600'
                  } bg-white/80 backdrop-blur-sm rounded-lg`}>
                    {feedback}
                  </div>
                )}
              </div>
              
              <div className="w-full">
                {renderKeyboard()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlphabetGameApp;