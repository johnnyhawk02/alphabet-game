import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const sizes = [
  { width: 72, height: 72, name: 'icon-72x72.png' },
  { width: 192, height: 192, name: 'icon-192x192.png' },
  { width: 512, height: 512, name: 'icon-512x512.png' },
  { width: 180, height: 180, name: 'apple-touch-icon.png' }
];

async function generateIcons() {
  try {
    const sourceFile = new URL('../public/vite.svg', import.meta.url).pathname;
    const iconsDir = new URL('../public/icons', import.meta.url).pathname;

    // Ensure icons directory exists
    await fs.mkdir(iconsDir, { recursive: true });

    // Generate each icon size
    for (const size of sizes) {
      const outputPath = path.join(iconsDir, size.name);
      
      console.log(`Generating ${size.name}...`);
      
      await sharp(sourceFile)
        .resize(size.width, size.height)
        .png()
        .toFile(outputPath);
        
      console.log(`Generated ${size.name}`);
    }

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();