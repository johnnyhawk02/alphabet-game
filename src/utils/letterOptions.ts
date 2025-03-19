/**
 * Utility functions for generating and managing letter options in the game
 */

/**
 * Generates a set of letter options including the correct letter and random alternatives
 * 
 * @param correctLetter The correct letter that should be included in options
 * @param numberOfOptions Total number of options to generate (default: 3)
 * @returns An array of letter options with the correct letter in a random position
 */
export const generateLetterOptions = (correctLetter: string, numberOfOptions = 3): string[] => {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const result: string[] = new Array(numberOfOptions).fill('');
  
  // Pick a random position for the correct letter
  const correctPosition = Math.floor(Math.random() * numberOfOptions);
  result[correctPosition] = correctLetter;
  
  // Fill other positions with random letters
  let filledPositions = 1;
  while (filledPositions < numberOfOptions) {
    const randLetter = letters[Math.floor(Math.random() * letters.length)];
    // Skip if it's the correct letter or if we already used this letter
    if (randLetter !== correctLetter && !result.includes(randLetter)) {
      // Find next empty position
      const emptyIndex = result.findIndex(letter => letter === '');
      result[emptyIndex] = randLetter;
      filledPositions++;
    }
  }
  
  return result;
};

/**
 * Shuffles an array using the Fisher-Yates algorithm
 * 
 * @param array The array to shuffle
 * @returns A new shuffled array
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * Gets the word/name from an image path
 *
 * @param imagePath Path to the image file
 * @returns The extracted word/name in lowercase
 */
export const getWordFromImagePath = (imagePath: string): string => {
  return imagePath.split('/').pop()?.split('.')[0].toLowerCase() || '';
};