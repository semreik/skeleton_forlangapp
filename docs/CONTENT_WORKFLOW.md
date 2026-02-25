# 📚 Content Management Workflow for Non-Technical Users

This guide explains how to manage app content using **Google Sheets** - no coding required! You can edit decks, dictionary, culture content, and more directly in familiar spreadsheet format.

## 🚀 Quick Start

1. **Get Google API Access** (one-time setup)
2. **Create/Setup Google Sheets** (one-time setup)  
3. **Edit content** in Google Sheets
4. **Export to app** with one command
5. **Test changes** locally
6. **Deploy to production**

---

## 🔑 Step 1: Get Google API Access

### **What is a Google API Key?**
An API key is like a password that lets our app read your Google Sheets. It's free and safe.

### **How to Get Your API Key:**

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Sign in** with your Google account
3. **Create a new project** (or select existing):
   - Click "Select a project" → "New Project"
   - Name it something like "Dzardzongke Content Manager"
   - Click "Create"

4. **Enable Google Sheets API:**
   - In the left menu, click "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

5. **Create API Key:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the long string that appears (starts with "AIza...")
   - **Save this somewhere safe!** This is your API key.

6. **Restrict the API Key (Recommended):**
   - Click on your new API key
   - Under "Application restrictions" select "Restrict key"
   - Under "API restrictions" select "Restrict key to Google Sheets API"
   - Click "Save"

---

## 📊 Step 2: Create Google Sheets

### **Option A: Create New Spreadsheet (Recommended)**
1. Go to [Google Sheets](https://sheets.google.com)
2. Click "Blank" to create new spreadsheet
3. Name it "Dzardzongke Content Manager"
4. Create **3 tabs** (sheets) with these exact names:
   - `Decks` - for flashcard decks
   - `Dictionary` - for word definitions
   - `Culture` - for culture content

### **Option B: Use Our Template**
We'll provide a template spreadsheet you can copy.

### **Get Your Spreadsheet ID:**
- Look at the URL: `https://docs.google.com/spreadsheets/d/`**`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`**`/edit`
- The long string between `/d/` and `/edit` is your **Spreadsheet ID**
- Copy this ID - you'll need it later!

---

## 📋 Step 3: Spreadsheet Structure & Examples

### **Decks Tab - Flashcard Management**

| id | title | description | difficulty | cardId | front | back | image | audio |
|----|-------|-------------|------------|--------|-------|------|-------|-------|
| animals-basic | Animals | Basic animal names | beginner | 1 | བྱ་ | bird | bird.png | bird.mp3 |
| animals-basic | Animals | Basic animal names | beginner | 2 | ཁྱི་ | dog | dog.png | dog.mp3 |
| colors-basic | Colors | Basic colors | beginner | 1 | དམར་པོ་ | red | red.png | red.mp3 |

**How to use:**
- **Add new deck**: Create new row with unique `id` (e.g., "food-basic")
- **Add cards**: Add rows with same `id` but different `cardId`
- **Remove cards**: Delete the row
- **Edit content**: Change any cell directly

### **Dictionary Tab - Word Management**

| dz | en | example | exampleEn | audio | difficulty |
|----|----|---------|-----------|-------|------------|
| བྱ་ | bird | བྱ་མོ་ཆུང་ངུ་ | small bird | bird.mp3 | beginner |
| ཁྱི་ | dog | ཁྱི་ཆུང་ངུ་ | small dog | dog.mp3 | beginner |
| དམར་པོ་ | red | དམར་པོ་ཆུང་ངུ་ | small red | red.mp3 | beginner |

**How to use:**
- **Add words**: Add new rows
- **Remove words**: Delete rows
- **Edit translations**: Change any cell
- **Add audio**: Put filename in `audio` column

### **Culture Tab - Culture Content Management**

| type | step | title | text | image | caption | order |
|------|------|-------|------|-------|---------|-------|
| introduction | welcome | Welcome | Welcome to Dzardzongke culture! | welcome.png | Welcome image | 1 |
| history | origins | Origins | The Dzardzongke people... | origins.png | Historical origins | 2 |
| festivals | yarthung | Yarthung Festival | Annual horse riding... | yarthung.png | Festival celebration | 3 |

**How to use:**
- **Add new sections**: Create new `type` values
- **Add content**: Add rows with existing `type`
- **Reorder**: Change `order` numbers
- **Add images**: Put filename in `image` column

---

## 🖼️ Step 4: Managing Images & Audio Files

### **Images: Manual File Management Required**
**Images must still be added manually to the `assets/images/` folder.** This is a technical limitation we're working to solve.

### **Audio: AUTOMATIC Mapping! 🎉**
**Great news! Audio file mapping is now completely automatic.** No more manual TypeScript editing required!

**How it works:**
1. **Place audio files** in the correct folders (see structure below)
2. **Run auto-mapper**: `npm run map-audio`
3. **That's it!** The app automatically creates all necessary mappings

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

### **Current Process:**
1. **Add image/audio files** to `assets/images/` or `assets/audio/`
2. **Reference them** in Google Sheets (just filename, no path)
3. **Run export** to update the app

### **File Naming Rules:**
- Use **lowercase** letters only
- Use **hyphens** instead of spaces: `bird-image.png`
- **No special characters**: `bird_image.png` ❌, `bird-image.png` ✅
- **Supported formats**: `.png`, `.jpg`, `.mp3`, `.wav`

### **Audio Format Note:**
**Important:** While we recommend MP3 for new audio files (smaller size, better compatibility), the current app uses **WAV files**. You can use either format, but be consistent within your project.

### **Example File Structure:**
```
assets/
├── images/
│   ├── bird.png
│   ├── dog.png
│   └── red.png
├── audio/
│   ├── bird.mp3
│   ├── dog.mp3
│   └── red.mp3
```

---

## ⚙️ Step 5: Setup Environment Variables

### **What are Environment Variables?**
These are settings that tell our app where to find your Google Sheets.

### **How to Set Them:**

#### **On Mac/Linux:**
```bash
# Open Terminal and run these commands:
export GOOGLE_API_KEY="AIzaSyB...your-api-key-here"
export DECKS_SHEET_ID="1BxiM...your-spreadsheet-id"
export DICTIONARY_SHEET_ID="1BxiM...your-spreadsheet-id"
export CULTURE_SHEET_ID="1BxiM...your-spreadsheet-id"
```

#### **On Windows:**
```cmd
# Open Command Prompt and run:
set GOOGLE_API_KEY=AIzaSyB...your-api-key-here
set DECKS_SHEET_ID=1BxiM...your-spreadsheet-id
set DICTIONARY_SHEET_ID=1BxiM...your-spreadsheet-id
set CULTURE_SHEET_ID=1BxiM...your-spreadsheet-id
```

#### **Permanent Setup (Recommended):**
Create a file called `.env` in your project folder:
```bash
# .env file
GOOGLE_API_KEY=AIzaSyB...your-api-key-here
DECKS_SHEET_ID=1BxiM...your-spreadsheet-id
DICTIONARY_SHEET_ID=1BxiM...your-spreadsheet-id
CULTURE_SHEET_ID=1BxiM...your-spreadsheet-id
```

---

## 📤 Step 6: Export Content to App

### **After making changes in Google Sheets:**

1. **Open Terminal/Command Prompt**
2. **Navigate to project folder**
3. **Run export command:**
```bash
npm run export-content
```

### **If you added new audio files:**

4. **Run audio auto-mapper:**
```bash
npm run map-audio
```

**What this does:**
- Automatically scans `assets/audio/` folder
- Creates all necessary TypeScript mappings
- Updates AudioService.ts and dictionaryAudio.ts
- **No manual coding required!**

### **What This Does:**
- Reads your Google Sheets
- Creates/updates JSON files in `assets/` folder
- Syncs all changes to the app

### **Expected Output:**
```
✅ Successfully exported:
- assets/decks/decks.json
- assets/dictionary/dzardzongke.dict.json  
- assets/culture/culture.json
```

---

## 🧪 Step 7: Test Your Changes

### **Test Locally First:**
1. **Start local development server:**
```bash
npm start
# or
npx expo start
```

2. **Open app** in browser or mobile device
3. **Navigate to changed content** and verify:
   - New cards appear correctly
   - Images load properly
   - Audio plays
   - Text is correct

### **Common Issues to Check:**
- **Images not showing**: Check filename spelling in Google Sheets
- **Audio not playing**: Check audio file exists in `assets/audio/`
- **Content missing**: Check Google Sheets for typos
- **Export errors**: Check API key and spreadsheet ID

---

## 🚀 Step 8: Deploy to Production

### **After testing locally:**

1. **Commit your changes:**
```bash
git add .
git commit -m "Update content: added new animal cards and culture section"
git push origin main
```

2. **Build production app:**
```bash
# For Android APK:
eas build --platform android --profile production

# For iOS:
eas build --platform ios --profile production
```

3. **Wait for build** (usually 10-20 minutes)
4. **Download and install** new version

---

## 📝 Complete Workflow Example

### **Scenario: Add New Food Deck**

1. **Open Google Sheets** → `Decks` tab
2. **Add new rows:**
   ```
   food-basic | Food | Basic food names | beginner | 1 | ཁ་ཆུ | rice | rice.png | rice.mp3
   food-basic | Food | Basic food names | beginner | 2 | ཤ་མ | meat | meat.png | meat.mp3
   ```

3. **Add image files** to `assets/images/`:
   - `rice.png`
   - `meat.png`

4. **Add audio files** to `assets/audio/`:
   - `rice.mp3`
   - `meat.mp3`

5. **Export content:**
   ```bash
   npm run export-content
   ```

6. **If you added audio files, map them automatically:**
   ```bash
   npm run map-audio
   ```

7. **Test locally:**
   ```bash
   npm start
   ```

7. **Verify** new food deck appears in app

8. **Deploy to production:**
   ```bash
   git add . && git commit -m "Add food deck" && git push
   eas build --platform android --profile production
   ```

---

## 🆘 Troubleshooting

### **Export Fails:**
- Check API key is correct
- Check spreadsheet ID is correct
- Check Google Sheets is shared (anyone with link can view)
- Check internet connection

### **Images Not Showing:**
- Verify filename in Google Sheets matches actual file
- Check file is in correct `assets/` folder
- Ensure filename uses lowercase and hyphens

### **Content Not Updating:**
- Run `npm run export-content` again
- Check Google Sheets for typos
- Restart development server

### **Audio Not Working:**
- Run `npm run map-audio` to regenerate audio mappings
- Check audio file exists in correct folder
- Verify file naming follows conventions
- Check file format is supported (.wav, .mp3, .m4a, .aac)

### **Need Help?**
- Check this documentation first
- Look for error messages in terminal
- Verify all setup steps completed

---

## 📚 Summary

**You can now:**
✅ Add/remove/edit flashcard decks  
✅ Manage dictionary words  
✅ Update culture content  
✅ Add new content sections  
✅ All without writing any code!  

**Remember:**
- Images/audio files still need manual file management
- Always test locally before deploying
- Keep your API key and spreadsheet ID safe
- Use the export command after every change

**Next steps:**
1. Set up your Google API access
2. Create your content spreadsheets
3. Try adding one new card to test the system
4. Export and test locally
5. Deploy when ready!
