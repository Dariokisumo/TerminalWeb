import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  BANNER,
  COMMANDS,
  type Ctx,
  type LineKind,
  type ThemeName,
} from "../lib/commands";
import { getNode, resolvePath, toSegments } from "../data/fs";

/* ------------------------------------------------------------------ */

type InLine = { id: number; kind: "in"; cwd: string; text: string };
type OutLine = { id: number; kind: LineKind; node: ReactNode };
export type TermLine = InLine | OutLine;
type NewLine = Omit<InLine, "id"> | Omit<OutLine, "id">;

export type TermHandle = {
  run: (cmd: string) => void;
  clear: () => void;
  focus: () => void;
};

type Props = {
  booted: boolean;
  cwd: string;
  setCwd: (p: string) => void;
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  matrixOn: boolean;
  toggleMatrix: () => void;
  reboot: () => void;
  startTime: number;
};

const CHIPS = ["help", "tree", "github", "repo", "neofetch", "git log", "matrix"];

const KIND_CLASS: Record<LineKind, string> = {
  out: "text-ink/90",
  err: "text-err",
  sys: "text-dim italic",
};

function Prompt({ cwd }: { cwd: string }) {
  return (
    <span className="whitespace-pre">
      <span className="acc font-semibold">guest@terminalweb</span>
      <span className="text-faint">:</span>
      <span className="text-cy">{cwd}</span>
      <span className="acc soft-glow"> $ </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */

const Terminal = forwardRef<TermHandle, Props>(function Terminal(
  { booted, cwd, setCwd, theme, setTheme, matrixOn, toggleMatrix, reboot, startTime },
  ref
) {
  const [lines, setLines] = useState<TermLine[]>([]);
  const [value, setValue] = useState("");
  const [caret, setCaret] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [focused, setFocused] = useState(false);

  const idRef = useRef(0);
  const draftRef = useRef("");
  const welcomedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const push = (line: NewLine) =>
    setLines((ls) => [...ls.slice(-199), { ...line, id: ++idRef.current } as TermLine]);

  const print: Ctx["print"] = (node, kind = "out") => push({ kind, node });
  const clear = () => setLines([]);

  /* ---------- welcome banner once per boot ---------- */
  useEffect(() => {
    if (!booted) {
      welcomedRef.current = false;
      return;
    }
    if (welcomedRef.current) return;
    welcomedRef.current = true;
    push({
      kind: "out",
      node: (
        <div>
          {BANNER.map((l, i) => (
            <div key={i} className="acc t-glow whitespace-pre font-semibold leading-tight">
              {l}
            </div>
          ))}
          <div className="mt-1 text-[11px] tracking-[0.4em] text-dim">PHOSPHOR SHELL · TWSH 2.4.1</div>
        </div>
      ),
    });
    push({
      kind: "sys",
      node: `session opened for guest — ${COMMANDS.length} commands loaded from the registry.`,
    });
    push({
      kind: "sys",
      node: 'type "help" to begin · tab completes · ↑ recalls · the file tree on the right is live',
    });
  }, [booted]);

  /* ---------- autofocus + scroll ---------- */
  useEffect(() => {
    if (!booted) return;
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, [booted]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  /* ---------- exec ---------- */
  const makeCtx = (): Ctx => ({
    print,
    cwd,
    setCwd,
    theme,
    setTheme,
    matrixOn,
    toggleMatrix,
    reboot,
    clear,
    startTime,
    getHistory: () => history,
  });

  const exec = (raw: string) => {
    push({ kind: "in", cwd, text: raw });
    if (!raw.trim()) return;
    setHistory((h) => [...h, raw]);
    setHistIdx(-1);
    const [name, ...args] = raw.trim().split(/\s+/);
    const cmd = COMMANDS.find((c) => c.name === name);
    if (!cmd) {
      push({ kind: "err", node: `twsh: command not found: ${name}` });
      const sug = COMMANDS.filter((c) => c.name.startsWith(name.slice(0, 2)));
      if (sug.length)
        push({ kind: "sys", node: `did you mean: ${sug.map((s) => s.name).join(" · ")} ?` });
      return;
    }
    cmd.run(args, makeCtx());
  };

  const execRef = useRef(exec);
  execRef.current = exec;

  useImperativeHandle(ref, () => ({
    run: (c: string) => execRef.current(c),
    clear,
    focus: () => inputRef.current?.focus(),
  }));

  /* ---------- history nav ---------- */
  const nav = (dir: -1 | 1) => {
    if (!history.length) return;
    if (dir === -1) {
      if (histIdx === -1) {
        draftRef.current = value;
        const i = history.length - 1;
        setHistIdx(i);
        setValue(history[i]);
        setCaret(history[i].length);
      } else if (histIdx > 0) {
        const i = histIdx - 1;
        setHistIdx(i);
        setValue(history[i]);
        setCaret(history[i].length);
      }
    } else if (histIdx !== -1) {
      if (histIdx < history.length - 1) {
        const i = histIdx + 1;
        setHistIdx(i);
        setValue(history[i]);
        setCaret(history[i].length);
      } else {
        setHistIdx(-1);
        setValue(draftRef.current);
        setCaret(draftRef.current.length);
      }
    }
  };

  /* ---------- tab completion ---------- */
  const complete = () => {
    const parts = value.split(" ");
    const last = parts.length - 1;
    const frag = parts[last];
    let candidates: string[] = [];
    if (last === 0) {
      if (frag) candidates = COMMANDS.map((c) => c.name).filter((n) => n.startsWith(frag));
    } else {
      const slash = frag.lastIndexOf("/");
      const dirPart = slash >= 0 ? frag.slice(0, slash + 1) : "";
      const namePart = slash >= 0 ? frag.slice(slash + 1) : frag;
      const base = dirPart ? resolvePath(cwd, dirPart.replace(/\/$/, "")) : cwd;
      const node = getNode(toSegments(base ?? cwd));
      if (node && node.type === "dir") {
        candidates = Object.entries(node.children)
          .filter(([n]) => n.startsWith(namePart))
          .map(([n, c]) => dirPart + n + (c.type === "dir" ? "/" : ""));
      }
    }
    if (candidates.length === 1) {
      parts[last] = candidates[0];
      const next = parts.join(" ") + (last === 0 ? " " : "");
      setValue(next);
      setCaret(next.length);
    } else if (candidates.length > 1) {
      push({
        kind: "sys",
        node: candidates.join("   "),
      });
    }
  };

  const syncCaret = () => {
    const el = inputRef.current;
    if (el) setCaret(el.selectionStart ?? value.length);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      exec(value);
      setValue("");
      setCaret(0);
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      nav(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      nav(1);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      clear();
    }
  };

  /* ---------- render ---------- */
  return (
    <section
      className={`panel relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-shadow duration-300 ${
        focused ? "shadow-[0_0_0_1px_rgba(var(--acc-rgb),0.35),0_0_42px_rgba(var(--acc-rgb),0.07)]" : ""
      }`}
    >
      {/* title strip */}
      <header className="flex h-9 shrink-0 items-center justify-between border-b border-line bg-panel2/80 px-3">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-err/80" />
            <i className="h-2.5 w-2.5 rounded-full bg-am/80" />
            <i className="acc h-2.5 w-2.5 rounded-full opacity-80" style={{ background: "var(--acc)" }} />
          </span>
          <span className="panel-title text-[15px] text-ink/90">
            twsh — guest@terminalweb <span className="text-faint">· {cwd}</span>
          </span>
        </div>
        <span className="hidden text-[10px] tracking-widest text-faint sm:block">UTF-8 · 60FPS · RING0</span>
      </header>

      {/* quick chips */}
      <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-line bg-panel/60 px-3 py-1.5">
        <span className="mr-1 text-[10px] tracking-widest text-faint">RUN:</span>
        {CHIPS.map((c) => (
          <button
            key={c}
            onClick={() => {
              execRef.current(c);
              inputRef.current?.focus();
            }}
            className="border border-line px-2 py-[2px] text-[11px] text-dim transition-all duration-150 hover:border-[rgba(var(--acc-rgb),0.6)] hover:text-[var(--acc)] hover:shadow-[0_0_10px_rgba(var(--acc-rgb),0.25)] active:translate-y-px"
          >
            <span className="acc mr-1">›</span>
            {c}
          </button>
        ))}
      </div>

      {/* scrollback */}
      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        className="term-scroll min-h-0 flex-1 cursor-text overflow-y-auto px-3 py-3 text-[13px] leading-[1.55]"
      >
        {lines.map((l) => (
          <div key={l.id} className="ln">
            {l.kind === "in" ? (
              <div className="whitespace-pre-wrap break-words">
                <Prompt cwd={l.cwd} />
                <span className="text-ink">{l.text}</span>
              </div>
            ) : (
              <div className={`whitespace-pre-wrap break-words ${KIND_CLASS[l.kind]}`}>{l.node}</div>
            )}
          </div>
        ))}

        {/* live input line */}
        <div className="flex items-start">
          <Prompt cwd={cwd} />
          <div className="relative min-w-0 flex-1">
            <span className="whitespace-pre-wrap break-words text-ink">
              {value.slice(0, caret)}
              <span className="caret">▊</span>
              {value.slice(caret)}
            </span>
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setCaret(e.target.selectionStart ?? e.target.value.length);
              }}
              onKeyDown={onKey}
              onKeyUp={syncCaret}
              onClick={syncCaret}
              onSelect={syncCaret}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="absolute inset-0 h-full w-full cursor-text opacity-0"
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              aria-label="terminal input"
            />
          </div>
        </div>
      </div>
    </section>
  );
});

export default Terminal;
