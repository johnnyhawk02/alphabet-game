interface ScoreBoardProps {
  score: number;
}

export const ScoreBoard = ({ score }: ScoreBoardProps) => {
  return (
    <div className="fixed top-safe right-safe z-10">
      <div className="w-20 h-20 rounded-full bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center text-gray-800 shadow-lg">
        <span className="font-bold text-xs">Score</span>
        <span className="text-xl font-bold">{score}</span>
      </div>
    </div>
  );
};