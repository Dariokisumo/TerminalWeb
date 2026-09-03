import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Terminalweb virtual filesystem (the "repo" you are walking)        */
/* ------------------------------------------------------------------ */

export type FsNode =
  | { type: "dir"; children: Record<string, FsNode> }
  | { type: "file"; content: string; size: string };

const f = (content: string, size: string): FsNode => ({ type: "file", content, size });
const d = (children: Record<string, FsNode>): FsNode => ({ type: "dir", children });

export const FS: FsNode = d({
  "README.md": f(
    [
      "# TERMINALWEB",
      "",
      "> a browser-native terminal that treats this page like a repo.",
      "",
      "Terminalweb boots a phosphor shell (twsh) straight into a virtual",
      "filesystem. No backend, no runtime build step — just React, a fake",
      "inode table, and an unreasonable amount of glow.",
      "",
      "## QUICK START",
      "",
      "- type `help` to list every command",
      "- `tree` to walk the repo",
      "- `cat src/twsh.ts` to read the shell kernel",
      "- `theme amber` to switch phosphors",
      "- `matrix` for the easter egg",
      "",
      "## STACK",
      "",
      "- react 18 · vite · tailwind v4",
      "- twsh-core — the shell kernel (see src/twsh.ts)",
      "- glyphcore — text rasterizer",
      "- netpulse — latency sidecar (see right panel)",
      "",
      "## PUBLISH",
      "",
      "- run `repo` in the shell — downloads this repo as terminalweb-repo.zip",
      "- run `github` — step-by-step push instructions",
      "",
      "## LICENSE",
      "",
      "MIT — see LICENSE. be kind to your phosphors.",
    ].join("\n"),
    "1.1K"
  ),
  "package.json": f(
    [
      "{",
      '  "name": "terminalweb",',
      '  "version": "2.4.1",',
      '  "private": true,',
      '  "shell": "twsh",',
      '  "scripts": {',
      '    "boot": "twsh --phosphor=green",',
      '    "dev": "vite",',
      '    "build": "vite build",',
      '    "glow": "twsh theme amber"',
      "  },",
      '  "dependencies": {',
      '    "react": "^18.2.0",',
      '    "glyphcore": "^1.3.0",',
      '    "netpulse": "^0.9.2",',
      '    "twsh-core": "^2.4.1"',
      "  }",
      "}",
    ].join("\n"),
    "0.4K"
  ),
  LICENSE: f(
    [
      "MIT License — Terminalweb Foundry",
      "",
      "Permission is hereby granted, free of charge, to any person",
      "obtaining a copy of this software, to deal in the Software",
      "without restriction — including the rights to use, copy, modify,",
      "merge, publish, and bask in the glow.",
      "",
      'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.',
    ].join("\n"),
    "0.5K"
  ),
  "CHANGELOG.md": f(
    [
      "# CHANGELOG",
      "",
      "## 2.4.1 — 2026-02-11",
      "- fix: caret drift during tab completion",
      "- fix: scanband phase sync on 120Hz panels",
      "",
      "## 2.4.0 — 2026-01-28",
      "- feat: amber + ice phosphor themes",
      "- feat: matrix rain daemon (try `matrix`)",
      "- perf: glyph atlas now 40% brighter",
      "",
      "## 2.3.0 — 2025-12-14",
      "- feat: netpulse latency sidecar",
      "- feat: file tree side panel",
    ].join("\n"),
    "0.7K"
  ),
  ".gitignore": f(
    ["node_modules/", "dist/", "*.glow", ".phosphor-cache/", ".DS_Store"].join("\n"),
    "0.1K"
  ),
  src: d({
    "twsh.ts": f(
      [
        "// twsh — the tiny shell kernel",
        "// parses input, walks the inode table, prints glow.",
        "",
        "export function tokenize(raw: string): string[] {",
        "  return raw.trim().split(/\\s+/)",
        "}",
        "",
        "export function dispatch(cmd: string, args: string[]) {",
        "  const entry = registry.get(cmd)",
        "  if (!entry) throw new NotFound(cmd)",
        "  return entry.run(args)",
        "}",
        "",
        "// every command is ~10 lines. the shell is the portfolio.",
      ].join("\n"),
      "1.8K"
    ),
    "App.tsx": f(
      [
        "// entry — mounts the phosphor frame",
        "import { Terminal } from './terminal'",
        "import { SidePanels } from './panels'",
        "",
        "export default function App() {",
        "  return (",
        '    <Frame theme="green">',
        '      <Terminal cwd="~" />',
        "      <SidePanels />",
        "    </Frame>",
        "  )",
        "}",
      ].join("\n"),
      "0.9K"
    ),
    "theme.ts": f(
      [
        "// phosphor calibration tables",
        "export const PHOSPHORS = {",
        "  green: { acc: '#4af6a3', decay: '12ms' },",
        "  amber: { acc: '#ffb454', decay: '18ms' },",
        "  ice:   { acc: '#6fd7ff', decay: '9ms'  },",
        "} as const",
      ].join("\n"),
      "0.6K"
    ),
  }),
  docs: d({
    "COMMANDS.md": f(
      [
        "# COMMAND REFERENCE",
        "",
        "- help — list every command",
        "- ls / cd / cat / tree / pwd — walk the repo",
        "- git log · git status — the fake history",
        "- neofetch — system card",
        "- theme green|amber|ice — recalibrate phosphor",
        "- matrix — engage the rain daemon",
        "- ping <host> — poke the void",
        "- banner · about · projects · history",
        "- echo · date · uptime · whoami · clear",
        "- sudo — (you are not in the sudoers file)",
        "- reboot — cold restart the frame",
        "- repo — download this repository as a .zip",
        "- github — step-by-step push recipe for github.com",
      ].join("\n"),
      "0.8K"
    ),
    "ARCHITECTURE.md": f(
      [
        "# ARCHITECTURE",
        "",
        "the repo is the app. three rings:",
        "",
        "- RING 0 · twsh — command registry + line buffer",
        "- RING 1 · inode table — the virtual fs you are walking",
        "- RING 2 · phosphor — theme, scanlines, rain",
        "",
        "input never leaves the tab. everything you read is",
        "rendered at 60fps by glyphs with a day job.",
      ].join("\n"),
      "0.6K"
    ),
  }),
  public: d({
    "favicon.svg": f(
      [
        "<svg viewBox='0 0 32 32'>",
        "  <rect width='32' height='32' rx='4' fill='#060a0c'/>",
        "  <path d='M8 10l7 6-7 6' stroke='#4af6a3' stroke-width='3'/>",
        "  <rect x='17' y='21' width='8' height='3' fill='#4af6a3'/>",
        "</svg>",
      ].join("\n"),
      "0.2K"
    ),
  }),
});

/* ------------------------------------------------------------------ */
/*  path helpers — '~' is the repo root                                */
/* ------------------------------------------------------------------ */

export function toSegments(display: string): string[] {
  const t = display.replace(/^~\/?/, "");
  return t ? t.split("/").filter(Boolean) : [];
}

export function toDisplay(segs: string[]): string {
  return segs.length ? "~/" + segs.join("/") : "~";
}

export function getNode(segs: string[]): FsNode | null {
  let cur: FsNode = FS;
  for (const s of segs) {
    if (cur.type !== "dir") return null;
    const next = cur.children[s];
    if (!next) return null;
    cur = next;
  }
  return cur;
}

/** Resolve a possibly-relative target against cwd. Returns null if missing. */
export function resolvePath(cwd: string, target: string): string | null {
  let t = target.trim();
  if (!t || t === "~" || t === "/") return "~";
  let base: string[];
  if (t.startsWith("~")) {
    base = [];
    t = t.slice(1).replace(/^\//, "");
  } else {
    base = toSegments(cwd);
  }
  const out = [...base];
  for (const p of t.split("/")) {
    if (!p || p === ".") continue;
    if (p === "..") {
      out.pop();
      continue;
    }
    out.push(p);
  }
  if (!getNode(out)) return null;
  return toDisplay(out);
}

export function flatten(root: FsNode = FS, prefix = ""): Array<[string, string]> {
  if (root.type === "file") return prefix ? [[prefix, root.content]] : [];
  const out: Array<[string, string]> = [];
  for (const [name, child] of Object.entries(root.children)) {
    const p = prefix ? `${prefix}/${name}` : name;
    out.push(...flatten(child, p));
  }
  return out;
}

export type TreeLine = { pre: string; name: string; isDir: boolean };

export function buildTree(segs: string[], prefix = "", depth = 0): TreeLine[] {
  const node = getNode(segs);
  if (!node || node.type !== "dir" || depth > 4) return [];
  const entries = Object.entries(node.children).sort((a, b) => {
    const ad = a[1].type === "dir" ? 0 : 1;
    const bd = b[1].type === "dir" ? 0 : 1;
    return ad - bd || a[0].localeCompare(b[0]);
  });
  const lines: TreeLine[] = [];
  entries.forEach(([name, child], i) => {
    const last = i === entries.length - 1;
    const branch = last ? "└── " : "├── ";
    lines.push({ pre: prefix + branch, name, isDir: child.type === "dir" });
    if (child.type === "dir") {
      lines.push(...buildTree([...segs, name], prefix + (last ? "    " : "│   "), depth + 1));
    }
  });
  return lines;
}

/* ------------------------------------------------------------------ */
/*  tiny syntax-tinted file renderer                                   */
/* ------------------------------------------------------------------ */

export function renderFile(content: string): ReactNode {
  return (
    <div className="whitespace-pre-wrap break-words">
      {content.split("\n").map((ln, i) => {
        if (/^#{1,3}\s/.test(ln))
          return (
            <div key={i} className="acc font-semibold tracking-wide">
              {ln}
            </div>
          );
        if (/^>\s/.test(ln))
          return (
            <div key={i} className="text-mg italic">
              {ln}
            </div>
          );
        if (/^-\s/.test(ln))
          return (
            <div key={i}>
              <span className="acc">▪</span>
              <span className="text-ink/90">{ln.slice(1)}</span>
            </div>
          );
        if (/^\/\//.test(ln) || /^##\s/.test(ln))
          return (
            <div key={i} className="text-dim">
              {ln}
            </div>
          );
        return <div key={i}>{ln || " "}</div>;
      })}
    </div>
  );
}
