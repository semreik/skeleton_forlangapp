# Quiz Images Guide

You can show an optional illustration for multiple-choice quiz items. The UI scales images automatically.

## TL;DR
- Put your image under `assets/images/` (e.g., `assets/images/quiz/horse.png`).
- Map an English prompt to an image in Google Sheets (Decks tab) by adding the image filename to the `image` column.
- Build/run locally; the image will show on the quiz card for that prompt.

## Steps
1) Add your image file
- Recommended path: `assets/images/quiz/`
- Filename rule: lowercase, hyphen-separated (e.g., `horse.png`, `two-birds.png`)
- Recommended format: PNG or WebP
- Recommended size: square, around 256–512 px (optimize size < 100KB when possible)

2) Register the mapping in Google Sheets
- Open your Google Sheets (Decks tab)
- Add a new row or update existing row with:
  - `id`: quiz-deck-name
  - `front`: The Dzardzongke text or prompt
  - `back`: The English answer
  - `image`: The image filename (e.g., `horse.png`)
- The image filename must match exactly with the file in `assets/images/quiz/`

3) Verify in the app
- Run locally; open the Multiple Choice screen and navigate until the prompt appears.
- The image should appear under the prompt card with proper containment.

## Notes
- Images are optional. If no mapping exists, the quiz renders without an image.
- You can map the same image for both `dz` and `qu` prompts as needed.
- Keep images lightweight for mobile performance.

---

## Build & Run (Localhost)

- `npm install` then `npx expo start`
- Press `w` (web), `i` (iOS), `a` (Android) or scan the QR in Expo Go.

## Release & Updates (Android/iOS)

- Bump versions in `app.json` as needed.
- Android APK (quick share): `eas build -p android --profile preview`
- Android Play Store: `eas build -p android --profile production` then `eas submit -p android`
- iOS TestFlight/App Store: `eas build -p ios --profile production` then `eas submit -p ios`.

