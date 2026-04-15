// Auto-import all dictionary files dynamically
// Any .dict.json file in this folder will be automatically loaded

export type DictionaryShape = {
  entries: Array<{
    dz?: string;
    en?: string;
    example?: string;
    exampleEn?: string;
    audio?: string;
  }>;
};

// Use require.context to dynamically load all .dict.json files
const dictContext = require.context('./', false, /\.dict\.json$/);

// Get all dictionary files and merge entries by language code
const allDictionaries: Record<string, DictionaryShape> = {};

dictContext.keys().forEach(key => {
  // Extract language code from filename (e.g., "qu-words.dict.json" -> "qu", "anything.dict.json" -> "dz")
  const filename = key.replace('./', '').replace('.dict.json', '');

  // Determine language code: files starting with "qu" go to Quechua, everything else to Dzardzongke
  const langCode = filename.startsWith('qu') ? 'qu' : 'dz';

  const dictData = dictContext(key) as DictionaryShape;
  
  // Merge entries if language code already exists
  if (allDictionaries[langCode]) {
    allDictionaries[langCode].entries = [
      ...allDictionaries[langCode].entries,
      ...dictData.entries
    ];
  } else {
    allDictionaries[langCode] = dictData;
  }
});

// Export dictionaries by language code
export const dzDictionary: DictionaryShape = allDictionaries['dz'] || { entries: [] };
export const quDictionary: DictionaryShape = allDictionaries['qu'] || { entries: [] };

// Export all dictionaries for advanced usage
export const dictionaries = allDictionaries;
