# 📊 Google Sheets Template & Examples

This document provides a complete template structure for your Google Sheets content management system.

## 🗂️ Spreadsheet Structure

Create **one Google Spreadsheet** with **3 tabs** (sheets):

1. **`Decks`** - Flashcard decks and cards
2. **`Dictionary`** - Word definitions and translations  
3. **`Culture`** - Culture content and images

---

## 📚 Decks Tab Template

### **Column Headers (Row 1):**
```
A1: id | B1: title | C1: description | D1: difficulty | E1: cardId | F1: front | G1: back | H1: image | I1: audio
```

### **Sample Data (Starting Row 2):**
```
A2: animals-basic    | B2: Animals        | C2: Basic animal names | D2: beginner | E2: 1 | F2: བྱ་        | G2: bird | H2: bird.png | I2: bird.mp3
A3: animals-basic    | B3: Animals        | C3: Basic animal names | D3: beginner | E3: 2 | F3: ཁྱི་        | G3: dog  | H3: dog.png  | I3: dog.mp3
A4: animals-basic    | B4: Animals        | C4: Basic animal names | D4: beginner | E4: 3 | F4: བ་ལུག      | G4: sheep| H4: sheep.png| I4: sheep.mp3
A5: colors-basic     | B5: Colors         | C5: Basic colors      | D5: beginner | E5: 1 | F5: དམར་པོ་     | G5: red  | H5: red.png  | I5: red.mp3
A6: colors-basic     | B6: Colors         | C6: Basic colors      | D6: beginner | E6: 2 | F6: སེར་པོ་     | G6: yellow|H6: yellow.png| I6: yellow.mp3
A7: food-basic       | B7: Food           | C7: Basic food names  | D7: beginner | E7: 1 | F7: ཁ་ཆུ        | G7: rice | H7: rice.png | I7: rice.mp3
A8: food-basic       | B8: Food           | C8: Basic food names  | D8: beginner | E8: 2 | F8: ཤ་མ        | G8: meat | H8: meat.png | I8: meat.mp3
```

### **Column Explanations:**

| Column | Purpose | Example | Rules |
|--------|---------|---------|-------|
| **id** | Unique deck identifier | `animals-basic` | Use lowercase, hyphens only |
| **title** | Human-readable deck name | `Animals` | Any text, will be displayed |
| **description** | Deck description | `Basic animal names` | Explains what the deck contains |
| **difficulty** | Learning level | `beginner`, `intermediate`, `advanced` | Helps organize content |
| **cardId** | Card number within deck | `1`, `2`, `3` | Must be unique within each deck |
| **front** | Dzardzongke text | `བྱ་` | The text users see first |
| **back** | English translation | `bird` | What users learn |
| **image** | Image filename | `bird.png` | Must exist in `assets/images/` |
| **audio** | Audio filename | `bird.mp3` | Must exist in `assets/audio/` |

### **How to Use Decks Tab:**

#### **Add New Deck:**
1. Add new rows with unique `id` (e.g., `numbers-basic`)
2. Use same `title` and `description` for all cards in deck
3. Give each card unique `cardId` (1, 2, 3...)

#### **Add Cards to Existing Deck:**
1. Copy existing row
2. Change `cardId` to next number
3. Update `front`, `back`, `image`, `audio`

#### **Remove Cards:**
1. Delete the entire row
2. Renumber remaining `cardId` values if needed

#### **Edit Existing Content:**
1. Change any cell directly
2. Run export to update app

---

## 📖 Dictionary Tab Template

### **Column Headers (Row 1):**
```
A1: dz | B1: en | C1: example | D1: exampleEn | E1: audio | F1: difficulty
```

### **Sample Data (Starting Row 2):**
```
A2: བྱ་        | B2: bird      | C2: བྱ་མོ་ཆུང་ངུ་        | D2: small bird | E2: bird.mp3 | F2: beginner
A3: ཁྱི་        | B3: dog       | C3: ཁྱི་ཆུང་ངུ་          | D3: small dog  | E3: dog.mp3  | F3: beginner
A4: བ་ལུག      | B4: sheep     | C4: བ་ལུག་ཆུང་ངུ་      | D4: small sheep| E4: sheep.mp3| F4: beginner
A5: དམར་པོ་     | B5: red       | C5: དམར་པོ་ཆུང་ངུ་     | D5: small red  | E5: red.mp3  | F5: beginner
A6: སེར་པོ་     | B6: yellow    | C6: སེར་པོ་ཆུང་ངུ་     | D6: small yellow|E6: yellow.mp3| F6: beginner
A7: ཁ་ཆུ        | B7: rice      | C7: ཁ་ཆུ་ཆུང་ངུ་        | D7: small rice | E7: rice.mp3 | F7: beginner
A8: ཤ་མ        | B8: meat      | C8: ཤ་མ་ཆུང་ངུ་        | D8: small meat | E8: meat.mp3 | F8: beginner
```

### **Column Explanations:**

| Column | Purpose | Example | Rules |
|--------|---------|---------|-------|
| **dz** | Dzardzongke word | `བྱ་` | The word being defined |
| **en** | English translation | `bird` | English meaning |
| **example** | Dzardzongke example | `བྱ་མོ་ཆུང་ངུ་` | Sentence using the word |
| **exampleEn** | English example | `small bird` | English translation of example |
| **audio** | Audio filename | `bird.mp3` | Must exist in `assets/audio/` |
| **difficulty** | Learning level | `beginner`, `intermediate`, `advanced` | Helps organize content |

### **How to Use Dictionary Tab:**

#### **Add New Words:**
1. Add new row at bottom
2. Fill in all columns
3. Ensure audio file exists in `assets/audio/`

#### **Remove Words:**
1. Delete the entire row
2. Run export to update app

#### **Edit Translations:**
1. Change any cell directly
2. Run export to update app

---

## 🏛️ Culture Tab Template

### **Column Headers (Row 1):**
```
A1: type | B1: step | C1: title | D1: text | E1: image | F1: caption | G1: order
```

### **Sample Data (Starting Row 2):**
```
A2: introduction | B2: welcome    | C2: Welcome to Dzardzongke | D2: Welcome to the rich culture of the Dzardzongke people... | E2: welcome.png | F2: Traditional welcome ceremony | G2: 1
A3: introduction | B3: overview   | C3: Culture Overview      | D3: The Dzardzongke people have lived in this region for centuries... | E3: overview.png | F3: Cultural overview map | G3: 2
A4: history      | B4: origins    | C4: Historical Origins    | D4: According to local legends, the Dzardzongke people originated from... | E4: origins.png | F4: Historical origins | G4: 3
A5: history      | B5: migration  | C5: Migration Story       | D5: The great migration brought our ancestors to this valley... | E5: migration.png | F5: Migration route map | G5: 4
A6: festivals    | B6: yarthung   | C6: Yarthung Festival     | D6: The annual Yarthung horse riding festival celebrates... | E6: yarthung.png | F6: Festival celebration | G6: 5
A7: festivals    | B7: harvest    | C7: Harvest Festival      | D7: During harvest season, the community gathers to... | E7: harvest.png | F7: Harvest celebration | G7: 6
A8: daily-life   | B8: farming    | C8: Traditional Farming   | D8: Farming has been the backbone of our community... | E8: farming.png | F8: Traditional farming methods | G8: 7
A9: daily-life   | B9: cooking    | C9: Traditional Cooking   | D9: Our traditional cooking methods preserve... | E9: cooking.png | F9: Traditional cooking | G9: 8
```

### **Column Explanations:**

| Column | Purpose | Example | Rules |
|--------|---------|---------|-------|
| **type** | Content category | `introduction`, `history`, `festivals`, `daily-life` | Groups related content |
| **step** | Unique identifier | `welcome`, `origins`, `yarthung` | Must be unique within each type |
| **title** | Section title | `Welcome to Dzardzongke` | Displayed as heading |
| **text** | Content body | `Welcome to the rich culture...` | Main content text |
| **image** | Image filename | `welcome.png` | Must exist in `assets/images/` |
| **caption** | Image description | `Traditional welcome ceremony` | Explains the image |
| **order** | Display order | `1`, `2`, `3` | Controls sequence in app |

### **How to Use Culture Tab:**

#### **Add New Content Section:**
1. Create new `type` value (e.g., `religion`)
2. Add rows with that type
3. Use unique `step` values for each row

#### **Add Content to Existing Section:**
1. Add new row with existing `type`
2. Give unique `step` value
3. Set appropriate `order` number

#### **Reorder Content:**
1. Change `order` numbers
2. Lower numbers appear first
3. Run export to update app

#### **Add Images:**
1. Put image file in `assets/images/`
2. Reference filename in `image` column
3. Add descriptive `caption`

---

## 🎯 Complete Example: Adding New Food Deck

### **Step 1: Add to Decks Tab**
```
food-basic | Food | Basic food names | beginner | 1 | ཁ་ཆུ | rice | rice.png | rice.mp3
food-basic | Food | Basic food names | beginner | 2 | ཤ་མ | meat | meat.png | meat.mp3
food-basic | Food | Basic food names | beginner | 3 | ཁ་ཟས | vegetables | vegetables.png | vegetables.mp3
```

### **Step 2: Add to Dictionary Tab**
```
ཁ་ཆུ | rice | ཁ་ཆུ་ཆུང་ངུ་ | small rice | rice.mp3 | beginner
ཤ་མ | meat | ཤ་མ་ཆུང་ངུ་ | small meat | meat.mp3 | beginner
ཁ་ཟས | vegetables | ཁ་ཟས་ཆུང་ངུ་ | small vegetables | vegetables.mp3 | beginner
```

### **Step 3: Add Files to Assets**
```
assets/images/rice.png
assets/images/meat.png  
assets/images/vegetables.png
assets/audio/rice.mp3
assets/audio/meat.mp3
assets/audio/vegetables.mp3
```

### **Step 4: Export Content**
```bash
npm run export-content
```

### **Step 5: Test Locally**
```bash
npm start
```

---

## 📋 Content Management Checklist

### **Before Adding New Content:**
- [ ] Plan your content structure
- [ ] Prepare image files (PNG/JPG)
- [ ] Prepare audio files (MP3/WAV)
- [ ] Use consistent naming (lowercase, hyphens)

### **When Adding Content:**
- [ ] Add to appropriate Google Sheet tab
- [ ] Use consistent formatting
- [ ] Check spelling and grammar
- [ ] Ensure file references match actual files

### **After Adding Content:**
- [ ] Run `npm run export-content`
- [ ] Test locally with `npm start`
- [ ] Verify images and audio work
- [ ] Check content appears correctly
- [ ] Commit changes to Git
- [ ] Deploy to production

---

## 🚨 Common Mistakes to Avoid

### **File Naming:**
- ❌ `Bird Image.png` (spaces, uppercase)
- ❌ `bird_image.png` (underscores)
- ✅ `bird-image.png` (lowercase, hyphens)

### **Content Structure:**
- ❌ Missing required columns
- ❌ Inconsistent `id` values
- ❌ Duplicate `cardId` within same deck
- ❌ Missing `order` numbers in Culture tab

### **File Management:**
- ❌ Referencing non-existent files
- ❌ Wrong file extensions
- ❌ Files in wrong folders
- ❌ Case-sensitive mismatches

---

## 🔧 Advanced Tips

### **Bulk Operations:**
- Use Google Sheets' copy/paste features
- Use formulas for repetitive content
- Use find/replace for consistent updates

### **Content Organization:**
- Group related content with consistent `type` values
- Use descriptive `step` names
- Maintain logical `order` sequences
- Add comments in unused columns for notes

### **Quality Control:**
- Review content before export
- Test with different devices/screen sizes
- Verify audio quality and image clarity
- Check for cultural accuracy and sensitivity

---

## 📞 Need Help?

If you encounter issues:

1. **Check this template** for correct structure
2. **Verify file names** match exactly
3. **Check export logs** for error messages
4. **Test with simple content** first
5. **Review the main workflow guide**

Remember: The Google Sheets system is designed to be simple and intuitive. If something seems complicated, there's probably a simpler way!
