// ABOUTME: Generates a JSON manifest of all phrases needing TTS audio generation.
// ABOUTME: Covers questions, number words, feedback, instructions, and level messages in Hebrew and English.

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

interface NumberWord {
  feminine: string;
  masculine: string;
}

const HEBREW_NUMBERS: Record<number, NumberWord> = {
  0:  { feminine: 'אפס',           masculine: 'אפס' },
  1:  { feminine: 'אחת',           masculine: 'אחד' },
  2:  { feminine: 'שתיים',         masculine: 'שניים' },
  3:  { feminine: 'שלוש',          masculine: 'שלושה' },
  4:  { feminine: 'ארבע',          masculine: 'ארבעה' },
  5:  { feminine: 'חמש',           masculine: 'חמישה' },
  6:  { feminine: 'שש',            masculine: 'שישה' },
  7:  { feminine: 'שבע',           masculine: 'שבעה' },
  8:  { feminine: 'שמונה',         masculine: 'שמונה' },
  9:  { feminine: 'תשע',           masculine: 'תשעה' },
  10: { feminine: 'עשר',           masculine: 'עשרה' },
  11: { feminine: 'אחת עשרה',      masculine: 'אחד עשר' },
  12: { feminine: 'שתים עשרה',     masculine: 'שנים עשר' },
  13: { feminine: 'שלוש עשרה',     masculine: 'שלושה עשר' },
  14: { feminine: 'ארבע עשרה',     masculine: 'ארבעה עשר' },
  15: { feminine: 'חמש עשרה',      masculine: 'חמישה עשר' },
  16: { feminine: 'שש עשרה',       masculine: 'שישה עשר' },
  17: { feminine: 'שבע עשרה',      masculine: 'שבעה עשר' },
  18: { feminine: 'שמונה עשרה',    masculine: 'שמונה עשר' },
  19: { feminine: 'תשע עשרה',      masculine: 'תשעה עשר' },
  20: { feminine: 'עשרים',         masculine: 'עשרים' },
  21: { feminine: 'עשרים ואחת',    masculine: 'עשרים ואחד' },
  22: { feminine: 'עשרים ושתיים',  masculine: 'עשרים ושניים' },
  23: { feminine: 'עשרים ושלוש',   masculine: 'עשרים ושלושה' },
  24: { feminine: 'עשרים וארבע',   masculine: 'עשרים וארבעה' },
  25: { feminine: 'עשרים וחמש',    masculine: 'עשרים וחמישה' },
  26: { feminine: 'עשרים ושש',     masculine: 'עשרים ושישה' },
  27: { feminine: 'עשרים ושבע',    masculine: 'עשרים ושבעה' },
  28: { feminine: 'עשרים ושמונה',  masculine: 'עשרים ושמונה' },
  29: { feminine: 'עשרים ותשע',    masculine: 'עשרים ותשעה' },
  30: { feminine: 'שלושים',        masculine: 'שלושים' },
  31: { feminine: 'שלושים ואחת',   masculine: 'שלושים ואחד' },
  32: { feminine: 'שלושים ושתיים', masculine: 'שלושים ושניים' },
  33: { feminine: 'שלושים ושלוש',  masculine: 'שלושים ושלושה' },
  34: { feminine: 'שלושים וארבע',  masculine: 'שלושים וארבעה' },
  35: { feminine: 'שלושים וחמש',   masculine: 'שלושים וחמישה' },
  36: { feminine: 'שלושים ושש',    masculine: 'שלושים ושישה' },
  37: { feminine: 'שלושים ושבע',   masculine: 'שלושים ושבעה' },
  38: { feminine: 'שלושים ושמונה', masculine: 'שלושים ושמונה' },
  39: { feminine: 'שלושים ותשע',   masculine: 'שלושים ותשעה' },
  40: { feminine: 'ארבעים',        masculine: 'ארבעים' },
  41: { feminine: 'ארבעים ואחת',   masculine: 'ארבעים ואחד' },
  42: { feminine: 'ארבעים ושתיים', masculine: 'ארבעים ושניים' },
  43: { feminine: 'ארבעים ושלוש',  masculine: 'ארבעים ושלושה' },
  44: { feminine: 'ארבעים וארבע',  masculine: 'ארבעים וארבעה' },
  45: { feminine: 'ארבעים וחמש',   masculine: 'ארבעים וחמישה' },
  46: { feminine: 'ארבעים ושש',    masculine: 'ארבעים ושישה' },
  47: { feminine: 'ארבעים ושבע',   masculine: 'ארבעים ושבעה' },
  48: { feminine: 'ארבעים ושמונה', masculine: 'ארבעים ושמונה' },
  49: { feminine: 'ארבעים ותשע',   masculine: 'ארבעים ותשעה' },
  50: { feminine: 'חמישים',        masculine: 'חמישים' },
  51: { feminine: 'חמישים ואחת',   masculine: 'חמישים ואחד' },
  52: { feminine: 'חמישים ושתיים', masculine: 'חמישים ושניים' },
  53: { feminine: 'חמישים ושלוש',  masculine: 'חמישים ושלושה' },
  54: { feminine: 'חמישים וארבע',  masculine: 'חמישים וארבעה' },
  55: { feminine: 'חמישים וחמש',   masculine: 'חמישים וחמישה' },
  56: { feminine: 'חמישים ושש',    masculine: 'חמישים ושישה' },
  57: { feminine: 'חמישים ושבע',   masculine: 'חמישים ושבעה' },
  58: { feminine: 'חמישים ושמונה', masculine: 'חמישים ושמונה' },
  59: { feminine: 'חמישים ותשע',   masculine: 'חמישים ותשעה' },
  60: { feminine: 'שישים',         masculine: 'שישים' },
  61: { feminine: 'שישים ואחת',    masculine: 'שישים ואחד' },
  62: { feminine: 'שישים ושתיים',  masculine: 'שישים ושניים' },
  63: { feminine: 'שישים ושלוש',   masculine: 'שישים ושלושה' },
  64: { feminine: 'שישים וארבע',   masculine: 'שישים וארבעה' },
  65: { feminine: 'שישים וחמש',    masculine: 'שישים וחמישה' },
  66: { feminine: 'שישים ושש',     masculine: 'שישים ושישה' },
  67: { feminine: 'שישים ושבע',    masculine: 'שישים ושבעה' },
  68: { feminine: 'שישים ושמונה',  masculine: 'שישים ושמונה' },
  69: { feminine: 'שישים ותשע',    masculine: 'שישים ותשעה' },
  70: { feminine: 'שבעים',         masculine: 'שבעים' },
  71: { feminine: 'שבעים ואחת',    masculine: 'שבעים ואחד' },
  72: { feminine: 'שבעים ושתיים',  masculine: 'שבעים ושניים' },
  73: { feminine: 'שבעים ושלוש',   masculine: 'שבעים ושלושה' },
  74: { feminine: 'שבעים וארבע',   masculine: 'שבעים וארבעה' },
  75: { feminine: 'שבעים וחמש',    masculine: 'שבעים וחמישה' },
  76: { feminine: 'שבעים ושש',     masculine: 'שבעים ושישה' },
  77: { feminine: 'שבעים ושבע',    masculine: 'שבעים ושבעה' },
  78: { feminine: 'שבעים ושמונה',  masculine: 'שבעים ושמונה' },
  79: { feminine: 'שבעים ותשע',    masculine: 'שבעים ותשעה' },
  80: { feminine: 'שמונים',        masculine: 'שמונים' },
  81: { feminine: 'שמונים ואחת',   masculine: 'שמונים ואחד' },
  82: { feminine: 'שמונים ושתיים', masculine: 'שמונים ושניים' },
  83: { feminine: 'שמונים ושלוש',  masculine: 'שמונים ושלושה' },
  84: { feminine: 'שמונים וארבע',  masculine: 'שמונים וארבעה' },
  85: { feminine: 'שמונים וחמש',   masculine: 'שמונים וחמישה' },
  86: { feminine: 'שמונים ושש',    masculine: 'שמונים ושישה' },
  87: { feminine: 'שמונים ושבע',   masculine: 'שמונים ושבעה' },
  88: { feminine: 'שמונים ושמונה', masculine: 'שמונים ושמונה' },
  89: { feminine: 'שמונים ותשע',   masculine: 'שמונים ותשעה' },
  90: { feminine: 'תשעים',         masculine: 'תשעים' },
  91: { feminine: 'תשעים ואחת',    masculine: 'תשעים ואחד' },
  92: { feminine: 'תשעים ושתיים',  masculine: 'תשעים ושניים' },
  93: { feminine: 'תשעים ושלוש',   masculine: 'תשעים ושלושה' },
  94: { feminine: 'תשעים וארבע',   masculine: 'תשעים וארבעה' },
  95: { feminine: 'תשעים וחמש',    masculine: 'תשעים וחמישה' },
  96: { feminine: 'תשעים ושש',     masculine: 'תשעים ושישה' },
  97: { feminine: 'תשעים ושבע',    masculine: 'תשעים ושבעה' },
  98: { feminine: 'תשעים ושמונה',  masculine: 'תשעים ושמונה' },
  99: { feminine: 'תשעים ותשע',    masculine: 'תשעים ותשעה' },
  100: { feminine: 'מאה',          masculine: 'מאה' },
};

const ENGLISH_NUMBERS: Record<number, string> = {
  0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four',
  5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine',
  10: 'ten', 11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen',
  15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen',
  20: 'twenty', 21: 'twenty-one', 22: 'twenty-two', 23: 'twenty-three',
  24: 'twenty-four', 25: 'twenty-five', 26: 'twenty-six', 27: 'twenty-seven',
  28: 'twenty-eight', 29: 'twenty-nine', 30: 'thirty', 31: 'thirty-one',
  32: 'thirty-two', 33: 'thirty-three', 34: 'thirty-four', 35: 'thirty-five',
  36: 'thirty-six', 37: 'thirty-seven', 38: 'thirty-eight', 39: 'thirty-nine',
  40: 'forty', 41: 'forty-one', 42: 'forty-two', 43: 'forty-three',
  44: 'forty-four', 45: 'forty-five', 46: 'forty-six', 47: 'forty-seven',
  48: 'forty-eight', 49: 'forty-nine', 50: 'fifty', 51: 'fifty-one',
  52: 'fifty-two', 53: 'fifty-three', 54: 'fifty-four', 55: 'fifty-five',
  56: 'fifty-six', 57: 'fifty-seven', 58: 'fifty-eight', 59: 'fifty-nine',
  60: 'sixty', 61: 'sixty-one', 62: 'sixty-two', 63: 'sixty-three',
  64: 'sixty-four', 65: 'sixty-five', 66: 'sixty-six', 67: 'sixty-seven',
  68: 'sixty-eight', 69: 'sixty-nine', 70: 'seventy', 71: 'seventy-one',
  72: 'seventy-two', 73: 'seventy-three', 74: 'seventy-four', 75: 'seventy-five',
  76: 'seventy-six', 77: 'seventy-seven', 78: 'seventy-eight', 79: 'seventy-nine',
  80: 'eighty', 81: 'eighty-one', 82: 'eighty-two', 83: 'eighty-three',
  84: 'eighty-four', 85: 'eighty-five', 86: 'eighty-six', 87: 'eighty-seven',
  88: 'eighty-eight', 89: 'eighty-nine', 90: 'ninety', 91: 'ninety-one',
  92: 'ninety-two', 93: 'ninety-three', 94: 'ninety-four', 95: 'ninety-five',
  96: 'ninety-six', 97: 'ninety-seven', 98: 'ninety-eight', 99: 'ninety-nine',
  100: 'one hundred',
};

interface ManifestEntry {
  id: string;
  text: string;
  locale: 'he' | 'en';
  category: 'question' | 'number' | 'feedback' | 'instruction' | 'level';
  filePath: string;
  metadata: Record<string, number | string>;
}

interface Manifest {
  generatedAt: string;
  totalEntries: number;
  entries: ManifestEntry[];
}

const FEEDBACK_PHRASES: Array<{ id: string; he: string; en: string }> = [
  { id: 'correct-1',       he: 'כל הכבוד!',                   en: 'Amazing!' },
  { id: 'correct-2',       he: 'מצוין!',                      en: 'Excellent!' },
  { id: 'correct-3',       he: 'יופי!',                       en: 'Great job!' },
  { id: 'correct-4',       he: 'נכון מאוד!',                  en: 'That\'s right!' },
  { id: 'correct-5',       he: 'וואו!',                       en: 'Wow!' },
  { id: 'correct-6',       he: 'בדיוק!',                      en: 'Exactly!' },
  { id: 'correct-no-hint', he: 'לבד! בלי עזרה!',             en: 'All by yourself!' },
  { id: 'correct-fast',    he: 'מהר מאוד!',                   en: 'Super fast!' },
  { id: 'wrong-1',         he: 'לא בדיוק, נסי שוב!',         en: 'Not quite, try again!' },
  { id: 'wrong-2',         he: 'כמעט! נסי עוד פעם.',          en: 'Almost! Try once more.' },
  { id: 'wrong-3',         he: 'אופס, עוד פעם!',              en: 'Oops, one more time!' },
  { id: 'wrong-show',      he: 'התשובה היא',                   en: 'The answer is' },
  { id: 'wrong-lets-see',  he: 'בוא נראה למה.',                en: 'Let\'s see why.' },
  { id: 'hint-available',  he: 'רוצה עזרה?',                  en: 'Need help?' },
  { id: 'hint-used',       he: 'יופי שהשתמשת בעזרה!',        en: 'Great job using the blocks!' },
  { id: 'streak-3',        he: 'שלוש ברצף!',                  en: 'Three in a row!' },
  { id: 'streak-5',        he: 'חמש ברצף! אלופה!',            en: 'Five in a row! Champion!' },
  { id: 'try-again-later', he: 'ננסה את זה שוב אחר כך.',      en: 'We\'ll try this one again later.' },
];

const INSTRUCTION_PHRASES: Array<{ id: string; he: string; en: string }> = [
  { id: 'drag-blocks',     he: 'גררי את הקוביות.',             en: 'Drag the blocks.' },
  { id: 'tap-answer',      he: 'הקישי את התשובה.',             en: 'Tap the answer.' },
  { id: 'tap-hint',        he: 'אפשר ללחוץ על עזרה.',          en: 'You can tap the help button.' },
  { id: 'count-groups',    he: 'בואי נספור את הקבוצות.',        en: 'Let\'s count the groups.' },
  { id: 'count-all',       he: 'עכשיו נספור את הכל.',          en: 'Now let\'s count them all.' },
  { id: 'look-blocks',     he: 'תסתכלי על הקוביות.',           en: 'Look at the blocks.' },
  { id: 'how-many-groups', he: 'כמה קבוצות יש?',               en: 'How many groups are there?' },
  { id: 'how-many-each',   he: 'כמה בכל קבוצה?',               en: 'How many in each group?' },
  { id: 'press-number',    he: 'לחצי על המספר.',                en: 'Press the number.' },
  { id: 'good-thinking',   he: 'חשיבה טובה!',                  en: 'Good thinking!' },
];

const LEVEL_PHRASES: Array<{ id: string; he: string; en: string }> = [
  { id: 'level-1',          he: 'שלב אחת!',                    en: 'Level one!' },
  { id: 'level-2',          he: 'שלב שתיים!',                  en: 'Level two!' },
  { id: 'level-3',          he: 'שלב שלוש!',                   en: 'Level three!' },
  { id: 'level-4',          he: 'שלב ארבע!',                   en: 'Level four!' },
  { id: 'level-5',          he: 'שלב חמש!',                    en: 'Level five!' },
  { id: 'level-6',          he: 'שלב שש!',                     en: 'Level six!' },
  { id: 'level-7',          he: 'שלב שבע!',                    en: 'Level seven!' },
  { id: 'level-8',          he: 'שלב שמונה!',                  en: 'Level eight!' },
  { id: 'level-9',          he: 'שלב תשע!',                    en: 'Level nine!' },
  { id: 'level-10',         he: 'שלב עשר!',                    en: 'Level ten!' },
  { id: 'level-11',         he: 'שלב אחת עשרה!',              en: 'Level eleven!' },
  { id: 'level-12',         he: 'שלב שתים עשרה!',             en: 'Level twelve!' },
  { id: 'level-13',         he: 'שלב שלוש עשרה!',             en: 'Level thirteen!' },
  { id: 'level-14',         he: 'שלב ארבע עשרה!',             en: 'Level fourteen!' },
  { id: 'level-15',         he: 'שלב חמש עשרה!',              en: 'Level fifteen!' },
  { id: 'level-complete',   he: 'הצלחת!',                     en: 'You did it!' },
  { id: 'level-perfect',    he: 'מושלם! בלי טעויות!',         en: 'Perfect! No mistakes!' },
  { id: 'session-start',    he: 'בואי נשחק!',                 en: 'Let\'s play!' },
  { id: 'session-end',      he: 'כל הכבוד! סיימנו להיום!',    en: 'Great job! We\'re done for today!' },
  { id: 'session-continue', he: 'רוצה להמשיך?',               en: 'Want to keep going?' },
  { id: 'welcome-back',     he: 'שוב פה! בואי נתחיל!',        en: 'You\'re back! Let\'s start!' },
  { id: 'new-building',     he: 'בניין חדש!',                  en: 'New building!' },
  { id: 'building-growing', he: 'הבניין גדל!',                en: 'The building is growing!' },
];

function generateManifest(): Manifest {
  const entries: ManifestEntry[] = [];

  // Question phrases: all 66 canonical facts (0x0 through 10x10, a <= b)
  for (let a = 0; a <= 10; a++) {
    for (let b = a; b <= 10; b++) {
      const heA = HEBREW_NUMBERS[a].feminine;
      const heB = HEBREW_NUMBERS[b].feminine;
      const heText = `כמה זה ${heA} פעמים ${heB}?`;
      entries.push({
        id: `q-${a}x${b}-he`,
        text: heText,
        locale: 'he',
        category: 'question',
        filePath: `tts/he/questions/q-${a}x${b}.mp3`,
        metadata: { factorA: a, factorB: b, answer: a * b },
      });

      const enA = ENGLISH_NUMBERS[a];
      const enB = ENGLISH_NUMBERS[b];
      const enText = `How much is ${enA} times ${enB}?`;
      entries.push({
        id: `q-${a}x${b}-en`,
        text: enText,
        locale: 'en',
        category: 'question',
        filePath: `tts/en/questions/q-${a}x${b}.mp3`,
        metadata: { factorA: a, factorB: b, answer: a * b },
      });
    }
  }

  // Number words 0-100
  for (let n = 0; n <= 100; n++) {
    entries.push({
      id: `num-${n}-he-f`,
      text: HEBREW_NUMBERS[n].feminine,
      locale: 'he',
      category: 'number',
      filePath: `tts/he/numbers/num-${n}-f.mp3`,
      metadata: { number: n, gender: 'feminine' },
    });
    if (HEBREW_NUMBERS[n].masculine !== HEBREW_NUMBERS[n].feminine) {
      entries.push({
        id: `num-${n}-he-m`,
        text: HEBREW_NUMBERS[n].masculine,
        locale: 'he',
        category: 'number',
        filePath: `tts/he/numbers/num-${n}-m.mp3`,
        metadata: { number: n, gender: 'masculine' },
      });
    }
    entries.push({
      id: `num-${n}-en`,
      text: ENGLISH_NUMBERS[n],
      locale: 'en',
      category: 'number',
      filePath: `tts/en/numbers/num-${n}.mp3`,
      metadata: { number: n },
    });
  }

  // Feedback phrases
  for (const phrase of FEEDBACK_PHRASES) {
    entries.push({
      id: `feedback-${phrase.id}-he`,
      text: phrase.he,
      locale: 'he',
      category: 'feedback',
      filePath: `tts/he/feedback/${phrase.id}.mp3`,
      metadata: {},
    });
    entries.push({
      id: `feedback-${phrase.id}-en`,
      text: phrase.en,
      locale: 'en',
      category: 'feedback',
      filePath: `tts/en/feedback/${phrase.id}.mp3`,
      metadata: {},
    });
  }

  // Instruction phrases
  for (const phrase of INSTRUCTION_PHRASES) {
    entries.push({
      id: `instruction-${phrase.id}-he`,
      text: phrase.he,
      locale: 'he',
      category: 'instruction',
      filePath: `tts/he/instructions/${phrase.id}.mp3`,
      metadata: {},
    });
    entries.push({
      id: `instruction-${phrase.id}-en`,
      text: phrase.en,
      locale: 'en',
      category: 'instruction',
      filePath: `tts/en/instructions/${phrase.id}.mp3`,
      metadata: {},
    });
  }

  // Level/session phrases
  for (const phrase of LEVEL_PHRASES) {
    entries.push({
      id: `level-${phrase.id}-he`,
      text: phrase.he,
      locale: 'he',
      category: 'level',
      filePath: `tts/he/level/${phrase.id}.mp3`,
      metadata: {},
    });
    entries.push({
      id: `level-${phrase.id}-en`,
      text: phrase.en,
      locale: 'en',
      category: 'level',
      filePath: `tts/en/level/${phrase.id}.mp3`,
      metadata: {},
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    totalEntries: entries.length,
    entries,
  };
}

const manifest = generateManifest();
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(scriptDir, 'tts-manifest.json');
fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf-8');

console.log(`Generated TTS manifest: ${manifest.totalEntries} entries`);
console.log(`  Questions: ${manifest.entries.filter(e => e.category === 'question').length}`);
console.log(`  Numbers:   ${manifest.entries.filter(e => e.category === 'number').length}`);
console.log(`  Feedback:  ${manifest.entries.filter(e => e.category === 'feedback').length}`);
console.log(`  Instructions: ${manifest.entries.filter(e => e.category === 'instruction').length}`);
console.log(`  Level/Session: ${manifest.entries.filter(e => e.category === 'level').length}`);
console.log(`Written to: ${outputPath}`);
