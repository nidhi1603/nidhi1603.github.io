// Writes the github.com/nidhi1603 profile README and its SVG cards into profile/ (a separate git repo,
// nidhi1603/nidhi1603). It uses the same facts and permalinks as the site, and check-site.mjs verifies
// the README's links and the numbers drawn in every card.
import fs from 'node:fs/promises';
import {
  THEMES, esc, num, headerIntro, headerTerminal, proofBars, proofGrid, proofMerged, barChart, findingsGrid, layerStack,
} from './profile-svg.mjs';

const data = JSON.parse(await fs.readFile('src/data/facts.json', 'utf8'));
const f = (key) => {
  if (!data.facts[key]) throw new Error(`build-profile: unknown fact "${key}"`);
  return data.facts[key];
};
const link = (key) => `[${f(key).text}](${f(key).url})`; // Markdown
const a = (key) => `<a href="${f(key).url}">${esc(f(key).text)}</a>`; // inside HTML blocks

const SITE = 'https://nidhi1603.github.io';
const RAW = 'https://raw.githubusercontent.com/nidhi1603/nidhi1603/main/';
const OCTO = 'https://arxiv.org/abs/2308.07124';
const STAR = 'https://arxiv.org/abs/2305.06161';
const octo = data.verifiedUrls[OCTO][0];
const lc = f('gh.langchain');
const af = f('gh.airflow');
const [lcAdd, lcDel, lcFiles] = lc.text.match(/\d+/g).map(Number);
const [leakK, leakN] = f('aep.leak').text.match(/\d+/g).map(Number);
const ladder = data.tables.ptlLadder.rows.map((r) => ({ k: r.cells[0].replace(/\s*\(.*\)/, ''), lift: r.cells[2] }));

// Each card is drawn once per theme; the README swaps them with <picture>.
const cards = {
  header: (t) => headerIntro(t, {
    name: 'Nidhi Rajani',
    roles: ['AI Engineer', 'LLM post-training · SFT / DPO / GRPO', 'Agents, RAG & evaluation', 'Forward Deployed Engineer'],
    tagline: ['I build LLM systems, and the evaluations', 'that tell me whether they work.'],
  }),
  terminal: (t) => headerTerminal(t, {
    title: '~/evals',
    command: 'eval --frozen-protocol',
    checks: ['ruler locked before training', 'random-reward control run', 'null results published', 'every number linked to source'],
  }),
  'proof-post-training': (t) => proofBars(t, {
    kicker: 'Post-training',
    big: f('ptl.mean').text,
    label: 'HumanEvalFix pass@1 · fine-tuned 1.5B',
    max: 50,
    rows: [
      { name: 'Ours, 1.5B', value: num(f('ptl.mean').text), display: String(num(f('ptl.mean').text)), kind: 'ours' },
      { name: 'OctoCoder', value: octo, display: String(octo), kind: 'ref' },
      { name: 'Base 1.5B', value: num(f('ptl.base').text), display: String(num(f('ptl.base').text)), kind: 'base' },
    ],
  }),
  'proof-agent-eval': (t) => proofGrid(t, {
    kicker: 'Agent evaluation',
    big: f('aep.leak').text,
    label: 'dev tasks leaked answer-key data',
    k: leakK,
    n: leakN,
    note: `reported upstream as ${f('gh.issue574').text}`,
  }),
  'proof-langchain': (t) => proofMerged(t, {
    kicker: 'Open source · LangChain',
    label: ["OpenAI's apply_patch tool", 'in langchain-openai'],
    add: lcAdd,
    del: lcDel,
    files: lcFiles,
  }),
  'ptl-results': (t) => barChart(t, {
    title: 'HumanEvalFix pass@1, held-out exam',
    subtitle: "OctoPack's frozen protocol · ours = fine-tuned 1.5B",
    max: 50,
    target: octo,
    rows: [
      { label: 'Base 1.5B, untrained', value: num(f('ptl.base').text), display: f('ptl.base').text, kind: 'base' },
      { label: 'OctoCoder 15.5B', value: octo, display: `${octo}%`, kind: 'ref' },
      { label: 'Ours, worst seed', value: num(f('ptl.worst').text), display: f('ptl.worst').text, kind: 'ours' },
      { label: 'Ours, 3-seed mean', value: num(f('ptl.mean').text), display: f('ptl.mean').text, kind: 'ours' },
      { label: 'Ours, best seed', value: num(f('ptl.best').text), display: f('ptl.best').text, kind: 'ours' },
    ],
    footer: "Dashed line: OctoCoder's published score, the target.",
  }),
  'ptl-ladder': (t) => barChart(t, {
    title: 'What training adds as retries grow',
    subtitle: 'Lift over the untrained base, same verify-and-repair loop',
    max: Math.max(...ladder.map((r) => num(r.lift))),
    rows: ladder.map((r) => ({
      label: r.k === '1' ? '1 try' : `${r.k} tries`, value: num(r.lift), display: `${r.lift} pts`, kind: 'ours',
    })),
    footer: "Fine-tune when you can't verify; scaffold when you can.",
    footerStrong: true,
    bx: 140,
    bw: 196,
  }),
  'aep-findings': (t) => findingsGrid(t, {
    title: 'What the evaluation layer caught',
    cells: [
      { big: f('aep.leak').text, tone: 'warn', label: ['dev tasks leaked answer-key', `data → ${f('gh.issue574').text}`] },
      { big: f('aep.defects').text, tone: 'accent', label: ['measurement and harness', 'defects found and fixed'] },
      { big: f('aep.claims').text.replace(/ of /g, '/'), tone: 'good', label: ['false “transfer under way”', 'replies, in replay'] },
      { big: f('aep.final').text, tone: 'ink', label: ['tasks completed, harness vs', 'standard agent: no gain'] },
    ],
  }),
  'aep-layers': (t) => layerStack(t, {
    title: 'Six layers, each making one number trustworthy',
    layers: [
      { name: 'Models', note: 'LiteLLM · gpt-5-mini · gpt-5.2' },
      { name: 'Spend admission control', note: 'reserve → refuse → settle' },
      { name: 'Benchmark, pinned', note: 'tau2-bench, hashed and sandboxed' },
      { name: 'Runtime harness', note: 'flags, each with a negative control' },
      { name: 'Evaluation layer', note: 'found the benchmark leak', hit: true },
      { name: 'Review', note: 'blind readers + adjudicator' },
    ],
  }),
};

const pic = (name, alt, width) =>
  `<picture><source media="(prefers-color-scheme: dark)" srcset="${RAW}assets/${name}-dark.svg"><img src="${RAW}assets/${name}-light.svg" width="${width}" alt="${esc(alt)}"></picture>`;

// GitHub keeps <a><picture>…</picture></a> intact only inside an HTML block, so every card is linked and
// each row of cards is its own <div>.
const card = (href, name, alt, width) => `<a href="${href}">${pic(name, alt, width)}</a>`;
const row = (...items) => `<div>\n${items.join('\n')}\n</div>`;

const badge = (label, color, logo, logoColor = 'white') =>
  `https://img.shields.io/badge/${encodeURIComponent(label.replace(/-/g, '--').replace(/_/g, '__'))}-${color}?style=for-the-badge${logo ? `&logo=${logo}&logoColor=${logoColor}` : ''}`;
const stack = (title, items) =>
  `**${title}**<br>\n${items.map(([label, logo, color]) => `<img alt="${esc(label)}" src="${badge(label, '20232a', logo, color)}">`).join('\n')}`;
const contact = [
  `<a href="${SITE}"><img alt="Portfolio site" src="${badge('Portfolio', '2448d8', 'githubpages')}"></a>`,
  `<a href="mailto:nidhi.rajani.ds@gmail.com"><img alt="Email" src="${badge('Email', 'd14836', 'gmail')}"></a>`,
  `<a href="https://www.linkedin.com/in/nidhirajani"><img alt="LinkedIn" src="${badge('LinkedIn', '0a66c2')}"></a>`,
].join('\n');
const prState = (repo, n, label) =>
  `<img alt="${label} pull request state" src="https://img.shields.io/github/pulls/detail/state/${repo}/${n}?style=flat-square&label=${encodeURIComponent(label)}">`;

const readme = `<!-- Generated by tools/build-profile.mjs in nidhi1603/nidhi1603.github.io from the same checked facts as the site. Edit it there. -->

${row(
  card(SITE, 'header', 'Nidhi Rajani. AI Engineer: LLM post-training, agents, RAG and evaluation. I build LLM systems, and the evaluations that tell me whether they work.', 520),
  card(SITE, 'terminal', 'A terminal running eval --frozen-protocol: ruler locked before training, random-reward control run, null results published, every number linked to source.', 300),
)}

${contact}

M.S. Data Science, University at Buffalo (May 2026) · before that, Solutions Engineer at Flipkart (Walmart) · now fine-tuning and evaluating LLMs at Cardio AI

### ⚡ Proof, not adjectives

${row(
  card(`${SITE}/work/post-training-lab/`, 'proof-post-training', `${f('ptl.mean').text} HumanEvalFix pass@1 from a fine-tuned 1.5B model, against OctoCoder's ${octo}% and the untrained base's ${f('ptl.base').text}`, 270),
  card(`${SITE}/work/agent-eval-platform/`, 'proof-agent-eval', `${f('aep.leak').text} dev tasks in a public agent benchmark leaked answer-key data; reported upstream as ${f('gh.issue574').text}`, 270),
  card(lc.url, 'proof-langchain', `Merged into LangChain: OpenAI's apply_patch tool in langchain-openai, ${lc.text}`, 270),
)}

<sub>Sources: ${link('ptl.mean')} · [${octo}%](${OCTO}) · ${link('ptl.base')} · ${link('aep.leak')} · ${link('gh.issue574')} · ${link('gh.langchain')}</sub>

### 👩‍💻 About me

- 🔭 **Now:** fine-tuning and evaluating LLMs at Cardio AI
- 🎯 **Looking for:** AI Engineer, Forward Deployed Engineer and ML Engineer roles in the US
- 🧪 **How I work:** lock the ruler before training, run the control before the claim, publish the null result
- 💬 **Ask me about:** post-training (SFT, DPO, GRPO), agent evaluation, RAG retrieval, LLM integrations
- ⚡ **Fun fact:** a random-reward control showed my own RL gain was noise, and it's my favourite result

### 🔬 Post-Training Lab · SFT vs DPO vs GRPO for code repair

${row(
  card(`${SITE}/work/post-training-lab/`, 'ptl-results', `HumanEvalFix pass@1: untrained base ${f('ptl.base').text}, OctoCoder ${octo}%, ours worst seed ${f('ptl.worst').text}, mean ${f('ptl.mean').text}, best seed ${f('ptl.best').text}`, 418),
  card(`${SITE}/results/#ptl`, 'ptl-ladder', `Training lift by try budget: ${ladder.map((r) => `${r.k}: ${r.lift}`).join(', ')}`, 418),
)}

- A fine-tuned 1.5B model scores ${link('ptl.mean')} pass@1 on HumanEvalFix (3-seed mean; worst seed ${link('ptl.worst')}), above OctoCoder's [${octo}%](${OCTO}), a [15.5B](${STAR}) model, under the paper's own frozen protocol.
- **The data won.** ${link('ptl.cost')} of API calls produced ${link('ptl.bugs')} certified training bugs; each had to compile and fail a real test.
- **The RL didn't.** A GRPO twin trained on a *random* reward matched the real one: real minus random came to ${link('ptl.random')} pass@1.
- **Scaffold or fine-tune?** In a verify-and-repair loop the untrained base reaches ${link('ptl.baseagent')}, and training adds only ${link('ptl.lift18')} points.

[Repo](https://github.com/nidhi1603/post-training-lab) · [Case study](${SITE}/work/post-training-lab/) · [Lab notebook](https://github.com/nidhi1603/post-training-lab/blob/main/docs/LAB_NOTEBOOK.md) · [Every result](${SITE}/results/#ptl)

<details>
<summary><b>How the study was run</b></summary>

\`\`\`mermaid
flowchart TB
    subgraph plan [" "]
        direction LR
        A["Frozen ruler<br/>OctoPack protocol,<br/>committed before training"] --> B["Data factory<br/>an LLM breaks clean functions;<br/>each bug must compile<br/>and fail a real test"] --> C["Three arms<br/>SFT · DPO · GRPO<br/>matched compute, paired seeds"]
    end
    subgraph test [" "]
        direction LR
        D["Controls<br/>random-reward GRPO,<br/>three seeds per arm"] --> E["Held-out exam<br/>HumanEvalFix, touched<br/>only at milestones"] --> F["Scaffold test<br/>sample, run tests, repair;<br/>base vs trained"]
    end
    plan --> test
    style plan fill:none,stroke:none
    style test fill:none,stroke:none
\`\`\`

</details>

### 🧪 Agent Eval Platform · evaluation machinery for a tool-using banking agent

${row(
  card(`${SITE}/results/#aep`, 'aep-findings', `What the evaluation layer caught: ${f('aep.leak').text} dev tasks leaked answer-key data; ${f('aep.defects').text} defects found and fixed; false transfer replies ${f('aep.claims').text} in replay; ${f('aep.final').text} tasks completed, no gain`, 418),
  card(`${SITE}/work/agent-eval-platform/`, 'aep-layers', 'Six layers: models via LiteLLM; spend admission control; the pinned, sandboxed benchmark; the runtime harness; the evaluation layer, which found the benchmark leak; and blind review', 418),
)}

- **Found a leak in the benchmark itself.** In ${link('aep.leak')} dev tasks, one listing tool exposed answer-key data to the agent. I reported it as ${link('gh.issue574')}, with a reproducer that needs no model calls.
- **Measured before claiming.** ${link('aep.defects')} measurement and harness defects found and fixed, each with a regression test. False "transfer under way" replies fell from ${link('aep.claims')} in replay.
- **Reported the null.** Harness vs standard agent: ${link('aep.final')} tasks completed. No gain shown, and the report says so.
- **Try it:** \`make demo-provenance\` reproduces a verification bug and its fix, offline and at no cost.

[Repo](https://github.com/nidhi1603/agent-eval-platform) · [Case study](${SITE}/work/agent-eval-platform/) · [Technical report](https://github.com/nidhi1603/agent-eval-platform/blob/main/docs/REPORT.md) · [Every result](${SITE}/results/#aep)

<details>
<summary><b>How the pieces fit</b></summary>

\`\`\`mermaid
flowchart TB
    subgraph B["tau2-bench, pinned and sandboxed"]
        U["Simulated customer"] <--> AG["Agent under test"]
        AG --> TL["Bank tools + database"]
    end
    S["Spend admission control<br/>reserve, refuse, settle"] -. gates every model call .-> AG
    H["Runtime harness<br/>tool adapter, checks before actions,<br/>verification evidence, disclosure check"] -. wraps .-> AG
    TL --> G["Official grader<br/>final database state"]
    G --> E["Evaluation layer<br/>frozen decision rules, paired batches,<br/>replay probes, answer-independence check"]
    E --> R["Review<br/>blind readers + adjudicator"]
    E -. found .-> L["Benchmark leak,<br/>reported upstream"]
\`\`\`

</details>

### 🧩 More work

<table>
<tr>
<td width="50%" valign="top">
<b>Code-review LoRA</b> <sub>· fine-tuning</sub><br>
Reasoning-trace SFT on Qwen2.5-Coder-7B that wins ${a('scr.win')} of head-to-head reviews against the base model (${a('scr.ci')}) and cuts hallucinations ${a('scr.halluc')}. Three rounds of RL on top didn't beat it, and the repo says so.<br>
<a href="https://github.com/nidhi1603/sft-code-review">Repo</a> · <a href="${SITE}/results/#scr">Results</a>
</td>
<td width="50%" valign="top">
<b>ProofCart</b> <sub>· agents and integrations</sub><br>
Hackathon agent across Slack, Notion and Stripe (test mode): reads supplier threads, waits for the owner's approval in Slack, pays, records. Exactly one charge under crash or duplicate (${a('pc.crash')} against an ablation); ${a('pc.evals')} deterministic regression cases.<br>
<a href="https://github.com/nidhi1603/proofcart">Repo</a> · <a href="https://www.loom.com/share/7d9e7c2100a1404fbc9be4f16a613b29">Demo video</a>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<b>Sokratic tutor</b> <sub>· group project, my parts</sub><br>
Multi-agent Socratic tutor (UB). I built the first RAG pipeline (MRR ${a('sok.mrrBase')} → ${a('sok.mrr')}), K-of-N partial reach in the reach gate, Haiku behaviour classifiers (${a('sok.cls')} on a check set) and an end-to-end regression harness. Reach rate: ${a('sok.reach')} across ${a('sok.convs')}.<br>
<a href="https://github.com/arun-gg-1996/sokratic-lm/commits/main?author=nidhi1603">My commits</a> · <a href="https://github.com/arun-gg-1996/sokratic-lm/commits/nidhi/reach-gate-and-override-analysis?author=nidhi1603">My branch</a>
</td>
<td width="50%" valign="top">
<b>Open source</b> <sub>· merged pull requests</sub><br>
<b>LangChain:</b> OpenAI's <code>apply_patch</code> built-in tool for langchain-openai, with unit tests (${a('gh.langchain')}, merged ${lc.merged}).<br>
<b>Apache Airflow:</b> a dependency fix in the AWS provider (${a('gh.airflow')}, merged ${af.merged}).<br>
<a href="${lc.url}">${prState('langchain-ai/langchain', 37157, 'langchain')}</a> <a href="${af.url}">${prState('apache/airflow', 64330, 'airflow')}</a>
</td>
</tr>
</table>

### 🧰 Tools I've shipped with

${stack('LLMs and post-training', [['PyTorch', 'pytorch', 'EE4C2C'], ['Hugging Face', 'huggingface', 'FFD21E'], ['TRL', 'huggingface', 'FFD21E'], ['PEFT · LoRA'], ['Unsloth'], ['Google Colab', 'googlecolab', 'F9AB00']])}

${stack('Agents, RAG and evals', [['LangChain', 'langchain'], ['LangGraph', 'langgraph'], ['LiteLLM'], ['OpenAI API'], ['Anthropic API', 'anthropic', 'D97757'], ['Qdrant', 'qdrant', 'DC244C'], ['pytest', 'pytest', '0A9EDC']])}

${stack('Backend and infrastructure', [['Python', 'python', 'FFD43B'], ['FastAPI', 'fastapi', '009688'], ['PostgreSQL', 'postgresql', '699EEB'], ['Redis', 'redis', 'FF4438'], ['Docker', 'docker', '2496ED'], ['Kubernetes', 'kubernetes', '326CE5'], ['Helm', 'helm'], ['GitHub Actions', 'githubactions', '2088FF']])}

${stack('Data and ML', [['SQL'], ['Pandas', 'pandas'], ['NumPy', 'numpy', '4DABCF'], ['scikit-learn', 'scikitlearn', 'F7931E'], ['XGBoost']])}

${stack('Integrations', [['Slack API'], ['Notion API', 'notion'], ['Stripe', 'stripe', '635BFF']])}

### 📈 GitHub activity

<div>
<a href="https://github.com/nidhi1603"><picture><source media="(prefers-color-scheme: dark)" srcset="${RAW}profile-3d-contrib/contrib-dark.svg"><img src="${RAW}profile-3d-contrib/contrib-light.svg" width="100%" alt="3D contribution calendar for the last year, with contribution types and languages"></picture></a>
</div>

### 📫 Get in touch

${contact}

Buffalo, NY (Eastern) · open to US-remote and to relocating to the SF Bay Area, NYC or Seattle.<br>
US work authorization: F-1 OPT, eligible for the 24-month STEM extension (E-Verify employer). I'll need H-1B sponsorship long-term.

<sub>Every number on this page links to the line it comes from, in a public repo at a pinned commit. This README is generated from the same checked facts as <a href="${SITE}">nidhi1603.github.io</a>.</sub>
`;

// The 3D contribution calendar is the one card drawn on GitHub: a daily workflow in the profile repo
// regenerates it with yoshi389111/github-profile-3d-contrib (pinned to the v0.9.3 commit).
const contribColors = (t, scale) => ({
  type: 'normal', fileName: `contrib-${t.name}.svg`, growingAnimation: true,
  backgroundColor: t.name === 'light' ? '#ffffff' : '#0d1117', foregroundColor: t.ink,
  strongColor: t.accent, weakColor: t.muted, radarColor: t.accent, contribColors: scale,
});
const contribSettings = [
  contribColors(THEMES.light, ['#ebedf0', '#c7d3ff', '#8ea6ff', '#4d6ff0', '#2448d8']),
  contribColors(THEMES.dark, ['#161b22', '#1b2a5c', '#2a43a8', '#4f74f0', '#86a6ff']),
];
const workflow = `# Regenerates profile-3d-contrib/contrib-{light,dark}.svg from this account's public contributions.
name: Contribution graph

on:
  schedule:
    - cron: '17 8 * * *' # daily, about 4 a.m. Eastern
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: contrib-graph
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: yoshi389111/github-profile-3d-contrib@7d95e7d4cdc028dd1e1cbd957d65f35efb12ae39 # v0.9.3
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          USERNAME: \${{ github.repository_owner }}
          SETTING_JSON: .github/contrib-3d.json
      - name: Commit the new graph
        run: |
          git config user.name 'github-actions[bot]'
          git config user.email '41898283+github-actions[bot]@users.noreply.github.com'
          git add profile-3d-contrib
          git diff --cached --quiet && exit 0
          git commit -m 'Update contribution graph'
          git push
`;

await fs.mkdir('profile/assets', { recursive: true });
await fs.mkdir('profile/.github/workflows', { recursive: true });
for (const [name, draw] of Object.entries(cards)) {
  for (const t of Object.values(THEMES)) await fs.writeFile(`profile/assets/${name}-${t.name}.svg`, draw(t));
}
await fs.writeFile('profile/README.md', readme);
await fs.writeFile('profile/.github/contrib-3d.json', `${JSON.stringify(contribSettings, null, 2)}\n`);
await fs.writeFile('profile/.github/workflows/contrib-3d.yml', workflow);
console.log(`build-profile: wrote profile/README.md, ${Object.keys(cards).length * 2} cards and the contribution-graph workflow`);
