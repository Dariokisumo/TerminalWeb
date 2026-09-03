import { Fragment, type ReactNode } from "react";
import {
  buildTree,
  getNode,
  renderFile,
  resolvePath,
  toSegments,
} from "../data/fs";
import { downloadRepoZip } from "./repoZip";

/* ------------------------------------------------------------------ */
/*  types + themes                                                     */
/* ------------------------------------------------------------------ */

export type ThemeName = "green" | "amber" | "ice";

export const THEMES: Record<ThemeName, { acc: string; rgb: string; label: string }> = {
  green: { acc: "#4af6a3", rgb: "74,246,163", label: "GREEN" },
  amber: { acc: "#ffb454", rgb: "255,180,84", label: "AMBER" },
  ice: { acc: "#6fd7ff", rgb: "111,215,255", label: "ICE" },
};

export type LineKind = "out" | "err" | "sys";
export type PrintFn = (node: ReactNode, kind?: LineKind) => void;

export type Ctx = {
  print: PrintFn;
  cwd: string;
  setCwd: (p: string) => void;
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  matrixOn: boolean;
  toggleMatrix: () => void;
  reboot: () => void;
  clear: () => void;
  startTime: number;
  getHistory: () => string[];
};

export type Command = {
  name: string;
  desc: string;
  run: (args: string[], ctx: Ctx) => void;
};

/* ------------------------------------------------------------------ */
/*  shared bits                                                        */
/* ------------------------------------------------------------------ */

export const BANNER = [
  "▀█▀ █▀▀ █▀█ █▀▄▀█ █ █▄░█ ▄▀█ █░░",
  "░█░ ██▄ █▀▄ █░▀░█ █ █░▀█ █▀█ █▄▄",
];

const GITHUB_STEPS: Array<[string, string]> = [
  ["#", "create a repo named 'Terminalweb' on github.com"],
  ["#", "leave 'Add a README file' UNCHECKED — the zip ships its own"],
  ["$", "git init && git add ."],
  ["$", 'git commit -m "Terminalweb: phosphor shell v2.5.0"'],
  ["$", "git branch -M main"],
  ["$", "git remote add origin https://github.com/<you>/Terminalweb.git"],
  ["$", "git push -u origin main"],
];

function uptimeStr(start: number) {
  const s = Math.floor((Date.now() - start) / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

const err = (ctx: Ctx, msg: string) => ctx.print(msg, "err");
const sys = (ctx: Ctx, msg: ReactNode) => ctx.print(msg, "sys");

/* ------------------------------------------------------------------ */
/*  the registry                                                       */
/* ------------------------------------------------------------------ */

export const COMMANDS: Command[] = [
  {
    name: "help",
    desc: "list every command in the registry",
    run: (_a, ctx) => {
      ctx.print(
        <div className="grid grid-cols-[104px_1fr] gap-x-4 gap-y-[3px]">
          {COMMANDS.map((c) => (
            <Fragment key={c.name}>
              <span className="acc font-semibold">{c.name}</span>
              <span className="text-dim">{c.desc}</span>
            </Fragment>
          ))}
        </div>
      );
      sys(ctx, "tab completes · ↑ recalls history · ctrl+L clears");
    },
  },
  {
    name: "ls",
    desc: "list directory contents (-l for sizes)",
    run: (args, ctx) => {
      const node = getNode(toSegments(ctx.cwd));
      if (!node || node.type !== "dir") return;
      const long = args.includes("-l") || args.includes("-la") || args.includes("-al");
      const entries = Object.entries(node.children).sort((a, b) => {
        const ad = a[1].type === "dir" ? 0 : 1;
        const bd = b[1].type === "dir" ? 0 : 1;
        return ad - bd || a[0].localeCompare(b[0]);
      });
      ctx.print(
        <div className="grid grid-cols-2 gap-x-6 gap-y-[2px] md:grid-cols-3">
          {entries.map(([n, c]) => (
            <div key={n} className="flex justify-between gap-2">
              <span className={c.type === "dir" ? "acc font-semibold" : "text-ink/90"}>
                {n}
                {c.type === "dir" ? "/" : ""}
              </span>
              {long && (
                <span className="text-faint tabular-nums">
                  {c.type === "dir" ? "4.0K" : c.size}
                </span>
              )}
            </div>
          ))}
        </div>
      );
      const dirs = entries.filter(([, c]) => c.type === "dir").length;
      sys(ctx, `${dirs} dir(s), ${entries.length - dirs} file(s) in ${ctx.cwd}`);
    },
  },
  {
    name: "cd",
    desc: "change directory (cd src · cd .. · cd ~)",
    run: (args, ctx) => {
      const target = args[0] ?? "~";
      const next = resolvePath(ctx.cwd, target);
      if (next === null) return err(ctx, `cd: no such directory: ${target}`);
      const node = getNode(toSegments(next));
      if (!node || node.type !== "dir") return err(ctx, `cd: not a directory: ${target}`);
      ctx.setCwd(next);
    },
  },
  {
    name: "cat",
    desc: "print a file with phosphor tinting",
    run: (args, ctx) => {
      if (!args[0]) return err(ctx, "cat: missing operand — try `cat README.md`");
      const next = resolvePath(ctx.cwd, args[0]);
      if (next === null) return err(ctx, `cat: ${args[0]}: no such file or directory`);
      const node = getNode(toSegments(next));
      if (!node) return;
      if (node.type === "dir") return err(ctx, `cat: ${args[0]}: is a directory`);
      ctx.print(
        <div>
          <div className="mb-1 text-[10.5px] tracking-widest text-faint">── {next} ──</div>
          {renderFile(node.content)}
        </div>
      );
    },
  },
  {
    name: "tree",
    desc: "draw the inode table as ascii",
    run: (_a, ctx) => {
      const lines = buildTree(toSegments(ctx.cwd));
      ctx.print(
        <div className="whitespace-pre">
          <div className="acc font-semibold">{ctx.cwd === "~" ? "." : ctx.cwd}</div>
          {lines.map((l, i) => (
            <div key={i}>
              <span className="text-faint">{l.pre}</span>
              <span className={l.isDir ? "acc font-semibold" : "text-ink/90"}>
                {l.name}
                {l.isDir ? "/" : ""}
              </span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    name: "pwd",
    desc: "print working directory",
    run: (_a, ctx) =>
      ctx.print("/home/guest/terminalweb" + ctx.cwd.replace(/^~/, "")),
  },
  {
    name: "whoami",
    desc: "print the current user",
    run: (_a, ctx) => ctx.print("guest"),
  },
  {
    name: "echo",
    desc: "bounce words off the phosphor",
    run: (args, ctx) => ctx.print(args.join(" ") || ""),
  },
  {
    name: "date",
    desc: "print the local date",
    run: (_a, ctx) => ctx.print(new Date().toString()),
  },
  {
    name: "uptime",
    desc: "how long the frame has been glowing",
    run: (_a, ctx) =>
      sys(ctx, `up ${uptimeStr(ctx.startTime)} · load average: 0.42 0.60 0.61 · 1 user (guest)`),
  },
  {
    name: "history",
    desc: "recall previous input lines",
    run: (_a, ctx) => {
      const h = ctx.getHistory();
      if (!h.length) return sys(ctx, "history is empty — the phosphor forgets nothing else.");
      ctx.print(
        <div>
          {h.map((l, i) => (
            <div key={i} className="whitespace-pre-wrap">
              <span className="mr-3 inline-block w-6 text-right text-faint tabular-nums">{i + 1}</span>
              {l}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    name: "clear",
    desc: "wipe the screen (ctrl+L too)",
    run: (_a, ctx) => ctx.clear(),
  },
  {
    name: "banner",
    desc: "print the big glyphs",
    run: (_a, ctx) =>
      ctx.print(
        <div>
          {BANNER.map((l, i) => (
            <div key={i} className="acc t-glow whitespace-pre font-semibold leading-tight">
              {l}
            </div>
          ))}
          <div className="mt-1 text-[11px] tracking-[0.4em] text-dim">PHOSPHOR SHELL · TWSH 2.5.0</div>
        </div>
      ),
  },
  {
    name: "neofetch",
    desc: "the system card",
    run: (_a, ctx) => {
      const art = [
        "┌─────────────────┐",
        "│ ● ● ●   twsh    │",
        "├─────────────────┤",
        "│ guest@web:~$ ▊  │",
        "│ ▒▒▒▒▒▒▒▒▒░░ 82% │",
        "└─────────────────┘",
      ];
      const info: [string, ReactNode][] = [
        ["OS", "Terminalweb 2.5.0 (phosphor)"],
        ["Host", "Browser Tab · x86-web"],
        ["Kernel", "twsh 2.5.0"],
        ["Shell", "twsh (tiny web shell)"],
        ["Resolution", `${window.innerWidth}×${window.innerHeight}`],
        ["Theme", THEMES[ctx.theme].label.toLowerCase()],
        ["CPU", "JavaScript V8 @ 60fps"],
        ["Memory", "just enough"],
        ["Uptime", uptimeStr(ctx.startTime)],
      ];
      ctx.print(
        <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
          <pre className="acc t-glow text-[13px] leading-snug">{art.join("\n")}</pre>
          <div className="text-[12.5px]">
            <div className="mb-1 font-semibold">
              <span className="acc">guest</span>
              <span className="text-faint">@</span>
              <span className="text-cy">terminalweb</span>
            </div>
            {info.map(([k, v]) => (
              <div key={k}>
                <span className="acc font-semibold">{k}</span>
                <span className="text-faint">: </span>
                {v}
              </div>
            ))}
            <div className="mt-2 flex gap-1">
              {["#0b1114", "#ff6b81", "#ffb454", "#4af6a3", "#56c8ff", "#d78cff", "#c9d8d1"].map((c) => (
                <span key={c} className="inline-block h-3 w-3" style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    name: "git",
    desc: "fake history · try `git log`",
    run: (args, ctx) => {
      const sub = args[0];
      if (sub === "log") {
        const log: [string, string, string][] = [
          ["9f3c2ab", "feat: wire matrix rain into twsh", "2 days ago"],
          ["7a1e9d4", "fix: caret drift on tab completion", "4 days ago"],
          ["c44b08f", "feat(theme): amber + ice phosphors", "1 week ago"],
          ["2de5710", "docs: COMMANDS.md + boot legend", "2 weeks ago"],
          ["0b8e3f9", "init: terminalweb scaffolding", "3 weeks ago"],
        ];
        ctx.print(
          <div>
            {log.map(([h, m, when], i) => (
              <div key={h} className="leading-6">
                <span className="text-am">* </span>
                <span className="text-cy">{h}</span>{" "}
                {i === 0 && (
                  <span className="acc border border-[rgba(var(--acc-rgb),0.4)] px-1 text-[11px]">
                    HEAD -&gt; main
                  </span>
                )}
                <div className="pl-4">
                  {m} <span className="text-faint">— guest, {when}</span>
                </div>
              </div>
            ))}
          </div>
        );
      } else if (sub === "status") {
        ctx.print(
          <div>
            <div>
              On branch <span className="acc">main</span>
            </div>
            <div className="text-dim">nothing to commit, working tree clean</div>
            <div className="text-faint">(the phosphor is the working tree)</div>
          </div>
        );
      } else if (sub === "branch") {
        ctx.print(
          <div>
            <span className="acc">* main</span>
            <div className="text-faint">  phosphor-experiments</div>
            <div className="text-faint">  feat/rain-daemon</div>
          </div>
        );
      } else {
        sys(ctx, "usage: git log · git status · git branch");
      }
    },
  },
  {
    name: "projects",
    desc: "what the foundry has shipped",
    run: (_a, ctx) => {
      const rows: [string, string, string, string][] = [
        ["SHIPPED", "acc", "twsh", "this shell — 23 commands, zero backend"],
        ["SHIPPED", "acc", "glyphcore", "text rasterizer with day-glow"],
        ["WIP", "text-am", "netpulse", "latency sidecar (see right panel)"],
        ["LAB", "text-mg", "phosphor", "crt shader playground"],
      ];
      ctx.print(
        <div>
          {rows.map(([st, cls, name, desc]) => (
            <div key={name} className="leading-6">
              <span className={`${cls} inline-block w-[86px] font-semibold`}>[{st}]</span>
              <span className="font-semibold text-ink">{name}</span>
              <span className="text-faint"> ····· </span>
              <span className="text-dim">{desc}</span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    name: "theme",
    desc: "recalibrate phosphor (green|amber|ice)",
    run: (args, ctx) => {
      const t = args[0];
      if (!t) {
        return sys(
          ctx,
          <>
            current phosphor: <span className="acc font-semibold">{THEMES[ctx.theme].label}</span> —
            available: green · amber · ice
          </>
        );
      }
      if (t in THEMES) {
        ctx.setTheme(t as ThemeName);
        sys(ctx, <>phosphor recalibrated → <span className="acc font-semibold">{t.toUpperCase()}</span></>);
      } else {
        err(ctx, `unknown phosphor: ${t} (try: green | amber | ice)`);
      }
    },
  },
  {
    name: "matrix",
    desc: "engage / disengage the rain daemon",
    run: (_a, ctx) => {
      ctx.toggleMatrix();
      sys(ctx, `matrixd ${ctx.matrixOn ? "disengaged — back to dry land" : "engaged — follow the glyphs"}`);
    },
  },
  {
    name: "ping",
    desc: "poke the void (ping <host>)",
    run: (args, ctx) => {
      const host = args[0] ?? "terminalweb.dev";
      sys(ctx, `PING ${host} (127.0.0.1): 56 data bytes`);
      let i = 0;
      const iv = setInterval(() => {
        i += 1;
        const ms = (8 + Math.random() * 22).toFixed(1);
        ctx.print(`64 bytes from ${host}: icmp_seq=${i} ttl=64 time=${ms} ms`);
        if (i >= 4) {
          clearInterval(iv);
          sys(ctx, `--- ${host} ping statistics ---`);
          sys(ctx, "4 packets transmitted, 4 received, 0.0% packet loss");
        }
      }, 430);
    },
  },
  {
    name: "sudo",
    desc: "you are not in the sudoers file",
    run: (args, ctx) => {
      err(ctx, `guest is not in the sudoers file. This incident will be reported.`);
      sys(ctx, `(report filed to /dev/null — ${args.join(" ") || "nothing"} was forgiven)`);
    },
  },
  {
    name: "about",
    desc: "what this place is",
    run: (_a, ctx) =>
      ctx.print(
        <div className="leading-6">
          <div className="acc font-semibold">TERMINALWEB</div>
          <div className="text-ink/90">
            A hand-built browser terminal where the page is the repo and the shell at the
            same time. Every command runs against a virtual inode table and renders with
            phosphor glow — nothing is fetched, nothing leaves the tab.
          </div>
          <div className="text-dim">
            react 18 · vite · tailwind v4 · vt323 + ibm plex mono. Walk the source with{" "}
            <span className="acc">tree</span>, read it with <span className="acc">cat src/twsh.ts</span>.
          </div>
        </div>
      ),
  },
  {
    name: "reboot",
    desc: "cold restart the frame",
    run: (_a, ctx) => {
      sys(ctx, "syncing phosphor… unmounting /dev/web…");
      setTimeout(() => ctx.reboot(), 650);
    },
  },
  {
    name: "repo",
    desc: "download this repository as terminalweb-repo.zip",
    run: (_a, ctx) => {
      sys(ctx, "packing inode table → terminalweb-repo.zip …");
      void downloadRepoZip().then((n) => {
        ctx.print(
          <div>
            <div>
              <span className="acc font-semibold">✔ packed {n} files</span>{" "}
              <span className="text-dim">— check your downloads folder.</span>
            </div>
            <div className="mt-1 text-dim">
              next: <span className="acc">github web</span> (upload in the browser, no git) or{" "}
              <span className="acc">github cli</span> — or hit the <span className="acc">PUBLISH</span> button up top.
            </div>
          </div>
        );
      });
    },
  },
  {
    name: "github",
    desc: "publish to github.com — github web · cli · fix",
    run: (args, ctx) => {
      const sub = (args[0] ?? "").toLowerCase();
      if (sub === "web" || sub === "upload") {
        ctx.print(
          <div className="leading-6">
            <div className="font-semibold tracking-wide text-mg">BROWSER UPLOAD — ZERO GIT</div>
            <div className="mt-1">
              1. <span className="acc">repo</span> → unzip <span className="text-cy">terminalweb-repo.zip</span>
            </div>
            <div>
              2. on your Terminalweb repo page: open <span className="text-ink/80">README.md</span> → trash →
              commit. same for <span className="text-ink/80">LICENSE</span>. (repo is now empty)
            </div>
            <div>
              3. <span className="acc">Add file → Upload files</span> → drag the <span className="text-ink/80">contents</span>{" "}
              of the unzipped folder into the box
            </div>
            <div>4. commit changes — the whole repo appears on main</div>
            <div className="mt-1 text-dim">
              visual guide: the <span className="acc">PUBLISH</span> button in the header.
            </div>
          </div>
        );
      } else if (sub === "cli" || sub === "git") {
        ctx.print(
          <div className="leading-6">
            <div className="font-semibold tracking-wide text-mg">CLASSIC GIT PUSH</div>
            <div className="text-dim">unzip the archive from `repo`, then from that folder:</div>
            <div className="mt-1 space-y-[2px]">
              {GITHUB_STEPS.map(([k, t], i) => (
                <div key={i} className="whitespace-pre-wrap">
                  {k === "$" ? (
                    <>
                      <span className="acc mr-2">$</span>
                      <span className="text-ink/90">{t}</span>
                    </>
                  ) : (
                    <span className="text-dim">{t}</span>
                  )}
                </div>
              ))}
              <div className="text-dim">if pull stops with CONFLICT (add/add):</div>
              <div>
                <span className="acc mr-2">$</span>
                <span className="text-ink/90">
                  git checkout --ours README.md LICENSE && git add . && git commit -m "merge"
                </span>
              </div>
              <div>
                <span className="acc mr-2">$</span>
                <span className="text-ink/90">git push -u origin main</span>
              </div>
            </div>
          </div>
        );
      } else if (sub === "fix" || sub === "stuck") {
        ctx.print(
          <div className="leading-6">
            <div className="font-semibold tracking-wide text-err">
              DIAGNOSIS: STILL ONLY README + LICENSE ON GITHUB
            </div>
            <div className="mt-1 text-dim">
              those two files were seeded by GitHub when the repo was created. your push was
              rejected (non-fast-forward) or never ran. from your unzipped repo folder:
            </div>
            <div className="mt-1 space-y-[2px]">
              {[
                "git pull origin main --allow-unrelated-histories",
                'git checkout --ours README.md LICENSE && git add . && git commit -m "merge seed files"',
                "git push -u origin main",
              ].map((t) => (
                <div key={t}>
                  <span className="acc mr-2">$</span>
                  <span className="text-ink/90">{t}</span>
                </div>
              ))}
            </div>
            <div className="mt-1 text-dim">
              no git installed? → <span className="acc">github web</span> does it all in the browser.
            </div>
          </div>
        );
      } else {
        ctx.print(
          <div className="leading-6">
            <div className="font-semibold tracking-wide text-mg">PUBLISH TERMINALWEB → GITHUB</div>
            <div className="mt-1 text-dim">
              easiest: hit the <span className="acc">⇪ PUBLISH</span> button in the header — guided steps
              with copy buttons.
            </div>
            <div>or stay in the shell:</div>
            <div>
              <span className="acc">github web</span>
              <span className="text-dim"> — upload via browser, no git needed</span>
            </div>
            <div>
              <span className="acc">github cli</span>
              <span className="text-dim"> — classic git push</span>
            </div>
            <div>
              <span className="acc">github fix</span>
              <span className="text-dim"> — push rejected? only README+LICENSE up there? start here</span>
            </div>
          </div>
        );
      }
    },
  },
];
