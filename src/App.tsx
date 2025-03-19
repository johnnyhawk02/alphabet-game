import { useEffect, useRef, useState, useCallback } from 'react';
import { ScoreBoard } from './components/ScoreBoard';
import { WelcomeScreen } from './components/WelcomeScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { GameContent } from './components/GameContent';
import { useGameState } from './hooks/useGameState';
import { useAudio } from './hooks/useAudio';
import { useKeyboardInput } from './hooks/useKeyboardInput';
import { useStandaloneMode } from './hooks/useStandaloneMode';
import { generateLetterOptions, getWordFromImagePath } from './utils/letterOptions';
import { playCorrectAnswerSound, playWrongAnswerSound, delay } from './utils/audioHelpers';

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
  
  const { 
    playWord, 
    playCongratsMessage, 
    playSupportiveMessage, 
    playWordAfterPause, 
    cleanup: cleanupAudio, 
    playQuestionPrompt, 
    playLetter 
  } = useAudio();
  
  // UI state
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('bg-gray-500');
  const [options, setOptions] = useState<string[]>([]);
  const [isKeyboardEnabled, setIsKeyboardEnabled] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [visibleLetters, setVisibleLetters] = useState<string[]>([]);
  const [highlightedLetter, setHighlightedLetter] = useState<string | null>(null);
  
  const userInteractedRef = useRef(false);
  const { isStandalone, isIOS } = useStandaloneMode();

  // Function to reveal letters one at a time with audio
  const revealLettersWithAudio = useCallback(async (letters: string[]) => {
    setVisibleLetters([]);
    setOptionsVisible(true);
    setAudioPlaying(true);
    
    for (let i = 0; i < letters.length; i++) {
      // First, reveal the letter visually
      setVisibleLetters(prev => [...prev, letters[i]]);
      
      // Highlight the current letter and play its sound
      setHighlightedLetter(letters[i]);
      try {
        await playLetter(letters[i]);
        // Add a small pause between letters
        await delay(300);
      } catch (error) {
        console.error("Error playing letter sound:", error);
      } finally {
        // Remove highlight after playing the sound and pausing
        setHighlightedLetter(null);
      }
    }
    
    setAudioPlaying(false);
    setIsKeyboardEnabled(true);
  }, [playLetter]);

  const showNewImage = useCallback(async () => {
    setOptionsVisible(false);
    setVisibleLetters([]);
    setHighlightedLetter(null);
    setBackgroundColor('bg-gray-500');
    setIsKeyboardEnabled(false);
    
    const newImage = getNextLetter();
    setCurrentImage(newImage);
    
    // Generate random options including the correct letter
    const shuffledOptions = generateLetterOptions(newImage.letter);
    setOptions(shuffledOptions);
    
    // Add a longer pause before starting audio sequence
    await delay(1000);
    
    const baseName = getWordFromImagePath(newImage.image);
    if (baseName) {
      setAudioPlaying(true);
      try {
        // Only play the question
        await playQuestionPrompt(baseName);
        
        // After question is played, reveal letters one by one
        await revealLettersWithAudio(shuffledOptions);
      } catch (error) {
        console.error('Error in audio sequence:', error);
        setAudioPlaying(false);
        setIsKeyboardEnabled(true);
        setOptionsVisible(true);
        setVisibleLetters(shuffledOptions); // Show all letters if there's an error
      }
    }
  }, [getNextLetter, setCurrentImage, playQuestionPrompt, revealLettersWithAudio]);

  const handleAnswer = useCallback(async (key: string) => {
    if (audioPlaying) return;
    
    userInteractedRef.current = true;
    setOptionsVisible(false); // Hide options during transition
    setAudioPlaying(true);
    
    await playLetter(key);
    setAudioPlaying(false);
    
    if (currentImage && key === currentImage.letter) {
      // Correct answer flow
      setBackgroundColor('bg-green-500');
      handleCorrectAnswer();
      
      setAudioPlaying(true);
      try {
        // Play sound effect in background (doesn't wait for it to finish)
        playCorrectAnswerSound();
        
        // Play TTS message simultaneously
        await playCongratsMessage();
        await delay(500);
      } catch (error) {
        console.error('Failed to play audio sequence:', error);
      } finally {
        setAudioPlaying(false);
      }
      
      clearFeedback();
      await showNewImage();
    } else {
      // Wrong answer flow
      setBackgroundColor('bg-red-500');
      const word = currentImage ? getWordFromImagePath(currentImage.image) : '';
      
      handleWrongAnswer(word);
      
      try {
        // Play sound effect in background (doesn't wait for it to finish)
        playWrongAnswerSound();
        
        // A short pause before starting TTS
        await delay(200);
        
        setAudioPlaying(true);
        // Play TTS messages
        await playSupportiveMessage();
        await playWordAfterPause(word);
      } catch (error) {
        console.error('Failed to play audio messages:', error);
      } finally {
        setAudioPlaying(false);
      }
      
      await delay(500);
      clearFeedback();
      setBackgroundColor('bg-gray-500');
      
      // Show options again after wrong answer sequence
      setTimeout(() => setOptionsVisible(true), 100);
    }
  }, [
    audioPlaying, 
    currentImage, 
    playLetter, 
    handleCorrectAnswer, 
    playCongratsMessage, 
    clearFeedback, 
    showNewImage, 
    handleWrongAnswer, 
    playSupportiveMessage, 
    playWordAfterPause
  ]);

  const handleStart = useCallback(async () => {
    setOptionsVisible(false);
    setVisibleLetters([]);
    setHighlightedLetter(null);
    userInteractedRef.current = true;
    
    const firstImage = startGame();
    
    // Generate random options including the correct letter
    const shuffledOptions = generateLetterOptions(firstImage.letter);
    setOptions(shuffledOptions);
    
    const baseName = getWordFromImagePath(firstImage.image);
    if (baseName) {
      setAudioPlaying(true);
      try {
        // Play the question for the first turn
        await playQuestionPrompt(baseName);
        
        // After question is played, reveal letters one by one
        await revealLettersWithAudio(shuffledOptions);
      } catch (error) {
        console.error('Error in audio sequence:', error);
        setAudioPlaying(false);
        setIsKeyboardEnabled(true);
        setOptionsVisible(true);
        setVisibleLetters(shuffledOptions); // Show all letters if there's an error
      }
    }
  }, [startGame, playQuestionPrompt, revealLettersWithAudio]);

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
      <div className="game-content min-h-[100svh]">
        {!state.isPlaying && !state.gameOver ? (
          <WelcomeScreen onStart={handleStart} />
        ) : state.gameOver ? (
          <GameOverScreen
            score={state.score}
            failedWords={state.failedWords}
            onRestart={handleStart}
          />
        ) : (
          <GameContent 
            currentImage={currentImage}
            feedback={state.feedback}
            options={options}
            visibleLetters={visibleLetters}
            highlightedLetter={highlightedLetter}
            audioPlaying={audioPlaying}
            optionsVisible={optionsVisible}
            onLetterClick={handleAnswer}
          />
        )}
      </div>
    </div>
  );
};

export default AlphabetGameApp;