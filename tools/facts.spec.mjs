// Every claim the site makes in prose. `contains` must appear on exactly one line of the
// source file at the pinned commit; that line becomes the link. `text` is what the page
// shows, and every number in it must match a number on that line (see check-site.mjs).
export const FACTS = [
  // agent-eval-platform
  { key: 'aep.leak', src: 'aep', path: 'docs/RESULTS.md', contains: 'yes, in 17 of 30 dev tasks', text: '17 of 30' },
  { key: 'aep.heldout', src: 'aep', path: 'docs/RESULTS.md', contains: 'The 67 held-out tasks were never run', text: '67 held-out tasks' },
  { key: 'aep.best', src: 'aep', path: 'docs/RESULTS.md', contains: '**5 vs 8** (of 22 completed matched pairs)', text: '5 vs 8 of 22' },
  { key: 'aep.violations', src: 'aep', path: 'docs/RESULTS.md', contains: '3 violations in 2 standard conversations vs 11 in 7 harness conversations', text: '11 policy violations in 7 conversations vs 3 in 2' },
  { key: 'aep.final', src: 'aep', path: 'docs/RESULTS.md', contains: '| **3 vs 3** |', text: '3 vs 3 of 30' },
  { key: 'aep.claims', src: 'aep', path: 'docs/RESULTS.md', contains: '26 of 27 → 2 of 27', text: '26 of 27 → 2 of 27' },
  { key: 'aep.transfers', src: 'aep', path: 'docs/REPORT.md', contains: 'transfers 0.65 → 0.05 per conversation', text: '0.65 → 0.05' },
  { key: 'aep.reach', src: 'aep', path: 'docs/RESULTS.md', contains: '16 of 90 → 81 of 90', text: '16 of 90 → 81 of 90' },
  { key: 'aep.controls', src: 'aep', path: 'docs/RESULTS.md', contains: 'same reward 30 / 30', text: '30 of 30' },
  { key: 'aep.disclosure', src: 'aep', path: 'docs/RESULTS.md', contains: 'catches 4 of 4 D005 leaks', text: '4 of 4' },
  { key: 'aep.offline', src: 'aep', path: 'docs/RESULTS.md', contains: 'would catch 13 of 1,301 saved agent texts', text: '13 of 1,301' },
  { key: 'aep.p003', src: 'aep', path: 'docs/RESULTS.md', contains: '20 of 27 vs 13 of 27', text: '20 of 27 vs 13 of 27' },
  { key: 'aep.p002', src: 'aep', path: 'docs/RESULTS.md', contains: '6 of 8 selected continuations', text: '6 of 8' },
  { key: 'aep.defects', src: 'aep', path: 'docs/RESULTS.md', contains: '| 13 | "Code graded"', text: '13' },
  { key: 'aep.noise', src: 'aep', path: 'docs/REPORT.md', contains: 'comes out ahead about 42% of the time', text: 'about 42%' },
  { key: 'aep.policyrule', src: 'aep', path: 'docs/REPORT.md', contains: 'In 16 agreed policy-step failures', text: '16' },
  { key: 'aep.reachP004', src: 'aep', path: 'docs/REPORT.md', contains: 'could directly affect only 2 of 30', text: '2 of 30' },

  // post-training-lab
  { key: 'ptl.mean', src: 'ptl', path: 'README.md', contains: '**38.63% (sd 4.07)**', text: '38.6%' },
  { key: 'ptl.worst', src: 'ptl', path: 'README.md', contains: '| ours: worst seed | 34.51% |', text: '34.5%' },
  { key: 'ptl.best', src: 'ptl', path: 'README.md', contains: '| ours: best seed | 42.65% |', text: '42.65%' },
  { key: 'ptl.base', src: 'ptl', path: 'README.md', contains: '| Qwen2.5-Coder-1.5B base | 17.59% |', text: '17.6%' },
  { key: 'ptl.cost', src: 'ptl', path: 'README.md', contains: 'a $0.34 LLM-self-broken, docstring-style', text: '$0.34' },
  { key: 'ptl.bugs', src: 'ptl', path: 'README.md', contains: 'bug corpus (2,551 bugs)', text: '2,551' },
  { key: 'ptl.functions', src: 'ptl', path: 'docs/LAB_NOTEBOOK.md', contains: '374/374 functions covered', text: '374' },
  { key: 'ptl.random', src: 'ptl', path: 'README.md', contains: 'real−random = +0.61 pass@1', text: '+0.61' },
  { key: 'ptl.lift1', src: 'ptl', path: 'docs/LAB_NOTEBOOK.md', contains: '| 1 | 47.6% | 26.3% | **+21.3** |', text: '+21.3' },
  { key: 'ptl.lift3', src: 'ptl', path: 'docs/LAB_NOTEBOOK.md', contains: '| 3 | 59.0% | 44.7% | **+14.3** |', text: '+14.3' },
  { key: 'ptl.lift18', src: 'ptl', path: 'docs/LAB_NOTEBOOK.md', contains: '| ~14–18 (+repair) |', text: '+2.5' },
  { key: 'ptl.baseagent', src: 'ptl', path: 'README.md', contains: '| Base 1.5B | 17.6% | **65.2%** |', text: '65.2%' },
  { key: 'ptl.caveat', src: 'ptl', path: 'docs/LAB_NOTEBOOK.md', contains: '2023 OctoCoder vs 2024-base Qwen', text: '2023 model against a 2024 base' },

  // sft-code-review
  { key: 'scr.win', src: 'scr', path: 'docs/RESULTS.md', contains: '| Pairwise win vs base |', text: '86.0%' },
  { key: 'scr.ci', src: 'scr', path: 'docs/RESULTS.md', contains: '| Pairwise win vs base |', text: 'CI [81.5%, 91%]' },
  { key: 'scr.halluc', src: 'scr', path: 'docs/RESULTS.md', contains: '| Hallucination rate | 14.5% |', text: '14.5% → 7.0%' },
  { key: 'scr.cot', src: 'scr', path: 'docs/RESULTS.md', contains: 'wins only 13.5% against v4', text: '13.5%' },

  // proofcart
  { key: 'pc.evals', src: 'pc', path: 'README.md', contains: '`make evals` — **14 / 14**', text: '14/14' },
  { key: 'pc.crash', src: 'pc', path: 'README.md', contains: '| **2 / 2** | 0 / 2 |', text: '2/2 vs 0/2' },
  { key: 'pc.parser', src: 'pc', path: 'README.md', contains: '11 parser cases', text: '11 parser cases' },

  // Sokratic (group repo; Nidhi's commits)
  { key: 'sok.mrrBase', src: 'sokA', path: 'data/eval/eval_results_2026_04_17.json', contains: '"mrr": 0.493', text: '0.493' },
  { key: 'sok.mrr', src: 'sokA', path: 'data/eval/eval_results_2026_04_17.json', contains: '"mrr": 0.616', text: '0.616' },
  { key: 'sok.hit7', src: 'sokA', path: 'data/eval/eval_results_2026_04_17.json', contains: '"hit_at_7": 0.71', text: '0.71' },
  { key: 'sok.reach', src: 'sokB', path: 'docs/HANDOFF_ARUN_2026-05-02.md', contains: 'Reach rate: 38.9% (Apr 29 baseline) → 66.1%', text: '38.9% → 66.1%' },
  { key: 'sok.convs', src: 'sokB', path: 'docs/HANDOFF_ARUN_2026-05-02.md', contains: 'ALL  59  100.0%', text: '59 conversations' },
  { key: 'sok.cls', src: 'sokB', path: 'data/artifacts/classifiers/2026-05-01T21-02-26/report.md', contains: 'Accuracy: **29/30**', text: '29/30' },
];

// Sources that are not files in a repo. Numbers in their link text are listed here after a
// manual check; the site check accepts only these numbers for these URLs.
export const EXTERNAL = {
  'https://arxiv.org/abs/2308.07124': {
    numbers: [30.4],
    note: 'OctoPack, Table 2: HumanEvalFix Python pass@1, OctoCoder = 30.4 (checked 2026-10-08).',
  },
  'https://arxiv.org/abs/2305.06161': {
    numbers: [15.5],
    note: 'StarCoder abstract: "15.5B parameter models" (OctoCoder is StarCoder instruction-tuned).',
  },
};
