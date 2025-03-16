import { FailedWord } from '../types/types';

interface GameOverScreenProps {
  score: number;
  failedWords: FailedWord[];
  onRestart: () => void;
}

export const GameOverScreen = ({ score, failedWords, onRestart }: GameOverScreenProps) => {
  return (
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
        onClick={onRestart}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full text-base md:text-xl shadow-lg transition-transform transform hover:scale-105 mt-4"
      >
        Play Again
      </button>
    </div>
  );
};