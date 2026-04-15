// Auto-import all image files dynamically using require.context
// Any .png, .jpg, .jpeg, .gif, or .webp file in subfolders will be automatically loaded
// No script needed - Metro bundler handles this at build time

import type { ImageSourcePropType } from 'react-native';

type ImageSource = ImageSourcePropType;

// Load all images from animals folder
const animalsContext = require.context('./animals', false, /\.(png|jpg|jpeg|gif|webp)$/);

// Load all images from culture folder
const cultureContext = require.context('./culture', false, /\.(png|jpg|jpeg|gif|webp)$/);

// Load all images from decks folder (recursive — images/decks/{deckname}/{card}.png)
const decksContext = require.context('./decks', true, /\.(png|jpg|jpeg|gif|webp)$/);

/**
 * Extract filename from require.context key
 * Example: "./bats.png" -> "bats.png"
 */
function getFilename(contextKey: string): string {
  return contextKey.replace('./', '');
}

// Build the animals image registry (keyed by filename)
const animalsRegistry: Record<string, ImageSource> = {};
animalsContext.keys().forEach((key) => {
  const filename = getFilename(key);
  animalsRegistry[filename] = animalsContext(key);
});

// Build the culture image registry (keyed by filename)
const cultureRegistry: Record<string, ImageSource> = {};
cultureContext.keys().forEach((key) => {
  const filename = getFilename(key);
  // Skip README and non-image files
  if (!filename.endsWith('.md')) {
    cultureRegistry[filename] = cultureContext(key);
  }
});

// Build the decks image registry (keyed by filename)
const decksRegistry: Record<string, ImageSource> = {};
decksContext.keys().forEach((key) => {
  const filename = getFilename(key);
  decksRegistry[filename] = decksContext(key);
});

// Combined registry with all images for global lookups
const imageRegistry: Record<string, ImageSource> = {
  ...animalsRegistry,
  ...decksRegistry,
};

/**
 * Get image for a deck card with deck-scoped lookup.
 * Accepts namespaced deckId (e.g. "dz:animals-basic") or plain (e.g. "animals-basic").
 * Tries "{deckId}/{filename}" first (matching folder under images/decks/),
 * then falls back to a plain "{filename}" lookup.
 */
export function getDeckImage(deckId: string, filename: string): ImageSource | undefined {
  if (!filename) return undefined;

  // Strip language namespace prefix (e.g. "dz:animals-basic" -> "animals-basic")
  const bare = deckId.includes(':') ? deckId.split(':')[1] : deckId;

  // Try exact deck folder match: e.g. "animals-basic/white-dog.png"
  const scoped = imageRegistry[`${bare}/${filename}`];
  if (scoped) return scoped;

  // Fallback: plain filename lookup
  return imageRegistry[filename];
}

// Full registry with all images organized by folder
const allImages = {
  animals: animalsRegistry,
  culture: cultureRegistry,
  decks: decksRegistry,
};

export { imageRegistry, animalsRegistry, cultureRegistry, decksRegistry, allImages };
export default imageRegistry;
