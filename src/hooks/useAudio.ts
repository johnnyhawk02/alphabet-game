import { useState, useRef } from 'react';

export const useAudio = () => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const lastCongratsMessageRef = useRef<number>(-1);
  const lastSupportiveMessageRef = useRef<number>(-1);

  const preloadAudio = async (audioPath: string): Promise<HTMLAudioElement> => {
    const newAudio = new Audio(audioPath);
    await new Promise((resolve) => {
      newAudio.oncanplaythrough = resolve;
      newAudio.load();
    });
    return newAudio;
  };

  const playAudio = async (audioPath: string) => {
    try {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }

      const newAudio = await preloadAudio(audioPath);
      setAudio(newAudio);

      return new Promise<void>((resolve, reject) => {
        newAudio.onended = () => resolve();
        newAudio.onerror = (e) => reject(e);

        newAudio.play().catch((err) => {
          console.error("Error playing audio:", err);
          reject(err);
        });
      });
    } catch (error) {
      console.error("Error setting up audio playback:", error);
      return Promise.resolve();
    }
  };

  const playSequentialAudio = async (audioPath: string) => {
    try {
      const newAudio = await preloadAudio(audioPath);
      
      return new Promise<void>((resolve, reject) => {
        newAudio.onended = () => {
          newAudio.remove(); // Cleanup
          resolve();
        };
        newAudio.onerror = (e) => {
          newAudio.remove(); // Cleanup
          reject(e);
        };
        
        newAudio.play().catch((err) => {
          console.error("Error playing audio:", err);
          newAudio.remove(); // Cleanup
          reject(err);
        });
      });
    } catch (error) {
      console.error("Error setting up audio playback:", error);
      return Promise.resolve();
    }
  };

  const playWord = async (word: string) => {
    const wordAudioPath = `/audio/words/${word}.mp3`;
    console.log(`Playing word audio: ${wordAudioPath}`);
    await playSequentialAudio(wordAudioPath);
  };

  const getRandomNumberExcept = (max: number, except: number): number => {
    if (except === -1) {
      return Math.floor(Math.random() * max) + 1;
    }
    
    let randomNum;
    do {
      randomNum = Math.floor(Math.random() * max) + 1;
    } while (randomNum === except && max > 1);
    
    return randomNum;
  };

  const playCongratsMessage = async () => {
    try {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      
      const messageNumber = getRandomNumberExcept(20, lastCongratsMessageRef.current);
      lastCongratsMessageRef.current = messageNumber;
      
      console.log(`Playing congrats message ${messageNumber}`);
      const audioPath = `/audio/congrats/congrats_${messageNumber}.mp3`;
      await playAudio(audioPath);
      
    } catch (error) {
      console.error('Error setting up congratulatory message:', error);
      return Promise.resolve();
    }
  };

  const playSupportiveMessage = async () => {
    try {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      
      const messageNumber = getRandomNumberExcept(20, lastSupportiveMessageRef.current);
      lastSupportiveMessageRef.current = messageNumber;
      
      console.log(`Playing support message ${messageNumber}`);
      const audioPath = `/audio/support/support_${messageNumber}.mp3`;
      await playAudio(audioPath);
      
    } catch (error) {
      console.error('Error setting up supportive message:', error);
      return Promise.resolve();
    }
  };

  const playWordAfterPause = async (word: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const audioPath = `/audio/words/${word}.mp3`;
      console.log(`Playing word after pause: ${word}`);
      await playSequentialAudio(audioPath);
      
    } catch (error) {
      console.error(`Error playing word audio after pause:`, error);
      return Promise.resolve();
    }
  };

  const playQuestionPrompt = async (word: string) => {
    try {
      const questionNumber = Math.floor(Math.random() * 5) + 1;
      const audioPath = `/audio/questions/${word}_question_${questionNumber}.mp3`;
      console.log(`Playing question prompt: ${audioPath}`);
      await playSequentialAudio(audioPath);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error playing question prompt:', error);
      return Promise.resolve();
    }
  };

  const playLetter = async (letter: string) => {
    try {
      const audioPath = `/audio/letters/${letter}.mp3`;
      console.log(`Playing letter sound: ${audioPath}`);
      await playSequentialAudio(audioPath);
    } catch (error) {
      console.error('Error playing letter sound:', error);
      return Promise.resolve();
    }
  };

  const cleanup = () => {
    if (audio) {
      audio.pause();
      setAudio(null);
    }
  };

  return { 
    playWord, 
    playCongratsMessage, 
    playSupportiveMessage, 
    playWordAfterPause, 
    playQuestionPrompt,
    playLetter,
    cleanup 
  };
};