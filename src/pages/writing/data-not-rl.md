---
layout: ../../layouts/Post.astro
title: "A 1.5B model beat OctoCoder on HumanEvalFix. A random-reward control told me why."
date: 2026-10-08
summary: "SFT vs DPO vs GRPO for code repair under a frozen protocol. The data won; the RL gain was matched by random rewards; and a retry ladder showed when fine-tuning stops mattering."
---

I wanted a small model to beat a much larger one on code repair, and I wanted to know *why* if it did.

## The target

The model was Qwen2.5-Coder-1.5B-Instruct. Under the OctoPack paper's own HumanEvalFix protocol, the untrained model scored [17.6%](claim:ptl.base) pass@1. The target was OctoCoder, which reports [30.4%](https://arxiv.org/abs/2308.07124); it's StarCoder instruction-tuned, a [15.5B](https://arxiv.org/abs/2305.06161)-parameter model. I locked the protocol and the target before training, used no benchmark-derived training data, and set a strict bar: the mean *and* every seed above the line.

## The result

Supervised fine-tuning reached [38.6%](claim:ptl.mean) pass@1 as a 3-seed mean. The worst seed scored [34.5%](claim:ptl.worst) and the best [42.65%](claim:ptl.best).

## Why: the data

The change that mattered was the training data. For [$0.34](claim:ptl.cost), an LLM broke clean functions into [2,551](claim:ptl.bugs) bugs in the benchmark's docstring style, covering all [374](claim:ptl.functions) source functions. A bug only counted if it compiled and failed a real test.

## Why not: the RL

DPO and GRPO tied SFT or nudged it slightly. The nudge looked like a result, so I ran GRPO with a *random* reward. It reproduced the gain: real minus random was [+0.61](claim:ptl.random) pass@1, zero within noise. At this scale, the RL signal wasn't doing the work.

## When does fine-tuning stop mattering?

Then I wrapped both models in the same scaffold: sample several fixes, run each problem's tests in a sandbox, repair on failure. Training's lift falls as the scaffold gets more tries: [+21.3](claim:ptl.lift1) points at one try, [+14.3](claim:ptl.lift3) at three, and [+2.5](claim:ptl.lift18) with repair at the largest budget. With enough verified retries the untrained model reaches [65.2%](claim:ptl.baseagent) on its own.

So: **fine-tune when you can't verify; scaffold when you can.**

## Caveats

One benchmark, one model family for the headline, and the comparison sets a [2023 model against a 2024 base](claim:ptl.caveat) model. The target is OctoCoder's published number, not a re-run under my harness.

Code, protocol and the full lab notebook: [github.com/nidhi1603/post-training-lab](https://github.com/nidhi1603/post-training-lab). The [case study](/work/post-training-lab/) has the charts.
