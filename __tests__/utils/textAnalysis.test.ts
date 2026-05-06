import { describe, it, expect } from 'vitest'
import {
  getCharacterCount,
  getWordCount,
  estimateTaskCount,
  isValidNoteText,
} from '../../src/utils/textAnalysis'

describe('getCharacterCount', () => {
  it('returns 0 for empty string', () => {
    expect(getCharacterCount('')).toBe(0)
  })

  it('strips leading and trailing whitespace', () => {
    expect(getCharacterCount('  hello  ')).toBe(5)
  })

  it('preserves internal whitespace', () => {
    expect(getCharacterCount('hello world')).toBe(11)
  })

  it('returns 0 for whitespace-only input', () => {
    expect(getCharacterCount('   \n\t  ')).toBe(0)
  })

  it('counts unicode characters by JS string length', () => {
    expect(getCharacterCount('café')).toBe(4)
  })
})

describe('getWordCount', () => {
  it('returns 0 for empty string', () => {
    expect(getWordCount('')).toBe(0)
  })

  it('returns 0 for whitespace-only input', () => {
    expect(getWordCount('   ')).toBe(0)
  })

  it('counts a single word', () => {
    expect(getWordCount('hello')).toBe(1)
  })

  it('handles multiple spaces between words', () => {
    expect(getWordCount('hello   world')).toBe(2)
  })

  it('handles newlines and tabs as separators', () => {
    expect(getWordCount('hello\nworld\ttoday')).toBe(3)
  })
})

describe('estimateTaskCount', () => {
  it('returns 0 for text under 50 characters', () => {
    expect(estimateTaskCount('short note')).toBe(0)
  })

  it('returns at least 1 once length threshold met (no action words)', () => {
    const text = 'a'.repeat(100)
    expect(estimateTaskCount(text)).toBe(1)
  })

  it('counts action words as whole words (not substrings)', () => {
    // "willingly" should NOT match "will"
    const text = 'A team meeting where everyone listened willingly to the report. ' + 'x'.repeat(50)
    expect(estimateTaskCount(text)).toBe(1) // just the floor
  })

  it('caps at 10 tasks even with many action words', () => {
    const longText = (
      'will need should must working complete finish deliver prepare review ' +
      'schedule create update send discuss '
    ).repeat(5)
    expect(estimateTaskCount(longText)).toBe(10)
  })

  it('is case-insensitive on action words', () => {
    const text = 'I WILL DELIVER and SCHEDULE the review next week. ' + 'x'.repeat(50)
    expect(estimateTaskCount(text)).toBeGreaterThanOrEqual(3)
  })
})

describe('isValidNoteText', () => {
  it('rejects empty input', () => {
    expect(isValidNoteText('')).toBe(false)
  })

  it('rejects input under 5 characters', () => {
    expect(isValidNoteText('hey')).toBe(false)
  })

  it('accepts input of exactly 5 characters', () => {
    expect(isValidNoteText('hello')).toBe(true)
  })

  it('accepts input over 5 characters', () => {
    expect(isValidNoteText('hello world')).toBe(true)
  })

  it('strips whitespace before checking length', () => {
    expect(isValidNoteText('  hi  ')).toBe(false)
  })
})
