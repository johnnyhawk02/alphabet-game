import { useEffect, useRef, useState } from 'react';
import { ImageCard } from './components/ImageCard';
import { ScoreBoard } from './components/ScoreBoard';
import { WelcomeScreen } from './components/WelcomeScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { useGameState } from './hooks/useGameState';
import { useAudio } from './hooks/useAudio';
import { useKeyboardInput } from './hooks/useKeyboardInput'; // Import the useKeyboardInput hook
import { useStandaloneMode } from './hooks/useStandaloneMode';

const AlphabetGameApp = () => {
  const {
    state,
    currentImage,
    startGame,
    getNextLetter,
    handleCorrectAnswer,
    handleWrongAnswer,
    clearFeedback,
    setCurrentImage
  } = useGameState();

  const { playWord, playCongratsMessage, playSupportiveMessage, playWordAfterPause, cleanup: cleanupAudio, playQuestionPrompt } = useAudio();
  const [audioPlaying, setAudioPlaying] = useState(false);
  const userInteractedRef = useRef(false);
  const [backgroundColor, setBackgroundColor] = useState('bg-gray-500'); // Default to grey for new round
  const [options, setOptions] = useState<string[]>([]);
  const [isKeyboardEnabled, setIsKeyboardEnabled] = useState(false); // State to manage keyboard enable/disable
  const { isStandalone, isIOS } = useStandaloneMode();

  const showNewImage = async () => {
    setBackgroundColor('bg-gray-500');
    setIsKeyboardEnabled(false);

    const newImage = getNextLetter();
    setCurrentImage(newImage);

    // Generate random options including the correct letter
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const correctLetter = newImage.letter;
    const tempLetters = [correctLetter];
    const randomLetters: string[] = [];

    while (randomLetters.length < 2) {
      const randLetter = letters[Math.floor(Math.random() * letters.length)];
      if (!tempLetters.includes(randLetter)) {
        randomLetters.push(randLetter);
        tempLetters.push(randLetter);
      }
    }

    const allOptions = [correctLetter, ...randomLetters];
    setOptions(allOptions.sort(() => Math.random() - 0.5));

    // Add a longer pause before starting audio sequence
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const baseName = newImage.image.split('/').pop()?.split('.')[0].toLowerCase();
    if (baseName) {
      setAudioPlaying(true);
      try {
        // Only play the question
        await playQuestionPrompt(baseName);
      } catch (error) {
        console.error('Error in audio sequence:', error);
      } finally {
        setAudioPlaying(false);
        setIsKeyboardEnabled(true);
      }
    }
  };

  const handleAnswer = async (key: string) => {
    if (audioPlaying) return;
    userInteractedRef.current = true;

    if (currentImage && key === currentImage.letter) {
      setBackgroundColor('bg-green-500');
      handleCorrectAnswer();
      setAudioPlaying(true);

      try {
        // Pre-load and play correct sound
        const correctSound = new Audio('/audio/other/correct.mp3');
        await new Promise((resolve) => {
          correctSound.oncanplaythrough = resolve;
          correctSound.load();
        });
        correctSound.volume = 0.5;
        await correctSound.play();

        // Play congratulatory message
        await playCongratsMessage();
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Failed to play audio sequence:', error);
      } finally {
        setAudioPlaying(false);
      }

      clearFeedback();
      await showNewImage();
    } else {
      setBackgroundColor('bg-red-500');
      const word = currentImage?.image.split('/').pop()?.split('.')[0].toLowerCase() || '';
      handleWrongAnswer(word);

      try {
        // Pre-load and play wrong sound
        const wrongSound = new Audio('/audio/other/wrong.mp3');
        await new Promise((resolve) => {
          wrongSound.oncanplaythrough = resolve;
          wrongSound.load();
        });
        await wrongSound.play();

        setAudioPlaying(true);
        await playSupportiveMessage();
        await playWordAfterPause(word);
      } catch (error) {
        console.error('Failed to play audio messages:', error);
      } finally {
        setAudioPlaying(false);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      clearFeedback();
      setBackgroundColor('bg-gray-500');
    }
  };

  const handleStart = async () => {
    userInteractedRef.current = true;
    
    const firstImage = startGame();
    
    // Generate random options including the correct letter
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const correctLetter = firstImage.letter;
    
    const tempLetters = [correctLetter];
    const randomLetters: string[] = [];
    
    while (randomLetters.length < 2) {
      const randLetter = letters[Math.floor(Math.random() * letters.length)];
      if (!tempLetters.includes(randLetter)) {
        randomLetters.push(randLetter);
        tempLetters.push(randLetter);
      }
    }
    
    const allOptions = [correctLetter, ...randomLetters];
    setOptions(allOptions.sort(() => Math.random() - 0.5));
    
    const baseName = firstImage.image.split('/').pop()?.split('.')[0].toLowerCase();
    if (baseName) {
      setAudioPlaying(true);
      try {
        // Play the question for the first turn
        await playQuestionPrompt(baseName);
      } finally {
        setAudioPlaying(false);
      }
    }
  };

  // Set up event listeners for user interaction
  useEffect(() => {
    const markInteracted = () => {
      userInteractedRef.current = true;
    };
    
    window.addEventListener('click', markInteracted);
    window.addEventListener('keydown', markInteracted);
    
    return () => {
      cleanupAudio();
      window.removeEventListener('click', markInteracted);
      window.removeEventListener('keydown', markInteracted);
    };
  }, [cleanupAudio]);

  useKeyboardInput({
    onKeyPress: handleAnswer,
    isEnabled: isKeyboardEnabled,
    isGameStarted: state.isPlaying,
  });

  // Add a class to handle iOS safe areas and full-screen mode
  const containerClass = `app-container ${backgroundColor} ${
    isIOS ? 'ios-safe-area' : ''
  } ${isStandalone ? 'standalone-mode' : ''}`;

  return (
    <div className={containerClass}>
      <ScoreBoard score={state.score} />

      <div className="game-content">
        {!state.isPlaying && !state.gameOver ? (
          <WelcomeScreen onStart={handleStart} />
        ) : state.gameOver ? (
          <GameOverScreen
            score={state.score}
            failedWords={state.failedWords}
            onRestart={handleStart}
          />
        ) : (
          <div className="flex flex-col items-center justify-between h-full">
            <div className="image-area mb-8">
              <ImageCard currentImage={currentImage} feedback={state.feedback} />
            </div>
            
            {/* Letter Options */}
            <div className="letter-options w-full py-4">
              <div className="flex justify-center gap-6">
                {options.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => !audioPlaying && handleAnswer(letter)}
                    disabled={audioPlaying}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white text-gray-700 text-6xl md:text-8xl font-bold shadow-lg flex items-center justify-center border-4 border-gray-300 hover:bg-gray-100"
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlphabetGameApp;