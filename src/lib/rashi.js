/**
 * Naam-se Rashi (traditional Nakshatra syllable → Moon sign).
 * Matches common Indian “name rashi” charts (same as Google naam-se-rashi).
 * Place / DOB are kept for personalisation; rashi comes from the name’s first sound.
 */

export const RASHIS = [
  {
    key: 'mesh',
    name: 'Mesh',
    english: 'Aries',
    slugPart: 'mesh-rashi',
    symbol: '♈',
    element: 'Fire',
    traits: 'Courage, energy, and new beginnings.',
  },
  {
    key: 'vrishabh',
    name: 'Vrishabh',
    english: 'Taurus',
    slugPart: 'vrishabh-rashi',
    symbol: '♉',
    element: 'Earth',
    traits: 'Stability, comfort, and steady devotion.',
  },
  {
    key: 'mithun',
    name: 'Mithun',
    english: 'Gemini',
    slugPart: 'mithun-rashi',
    symbol: '♊',
    element: 'Air',
    traits: 'Curiosity, communication, and dual grace.',
  },
  {
    key: 'kark',
    name: 'Kark',
    english: 'Cancer',
    slugPart: 'kark-rashi',
    symbol: '♋',
    element: 'Water',
    traits: 'Nurture, emotion, and home-centred calm.',
  },
  {
    key: 'singh',
    name: 'Singh',
    english: 'Leo',
    slugPart: 'singh-rashi',
    symbol: '♌',
    element: 'Fire',
    traits: 'Warmth, confidence, and radiant presence.',
  },
  {
    key: 'kanya',
    name: 'Kanya',
    english: 'Virgo',
    slugPart: 'kanya-rashi',
    symbol: '♍',
    element: 'Earth',
    traits: 'Clarity, care, and quiet refinement.',
  },
  {
    key: 'tula',
    name: 'Tula',
    english: 'Libra',
    slugPart: 'tula-rashi',
    symbol: '♎',
    element: 'Air',
    traits: 'Balance, beauty, and harmonious living.',
  },
  {
    key: 'vrishchik',
    name: 'Vrishchik',
    english: 'Scorpio',
    slugPart: 'vrishchik-rashi',
    symbol: '♏',
    element: 'Water',
    traits: 'Depth, intensity, and transformative focus.',
  },
  {
    key: 'dhanu',
    name: 'Dhanu',
    english: 'Sagittarius',
    slugPart: 'dhanu-rashi',
    symbol: '♐',
    element: 'Fire',
    traits: 'Adventure, wisdom, and expansive spirit.',
  },
  {
    key: 'makar',
    name: 'Makar',
    english: 'Capricorn',
    slugPart: 'makar-rashi',
    symbol: '♑',
    element: 'Earth',
    traits: 'Discipline, ambition, and grounded strength.',
  },
  {
    key: 'kumbh',
    name: 'Kumbh',
    english: 'Aquarius',
    slugPart: 'kumbh-rashi',
    symbol: '♒',
    element: 'Air',
    traits: 'Vision, originality, and free thought.',
  },
  {
    key: 'meen',
    name: 'Meen',
    english: 'Pisces',
    slugPart: 'meen-rashi',
    symbol: '♓',
    element: 'Water',
    traits: 'Intuition, compassion, and dreamy grace.',
  },
]

/** Nakshatra pada syllables → rashi key (longest match wins). */
const NAME_SYLLABLES = [
  // Mesh
  ['chu', 'mesh'],
  ['che', 'mesh'],
  ['cho', 'mesh'],
  ['la', 'mesh'],
  ['li', 'mesh'],
  ['lu', 'mesh'],
  ['le', 'mesh'],
  ['lo', 'mesh'],
  ['a', 'mesh'],
  // Vrishabh — Om (ओ), Vi (वी) etc.
  ['va', 'vrishabh'],
  ['vi', 'vrishabh'],
  ['vu', 'vrishabh'],
  ['ve', 'vrishabh'],
  ['vo', 'vrishabh'],
  ['ee', 'vrishabh'],
  ['ii', 'vrishabh'],
  ['oo', 'vrishabh'],
  ['uu', 'vrishabh'],
  ['i', 'vrishabh'],
  ['u', 'vrishabh'],
  ['e', 'vrishabh'],
  ['o', 'vrishabh'],
  // Mithun
  ['chha', 'mithun'],
  ['chh', 'mithun'],
  ['gha', 'mithun'],
  ['ka', 'mithun'],
  ['ki', 'mithun'],
  ['ku', 'mithun'],
  ['ke', 'mithun'],
  ['ko', 'mithun'],
  ['ng', 'mithun'],
  ['ha', 'mithun'],
  // Kark
  ['hi', 'kark'],
  ['hu', 'kark'],
  ['he', 'kark'],
  ['ho', 'kark'],
  ['da', 'kark'],
  ['di', 'kark'],
  ['du', 'kark'],
  ['de', 'kark'],
  ['do', 'kark'],
  // Singh
  ['ma', 'singh'],
  ['mi', 'singh'],
  ['mu', 'singh'],
  ['me', 'singh'],
  ['mo', 'singh'],
  ['ta', 'singh'],
  ['ti', 'singh'],
  ['tu', 'singh'],
  ['te', 'singh'],
  // Kanya
  ['sha', 'kanya'],
  ['tha', 'kanya'],
  ['to', 'kanya'],
  ['pa', 'kanya'],
  ['pi', 'kanya'],
  ['pu', 'kanya'],
  ['pe', 'kanya'],
  ['po', 'kanya'],
  ['na', 'kanya'],
  // Tula
  ['ra', 'tula'],
  ['ri', 'tula'],
  ['ru', 'tula'],
  ['re', 'tula'],
  ['ro', 'tula'],
  // soft त variants already covered as ta/ti… under Singh for Latin;
  // Hindi-native soft-ta names often romanised same — acceptable for store UX
  // Vrishchik
  ['ni', 'vrishchik'],
  ['nu', 'vrishchik'],
  ['ne', 'vrishchik'],
  ['no', 'vrishchik'],
  ['ya', 'vrishchik'],
  ['yi', 'vrishchik'],
  ['yu', 'vrishchik'],
  // Dhanu
  ['bha', 'dhanu'],
  ['bhi', 'dhanu'],
  ['bhu', 'dhanu'],
  ['bhe', 'dhanu'],
  ['dha', 'dhanu'],
  ['pha', 'dhanu'],
  ['ye', 'dhanu'],
  ['yo', 'dhanu'],
  // Makar
  ['bho', 'makar'],
  ['kha', 'makar'],
  ['khi', 'makar'],
  ['khu', 'makar'],
  ['khe', 'makar'],
  ['kho', 'makar'],
  ['ja', 'makar'],
  ['ji', 'makar'],
  ['ju', 'makar'],
  ['je', 'makar'],
  ['jo', 'makar'],
  ['ga', 'makar'],
  ['gi', 'makar'],
  // Kumbh
  ['gu', 'kumbh'],
  ['ge', 'kumbh'],
  ['go', 'kumbh'],
  ['sa', 'kumbh'],
  ['si', 'kumbh'],
  ['su', 'kumbh'],
  ['se', 'kumbh'],
  ['so', 'kumbh'],
  // Meen
  ['jha', 'meen'],
  ['cha', 'meen'],
  ['chi', 'meen'],
  ['dee', 'meen'],
]

/** Devanagari first-akshar → rashi (when name is typed in Hindi). */
const DEVANAGARI_START = [
  [/^[च][ुूेैोौ]/, 'mesh'],
  [/^[ल]/, 'mesh'],
  [/^[अ]/, 'mesh'],
  [/^[इईउऊएऐओऔ]/, 'vrishabh'],
  [/^[व]/, 'vrishabh'],
  [/^[क]/, 'mithun'],
  [/^[घङछ]/, 'mithun'],
  [/^[ह](?![ीुूेैोौ])/, 'mithun'], // हा alone → mithun; ही/हु… → kark
  [/^[ह][ीुूेैोौ]/, 'kark'],
  [/^[ड]/, 'kark'],
  [/^[म]/, 'singh'],
  [/^[ट](?![ोौ])/, 'singh'],
  [/^[ट][ोौ]/, 'kanya'],
  [/^[प]/, 'kanya'],
  [/^[षणठ]/, 'kanya'],
  [/^[र]/, 'tula'],
  [/^[त]/, 'tula'],
  [/^[न]/, 'vrishchik'],
  [/^[य](?![ेैोौ])/, 'vrishchik'],
  [/^[य][ेैोौ]/, 'dhanu'],
  [/^[भ](?![ोौ])/, 'dhanu'],
  [/^[भ][ोौ]/, 'makar'],
  [/^[धफढ]/, 'dhanu'],
  [/^[ज]/, 'makar'],
  [/^[ख]/, 'makar'],
  [/^[ग](?![ुूेैोौ])/, 'makar'],
  [/^[ग][ुूेैोौ]/, 'kumbh'],
  [/^[स]/, 'kumbh'],
  [/^[द](?![ीुूेैोौ])/, 'kumbh'],
  [/^[द][ीुूेैोौ]/, 'meen'],
  [/^[थझञच]/, 'meen'],
]

const RASHI_BY_KEY = Object.fromEntries(RASHIS.map((r) => [r.key, r]))

const SYLLABLES_SORTED = [...NAME_SYLLABLES].sort((a, b) => b[0].length - a[0].length)

/** When romanisation does not hit a pada syllable (e.g. Priya → Pr…), use first letter. */
const LETTER_FALLBACK = {
  a: 'mesh',
  b: 'dhanu',
  c: 'meen',
  d: 'kark',
  e: 'vrishabh',
  f: 'dhanu',
  g: 'makar',
  h: 'mithun',
  i: 'vrishabh',
  j: 'makar',
  k: 'mithun',
  l: 'mesh',
  m: 'singh',
  n: 'vrishchik',
  o: 'vrishabh',
  p: 'kanya',
  q: 'mithun',
  r: 'tula',
  s: 'kumbh',
  t: 'singh',
  u: 'vrishabh',
  v: 'vrishabh',
  w: 'vrishabh',
  x: 'kumbh',
  y: 'vrishchik',
  z: 'meen',
}

function normalizeLatin(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
}

function firstNameToken(fullName) {
  const parts = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  return parts[0] || ''
}

function matchDevanagari(token) {
  for (const [re, key] of DEVANAGARI_START) {
    if (re.test(token)) return RASHI_BY_KEY[key] || null
  }
  return null
}

function matchLatinSyllable(token) {
  const n = normalizeLatin(token)
  if (!n) return null
  for (const [syl, key] of SYLLABLES_SORTED) {
    if (n.startsWith(syl)) return RASHI_BY_KEY[key] || null
  }
  const key = LETTER_FALLBACK[n[0]]
  return key ? RASHI_BY_KEY[key] : null
}

/**
 * Rashi from name’s first sound (given name / pehla naam).
 * e.g. "Om Vishwakarma" → Om → ओ/O → Vrishabh
 *      "Vishwakarma" → Vi → Vrishabh
 */
export function getRashiFromName(fullName) {
  const token = firstNameToken(fullName)
  if (!token || token.length < 1) return null

  if (/[\u0900-\u097F]/.test(token)) {
    return matchDevanagari(token)
  }

  return matchLatinSyllable(token)
}

export function matchProductsForRashi(products, rashi) {
  if (!rashi || !Array.isArray(products)) return []
  const key = rashi.key.toLowerCase()
  const slugPart = rashi.slugPart.toLowerCase()
  const english = rashi.english.toLowerCase()
  const nameHi = rashi.name.toLowerCase()

  const scored = products
    .map((p) => {
      const hay = `${p.slug || ''} ${p.name || ''} ${p.tagline || ''}`.toLowerCase()
      let score = 0
      if (hay.includes(slugPart)) score += 10
      if (hay.includes(`${key}-rashi`) || hay.includes(`${key} rashi`)) score += 8
      if (hay.includes(english)) score += 4
      if (hay.includes(nameHi) && hay.includes('rashi')) score += 6
      return { product: p, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.map((x) => x.product)
}
