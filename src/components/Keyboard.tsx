interface KeyboardProps {
  onLetterClick: (letter: string) => void;
  disabled: boolean;
  correctLetter?: string;
}

export const Keyboard = ({ onLetterClick, disabled, correctLetter }: KeyboardProps) => {
  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  return (
    <div className="w-full bg-gray-100/50 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-lg"> {/* Increased padding */}
      <div className="max-w-3xl mx-auto">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center mb-2 gap-2 md:gap-3"> {/* Increased gap between keys */}
            {row.map((letter) => {
              const isCorrect = letter === correctLetter;
              return (
                <button
                  key={letter}
                  onClick={() => !disabled && onLetterClick(letter)}
                  disabled={disabled}
                  className={`w-[10.64vw] h-[10.64vw] md:w-16 md:h-16 rounded-lg bg-white text-gray-700 text-4xl md:text-6xl shadow-md 
                            hover:bg-gray-50 active:bg-gray-200
                            flex items-center justify-center
                            transform transition-all duration-150
                            hover:scale-105 active:scale-95
                            focus:outline-none focus:ring-0
                            disabled:opacity-50 disabled:cursor-not-allowed
                            relative
                            ${isCorrect ? 'animate-[wiggle_1s_ease-in-out_infinite]' : ''}`}
                >
                  {letter}
                  {isCorrect && (
                    <div className="absolute inset-0 rounded-lg bg-yellow-200/30 animate-[pulse-ring_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}