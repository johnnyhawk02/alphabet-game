import { readdir, mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const ELEVENLABS_API_KEY = process.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = 'XB0fDUnXU5powFXDhCwa'; // Voice ID


const imagesDir = new URL('../src/images', import.meta.url).pathname;
const audioDir = new URL('../public/audio', import.meta.url).pathname;

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

      const outputPath = join(audioDir, `${baseName}.mp3`);
      
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

    console.log('Audio generation completed!');
  } catch (error) {
    console.error('Error processing files:', error);
  }
}

generateAllAudio();