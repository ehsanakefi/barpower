/**
 * Persian / Arabic text normalization utilities.
 *
 * Used during document ingestion and search-time query normalization.
 */

const ARABIC_TO_PERSIAN: [RegExp, string][] = [
  [/ي/g, 'ی'],
  [/ك/g, 'ک'],
  [/ؤ/g, 'و'],
  [/إ/g, 'ا'],
  [/أ/g, 'ا'],
  [/ة/g, 'ه'],
];

const DIACRITICS = /[\u064B-\u065F\u0670]/g;

/**
 * Normalize Persian text:
 *  1. Unify Arabic -> Persian characters
 *  2. Remove diacritics (tashkeel)
 *  3. Replace ZWNJ (half-space) with regular space
 *  4. Collapse multiple whitespace to single space
 *  5. Trim
 */
export function normalizePersian(text: string): string {
  let result = text;

  for (const [pattern, replacement] of ARABIC_TO_PERSIAN) {
    result = result.replace(pattern, replacement);
  }

  result = result
    .replace(DIACRITICS, '')
    .replace(/\u200C/g, ' ') // جایگزینی نیم‌فاصله با فاصله (طبق کد خودتان)
    .replace(/[ \t\f\r]+/g, ' ') // فقط فاصله‌های افقی را یکی می‌کند (اینترها باقی می‌مانند)
    .trim();

  return result;
}

/**
 * Split raw document text into paragraph units.
 * Splits on one or more blank lines; trims and drops empty results.
 */
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 0);
}
