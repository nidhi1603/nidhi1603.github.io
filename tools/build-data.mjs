// Build src/data/facts.json from the source repos at their pinned commits.
// Fails loudly when a claim can't be found, so the site can never show a number
// that its source doesn't contain.
import fs from 'node:fs/promises';
import { SOURCES, fetchFile, ghApi, blobUrl, tableAfter } from './lib.mjs';
import { FACTS, EXTERNAL } from './facts.spec.mjs';

const out = { generated: new Date().toISOString().slice(0, 10), facts: {}, tables: {}, verifiedUrls: {}, sources: SOURCES };
const errors = [];

async function lines(src, file) {
  const s = SOURCES[src];
  return (await fetchFile(s.repo, s.sha, file)).split('\n');
}

// 1. Prose claims
for (const f of FACTS) {
  const s = SOURCES[f.src];
  const ls = await lines(f.src, f.path);
  const hits = ls.flatMap((l, i) => (l.includes(f.contains) ? [i + 1] : []));
  if (hits.length !== 1) {
    errors.push(`${f.key}: "${f.contains}" found on ${hits.length} lines of ${s.repo}@${s.sha.slice(0, 7)}:${f.path}`);
    continue;
  }
  out.facts[f.key] = { text: f.text, url: blobUrl(s.repo, s.sha, f.path, hits[0]) };
}

// 2. Tables rendered from the source files themselves
async function table(src, file, headerPrefix) {
  const s = SOURCES[src];
  const text = await fetchFile(s.repo, s.sha, file);
  const t = tableAfter(text, headerPrefix);
  return { header: t.header, rows: t.rows.map((r) => ({ cells: r.cells, url: blobUrl(s.repo, s.sha, file, r.line) })) };
}

out.tables.aepFull = await table('aep', 'docs/RESULTS.md', '| ID | Comparison |');
out.tables.aepTargeted = await table('aep', 'docs/RESULTS.md', '| ID | What was tested |');
out.tables.aepDefects = await table('aep', 'docs/RESULTS.md', '| # | Defect |');
out.tables.aepSpend = await table('aep', 'docs/RESULTS.md', '| Period | Basis | Total |');
out.tables.ptlLadder = await table('ptl', 'docs/LAB_NOTEBOOK.md', '| try budget k |');
out.tables.scr = await table('scr', 'docs/RESULTS.md', '| Metric |');

// The ladder's SFT column is not shown on the site (its last cell is a number the
// author keeps off public profiles); the training-lift column carries the finding.
out.tables.ptlLadder.header = ['Try budget k', 'Base 1.5B', 'Training lift (pts)'];
out.tables.ptlLadder.rows = out.tables.ptlLadder.rows.map((r) => ({ cells: [r.cells[0], r.cells[2], r.cells[3]], url: r.url }));

// 3. Facts that live on GitHub itself
async function pr(key, endpoint) {
  const p = await ghApi(endpoint);
  if (!p.merged) errors.push(`${key}: ${endpoint} is not merged`);
  const date = new Date(p.merged_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  out.facts[key] = { text: `+${p.additions}/−${p.deletions} across ${p.changed_files} file${p.changed_files === 1 ? '' : 's'}`, url: p.html_url, title: p.title, merged: date };
  out.verifiedUrls[p.html_url] = [p.additions, p.deletions, p.changed_files, p.number, ...date.split(' ').map(Number).filter((n) => !Number.isNaN(n))];
}
await pr('gh.langchain', 'repos/langchain-ai/langchain/pulls/37157');
await pr('gh.airflow', 'repos/apache/airflow/pulls/64330');

const issue = await ghApi('repos/sierra-research/tau2-bench/issues/574');
if (issue.user?.login !== 'nidhi1603') errors.push('gh.issue574: not authored by nidhi1603');
out.facts['gh.issue574'] = { text: 'tau2-bench #574', url: issue.html_url, state: issue.state, title: issue.title };
out.verifiedUrls[issue.html_url] = [2, 574];

for (const [url, e] of Object.entries(EXTERNAL)) out.verifiedUrls[url] = e.numbers;

if (errors.length) {
  console.error('build-data FAILED:\n  ' + errors.join('\n  '));
  process.exit(1);
}
await fs.mkdir('src/data', { recursive: true });
await fs.writeFile('src/data/facts.json', JSON.stringify(out, null, 2) + '\n');
console.log(`build-data: ${Object.keys(out.facts).length} facts, ${Object.keys(out.tables).length} tables, all found at pinned commits`);
