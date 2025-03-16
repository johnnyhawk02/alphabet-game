import { useState, useEffect } from 'react';

interface AlphabetData {
  letter: string;
  image: string;
}

const AlphabetGameApp = () => {
  const [currentImage, setCurrentImage] = useState<AlphabetData | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Sample alphabet data - in a real app, these would point to your actual images folder
  const alphabetData: AlphabetData[] = [
    { letter: 'a', image: 'src/images/apple.jpeg' },
    { letter: 'b', image: 'src/images/baby.jpeg' },
    { letter: 'c', image: 'src/images/cat.jpeg' },
    { letter: 'd', image: 'src/images/dog.jpeg' },
    { letter: 'e', image: 'src/images/eyes.jpeg' },
    { letter: 'f', image: 'src/images/fish.jpeg' },
    { letter: 'g', image: 'src/images/giraffe.jpeg' },
    { letter: 'h', image: 'src/images/hat.jpeg' },
    { letter: 'i', image: 'src/images/icecream.jpeg' },
    { letter: 'j', image: 'src/images/jacket.jpeg' },
    { letter: 'k', image: 'src/images/kite.jpeg' },
    { letter: 'l', image: 'src/images/lion.jpeg' },
    { letter: 'm', image: 'src/images/monkey.jpeg' },
    { letter: 'n', image: 'src/images/nose.jpeg' },
    { letter: 'o', image: 'src/images/owl.jpeg' },
    { letter: 'p', image: 'src/images/pig.jpeg' },
    { letter: 'q', image: 'src/images/queen.jpeg' },
    { letter: 'r', image: 'src/images/rabbit.jpeg' },
    { letter: 's', image: 'src/images/sun.jpeg' },
    { letter: 't', image: 'src/images/tiger.jpeg' },
    { letter: 'u', image: 'src/images/umbrella.jpeg' },
    { letter: 'v', image: 'src/images/violin.jpeg' },
    { letter: 'w', image: 'src/images/whale.jpeg' },
    { letter: 'x', image: 'src/images/xylophone.jpeg' },
    { letter: 'y', image: 'src/images/yak.jpeg' },
    { letter: 'z', image: 'src/images/zebra.jpeg' }
  ];
  
  // Get random letter
  const getRandomLetter = (): AlphabetData => {
    const randomIndex = Math.floor(Math.random() * alphabetData.length);
    return alphabetData[randomIndex];
  };
  
  // Start the game
  const startGame = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setLevel(1);
    setTimeLeft(10);
    setIsPlaying(true);
    setCurrentImage(getRandomLetter());
    setFeedback('');
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
  
  // Timer effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying && !gameOver) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleWrongAnswer();
            return 10; // Reset timer
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [isPlaying, gameOver]);
  
  // Check if the answer is correct
  const checkAnswer = (key: string) => {
    if (currentImage && key === currentImage.letter) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  };
  
  // Handle correct answer
  const handleCorrectAnswer = () => {
    const newScore = score + (level * 10);
    setScore(newScore);
    
    // Show feedback
    setFeedback('Correct!');
    setTimeout(() => setFeedback(''), 1000);
    
    // Increase level every 5 correct answers
    if (newScore % 50 === 0) {
      setLevel((prev) => prev + 1);
    }
    
    // Reset timer and get new image
    setTimeLeft(Math.max(10 - level + 1, 3)); // Timer gets shorter as level increases
    setCurrentImage(getRandomLetter());
  };
  
  // Handle wrong answer
  const handleWrongAnswer = () => {
    const newLives = lives - 1;
    setLives(newLives);
    
    // Show feedback
    setFeedback(`Wrong! The correct letter was ${currentImage?.letter.toUpperCase()}`);
    setTimeout(() => setFeedback(''), 1500);
    
    if (newLives <= 0) {
      setGameOver(true);
    } else {
      // Reset timer and get new image
      setTimeLeft(10);
      setCurrentImage(getRandomLetter());
    }
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
              
              <div className="bg-gray-100 rounded-lg p-2 text-gray-700 mb-2">
                Time: {timeLeft}s
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