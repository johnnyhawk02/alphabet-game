import { useEffect } from 'react';
import { ImageCard } from './components/ImageCard';
import { Keyboard } from './components/Keyboard';
import { ScoreBoard } from './components/ScoreBoard';
import { WelcomeScreen } from './components/WelcomeScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { useGameState } from './hooks/useGameState';
import { useAudio } from './hooks/useAudio';
import { useKeyboardInput } from './hooks/useKeyboardInput';

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

  const { playWord, cleanup: cleanupAudio } = useAudio();

  const showNewImage = async () => {
    const newImage = getNextLetter();
    setCurrentImage(newImage);
    await new Promise(resolve => setTimeout(resolve, 100));
    const baseName = newImage.image.split('/').pop()?.split('.')[0].toLowerCase();
    if (baseName) {
      await playWord(baseName);
    }
  };

  const handleAnswer = async (key: string) => {
    if (currentImage && key === currentImage.letter) {
      handleCorrectAnswer();
      await new Promise(resolve => setTimeout(resolve, 1000));
      clearFeedback();
      await showNewImage();
    } else {
      const word = currentImage?.image.split('/').pop()?.split('.')[0].toLowerCase() || '';
      handleWrongAnswer(word);
      await new Promise(resolve => setTimeout(resolve, 500));
      clearFeedback();
    }
  };

  const handleStart = async () => {
    const firstImage = startGame();
    const baseName = firstImage.image.split('/').pop()?.split('.')[0].toLowerCase();
    if (baseName) {
      await playWord(baseName);
    }
  };

  const isProcessing = useKeyboardInput({
    onKeyPress: handleAnswer,
    isEnabled: state.isPlaying && !state.gameOver,
    isGameStarted: state.isPlaying,
    onEnterPress: handleStart
  });

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  return (
    <div className="min-h-screen h-screen w-screen bg-gradient-to-r from-yellow-100 to-orange-100 flex flex-col items-center overflow-hidden">
      <ScoreBoard score={state.score} lives={state.lives} />

      <div className="w-full h-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-none md:rounded-2xl shadow-xl flex flex-col items-center p-2 md:p-6">
        <div className="flex-grow w-full flex flex-col justify-center items-center gap-2 md:gap-6">
          {!state.isPlaying && !state.gameOver ? (
            <WelcomeScreen onStart={handleStart} />
          ) : state.gameOver ? (
            <GameOverScreen
              score={state.score}
              failedWords={state.failedWords}
              onRestart={handleStart}
            />
          ) : (
            <div className="flex flex-col items-center justify-between w-full max-w-2xl mx-auto gap-2">
              <ImageCard currentImage={currentImage} feedback={state.feedback} />
              <Keyboard 
                onLetterClick={handleAnswer} 
                disabled={isProcessing} 
                correctLetter={currentImage?.letter}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlphabetGameApp;