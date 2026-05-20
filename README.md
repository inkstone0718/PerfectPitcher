# PerfectPitcher

PerfectPitcher is a baseball-themed ear training game for guitar learners. It turns chord recognition, note identification, live guitar practice, and multiplayer battles into a pixel-art batting experience.

## Features

- **Single Player Practice**
  - Chord quiz: listen to a guitar chord and pick the correct answer.
  - Note quiz: listen to a single pitch and identify the note.
  - Chord analysis: review chord tones and short theory notes after answering.

- **Live Challenge**
  - Uses the microphone to analyze guitar input in real time.
  - Compares chroma features against target chord templates.
  - Supports configurable roots, chord qualities, and question count.
  - Includes hints with guitar tabs and chord-tone playback.

- **Multiplayer Battle**
  - Create or join rooms with a short room code.
  - Compete in real-time chord or note quizzes.
  - Faster correct answers receive more points.
  - Built with Firebase Realtime Database.

- **Presentation**
  - Pixel-art baseball visual style.
  - Pitcher, batter, catcher, and umpire animations.
  - Chinese and English language support.
  - Dark and light theme settings.

## Tech Stack

- React
- TypeScript
- Vite
- Tone.js / Soundfont Player
- Meyda
- Firebase Realtime Database
- Lucide React
- Canvas Confetti

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## How To Play

### Single Player

1. Choose **Single Player** from the home screen.
2. Select **Chord Quiz** or **Note Quiz**.
3. Listen to the prompt and choose the correct option.
4. In chord mode, open the theory analysis after answering to review the chord tones.

### Live Challenge

1. Choose **Live Challenge**.
2. Select roots, chord qualities, and the number of questions.
3. Allow microphone access when prompted.
4. Play the displayed chord on guitar.
5. The app advances when your played chord reaches the match threshold.

For best results, play in a quiet room and let each chord ring clearly.

### Multiplayer

1. Choose **Multiplayer**.
2. Create a room or join with a room code.
3. Wait for at least two players.
4. Select an answer, then tap the same option again to confirm.
5. Correct and faster answers score more points.

## Project Structure

```text
src/
  components/          UI screens, game views, and character animations
  utils/
    audioEngine.ts     Guitar sound playback
    challengeEngine.ts Microphone analysis and chord matching
    chords.ts          Chord data, tabs, and theory descriptions
    firebase.ts        Firebase Realtime Database setup
    notes.ts           Note quiz data
public/                Sprite sheets and game assets
```

## Notes

- Live Challenge requires browser microphone permission.
- Audio playback must be started from a user gesture, so the app initializes audio after the player starts a mode.
- The current Firebase database rules are open for demo/testing. Tighten `database.rules.json` before using the multiplayer mode in production.
- The project currently stores Firebase configuration in the client bundle, which is acceptable for Firebase client apps only when database rules are properly secured.

## Future Improvements

- Add a guided learning path for beginner, basic, advanced, and mixed chord practice.
- Add progress tracking for weak notes and chords.
- Add a microphone calibration step before Live Challenge.
- Improve result feedback by explaining the difference between the selected answer and the correct answer.
- Add screenshots or a short gameplay GIF to this README.
