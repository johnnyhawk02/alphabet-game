# Alphabet Game

An interactive educational web application designed to help children learn the alphabet through an engaging game format. The app shows images and prompts users to select the correct starting letter, with audio feedback and supportive messages.

## Features

- **Interactive Learning Experience**: Images with corresponding letter choices
- **Audio Feedback**: Voice prompts and positive reinforcement
- **Progressive Web App**: Installable on mobile devices with offline support
- **Mobile-Optimized**: Responsive design with special handling for iOS and fullscreen mode
- **Score Tracking**: Points system to motivate progress
- **Supportive Learning**: Hints and encouragement for incorrect answers

## Technologies

- React 19
- TypeScript
- Vite
- Tailwind CSS
- PWA (Progressive Web App)
- Google Text-to-Speech API

## Development Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build
- `npm run convert-images`: Run the image conversion script
- `npm run generate-audio`: Generate audio files using Google Text-to-Speech
- `npm run generate-icons`: Generate app icons in various sizes

## Project Structure

```
alphabet-game/
├── public/               # Static assets
│   ├── audio/            # Audio files for letters, words, and feedback
│   ├── icons/            # App icons for PWA
│   ├── images/           # Image collection for the game
│   └── manifest.webmanifest  # PWA manifest file
├── src/
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
└── scripts/              # Utility scripts
    ├── convertImages.js  # Script to process and optimize images
    ├── generateAudio.js  # Script to generate audio using Google TTS
    └── generateIcons.js  # Script to generate app icons
```

## How to Play

1. Start the game by clicking the start button
2. An image will be displayed with a question prompt
3. Select the correct letter that the image starts with
4. Receive points for correct answers
5. Get supportive feedback for incorrect answers
6. Continue playing to improve your score

## License

[Add your license information here]

## Author

[Your Name]