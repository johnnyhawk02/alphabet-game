interface ScoreBoardProps {
  score: number;
}

export const ScoreBoard = ({ score }: ScoreBoardProps) => {
  return (
    <div className="fixed top-2 md:top-4 right-2 md:right-4 flex gap-1 md:gap-4 text-xs md:text-base z-10">
      <div className="bg-white/80 backdrop-blur-sm p-1.5 md:p-3 rounded-lg text-gray-800 shadow-lg">
        <span className="font-bold">Score:</span> {score}
      </div>
    </div>
  );
};