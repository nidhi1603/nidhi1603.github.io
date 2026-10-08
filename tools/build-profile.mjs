// Writes profile/README.md, the README for the github.com/nidhi1603 profile repo.
// It uses the same facts and permalinks as the site, and check-site.mjs verifies it the same way.
import fs from 'node:fs/promises';

const { facts } = JSON.parse(await fs.readFile('src/data/facts.json', 'utf8'));
const f = (key) => {
  if (!facts[key]) throw new Error(`build-profile: unknown fact "${key}"`);
  return facts[key];
};
const link = (key) => `[${f(key).text}](${f(key).url})`;
const lc = f('gh.langchain');

const readme = `### I build LLM systems, and the evaluations that tell me whether they work.

AI Engineer · M.S. Data Science, University at Buffalo (May 2026) · before that, Solutions Engineer at Flipkart (Walmart) · now fine-tuning and evaluating LLMs at Cardio AI

- **${link('ptl.mean')} HumanEvalFix pass@1** from a fine-tuned 1.5B model (3-seed mean), above OctoCoder's [30.4%](https://arxiv.org/abs/2308.07124) at about a tenth of its size · [post-training-lab](https://github.com/nidhi1603/post-training-lab)
- **${link('aep.leak')} dev tasks** in a public agent benchmark leaked answer-key data to the agent; my answer-independence check caught it, reported as ${link('gh.issue574')} · [agent-eval-platform](https://github.com/nidhi1603/agent-eval-platform)
- **Merged into LangChain:** support for OpenAI's \`apply_patch\` tool in langchain-openai, ${link('gh.langchain')}, merged ${lc.merged}

**[Explore the interactive portfolio →](https://nidhi1603.github.io)** Case studies, a filterable results explorer, and every number linked to its source line.

[nidhi.rajani.ds@gmail.com](mailto:nidhi.rajani.ds@gmail.com) · [LinkedIn](https://www.linkedin.com/in/nidhirajani) · Buffalo, NY · open to US-remote or relocating to the SF Bay Area, NYC or Seattle
`;

await fs.mkdir('profile', { recursive: true });
await fs.writeFile('profile/README.md', readme);
console.log('build-profile: wrote profile/README.md');
