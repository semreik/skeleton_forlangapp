# Adding Audio Pronunciations to Dictionary Entries

This guide explains how to add audio pronunciations to the Dzongkha dictionary entries.

## Audio File Requirements

- **Format**: MP3 format is recommended
- **File Size**: Keep files small (under 100KB if possible) for better app performance
- **Quality**: 128kbps is a good balance between quality and file size
- **Naming Convention**: The filename should match the `audio` field in the dictionary entry

## Adding New Audio Pronunciations

### Step 1: Prepare Your Audio File

1. Record or obtain an audio file of the Dzongkha word pronunciation
2. Convert it to MP3 format if necessary
3. Name the file according to the convention (e.g., `go.mp3` for the word "go")
4. For words with spaces, replace spaces with underscores (e.g., `go_tsukken.mp3`)

### Step 2: Add the Audio File to the Project

1. Place the audio file in the `/assets/audio/` directory

### Step 3: Update the Dictionary Entry

Update the corresponding dictionary entry in `/assets/dictionary/dzardzongke.dict.json` to include the audio field:

```json
{
  "dz": "go",
  "en": "door",
  "example": "",
  "exampleEn": "",
  "audio": "go.mp3"
}
```

### Step 4: Register the Audio File in AudioService

Update the `audioMap` in `/app/services/AudioService.ts` to include your new audio file:

```typescript
const audioMap: Record<string, any> = {
  'go.mp3': require('../../assets/audio/go.mp3'),
  'your_new_file.mp3': require('../../assets/audio/your_new_file.mp3'),
  // Add more audio files as they become available
};
```

### Step 5: Test the Audio Pronunciation

1. Rebuild and restart the app
2. Navigate to the dictionary
3. Search for the word you added audio for
4. Tap the sound button next to the word to hear the pronunciation

## Batch Adding Audio Files

For adding multiple audio files at once, follow the same process but make sure to:

1. Add all audio files to the `/assets/audio/` directory
2. Update all corresponding dictionary entries with the `audio` field
3. Register all new audio files in the `audioMap` in `AudioService.ts`

## Troubleshooting

- If the audio doesn't play, check that the filename in the dictionary entry matches exactly with the audio file name
- Ensure the audio file is properly registered in the `audioMap`
- Verify that the audio file is in MP3 format and placed in the correct directory

---

## Build & Run (Localhost)

- Install dependencies: `npm install`
- Start dev server: `npx expo start` and choose web (`w`), iOS (`i`), Android (`a`), or scan QR in Expo Go.

## Release & Updates (Android/iOS)

- Bump `expo.version` in `app.json` (and `ios.buildNumber` / `android.versionCode` if applicable).
- Android APK (quick share): `eas build -p android --profile preview`
- Android Play Store: `eas build -p android --profile production` then `eas submit -p android`
- iOS TestFlight/App Store: `eas build -p ios --profile production` then `eas submit -p ios`.

# Audio Pronunciations Guide

This guide explains how to add audio for dictionary entries and conversation messages.

## Dictionary Audio

Follow the steps in README to register dictionary audio files and reference them in `app/services/AudioService.ts` if needed.

## Conversation Audio (message-level)

- Put files under: `assets/audio/conversations/<category>/<conversation>/`
- File naming convention: `<sequence>_<speaker>.(mp3|wav)`
  - `<sequence>` starts at 1 and matches the message order in the conversation
  - `<speaker>` is `A` or `B`
  - Example: `assets/audio/conversations/greetings/lesson1/1_A.mp3`

### Registering files (AUTOMATIC - No manual work required!)

**🎉 Good news!** Audio file registration is now **completely automatic**. The app automatically scans your `assets/audio/` folder and creates all necessary mappings.

**What you need to do:**
1. **Place audio files** in the correct folders (see structure below)
2. **Run the auto-mapper**: `npm run map-audio`
3. **That's it!** No manual TypeScript editing required

**Audio folder structure:**
```
assets/audio/
├── dictionary_words/     # Dictionary pronunciations
│   ├── word-meaning.wav
│   └── another-word.mp3
├── conversations/        # Conversation audio
│   ├── greetings/
│   │   ├── lesson1/
│   │   │   ├── 1_A.wav
│   │   │   └── 1_B.wav
│   │   └── lesson2/
│   └── family/
└── other_audio/         # Any other audio files
```

**File naming conventions:**
- **Dictionary words**: `word-meaning.wav` (word before first hyphen becomes the key)
- **Conversations**: `1_A.wav`, `2_B.wav` (sequence_speaker format)
- **Supported formats**: `.wav`, `.mp3`, `.m4a`, `.aac`

### How playback is triggered

- When a new message appears in `ConversationPractice`, the app computes the key
  `conv/<lang>/<category>/<conversation>/<sequence>_<speaker>` and plays it automatically if registered.
- Each bubble also shows a replay button that plays the same key on demand.

### Adding a new conversation category or conversation

1. Add your conversation texts in Google Sheets (Decks tab) with ordered exchanges and `speaker: 'A'|'B'`.
2. Place your audio files in `assets/audio/conversations/<category>/<conversation>/` following the naming convention.
3. Register each file in `app/services/AudioService.ts` `audioMap` with the key format above.
4. Run the app; audio will auto‑play on message appearance and replay on button press.

Notes:
- Use `.mp3` to minimize size; keep under ~150KB per clip when possible.
- On web builds, auto‑play may be blocked until the user interacts (browser policy). The replay button always works after first interaction.
