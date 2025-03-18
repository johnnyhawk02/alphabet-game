export interface AlphabetData {
  letter: string;
  image: string;
}

export interface FailedWord {
  word: string;
  count: number;
}

export interface GameState {
  score: number;
  gameOver: boolean;
  isPlaying: boolean;
  feedback: string;
  failedWords: FailedWord[];
}