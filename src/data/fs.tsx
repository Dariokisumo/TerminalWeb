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
      "▀█▀ █▀▀ █▀█ █▀▄▀█ █ █▄░█ ▄▀█ █░░",
      "░█░ ██▄ █▀▄ █░▀░█ █ █░▀█ █▀█ █▄▄",
      "",
      "[ twsh 2.5.0 ] [ phosphor green·amber·ice ] [ license MIT ] [ uplink stable ]",
      "",
      "> a browser-native phosphor terminal.",
      "> the page is the repo, and the shell at the same time.",
      "> type `help` — everything below is real in here.",
      "",
      "## WHAT IS THIS",
      "",
      "Terminalweb is a hand-built terminal that runs entirely inside one",
      "browser tab. It cold-boots a tiny shell kernel (twsh) straight into",
      "a virtual inode table — the very source files of this repository.",
      "No backend, no accounts, no network. Every command resolves against",
      "the file tree below and renders with phosphor glow at 60fps.",
      "",
      "- the shell is the portfolio. the repo is the app.",
      "- the source you `cat` here is the source you unzip at home.",
      "- everything is reactive: type, and the whole frame answers.",
      "",
      "## TRY IT FIRST",
      "",
      "| type this          | and watch                          |",
      "|--------------------|------------------------------------|",
      "| `tree`             | the repo draw itself in ascii      |",
      "| `cat src/twsh.ts`  | the shell kernel, tinted           |",
      "| `neofetch`         | the system card                    |",
      "| `ping the-void`    | four packets into nothing          |",
      "| `theme amber`      | the phosphor recalibrate           |",
      "| `matrix`           | the rain daemon engage             |",
      "| `github fix`       | push rejected? start here          |",
      "",
      "## THE COMMANDS",
      "",
      "- help — the full registry",
      "- ls · cd · cat · tree · pwd — walk the repo",
      "- git log · status · branch — the fake history",
      "- neofetch · banner · about · projects · echo · date",
      "- theme green|amber|ice — swap phosphors mid-session",
      "- matrix — rain daemon (toggle)",
      "- ping <host> — poke the void",
      "- history · uptime · whoami · clear · sudo · reboot",
      "- repo — pack this repository into a .zip",
      "- github web|cli|fix — the publish coach",
      "",
      "## UNDER THE GLASS",
      "",
      "three rings, nothing else:",
      "",
      "- RING 0 · twsh — command registry, line buffer, tab completion",
      "- RING 1 · inode table — the virtual fs (this repo)",
      "- RING 2 · phosphor — themes, scanlines, rain, glow",
      "",
      "stack: react 18 · vite · tailwind v4 · vt323 + ibm plex mono.",
      "sidecars: glyphcore (rasterizer), netpulse (latency monitor,",
      "right panel), matrixd (rain daemon, pid 0666).",
      "",
      "## PHOSPHOR SPEC",
      "",
      "- green  #4af6a3 — factory default, 12ms decay",
      "- amber  #ffb454 — 1978 mainframe warmth, 18ms decay",
      "- ice    #6fd7ff — cold-storage blue, 9ms decay",
      "",
      "## RUN IT YOURSELF",
      "",
      "```",
      "npm install",
      "npm run dev     # local phosphor on localhost",
      "npm run build   # ship the glow",
      "```",
      "",
      "## PUBLISH TO GITHUB",
      "",
      "- run `repo` — downloads this repo as terminalweb-repo.zip",
      "- run `github web` — upload via browser, no git needed",
      "- run `github cli` — classic push with copy-ready commands",
      "- run `github fix` — only README+LICENSE up there? start here",
      "",
      "## FAQ",
      "",
      "Q — my GitHub repo only shows README + LICENSE. why?",
      "A — those two files were seeded by GitHub when the repo was",
      "    created, and they silently reject a first push. either delete",
      "    them on github.com and drag-upload the unzipped files, or run",
      "    `git pull origin main --allow-unrelated-histories` and push.",
      "    the shell command `github fix` walks through it line by line.",
      "",
      "Q — is any of this real?",
      "A — the shell, the fs, the glow, the 0.0% packet loss. the RAM",
      "    size is aspirational.",
      "",
      "## LICENSE",
      "",
      "MIT — see LICENSE. be kind to your phosphors.",
      "",
      "written by the terminal, about the terminal, inside the terminal.",
    ].join("\n"),
    "2.4K"
  ),
  "package.json": f(
    [
      "{",
      '  "name": "terminalweb",',
      '  "version": "2.5.0",',
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
      '    "twsh-core": "^2.5.0"',
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
      "## 2.5.0 — 2026-02-14",
      "- docs: README rewritten by the terminal itself",
      "- feat: `repo` — pack the source into terminalweb-repo.zip",
      "- feat: `github web|cli|fix` — in-shell publish coach",
      "- feat: PUBLISH panel in the frame header",
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
        if (/^```/.test(ln))
          return (
            <div key={i} className="text-faint">
              {ln}
            </div>
          );
        if (/^\|/.test(ln))
          return <div key={i} className="text-cy/85">{ln}</div>;
        if (/^Q\s—/.test(ln))
          return (
            <div key={i} className="text-am">
              {ln}
            </div>
          );
        return <div key={i}>{ln || " "}</div>;
      })}
    </div>
  );
}
