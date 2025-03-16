import { useState, useCallback } from 'react';
import { AlphabetData, GameState } from '../types/types';

export const useGameState = () => {
  const [state, setState] = useState<GameState>({
    score: 0,
    lives: 3,
    gameOver: false,
    isPlaying: false,
    feedback: '',
    failedWords: []
  });

  const [currentImage, setCurrentImage] = useState<AlphabetData | null>(null);
  const [shuffledDeck, setShuffledDeck] = useState<AlphabetData[]>([]);

  const shuffleArray = (array: AlphabetData[]): AlphabetData[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const getImageMap = useCallback(() => {
    const imageFiles = Object.keys(import.meta.glob('/public/images/*.(jpeg|png)'));
    const imageMap: { [key: string]: string[] } = {};
    
    imageFiles.forEach(path => {
      const browserPath = path.replace('/public', '');
      const fileName = browserPath.split('/').pop()?.toLowerCase() ?? '';
      const letter = fileName[0];
      
      if (letter && /^[a-z]$/.test(letter)) {
        if (!imageMap[letter]) {
          imageMap[letter] = [];
        }
        imageMap[letter].push(browserPath);
      }
    });
    
    return Object.entries(imageMap).map(([letter, paths]) => ({
      letter,
      image: paths[Math.floor(Math.random() * paths.length)]
    }));
  }, []);

  const getNextLetter = useCallback((): AlphabetData => {
    if (shuffledDeck.length === 0) {
      const newDeck = shuffleArray(getImageMap());
      setShuffledDeck(newDeck.slice(1));
      return newDeck[0];
    }
    const nextCard = shuffledDeck[0];
    setShuffledDeck(shuffledDeck.slice(1));
    return nextCard;
  }, [shuffledDeck, getImageMap]);

  const startGame = useCallback(() => {
    const initialDeck = shuffleArray(getImageMap());
    setShuffledDeck(initialDeck.slice(1));
    setState({
      score: 0,
      lives: 3,
      gameOver: false,
      isPlaying: true,
      feedback: '',
      failedWords: []
    });
    setCurrentImage(initialDeck[0]);
    return initialDeck[0];
  }, [getImageMap]);

  const handleCorrectAnswer = useCallback(() => {
    setState(prev => ({
      ...prev,
      score: prev.score + 10,
      feedback: 'Correct!'
    }));
  }, []);

  const handleWrongAnswer = useCallback((word: string) => {
    setState(prev => {
      const newLives = prev.lives - 1;
      const gameOver = newLives <= 0;
      
      const updatedFailedWords = [...prev.failedWords];
      const existingWord = updatedFailedWords.find(fw => fw.word === word);
      
      if (existingWord) {
        existingWord.count++;
      } else {
        updatedFailedWords.push({ word, count: 1 });
      }

      return {
        ...prev,
        lives: newLives,
        gameOver,
        failedWords: updatedFailedWords,
        feedback: `Wrong! The correct letter was ${currentImage?.letter.toUpperCase()}`
      };
    });
  }, [currentImage]);

  const clearFeedback = useCallback(() => {
    setState(prev => ({ ...prev, feedback: '' }));
  }, []);

  return {
    state,
    currentImage,
    setCurrentImage,
    startGame,
    getNextLetter,
    handleCorrectAnswer,
    handleWrongAnswer,
    clearFeedback
  };
};