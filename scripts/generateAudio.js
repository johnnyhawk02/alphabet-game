import textToSpeech from '@google-cloud/text-to-speech';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const client = new textToSpeech.TextToSpeechClient();

const synthesizeSpeech = async (text) => {
  const request = {
    input: { text },
    voice: {
      languageCode: 'en-GB',
      name: 'en-GB-Chirp3-HD-Zephyr',
    },
    audioConfig: { audioEncoding: 'MP3' },
  };

  const [response] = await client.synthesizeSpeech(request);
  return response.audioContent;
};

async function generateAudioFile(text, outputPath) {
  try {
    const audioContent = await synthesizeSpeech(text);
    await fs.writeFile(outputPath, audioContent, 'binary');
    console.log(`Generated audio file: ${outputPath}`);
  } catch (error) {
    console.error(`Error generating audio for "${text}":`, error);
  }
}

async function directoryExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function generateAllAudio() {
  try {
    const imagesDir = new URL('../public/images', import.meta.url).pathname;
    const audioDir = new URL('../public/audio', import.meta.url).pathname;
    const wordsDir = path.join(audioDir, 'words');

    // Create audio directory if it doesn't exist
    if (!(await directoryExists(audioDir))) {
      await fs.mkdir(audioDir, { recursive: true });
    }
    
    // Create words directory if it doesn't exist
    if (!(await directoryExists(wordsDir))) {
      await fs.mkdir(wordsDir, { recursive: true });
    }

    const files = await fs.readdir(imagesDir);
    const processedNames = new Set();

    for (const file of files) {
      // Get the base name without extension and remove any numbers or special characters
      const baseName = file.toLowerCase()
        .replace(/\(\d+\)/, '') // Remove (1), (2), etc.
        .replace(/\.[^/.]+$/, '') // Remove file extension
        .trim();

      // Skip if we've already processed this name
      if (processedNames.has(baseName)) {
        continue;
      }

      processedNames.add(baseName);

      const outputPath = path.join(wordsDir, `${baseName}.mp3`);
      
      // Skip if audio file already exists
      if (await directoryExists(outputPath)) {
        console.log(`Skipping ${baseName} - audio file already exists`);
        continue;
      }

      const text = `${baseName}`;

      console.log(`Processing: ${baseName}`);
      await generateAudioFile(text, outputPath);

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate the "the word is" prompt
    console.log("Generating 'the word is' prompt...");
    const otherDir = path.join(audioDir, "other");
    if (!(await directoryExists(otherDir))) {
      await fs.mkdir(otherDir, { recursive: true });
    }
    
    const wordIsPath = path.join(otherDir, `the_word_is.mp3`);
    if (!(await directoryExists(wordIsPath))) {
      console.log(`Processing: "the word is" prompt`);
      await generateAudioFile("the word is", wordIsPath);
    } else {
      console.log(`Skipping "the word is" - already exists`);
    }

    // Generate congratulatory messages
    console.log("Generating congratulatory messages...");
    const congratsDir = path.join(audioDir, "congrats");
    if (!(await directoryExists(congratsDir))) {
      await fs.mkdir(congratsDir, { recursive: true });
    }

    const congratulatoryMessages = [
      "The letter matches!",
      "That fits!",
      "They go together.",
      "That's a match.",
      "Look! They connect.",
      "The sounds match.",
      "That works.",
      "You found it.",
      "That's right.",
      "It fits nicely.",
      "Wow, look at that!",
      "It matches.",
      "The sounds fit.",
      "Good match.",
      "Nice finding.",
      "They belong together.",
      "Look how they match.",
      "You did it.",
      "That's it.",
      "They're the same sound."
    ];

    for (let i = 0; i < congratulatoryMessages.length; i++) {
      const outputPath = path.join(congratsDir, `congrats_${i + 1}.mp3`);
      
      if (!(await directoryExists(outputPath))) {
        console.log(`Processing: Congratulation message ${i + 1}`);
        await generateAudioFile(congratulatoryMessages[i], outputPath);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log(`Skipping congrats_${i + 1}.mp3 - already exists`);
      }
    }

    // Generate supportive messages
    console.log("Generating supportive messages...");
    const supportDir = path.join(audioDir, "support");
    if (!(await directoryExists(supportDir))) {
      await fs.mkdir(supportDir, { recursive: true });
    }

    const supportiveMessages = [
      "Sounds can be tricky.",
      "Want to try again?",
      "Maybe another letter?",
      "Sounds can be silly.",
      "Try a different one?",
      "It's okay to keep looking.",
      "No rush.",
      "It's your choice.",
      "Maybe try again?",
      "It's okay.",
      "Let's look again.",
      "Want to see more?",
      "What do you think?",
      "You choose what's next.",
      "Let's listen again.",
      "You can decide.",
      "Sounds can be funny.",
      "Break time?",
      "Take your time.",
      "You're the boss."
    ];

    for (let i = 0; i < supportiveMessages.length; i++) {
      const outputPath = path.join(supportDir, `support_${i + 1}.mp3`);
      
      if (!(await directoryExists(outputPath))) {
        console.log(`Processing: Supportive message ${i + 1}`);
        await generateAudioFile(supportiveMessages[i], outputPath);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log(`Skipping support_${i + 1}.mp3 - already exists`);
      }
    }

    console.log('Audio generation completed!');
  } catch (error) {
    console.error('Error processing files:', error);
  }
}

generateAllAudio();