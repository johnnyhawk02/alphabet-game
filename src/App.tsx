import { useEffect, useRef, useState } from 'react';
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

  const { playWord, playCongratsMessage, playSupportiveMessage, playWordAfterPause, cleanup: cleanupAudio } = useAudio();
  const [audioPlaying, setAudioPlaying] = useState(false);
  const userInteractedRef = useRef(false);

  const showNewImage = async () => {
    const newImage = getNextLetter();
    setCurrentImage(newImage);
    // Add a small delay before playing the word
    await new Promise(resolve => setTimeout(resolve, 300));
    const baseName = newImage.image.split('/').pop()?.split('.')[0].toLowerCase();
    if (baseName) {
      // Set audio playing state
      setAudioPlaying(true);
      // Wait for the word audio to complete before allowing next interaction
      await playWord(baseName);
      setAudioPlaying(false);
    }
  };

  const handleAnswer = async (key: string) => {
    // Don't process input if audio is still playing
    if (audioPlaying) return;
    
    // Mark that user has interacted with the page (helps with audio playback)
    userInteractedRef.current = true;
    
    if (currentImage && key === currentImage.letter) {
      handleCorrectAnswer();
      
      // Play congratulatory message and wait for it to finish
      try {
        setAudioPlaying(true);
        await playCongratsMessage();
        // Wait a bit after audio completes
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Failed to play congratulatory message:', error);
      } finally {
        setAudioPlaying(false);
      }
      
      clearFeedback();
      await showNewImage();
    } else {
      const word = currentImage?.image.split('/').pop()?.split('.')[0].toLowerCase() || '';
      handleWrongAnswer(word);
      
      // Play supportive message and wait for it to finish
      try {
        setAudioPlaying(true);
        await playSupportiveMessage();
        
        // After a pause, play just the word
        await playWordAfterPause(word);
      } catch (error) {
        console.error('Failed to play audio messages:', error);
      } finally {
        setAudioPlaying(false);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      clearFeedback();
    }
  };

  const handleStart = async () => {
    // Mark that user has interacted with the page (helps with audio playback)
    userInteractedRef.current = true;
    
    const firstImage = startGame();
    const baseName = firstImage.image.split('/').pop()?.split('.')[0].toLowerCase();
    if (baseName) {
      // Set audio playing state
      setAudioPlaying(true);
      // Wait for the initial word audio to complete
      await playWord(baseName);
      setAudioPlaying(false);
    }
  };

  const isProcessing = useKeyboardInput({
    onKeyPress: handleAnswer,
    isEnabled: state.isPlaying && !state.gameOver && !audioPlaying,
    isGameStarted: state.isPlaying,
    onEnterPress: handleStart
  });

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

  return (
    <div className="app-container bg-gradient-to-r from-yellow-100 to-orange-100">
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
          <>
            <div className="image-area">
              <ImageCard currentImage={currentImage} feedback={state.feedback} />
            </div>
            
            <div className="keyboard-area">
              <Keyboard 
                onLetterClick={handleAnswer} 
                disabled={isProcessing || audioPlaying} 
                correctLetter={currentImage?.letter}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AlphabetGameApp;