import { useState, useEffect } from 'react';

interface AlphabetData {
  letter: string;
  image: string;
}

const AlphabetGameApp = () => {
  const [currentImage, setCurrentImage] = useState<AlphabetData | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [level, setLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffledDeck, setShuffledDeck] = useState<AlphabetData[]>([]);
  
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
    // Initialize with a fresh shuffled deck
    const initialDeck = shuffleArray(getImageMap());
    setShuffledDeck(initialDeck.slice(1)); // Remove first card as we'll use it
    
    setScore(0);
    setLives(3);
    setGameOver(false);
    setLevel(1);
    setIsPlaying(true);
    setFeedback('');
    
    // Set and show first image
    setCurrentImage(initialDeck[0]);
    const baseName = initialDeck[0].image.split('/').pop()?.split('.')[0].toLowerCase();
    if (baseName) {
      await playCurrentWordAudio(baseName);
    }
  };
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;
      
      const keyPressed = event.key.toLowerCase();
      
      // Check if the pressed key is a letter
      if (/^[a-z]$/.test(keyPressed)) {
        checkAnswer(keyPressed);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentImage, isPlaying, gameOver]);
  
  // Check if the answer is correct
  const checkAnswer = (key: string) => {
    if (currentImage && key === currentImage.letter) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  };
  
  // Handle correct answer
  const handleCorrectAnswer = async () => {
    const newScore = score + (level * 10);
    setScore(newScore);
    
    // Show feedback
    setFeedback('Correct!');
    
    // Increase level every 5 correct answers
    if (newScore % 50 === 0) {
      setLevel((prev) => prev + 1);
    }
    
    // Wait 1 second before showing next image and playing audio
    await new Promise(resolve => setTimeout(resolve, 1000));
    setFeedback('');
    await showNewImage();
  };
  
  // Handle wrong answer
  const handleWrongAnswer = async () => {
    const newLives = lives - 1;
    setLives(newLives);
    
    // Show feedback
    setFeedback(`Wrong! The correct letter was ${currentImage?.letter.toUpperCase()}`);
    
    if (newLives <= 0) {
      setGameOver(true);
      return;
    }
    
    // Wait 1.5 seconds before showing next image and playing audio
    await new Promise(resolve => setTimeout(resolve, 1500));
    setFeedback('');
    await showNewImage();
  };
  
  // Handle letter button click
  const handleLetterClick = (letter: string) => {
    if (!isPlaying || gameOver) return;
    checkAnswer(letter);
  };
  
  // Create the keyboard
  const renderKeyboard = () => {
    const rows = [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];
    
    return (
      <div className="mt-4">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center mb-2">
            {row.map((letter) => {
              // Find the color for this letter
              const bgColor = 'bg-gray-500';
              
              return (
                <button
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                  className={`w-12 h-12 mx-1 rounded-full text-white font-bold text-xl ${bgColor} shadow-lg flex items-center justify-center transform transition-transform duration-100 active:scale-95 focus:outline-none`}
                >
                  {letter.toUpperCase()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };
  
  // Render current image display
  const renderCurrentImage = () => {
    if (!currentImage) return null;
    
    return (
      <div className="w-96 h-96 flex items-center justify-center rounded-lg mb-6 overflow-hidden bg-yellow-100">
        <img src={currentImage.image} alt={currentImage.letter} className="w-full h-full object-cover" />
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
    <div className="min-h-screen h-screen w-screen bg-gradient-to-r from-yellow-100 to-orange-100 flex flex-col items-center justify-center overflow-x-hidden">
      <div className="w-full h-full max-w-none bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col justify-center items-center">
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-4 text-white text-center w-full">
          <h1 className="text-3xl font-bold">Alphabet Mystery Box</h1>
          <p className="text-lg">Press the letter that matches the image!</p>
        </div>
        <div className="p-6 flex-grow w-full flex flex-col justify-center items-center">
          {!isPlaying && !gameOver ? (
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold mb-4">Welcome to Alphabet Mystery Box!</h2>
              <p className="mb-6">Press the letter on your keyboard that matches the image shown. Be quick!</p>
              <button 
                onClick={startGame}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg transition-transform transform hover:scale-105"
              >
                Start Game
              </button>
            </div>
          ) : gameOver ? (
            <div className="text-center p-8">
              <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
              <p className="text-xl mb-2">Your Score: {score}</p>
              <p className="text-lg mb-6">Level Reached: {level}</p>
              <button 
                onClick={startGame}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg transition-transform transform hover:scale-105"
              >
                Play Again
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex justify-between w-full mb-4">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-800">
                  <span className="font-bold">Score:</span> {score}
                </div>
                <div className="bg-purple-100 p-2 rounded-lg text-purple-800">
                  <span className="font-bold">Level:</span> {level}
                </div>
                <div className="bg-red-100 p-2 rounded-lg text-red-800">
                  <span className="font-bold">Lives:</span> {'❤️'.repeat(lives)}
                </div>
              </div>
              
              <div className="relative">
                {renderCurrentImage()}
                
                {feedback && (
                  <div className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${
                    feedback.startsWith('Correct') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {feedback}
                  </div>
                )}
              </div>
              
              {renderKeyboard()}
              
              <p className="mt-4 text-gray-600">
                Press the letter on your keyboard or tap/click the button
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 text-center text-gray-600">
        <p>You can also use your keyboard to play!</p>
      </div>
    </div>
  );
};

export default AlphabetGameApp;