# nidhi1603.github.io

Source for [nidhi1603.github.io](https://nidhi1603.github.io): case studies, a results explorer and two posts about
my work on LLM post-training and agent evaluation.

Every number on the site links to the exact line it comes from, in a public repo at a pinned commit. The build
fails if a number doesn't match its source.

## How the numbers are kept honest

- [`tools/facts.spec.mjs`](tools/facts.spec.mjs) lists each claim: the repo, the file, a string that must appear on
  exactly one line, and the text the site shows.
- [`tools/build-data.mjs`](tools/build-data.mjs) fetches those files at the commits pinned in
  [`tools/lib.mjs`](tools/lib.mjs), finds each line and writes the permalinks to `src/data/facts.json`. PR and issue
  figures come from the GitHub API.
- [`tools/check-site.mjs`](tools/check-site.mjs) runs after the build. For every link that shows a number, it reads
  the linked source lines and fails if the number isn't there (allowing for rounding). It also fails on a list of
  claims that must never appear.
- [`tools/build-profile.mjs`](tools/build-profile.mjs) writes the [profile README](https://github.com/nidhi1603) from
  the same facts, and the check covers it too.

A weekly scheduled build re-runs all of this.

## Run it

```bash
npm install
npm run build     # fetch sources, build the site, check every number
npm run dev       # local preview
```

Built with [Astro](https://astro.build) and deployed to GitHub Pages by
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
