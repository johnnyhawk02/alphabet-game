interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <div className="text-center p-4">
      <h2 className="text-lg md:text-2xl font-bold mb-3">Welcome to Alphabet Mystery Box!</h2>
      <p className="mb-4 text-sm md:text-base">Press the letter on your keyboard that matches the image shown.</p>
      <p className="mb-4 text-sm text-gray-600">Press Enter to start</p>
      <button 
        onClick={onStart}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full text-base md:text-xl shadow-lg transition-transform transform hover:scale-105"
      >
        Start Game
      </button>
    </div>
  );
};