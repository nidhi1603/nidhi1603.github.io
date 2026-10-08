import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Markdown links written as [38.6%](claim:ptl.mean) are rewritten after the build to the
// pinned source line recorded in src/data/facts.json, so posts can't drift from the evidence.
// (Done on the built HTML because Astro 7's default Markdown processor has no remark plugins.)
function resolveClaims() {
  return {
    name: 'resolve-claims',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const facts = JSON.parse(fs.readFileSync(new URL('./src/data/facts.json', import.meta.url), 'utf8')).facts;
        const root = fileURLToPath(dir);
        for (const rel of fs.readdirSync(root, { recursive: true })) {
          if (!String(rel).endsWith('.html')) continue;
          const file = path.join(root, String(rel));
          const html = fs.readFileSync(file, 'utf8');
          const out = html.replace(/<a href="claim:([^"]+)"/g, (_, key) => {
            const fact = facts[key];
            if (!fact) throw new Error(`${rel}: unknown claim "${key}"`);
            return `<a class="claim" data-claim="${key}" href="${fact.url}"`;
          });
          if (out !== html) fs.writeFileSync(file, out);
        }
      },
    },
  };
}

export default defineConfig({
  site: 'https://nidhi1603.github.io',
  trailingSlash: 'ignore',
  integrations: [resolveClaims()],
});
