---
layout: ../../layouts/Post.astro
title: "I tried to make an LLM banking agent complete more tasks. The evaluations were the useful part."
date: 2026-10-08
summary: "Ten days on Sierra's tau2-bench: a pinned benchmark, frozen decision rules, an honest null result, and a leak in the benchmark itself."
---

For ten days in late September I tried to make a tool-using banking agent complete more tasks. It didn't work. What I built to find that out turned out to be the valuable part.

## The setup

The agent was gpt-5-mini on Sierra's τ-Knowledge banking domain in tau2-bench, compared against tau2's own standard agent with the model held fixed. A simulated customer asks for help. The agent has to find the bank's procedure in a knowledge base, unlock the tools it names, verify the customer and act within policy. Grading is official: the final database state.

Every paid run had a written plan and a decision rule before any money was spent. I worked on the development split only; the [67 held-out tasks](claim:aep.heldout) were never run.

## What I tried

A tool adapter. Checks before the agent gives up, verifies or writes. Capability search. Evidence-based identity verification. A check that stops identity values leaking to unverified customers. A re-check on transfer reason codes.

Each one moved the behaviour it targeted. Transfers per conversation fell ([0.65 → 0.05](claim:aep.transfers)). The needed document became reachable far more often ([16 of 90 → 81 of 90](claim:aep.reach)). One rewrite of the feedback after a held action cut false "your transfer is under way" replies from [26 of 27 → 2 of 27](claim:aep.claims) in a replay test.

## What didn't move

Completed tasks. The best comparison came out [5 vs 8 of 22](claim:aep.best) completed pairs. That missed my pre-set gate, and the safety audit found [11 policy violations in 7 conversations vs 3 in 2](claim:aep.violations) for the standard agent. The last comparison was [3 vs 3 of 30](claim:aep.final).

At one conversation per task, an identical copy of the agent comes out ahead [about 42%](claim:aep.noise) of the time. If you don't freeze the gate before you look, 8 of 22 against 5 of 22 becomes a "60% improvement" slide. I'd rather know.

## What the evaluation layer caught

- **A leak in the benchmark.** An answer-independence check replays everything the agent saw against a copy of the task with the answers erased. One listing tool changed its output in [17 of 30](claim:aep.leak) dev tasks. I reported it as [tau2-bench #574](claim:gh.issue574) with a reproducer that needs no model calls.
- **[13](claim:aep.defects) defects in total.** One was the benchmark's; the rest were in my own measurement. A per-run cost cap was cutting off only the longer arm. A verification rule accepted values the customer was just echoing back. Blind model reviewers missed those echoes too; a code check caught them.
- **A bug you can run.** An intercepted draft was counted as "shown to the customer", so a valid verification was refused. `make demo-provenance` reproduces it and the fix, offline, for $0.

## What I'd do differently

Rank ideas by reach before building. My last component could directly affect only [2 of 30](claim:aep.reachP004) tasks' scores. And test "acting on what's already in context" directly: in [16](claim:aep.policyrule) agreed policy-step failures, the rule and the evidence were both already there.

The repo, the results table and the offline demo are at [github.com/nidhi1603/agent-eval-platform](https://github.com/nidhi1603/agent-eval-platform). The [case study](/work/agent-eval-platform/) has the full story.
