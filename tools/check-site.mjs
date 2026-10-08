// Post-build check over dist/ and profile/README.md. Fails the build if:
//  - a banned claim appears anywhere in the visible text, or
//  - an external link shows a number that its source doesn't contain.
// GitHub permalinks are checked against the exact lines they point to at a pinned commit;
// PRs, issues and papers are checked against numbers verified in build-data.mjs.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fetchFile, parseBlobUrl, numbersIn, matches, BANNED } from './lib.mjs';

const facts = JSON.parse(await fs.readFile('src/data/facts.json', 'utf8'));

const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'").replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));
const visible = (html) =>
  decode(html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' '));
// Digits inside names (tau2-bench, Qwen2.5, nidhi1603, gpt-5-mini) are not claims.
const claimNumbers = (label) => numbersIn(label.replace(/[A-Za-z][\w.]*?\d[\w.-]*/g, ' ').replace(/[A-Za-z]+-\d[\w.-]*/g, ' '));

const errors = [];
let pages = 0;
let verified = 0;

async function checkLink(file, label, href) {
  if (!/^https?:/.test(href)) return; // internal navigation, mailto
  const shown = claimNumbers(label);
  if (!shown.length) return;
  let sourceValues;
  const blob = parseBlobUrl(href);
  if (blob) {
    const lines = (await fetchFile(blob.repo, blob.sha, blob.file)).split('\n').slice(blob.from - 1, blob.to);
    sourceValues = numbersIn(lines.join('\n')).map((n) => n.value);
  } else if (facts.verifiedUrls[href]) {
    sourceValues = facts.verifiedUrls[href];
  } else {
    errors.push(`${file}: "${label}" shows a number but links to ${href}, which is not a pinned or verified source`);
    return;
  }
  for (const n of shown) {
    if (!matches(n, sourceValues)) errors.push(`${file}: "${label}" shows ${n.raw}, which is not in ${href}`);
  }
  verified++;
}

const files = (await fs.readdir('dist', { recursive: true })).filter((f) => f.endsWith('.html'));
for (const file of files) {
  pages++;
  const html = await fs.readFile(path.join('dist', file), 'utf8');
  const text = visible(html);
  for (const b of BANNED) if (text.includes(b)) errors.push(`${file}: banned string "${b}"`);
  if (html.includes('href="claim:')) errors.push(`${file}: unresolved claim: link`);
  // Astro drops the line break between a component and text, which glues words onto links ("374source").
  const body = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ');
  for (const m of body.matchAll(/[A-Za-z0-9]<a\b[^>]*>[^<]*<\/a>|<a\b[^>]*>[^<]*<\/a>[A-Za-z0-9]/g)) {
    errors.push(`${file}: link glued to a neighbouring word: "${decode(m[0].replace(/<[^>]+>/g, ''))}"`);
  }

  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const href = decode((m[1].match(/href="([^"]*)"/) || [])[1] || '');
    await checkLink(file, visible(m[2]).replace(/\s+/g, ' ').trim(), href);
  }
}

// The profile README is generated from the same facts; hold it to the same standard.
const readme = await fs.readFile('profile/README.md', 'utf8');
for (const b of BANNED) if (readme.includes(b)) errors.push(`profile/README.md: banned string "${b}"`);
for (const m of readme.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)) await checkLink('profile/README.md', m[1], m[2]);
for (const m of readme.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
  await checkLink('profile/README.md', visible(m[2]).replace(/\s+/g, ' ').trim(), decode(m[1]));
}

// Numbers drawn inside the README's cards can't carry links, so each one must come from facts.json.
const cells = Object.values(facts.tables).flatMap((t) => [...t.header, ...t.rows.flatMap((r) => r.cells)]);
const known = [...Object.values(facts.facts).map((x) => x.text), ...cells].flatMap((s) => numbersIn(s).map((n) => n.value))
  .concat(Object.values(facts.verifiedUrls).flat());
let cards = 0;
for (const file of (await fs.readdir('profile/assets')).filter((x) => x.endsWith('.svg'))) {
  cards++;
  const text = visible(await fs.readFile(path.join('profile/assets', file), 'utf8'));
  for (const b of BANNED) if (text.includes(b)) errors.push(`profile/assets/${file}: banned string "${b}"`);
  for (const n of claimNumbers(text)) {
    if (!matches(n, known)) errors.push(`profile/assets/${file}: shows ${n.raw}, which no fact contains`);
  }
}

if (errors.length) {
  console.error(`check-site FAILED (${errors.length}):\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log(`check-site: ${pages} pages + profile README and ${cards} cards, ${verified} numeric links verified against their sources, no banned claims`);
