# Dictionary Management Guide

The dictionary feature uses a JSON file located at `assets/dictionary/dzardzongke.dict.json`. You can easily add, remove, or modify dictionary entries by editing this file.

## File Structure

```json
{
  "entries": [
    {
      "dz": "བྱ་",          // Dzardzongke word
      "en": "bird",        // English translation
      "example": "བྱ་ཆེན་པོ་གཅིག་ནམ་མཁར་འཕུར་གི་འདུག",  // Example sentence in Dzardzongke
      "exampleEn": "A big bird is flying in the sky"  // English translation of example
    }
  ]
}
```

## How to Add New Words

1. Open `assets/dictionary/dzardzongke.dict.json`
2. Add a new entry to the `entries` array following the structure above
3. Make sure to include:
   - `dz`: The Dzardzongke word
   - `en`: The English translation
   - `example`: (Optional) An example sentence in Dzardzongke
   - `exampleEn`: (Optional) English translation of the example sentence
   

## Example Entry

```json
{
  "dz": "ཆུ་",
  "en": "water",
  "example": "ཆུ་འདི་གཙང་མ་འདུག",
  "exampleEn": "This water is clean"
}
```

For adding images to Quizzes, see `docs/QUIZ_IMAGES.md`.

## Adding Pronunciation Audio for Dictionary Entries

There are two supported ways to attach audio to dictionary items:

1) Explicit per‑entry field (simple)
- Add an `audio` field on the entry pointing to a registry key. This is used rarely.

2) Auto‑mapping from filenames (recommended)
- Place `.wav` files in `assets/audio/dictionary_words/`.
- Use the filename format: `headword-english_hint.wav` (left part is the Dz headword).
  - Examples: `ang-also_even.wav`, `chu-water.wav`, `arong_che-quite_big.wav`.
- Normalize rule: lowercase, accents stripped, spaces → underscore. The app applies the same normalization.
- Register the file once in `app/services/dictionaryAudio.ts` under `dictionaryAudioMap`:
  ```ts
  export const dictionaryAudioMap = {
    chu: require('../../assets/audio/dictionary_words/chu-water.wav'),
    arong_che: require('../../assets/audio/dictionary_words/arong_che-quite_big.wav'),
  };
  ```
- The Dictionary card resolves audio in this order: `entry.audio` → `dictionaryAudioMap[normalize(entry.dz)]` → fallback.
- The play button is blue if audio exists, grey and disabled if not.

Tips:
- Keep audio small (<150KB) for fast web loads.
- If a headword isn’t yet in `dzardzongke.dict.json`, add it before the audio.

## Important Notes

1. Maintain proper JSON formatting
2. Each entry must have at least `dz` and `en` fields
3. `example` and `exampleEn` fields are optional but recommended
4. The app uses fuzzy search, so users can find words even with slight misspellings
5. Changes to the dictionary file will be reflected after restarting the app

## Best Practices

1. Keep entries alphabetically sorted by the `en` field for easier maintenance
2. Include practical, commonly used example sentences
3. Verify the correctness of Dzardzongke text and translations
4. Back up the dictionary file before making large changes

---

## Build & Run (Localhost)

- Install dependencies:
  - `npm install` (if peer-deps conflict: `npm install --legacy-peer-deps`)
- Start the dev server:
  - `npx expo start`
  - Web: press `w`; iOS simulator: `i`; Android emulator: `a`; or scan the QR in Expo Go.

## Release & Updates (Android/iOS)

- Increment app version in `app.json` (`expo.version`). For store builds, also bump `ios.buildNumber` and `android.versionCode` unless using remote versioning.
- Android quick share (APK): `eas build -p android --profile preview`
- Android Play Store: `eas build -p android --profile production` then `eas submit -p android`
- iOS TestFlight/App Store: `eas build -p ios --profile production` then `eas submit -p ios` (Apple Developer account required).
- After adding new dictionary entries or audio, commit changes and repeat the relevant build step.
