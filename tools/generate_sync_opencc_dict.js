const fs = require('fs');
const path = require('path');
const OpenCC = require('opencc-js');

const s2t = OpenCC.Converter({ from: 'cn', to: 'tw' });

function walk(dir, list = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, list);
    else if (p.endsWith('.tsx') || p.endsWith('.ts') || p.endsWith('.json')) list.push(p);
  }
  return list;
}

const strings = new Set();

// 1. Extract all t('...') strings from app/ and components/
const tRegex = /\bt\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1\s*\)/g;
for (const file of [...walk('app'), ...walk('components')]) {
  const content = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = tRegex.exec(content)) !== null) {
    const str = m[2];
    if (!str.includes('${') && str.length > 0 && str.length < 300) {
      strings.add(str);
    }
  }
}

// 2. Extract manifest titles, authors, categories
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
for (const item of manifest) {
  if (item.title) strings.add(item.title);
  if (item.author) strings.add(item.author);
  if (item.category) strings.add(item.category);
  if (item.dynasty) strings.add(item.dynasty);
  if (item.canon_source) strings.add(item.canon_source);
}

// 3. Extract sidebar-concepts.json
if (fs.existsSync('lib/sidebar-concepts.json')) {
  const sb = JSON.parse(fs.readFileSync('lib/sidebar-concepts.json', 'utf8'));
  for (const cat of sb) {
    if (cat.category) strings.add(cat.category);
    if (Array.isArray(cat.items)) {
      for (const it of cat.items) {
        if (it.title) strings.add(it.title);
      }
    }
  }
}

// 4. Build character-level map from STCharacters + TWVariants via s2t on all CJK unified ideographs
let simpChars = '';
let tradChars = '';
for (let code = 0x4e00; code <= 0x9fa5; code++) {
  const ch = String.fromCharCode(code);
  const tr = s2t(ch);
  if (tr !== ch && tr.length === 1) {
    simpChars += ch;
    tradChars += tr;
  }
}

// Helper for char-only conversion
const charMap = new Map();
for (let i = 0; i < simpChars.length; i++) {
  charMap.set(simpChars[i], tradChars[i]);
}
function charConvert(text) {
  let out = '';
  for (const ch of text) {
    out += charMap.get(ch) || ch;
  }
  return out;
}

// Only store in phraseOverrides those strings where s2t(str) differs from charConvert(str)!
const phraseOverrides = {};
for (const s of strings) {
  const fullTrad = s2t(s);
  const charTrad = charConvert(s);
  if (fullTrad !== charTrad) {
    phraseOverrides[s] = fullTrad;
  }
}

console.log('Simp->Trad char pairs:', simpChars.length);
console.log('Total UI/meta strings checked:', strings.size);
console.log('Phrase overrides needed (where twp differs from char-by-char):', Object.keys(phraseOverrides).length);

const output = `// Auto-generated synchronous Simplified-to-Traditional dictionary for zero-hydration-mismatch SSR/CSR
export const SIMP_CHARS = ${JSON.stringify(simpChars)};
export const TRAD_CHARS = ${JSON.stringify(tradChars)};
export const PHRASE_OVERRIDES: Record<string, string> = ${JSON.stringify(phraseOverrides, null, 2)};
`;

fs.writeFileSync('lib/opencc-sync-dict.ts', output, 'utf8');
console.log('Generated lib/opencc-sync-dict.ts, size:', Buffer.byteLength(output), 'bytes');
