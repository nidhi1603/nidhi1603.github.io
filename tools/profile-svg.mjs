// SVG cards for the GitHub profile README.
// GitHub serves README images as sandboxed SVG: inline <style>, CSS animation and SMIL work;
// scripts and web fonts don't. Every card comes in a light and a dark variant, which the README
// swaps with <picture> so it follows the viewer's GitHub theme. All numbers are passed in from
// src/data/facts.json; nothing here invents one.

export const THEMES = {
  light: {
    name: 'light', card: '#f6f8fa', line: '#d1d9e0', ink: '#1f2328', muted: '#59636e', track: '#e6eaef',
    accent: '#2448d8', accentSoft: '#e8edff', good: '#1a7f37', warn: '#bc4c00', warnSoft: '#fff1e5',
    del: '#cf222e', merged: '#8250df', term: '#0d1117', termLine: '#d1d9e0',
  },
  dark: {
    name: 'dark', card: '#151b23', line: '#3d444d', ink: '#f0f6fc', muted: '#9198a1', track: '#262c36',
    accent: '#86a6ff', accentSoft: '#1b2440', good: '#3fb950', warn: '#f0883e', warnSoft: '#2d1d10',
    del: '#f85149', merged: '#ab7df8', term: '#010409', termLine: '#3d444d',
  },
};

const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const n2 = (x) => Math.round(x * 100) / 100;
const n5 = (x) => Math.round(x * 1e5) / 1e5;
const num = (text) => parseFloat(String(text).replace(/[^0-9.\-]/g, ''));

function svg({ w, h, label, css = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">
<style>
text { font-family: ${SANS}; }
.mono { font-family: ${MONO}; }
.grow { transform-box: fill-box; transform-origin: 0 50%; animation: grow 1.1s cubic-bezier(.2,.7,.2,1) both; }
.rise { animation: rise .6s ease-out both; }
@keyframes grow { from { transform: scaleX(0); } }
@keyframes rise { from { opacity: 0; transform: translateY(6px); } }
${css}
@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
</style>
${body}
</svg>
`;
}

const frame = (t, w, h) =>
  `<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="12" fill="${t.card}" stroke="${t.line}"/>`;
const delay = (s) => `style="animation-delay:${n2(s)}s"`;

// Name and a typed line that cycles through the roles. The typing is SMIL (discrete steps on a
// clip rect); with reduced motion the first role shows still instead.
export function headerIntro(t, { name, roles, tagline }) {
  const W = 520, H = 200, fs = 22, cw = fs * 0.6, x0 = 26, base = 118;
  const slot = 4, type = 1.4, hold = 1.9, erase = 0.45, T = slot * roles.length;
  const times = [0], widths = [0];
  roles.forEach((role, i) => {
    const n = role.length, t0 = i * slot, t1 = t0 + type + hold;
    for (let k = 1; k <= n; k++) { times.push(t0 + (type * k) / n); widths.push(k * cw); }
    for (let k = n - 1; k >= 0; k--) { times.push(t1 + (erase * (n - k)) / n); widths.push(k * cw); }
  });
  times.push(T); widths.push(0);
  const keyTimes = times.map((x) => n5(x / T)).join(';');
  const anim = (attr, vals) =>
    `<animate attributeName="${attr}" calcMode="discrete" dur="${T}s" repeatCount="indefinite" keyTimes="${keyTimes}" values="${vals.map(n2).join(';')}"/>`;
  const show = (i) => {
    const last = roles.length - 1;
    const [values, keys] = i === 0 ? ['1;0', `0;${n5(slot / T)}`]
      : i === last ? ['0;1', `0;${n5((i * slot) / T)}`]
      : ['0;1;0', `0;${n5((i * slot) / T)};${n5(((i + 1) * slot) / T)}`];
    return `<animate attributeName="opacity" calcMode="discrete" dur="${T}s" repeatCount="indefinite" keyTimes="${keys}" values="${values}"/>`;
  };
  const role = (r, extra = '') =>
    `<text class="mono role" x="${x0}" y="${base}" textLength="${n2(r.length * cw)}" lengthAdjust="spacingAndGlyphs"${extra}>${esc(r)}</text>`;
  return svg({
    w: W, h: H, label: `${name}: ${roles.join(', ')}. ${tagline.join(' ')}`,
    css: `.name { font-size: 50px; font-weight: 700; letter-spacing: -1.2px; fill: ${t.ink}; }
.role { font-size: ${fs}px; fill: ${t.accent}; }
.prompt { font-size: ${fs}px; fill: ${t.muted}; }
.tag { font-size: 17px; fill: ${t.muted}; }
.cursor { animation: blink 1.06s steps(1) infinite; }
.still { display: none; }
@keyframes blink { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .typing, .cursor { display: none; } .still { display: inline; } }`,
    body: `<text class="name" x="0" y="66">${esc(name)}</text>
<text class="mono prompt" x="2" y="${base}">›</text>
<clipPath id="typed"><rect x="${x0}" y="${base - 22}" height="32" width="0">${anim('width', widths)}</rect></clipPath>
<g class="typing" clip-path="url(#typed)">
${roles.map((r, i) => role(r, ` opacity="${i === 0 ? 1 : 0}"`).replace('</text>', `${show(i)}</text>`)).join('\n')}
</g>
${role(roles[0]).replace('class="mono role"', 'class="mono role still"')}
<rect class="cursor" x="${x0 + 2}" y="${base - 18}" width="${n2(cw * 0.55)}" height="23" rx="1.5" fill="${t.accent}">${anim('x', widths.map((w) => x0 + 2 + w))}</rect>
${tagline.map((line, i) => `<text class="tag" x="0" y="${160 + i * 24}">${esc(line)}</text>`).join('\n')}`,
  });
}

// A small terminal whose lines appear one by one, hold, and fade out on a loop.
export function headerTerminal(t, { title, command, checks }) {
  const W = 300, H = 200;
  const lines = [`<tspan fill="${t.name === 'light' ? '#86a6ff' : t.accent}">$</tspan> ${esc(command)}`,
    ...checks.map((c) => `<tspan fill="#3fb950">✓</tspan> ${esc(c)}`)];
  return svg({
    w: W, h: H, label: `$ ${command}. ${checks.join('. ')}.`,
    css: `.tl { font-size: 13px; fill: #e6edf3; animation: show 12s ease-in-out infinite both; }
.ttl { font-size: 11px; fill: #8b949e; }
.blk { animation: blink 1.06s steps(1) infinite; }
@keyframes show { 0%, 3% { opacity: 0; } 8%, 86% { opacity: 1; } 92%, 100% { opacity: 0; } }
@keyframes blink { 50% { opacity: 0; } }`,
    body: `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="${t.term}" stroke="${t.termLine}"/>
<circle cx="18" cy="17" r="5" fill="#ff5f57"/><circle cx="34" cy="17" r="5" fill="#febc2e"/><circle cx="50" cy="17" r="5" fill="#28c840"/>
<text class="ttl mono" x="${W / 2}" y="21" text-anchor="middle">${esc(title)}</text>
${lines.map((l, i) => `<text class="tl mono" x="18" y="${56 + i * 25}" ${delay(0.3 + i * 0.7)}>${l}</text>`).join('\n')}
<rect class="blk" x="18" y="${56 + lines.length * 25 - 11}" width="8" height="14" fill="#86a6ff"/>`,
  });
}

const eyebrow = (t, text) =>
  `<text x="18" y="30" font-size="11" font-weight="600" letter-spacing="1.2" fill="${t.accent}">${esc(text.toUpperCase())}</text>`;

// Proof card: the headline number, with three bars against the target.
export function proofBars(t, { kicker, big, label, rows, max }) {
  const W = 270, H = 196, bx = 98, bw = 118;
  const bar = (r, i) => {
    const y = 120 + i * 22, w = (bw * r.value) / max;
    const fill = r.kind === 'ref' ? `url(#hatch-${t.name})` : r.kind === 'ours' ? t.accent : t.muted;
    return `<text x="18" y="${y + 9}" font-size="12" fill="${t.muted}">${esc(r.name)}</text>
<rect x="${bx}" y="${y}" width="${bw}" height="10" rx="5" fill="${t.track}"/>
<rect class="grow" x="${bx}" y="${y}" width="${n2(w)}" height="10" rx="5" fill="${fill}"${r.kind === 'base' ? ' opacity=".55"' : ''} ${delay(0.3 + i * 0.15)}/>
<text x="${bx + bw + 8}" y="${y + 9}" font-size="12" font-weight="600" fill="${t.ink}">${esc(r.display)}</text>`;
  };
  return svg({
    w: W, h: H, label: `${big} ${label}`,
    body: `<defs><pattern id="hatch-${t.name}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="6" fill="${t.muted}" opacity=".6"/></pattern></defs>
${frame(t, W, H)}${eyebrow(t, kicker)}
<text x="18" y="72" font-size="38" font-weight="700" letter-spacing="-1" fill="${t.ink}">${esc(big)}</text>
<text x="18" y="96" font-size="13" fill="${t.muted}">${esc(label)}</text>
${rows.map(bar).join('\n')}`,
  });
}

// Proof card: "k of n" drawn as n squares, k of which light up.
export function proofGrid(t, { kicker, big, label, k, n, note }) {
  const W = 270, H = 196, size = 11, gap = 4, cols = Math.ceil(n / 2);
  const squares = Array.from({ length: n }, (_, i) => {
    const x = 18 + (i % cols) * (size + gap), y = 112 + Math.floor(i / cols) * (size + gap);
    return i < k
      ? `<rect class="lit" x="${x}" y="${y}" width="${size}" height="${size}" rx="2.5" ${delay(0.3 + i * 0.06)}/>`
      : `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="2.5" fill="${t.track}"/>`;
  });
  return svg({
    w: W, h: H, label: `${big} ${label}. ${note}`,
    css: `.lit { fill: ${t.warn}; animation: lit .35s ease-out both; }
@keyframes lit { from { fill: ${t.track}; } }`,
    body: `${frame(t, W, H)}${eyebrow(t, kicker)}
<text x="18" y="72" font-size="38" font-weight="700" letter-spacing="-1" fill="${t.ink}">${esc(big)}</text>
<text x="18" y="96" font-size="13" fill="${t.muted}">${esc(label)}</text>
${squares.join('\n')}
<text x="18" y="168" font-size="12" fill="${t.muted}">${esc(note)}</text>`,
  });
}

// Proof card: a merged pull request, with its additions and deletions to scale.
export function proofMerged(t, { kicker, label, add, del, files }) {
  const W = 270, H = 196, bw = 234, aw = (bw * add) / (add + del);
  return svg({
    w: W, h: H, label: `Merged: ${label.join(' ')}, +${add} −${del} across ${files} files`,
    body: `${frame(t, W, H)}${eyebrow(t, kicker)}
<rect x="18" y="42" width="116" height="34" rx="17" fill="${t.merged}"/>
<g transform="translate(36 59)" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"><circle cx="0" cy="-6.5" r="2.6"/><circle cx="0" cy="7" r="2.6"/><circle cx="9.5" cy="2.5" r="2.6"/><path d="M0 -3.9 V4.4"/><path d="M0 -3.9 C0 1 3.5 2.5 6.9 2.5"/></g>
<text x="56" y="65" font-size="17" font-weight="700" fill="#fff">Merged</text>
${label.map((l, i) => `<text x="18" y="${102 + i * 18}" font-size="13" fill="${t.muted}">${esc(l)}</text>`).join('\n')}
<text x="18" y="160" font-size="20" font-weight="700" fill="${t.good}">+${add}</text>
<text x="70" y="160" font-size="20" font-weight="700" fill="${t.del}">−${del}</text>
<text x="112" y="160" font-size="13" fill="${t.muted}">across ${files} files</text>
<rect class="grow" x="18" y="171" width="${n2(aw)}" height="8" rx="2" fill="${t.good}" ${delay(0.3)}/>
<rect class="grow" x="${n2(18 + aw + 2)}" y="171" width="${n2(bw - aw - 2)}" height="8" rx="2" fill="${t.del}" ${delay(1.2)}/>`,
  });
}

// Horizontal bar chart (418 wide, so two sit side by side in the README).
export function barChart(t, { title, subtitle, rows, max, target, footer, footerStrong = false, bx = 190, bw = 166 }) {
  const W = 418, H = 250;
  const x = (v) => bx + (bw * v) / max;
  const row = (r, i) => {
    const y = 80 + i * 30;
    const fill = r.kind === 'ref' ? `url(#hatch-${t.name})` : r.kind === 'ours' ? t.accent : t.muted;
    return `<text x="20" y="${y}" font-size="12.5" fill="${r.kind === 'ours' ? t.ink : t.muted}">${esc(r.label)}</text>
<rect x="${bx}" y="${y - 10}" width="${bw}" height="12" rx="6" fill="${t.track}"/>
<rect class="grow" x="${bx}" y="${y - 10}" width="${n2(x(r.value) - bx)}" height="12" rx="6" fill="${fill}"${r.kind === 'base' ? ' opacity=".55"' : ''} ${delay(0.2 + i * 0.12)}/>
<text x="${bx + bw + 7}" y="${y}" font-size="12.5" font-weight="600" fill="${t.ink}">${esc(r.display)}</text>`;
  };
  const tgt = target === undefined ? '' : `<line x1="${n2(x(target))}" y1="62" x2="${n2(x(target))}" y2="${80 + (rows.length - 1) * 30 + 6}" stroke="${t.muted}" stroke-dasharray="3 3"/>
<text x="${n2(x(target))}" y="58" font-size="11" fill="${t.muted}" text-anchor="middle">target</text>`;
  return svg({
    w: W, h: H, label: `${title}. ${rows.map((r) => `${r.label}: ${r.display}`).join(', ')}. ${footer}`,
    body: `<defs><pattern id="hatch-${t.name}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="6" fill="${t.muted}" opacity=".6"/></pattern></defs>
${frame(t, W, H)}
<text x="20" y="30" font-size="14" font-weight="700" fill="${t.ink}">${esc(title)}</text>
<text x="20" y="${tgt ? 46 : 48}" font-size="12" fill="${t.muted}">${esc(subtitle)}</text>
${tgt}
${rows.map(row).join('\n')}
<text x="20" y="232" font-size="12" ${footerStrong ? `font-weight="700" fill="${t.accent}"` : `fill="${t.muted}"`}>${esc(footer)}</text>`,
  });
}

// Four findings in a 2 × 2 grid.
export function findingsGrid(t, { title, cells }) {
  const W = 418, H = 250;
  const tone = { warn: t.warn, accent: t.accent, good: t.good, ink: t.ink };
  const cell = (c, i) => {
    const x = 20 + (i % 2) * 199, y = 52 + Math.floor(i / 2) * 96;
    return `<g class="rise" ${delay(0.2 + i * 0.18)}>
<text x="${x}" y="${y + 26}" font-size="24" font-weight="700" letter-spacing="-.5" fill="${tone[c.tone]}">${esc(c.big)}</text>
${c.label.map((l, j) => `<text x="${x}" y="${y + 50 + j * 17}" font-size="12.5" fill="${t.muted}">${esc(l)}</text>`).join('\n')}
</g>`;
  };
  return svg({
    w: W, h: H, label: `${title}: ${cells.map((c) => `${c.big} ${c.label.join(' ')}`).join('; ')}`,
    body: `${frame(t, W, H)}
<text x="20" y="30" font-size="14" font-weight="700" fill="${t.ink}">${esc(title)}</text>
<line x1="20" y1="146" x2="398" y2="146" stroke="${t.line}"/><line x1="209" y1="50" x2="209" y2="238" stroke="${t.line}"/>
${cells.map(cell).join('\n')}`,
  });
}

// The system as a stack of layers; one can be highlighted with a note.
export function layerStack(t, { title, layers }) {
  const W = 418, H = 250;
  const layer = (l, i) => {
    const y = 44 + i * 33;
    const hit = Boolean(l.hit);
    return `<g class="rise" ${delay(0.15 + i * 0.12)}>
<rect x="20" y="${y}" width="378" height="27" rx="7" fill="${hit ? t.warnSoft : t.accentSoft}" stroke="${hit ? t.warn : 'none'}"/>
<text x="32" y="${y + 18}" font-size="12.5" font-weight="700" fill="${t.ink}">${esc(l.name)}</text>
<text x="386" y="${y + 18}" font-size="12" fill="${hit ? t.warn : t.muted}" text-anchor="end"${hit ? ' font-weight="600"' : ''}>${esc(l.note)}</text>
</g>`;
  };
  return svg({
    w: W, h: H, label: `${title}: ${layers.map((l) => `${l.name} (${l.note})`).join(', ')}`,
    body: `${frame(t, W, H)}
<text x="20" y="30" font-size="14" font-weight="700" fill="${t.ink}">${esc(title)}</text>
${layers.map(layer).join('\n')}`,
  });
}

export { num };
