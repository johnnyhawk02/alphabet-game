interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <div className="text-center p-4 flex flex-col items-center justify-center h-full">
      <h2 className="text-lg md:text-2xl font-bold mb-3">Welcome to Alphabet Mystery Box!</h2>
      <p className="mb-4 text-sm md:text-base">Press the letter on your keyboard that matches the image shown.</p>
      <p className="mb-8 text-sm text-gray-600">Press Enter to start</p>
      <button 
        onClick={onStart}
        className="w-32 h-32 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold 
                   shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95
                   flex items-center justify-center text-xl md:text-2xl"
      >
        Start
      </button>
    </div>
  );
};