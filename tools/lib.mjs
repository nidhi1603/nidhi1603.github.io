// Shared helpers for the build-time data and verification scripts.
// Every number on the site comes from a file in a public repo at a pinned commit,
// so links never drift and a check can compare the page with its source.
import fs from 'node:fs/promises';
import path from 'node:path';

export const SOURCES = {
  aep: { repo: 'nidhi1603/agent-eval-platform', sha: 'ed27c056e28d6c869aad96202b588584a05ddd16' },
  ptl: { repo: 'nidhi1603/post-training-lab', sha: 'eb108d1ee264be1383770c97582c31b5272d853e' },
  scr: { repo: 'nidhi1603/sft-code-review', sha: '79d0f48c576458706b90cd7ab8633666fd4e4314' },
  pc: { repo: 'nidhi1603/proofcart', sha: '52d978bb4c2e5f4f9db4446d90c949ee14a0b1a4' },
  sokA: { repo: 'arun-gg-1996/sokratic-lm', sha: '36ba2111d85d67ee70739bff5852a7d9ac63b92e' },
  sokB: { repo: 'arun-gg-1996/sokratic-lm', sha: '0747506df2b080b5a6f9ce4c110c1ae9639e894c' },
};

// Claims that must never appear on a public surface (from the master resume bank).
export const BANNED = ['RLHF', '16B', '67.7', '65-68', '65–68', '85-98', '85–98', 'no sponsorship', 'No sponsorship'];

const CACHE = path.resolve('.cache/sources');

// Pinned commits never change, so a local cache is safe. CI starts without one.
export async function fetchFile(repo, sha, file) {
  const key = [repo, sha, file].join('__').replace(/[/]/g, '_');
  const cached = path.join(CACHE, key);
  try {
    return await fs.readFile(cached, 'utf8');
  } catch {}
  const url = `https://raw.githubusercontent.com/${repo}/${sha}/${file}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url}: HTTP ${res.status}`);
  const text = await res.text();
  await fs.mkdir(CACHE, { recursive: true });
  await fs.writeFile(cached, text);
  return text;
}

export async function ghApi(endpoint) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'nidhi1603-portfolio-build' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com/${endpoint}`, { headers });
  if (!res.ok) throw new Error(`GitHub API ${endpoint}: HTTP ${res.status}`);
  return res.json();
}

export const blobUrl = (repo, sha, file, from, to) =>
  `https://github.com/${repo}/blob/${sha}/${file}#L${from}${to && to !== from ? `-L${to}` : ''}`;

// Parse a pinned GitHub permalink back into its parts (used by the site check).
export function parseBlobUrl(href) {
  const m = href.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)\/blob\/([0-9a-f]{40})\/([^#]+)#L(\d+)(?:-L(\d+))?$/);
  if (!m) return null;
  return { repo: m[1], sha: m[2], file: decodeURIComponent(m[3]), from: +m[4], to: m[5] ? +m[5] : +m[4] };
}

// Numbers as written: "2,551" -> 2551, "38.6%" -> 38.6 with 1 decimal, "−18" -> 18.
export function numbersIn(text) {
  const out = [];
  for (const m of text.matchAll(/\d[\d,]*(?:\.\d+)?/g)) {
    const raw = m[0].replace(/,(?=\d{3}\b)/g, '').replace(/,$/, '');
    const decimals = raw.includes('.') ? raw.split('.')[1].length : 0;
    out.push({ value: parseFloat(raw), decimals, raw: m[0] });
  }
  return out;
}

// A displayed number matches a source number if it equals it at the displayed precision.
export function matches(shown, sourceValues) {
  const tol = 0.5 * 10 ** -shown.decimals + 1e-9;
  return sourceValues.some((v) => Math.abs(v - shown.value) <= tol);
}

export function cleanCell(s) {
  return s.replace(/\*\*/g, '').replace(/\*([^*]+)\*/g, '$1').replace(/`/g, '').replace(/\s+/g, ' ').trim();
}

// Rows of the markdown table whose header line starts with `headerPrefix`.
export function tableAfter(text, headerPrefix) {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => l.startsWith(headerPrefix));
  if (start < 0) throw new Error(`table header not found: ${headerPrefix}`);
  const header = splitRow(lines[start]);
  const rows = [];
  for (let i = start + 2; i < lines.length && lines[i].startsWith('|'); i++) {
    rows.push({ cells: splitRow(lines[i]), line: i + 1, raw: lines[i] });
  }
  return { header, rows };
}

function splitRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(cleanCell);
}
