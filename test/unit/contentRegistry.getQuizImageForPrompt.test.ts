import { getQuizImageForPrompt } from '../../app/services/contentRegistry';

describe('getQuizImageForPrompt', () => {
  it('returns shared image for known prompt across languages', () => {
    const dzImage = getQuizImageForPrompt('dz', 'dog');
    const quImage = getQuizImageForPrompt('qu', 'dog');
    expect(dzImage).toBeDefined();
    expect(quImage).toBe(dzImage);
  });

  it('returns undefined for unknown prompt', () => {
    expect(getQuizImageForPrompt('dz', 'unknown')).toBeUndefined();
  });
});
