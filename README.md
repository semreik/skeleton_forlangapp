<div align="center">

  <img src="https://img.shields.io/badge/%F0%9F%8C%BF-Language_Learning_App-2E7D32?style=for-the-badge" alt="Language Learning App" />

  <h3>An offline-first mobile app skeleton for learning <i>any</i> language.</h3>

  <p>
    <img alt="Expo SDK" src="https://img.shields.io/badge/Expo_SDK-53-4630EB?style=flat-square&logo=expo&logoColor=white" />
    <img alt="React Native" src="https://img.shields.io/badge/React_Native-0.79-61DAFB?style=flat-square&logo=react&logoColor=white" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white" />
    <img alt="Zustand" src="https://img.shields.io/badge/Zustand-5-443E38?style=flat-square&logo=react&logoColor=white" />
    <img alt="Platforms" src="https://img.shields.io/badge/iOS_·_Android_·_Web-999?style=flat-square" />
  </p>

  <p>
    <b>Fork → Fill with content from LangData Creator → Build APK → Learn offline</b>
  </p>

</div>

<br/>

> **No coding required.** All learning content is pushed into your fork by the
> [LangData Creator](#-how-content-gets-into-the-app) website. GitHub Actions builds your APK in the cloud.

---

## 📖 Table of Contents

- [What Is This?](#what-is-this)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [How Content Gets Into the App](#-how-content-gets-into-the-app)
- [File & Folder Naming Conventions](#-file--folder-naming-conventions)
- [Building the APK](#%EF%B8%8F-building-the-apk-github-actions)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Configuration](#-configuration)

---

## What Is This?

This is a **language learning app skeleton**. The app itself ships with no hardcoded language — all learning content (flashcard decks, dictionary, conversations, culture articles, audio) is **pushed into your fork by the LangData Creator website**.

<table>
<tr>
<td width="60">1️⃣</td>
<td><b>Fork</b> this repo to your own GitHub account</td>
</tr>
<tr>
<td>2️⃣</td>
<td><b>Create your language content</b> on the <b>LangData Creator</b> web app</td>
</tr>
<tr>
<td>3️⃣</td>
<td><b>Connect your fork</b> by entering the repo in the LangData Creator settings</td>
</tr>
<tr>
<td>4️⃣</td>
<td>The website <b>pushes</b> the generated content (JSON + audio) directly to your forked repo</td>
</tr>
<tr>
<td>5️⃣</td>
<td>GitHub Actions <b>automatically builds</b> a ready-to-install APK with your language data bundled in</td>
</tr>
</table>

---

## ✨ Features

<table>
<tr>
<td align="center" width="110"><br/><b>📚<br/>Flashcards</b></td>
<td>Progressive deck-based learning (<b>New → Learning → Mastered</b>) with animated flip cards, swipe gestures, and per-card audio</td>
</tr>
<tr>
<td align="center"><br/><b>✍️<br/>Writing</b></td>
<td>Free-text vocabulary input + dedicated numbers module — auto-correction disabled for non-Latin scripts</td>
</tr>
<tr>
<td align="center"><br/><b>🧠<br/>Quizzes</b></td>
<td>Timed multiple-choice assessments with optional images for visual word recognition</td>
</tr>
<tr>
<td align="center"><br/><b>💬<br/>Conversations</b></td>
<td>Categorized dialogues with <b>line-by-line audio playback</b> and speaker attribution (A / B)</td>
</tr>
<tr>
<td align="center"><br/><b>📕<br/>Dictionary</b></td>
<td>Fuzzy search (Fuse.js) with definitions, example sentences, and native pronunciation audio</td>
</tr>
<tr>
<td align="center"><br/><b>🏛️<br/>Culture</b></td>
<td>Bundled articles on traditions and history with embedded images and interactive quizzes</td>
</tr>
<tr>
<td align="center"><br/><b>📊<br/>Stats</b></td>
<td>Session history, time-spent tracking, daily streaks, and per-deck mastery dashboards</td>
</tr>
<tr>
<td align="center"><br/><b>🔐<br/>Accounts</b></td>
<td>On-device user profiles with PBKDF2 key derivation — all data stays on the device, zero cloud sync</td>
</tr>
</table>

---

## 🚀 Quick Start

```bash
# 1. Fork this repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/skeleton_forlangapp-main.git
cd skeleton_forlangapp-main

# 2. Install dependencies
npm install

# 3. Launch Expo dev server (scan QR to open on phone)
npm start
```

<details>
<summary><b>All available scripts</b></summary>
<br/>

| Script | What it does |
|--------|--------------|
| `npm run android` | Build & run on Android emulator |
| `npm run ios` | Build & run on iOS simulator (macOS only) |
| `npm run web` | Open in browser at localhost |
| `npm run lint` | Run ESLint + Prettier checks |
| `npm test` | Run test suites |

**Prerequisites:** Node.js v18+, npm, and optionally Expo Go on your phone.

</details>

---

<details>
<summary><b>📂 Project Structure</b> (click to expand)</summary>
<br/>

```
.
├── App.tsx                     # Root navigator, splash screen, auth gate
├── app/
│   ├── screens/                # 18 screens — Study, Write, Quiz, Dictionary, Conversations…
│   ├── components/             # FlipCard, Confetti, ProgressBar, AppDrawer, DictEntryCard…
│   ├── stores/                 # Zustand — useAuth, useLanguage, useProgress, useSaved
│   ├── db/                     # SQLite — schema, auth repo, stats repo
│   ├── services/               # AudioService, contentRegistry, imageRegistry
│   ├── auth/                   # PBKDF2 password hashing
│   ├── types/                  # TypeScript types
│   └── utils/                  # Logger & helpers
├── assets/                     # ⬅ All content lives here (see naming section below)
├── lib/                        # Platform-specific SQLite & SecureStore
├── scripts/                    # Content pipeline scripts
├── docs/                       # Contributor guides
├── test/                       # Unit + integration tests
└── .github/workflows/          # CI/CD — cloud APK builds
```

</details>

---

## 🏗️ Tech Stack

<table>
<tr><td><b>Framework</b></td><td>React Native 0.79 · Expo SDK 53</td></tr>
<tr><td><b>Language</b></td><td>TypeScript 5.8</td></tr>
<tr><td><b>State</b></td><td>Zustand (auth · language · progress · saved)</td></tr>
<tr><td><b>Database</b></td><td>SQLite + Expo SecureStore</td></tr>
<tr><td><b>Search</b></td><td>Fuse.js (fuzzy, offline)</td></tr>
<tr><td><b>Animations</b></td><td>React Native Reanimated 3</td></tr>
<tr><td><b>Navigation</b></td><td>React Navigation (Stack · Drawer · Top Tabs)</td></tr>
<tr><td><b>Audio</b></td><td>expo-av</td></tr>
<tr><td><b>UI</b></td><td>React Native Paper</td></tr>
</table>

---

## � How Content Gets Into the App

### Step by Step

1. **Fork** this repository to your GitHub account
2. Open the **LangData Creator** website and create your language project
3. Add your content — flashcard decks, dictionary entries, conversations, culture articles, and audio files
4. In the LangData Creator settings, **enter your forked repo** and connect it
5. When you publish, the website **pushes** the generated JSON and audio files into the `assets/` folder of your fork
6. The content is registered in the **content registry** (`app/services/contentRegistry.ts`) under a language code
7. Trigger the GitHub Actions build (or it triggers automatically) → download your APK

The content registry supports **multiple languages simultaneously** — each language code maps to its own set of decks, dictionary, conversations, and culture articles.

---

## 📐 File & Folder Naming Conventions

All content lives inside `assets/`. The app auto-discovers files by folder and naming pattern — **get the names right and everything works.**

### 📁 Complete Asset Tree

```
assets/
│
├── 📂 decks/
│   ├── animals-basic.json              # {deck-id}.json
│   ├── colors.json
│   ├── food-basic.json
│   └── qu-numbers.json                 # 2nd language → prefix with lang code
│
├── 📂 dictionary/
│   └── myLang.dict.json                # {name}.dict.json
│
├── 📂 conversations/
│   └── conversations.json              # {name}.json  (all categories in one file)
│
├── 📂 culture/
│   ├── dz/                             # One subfolder per language code
│   │   ├── deck-1.json                 # deck-{number}.json
│   │   ├── deck-2.json
│   │   └── deck-3.json
│   └── qu/
│       └── deck-1.json
│
├── 📂 audio/
│   ├── 🔊 dictionary_words/
│   │   ├── water.wav                   # {word}.wav  ← recommended
│   │   ├── hello.wav
│   │   ├── chu-water.wav               # {word}-{hint}.wav  (legacy)
│   │   └── ang_tsukken.wav             # spaces→underscores, lowercase
│   │
│   └── 🔊 conversations/
│       ├── hello/                      # folder = conversation id
│       │   ├── hello_1_A.wav           # {id}_{exchange}_{speaker}.wav
│       │   ├── hello_1_B.wav
│       │   ├── hello_2_A.wav
│       │   └── hello_2_B.wav
│       └── family/
│           ├── family_1_A.wav
│           └── family_2_A_edited.wav   # _edited suffix OK
│
├── 📂 images/
│   ├── animals/                        # Deck/quiz images
│   │   ├── cat.png
│   │   └── dog.png
│   └── Culture/                        # Culture images (registered in code)
│       └── culture-region.png
│
└── 📂 fonts/                           # .ttf / .otf
```

### 📋 Naming Rules at a Glance

| Content | Folder | Pattern | Formats |
|---------|--------|---------|---------|
| Flashcard deck | `assets/decks/` | `{deck-id}.json` | JSON |
| Dictionary | `assets/dictionary/` | `{name}.dict.json` | JSON |
| Conversations | `assets/conversations/` | `{name}.json` | JSON |
| Culture article | `assets/culture/{lang}/` | `deck-{number}.json` | JSON |
| Dict. audio | `assets/audio/dictionary_words/` | `{word}.wav` | `.wav` `.mp3` `.m4a` `.aac` |
| Conv. audio | `assets/audio/conversations/{id}/` | `{id}_{n}_{A|B}.wav` | `.wav` `.mp3` `.m4a` `.aac` |
| Images | `assets/images/{category}/` | `{name}.png` | `.png` `.jpg` `.webp` |

### 🔍 Dictionary Audio Lookup Order

The app tries to match a word to an audio file in this order:

```
  "water"       →  1. water.wav           (exact)
  "Water"       →  2. water.wav           (lowercase)
  "Ang Tsukken" →  3. ang_tsukken.wav     (normalized: no accents, _ for spaces)
  "chu"         →  4. chu-water.wav       (legacy: part before first -)
```

### 🔊 Conversation Audio Naming

Each audio file maps to one exchange line:

```
  hello_1_A.wav
  ─┬──  ┬  ┬
   │    │  └── speaker: "A" or "B"
   │    └── exchange number: 1, 2, 3… (matches order in JSON)
   └── conversation id (must match JSON "id" field AND folder name)
```

---

## ⚙️ Building the APK (GitHub Actions)

> The APK is built **entirely in the cloud** — you do **not** need Android SDK, Java, or Gradle locally.

<details>
<summary><b>How to trigger a build</b></summary>
<br/>

1. Go to the repo on GitHub → **Actions** tab
2. Select **"Build Android App"** on the left
3. Click **"Run workflow"** → choose branch → **"Run workflow"**
4. Wait for it to finish (~5–10 min)

</details>

<details>
<summary><b>What the pipeline does (11 steps)</b></summary>
<br/>

| Step | Action | Details |
|------|--------|---------|
| **1. Checkout** | `actions/checkout@v4` | Clones the repo |
| **2. Node.js** | `actions/setup-node@v4` | Installs Node 20 with npm cache |
| **3. App name injection** | Custom script | Reads `app-config.json` → writes `appName` (e.g. `"Learn MyLanguage"`) into `app.json`'s `expo.name` and `expo.slug` fields |
| **4. Dependencies** | `npm ci` | Clean install of all packages |
| **5. JDK** | `actions/setup-java@v4` | Installs Temurin JDK 17 |
| **6. Android SDK** | `android-actions/setup-android@v3` | Installs Android build tools |
| **7. Prebuild** | `npx expo prebuild --platform android --clean` | Generates the native `android/` project from Expo config |
| **8. Gradle build** | `./gradlew assembleRelease --no-daemon` | Compiles the release APK |
| **9. Rename APK** | Custom script | Renames the output based on the app name (e.g. `learn-mylanguage.apk`) |
| **10. Upload artifact** | `actions/upload-artifact@v4` | Stores the APK as a downloadable **GitHub Artifact** (90-day retention) |
| **11. Create release** | `softprops/action-gh-release@v2` | Auto-creates a **GitHub Release** tagged `build-<run_number>` with the APK attached and install instructions |

</details>

### 📥 How to Download the APK

<table>
<tr>
<td width="200"><b>Option A — Artifacts</b></td>
<td>

1. Open the completed workflow run in **Actions**
2. Scroll to **Artifacts**
3. Click the APK name → download `.zip` → extract the `.apk`

</td>
</tr>
<tr>
<td><b>Option B — Releases</b></td>
<td>

1. Go to the repo's **Releases** page
2. Find the latest build
3. Download the `.apk` directly

</td>
</tr>
</table>

### 📱 Install on Android

1. Transfer the `.apk` to the phone (USB, email, cloud drive…)
2. Open the file → tap **Install**
3. If prompted, enable **"Install from unknown sources"**
4. Done — no sign-in or internet required

### ✏️ Customising the App Name

Edit `app-config.json`:

```json
{
  "appName": "Learn MyLanguage"
}
```

Change the value and trigger a new build — the pipeline injects it into the app title, slug, and APK filename.

<details>
<summary><b>Troubleshooting</b></summary>
<br/>

| Problem | Fix |
|---------|---------|
| Build fails at **Gradle** step | Check that no dependency requires a newer Android SDK; review the Gradle error in the Actions log |
| APK not appearing in Artifacts | The build may have failed — check the red ✗ step in the workflow run |
| "App not installed" on phone | Make sure you don't have a debug version already installed (uninstall it first), or try enabling **Install from unknown sources** again |
| Wrong app name on phone | Update `app-config.json` and re-run the workflow |

</details>

---

## 🔧 Configuration

| File | Purpose |
|------|---------|
| `app.json` | Expo config — icons, splash, plugins, platforms |
| `app-config.json` | Custom app display name for CI builds |
| `tsconfig.json` | TypeScript compiler options |
| `vercel.json` | Web SPA deployment routing |

---

<div align="center">
  <br/>
  <img src="https://img.shields.io/badge/Built_with_%E2%9D%A4%EF%B8%8F_for-Language_Preservation-2E7D32?style=flat-square" alt="Built with love" />
  <br/><br/>
  <sub>Works with any language · Private Repository · Not licensed for public distribution.</sub>
</div>
