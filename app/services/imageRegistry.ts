// Re-export from assets/images/index.ts which uses require.context
// This file exists for backwards compatibility with existing imports
export {
  imageRegistry,
  animalsRegistry,
  cultureRegistry,
  decksRegistry,
  allImages,
  getDeckImage,
} from '../../assets/images';

export { default } from '../../assets/images';
