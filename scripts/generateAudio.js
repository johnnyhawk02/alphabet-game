import { readdir, mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const ELEVENLABS_API_KEY = process.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = 'XB0fDUnXU5powFXDhCwa'; // Voice ID

const imagesDir = new URL('../public/images', import.meta.url).pathname;
const audioDir = new URL('../public/audio', import.meta.url).pathname;
const wordsDir = join(audioDir, 'words');

// Add congratulatory messages - modified to be more declarative for children with PDA
const congratulatoryMessages = [
  "That's the right letter.",
  "The letter matches the picture.",
  "That letter and picture go together.",
  "The answer is correct.",
  "That's how the word starts.",
  "The letter and sound match."
];

// Add supportive messages - modified to be more declarative and less demanding for PDA
const supportiveMessages = [
  "Sometimes letters can be tricky.",
  "This word begins with a different letter.",
  "The sound is a bit different from what you chose.",
  "Words and letters have interesting connections.",
  "There's another letter that goes with this picture.",
  "Each word has its own special starting sound."
];

async function generateAudioFile(text, outputPath) {
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate audio: ${response.statusText}`);
    }

    const buffer = await response.buffer();
    await writeFile(outputPath, buffer);
    console.log(`Generated audio file: ${outputPath}`);
  } catch (error) {
    console.error(`Error generating audio for "${text}":`, error);
  }
}

async function generateAllAudio() {
  try {
    // Create audio directory if it doesn't exist
    if (!existsSync(audioDir)) {
      await mkdir(audioDir, { recursive: true });
    }
    
    // Create words directory if it doesn't exist
    if (!existsSync(wordsDir)) {
      await mkdir(wordsDir, { recursive: true });
    }

    const files = await readdir(imagesDir);
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

      const outputPath = join(wordsDir, `${baseName}.mp3`);
      
      // Skip if audio file already exists
      if (existsSync(outputPath)) {
        console.log(`Skipping ${baseName} - audio file already exists`);
        continue;
      }

      const text = `${baseName}`;

      console.log(`Processing: ${baseName}`);
      await generateAudioFile(text, outputPath);

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate congratulatory messages
    console.log("Generating congratulatory messages...");
    const congratsDir = join(audioDir, "congrats");
    if (!existsSync(congratsDir)) {
      await mkdir(congratsDir, { recursive: true });
    }

    for (let i = 0; i < congratulatoryMessages.length; i++) {
      const outputPath = join(congratsDir, `congrats_${i + 1}.mp3`);
      
      if (!existsSync(outputPath)) {
        console.log(`Processing: Congratulation message ${i + 1}`);
        await generateAudioFile(congratulatoryMessages[i], outputPath);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log(`Skipping congrats_${i + 1}.mp3 - already exists`);
      }
    }

    // Generate supportive messages
    console.log("Generating supportive messages...");
    const supportDir = join(audioDir, "support");
    if (!existsSync(supportDir)) {
      await mkdir(supportDir, { recursive: true });
    }

    for (let i = 0; i < supportiveMessages.length; i++) {
      const outputPath = join(supportDir, `support_${i + 1}.mp3`);
      
      if (!existsSync(outputPath)) {
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