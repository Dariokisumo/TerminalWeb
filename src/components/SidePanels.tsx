import { useEffect, useRef, useState, type ReactNode } from "react";
import { FS, toDisplay, type FsNode } from "../data/fs";

/* ---------------------------------- shell ---------------------------------- */

export function Panel({ title, tag, children }: { title: string; tag?: string; children: ReactNode }) {
  return (
    <section className="panel overflow-hidden">
      <header className="flex items-center justify-between border-b border-line bg-panel2/80 px-3 py-1.5">
        <h2 className="panel-title acc soft-glow text-[15px]">{title}</h2>
        {tag && <span className="text-[10px] tracking-widest text-faint">{tag}</span>}
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}

/* ------------------------------- system monitor ---------------------------- */

function useWalk(init: number, lo: number, hi: number, step: number, ms: number) {
  const [v, setV] = useState(init);
  useEffect(() => {
    const iv = setInterval(
      () => setV((p) => Math.min(hi, Math.max(lo, p + (Math.random() - 0.5) * step))),
      ms
    );
    return () => clearInterval(iv);
  }, [lo, hi, step, ms]);
  return v;
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="mb-1 flex justify-between text-[10.5px]">
        <span className="text-dim">{label}</span>
        <span className="acc tabular-nums">{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 w-full bg-[#101b1f]">
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{
            width: `${value}%`,
            background: "linear-gradient(90deg, rgba(var(--acc-rgb),0.35), var(--acc))",
            boxShadow: "0 0 8px rgba(var(--acc-rgb),0.5)",
          }}
        />
      </div>
    </div>
  );
}

export function SystemPanel({ matrixOn }: { matrixOn: boolean }) {
  const cpu = useWalk(34, 12, 92, 26, 900);
  const mem = useWalk(58, 30, 86, 12, 1300);
  const gpu = useWalk(21, 5, 74, 18, 1100);

  const procs: [string, string, number][] = [
    ["twsh", "0412", 3.8],
    ["glyphcore", "0413", 11.2],
    ["netpulse", "0417", 2.1],
    ["matrixd", "0666", matrixOn ? 9.6 : 0],
    ["scanband", "0420", 0.9],
  ];

  return (
    <Panel title="SYSTEM" tag="RING·0">
      <Bar label="CPU · v8" value={cpu} />
      <Bar label="MEM · heap" value={mem} />
      <Bar label="GPU · compositor" value={gpu} />
      <div className="mt-3 border-t border-line pt-2 text-[10.5px]">
        <div className="mb-1 flex justify-between text-faint">
          <span>PID</span>
          <span>PROC</span>
          <span>%CPU</span>
        </div>
        {procs.map(([name, pid, p]) => (
          <div key={name} className="flex justify-between text-dim">
            <span className="text-faint">{pid}</span>
            <span className="flex-1 px-2 text-ink/85">{name}</span>
            <span className={p > 8 ? "acc tabular-nums" : "tabular-nums"}>{p.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* -------------------------------- net pulse -------------------------------- */

export function NetPanel() {
  const [vals, setVals] = useState<number[]>(() =>
    Array.from({ length: 26 }, () => 10 + Math.random() * 18)
  );
  useEffect(() => {
    const iv = setInterval(
      () => setVals((v) => [...v.slice(1), 8 + Math.random() * 26 + (Math.random() > 0.92 ? 22 : 0)]),
      1100
    );
    return () => clearInterval(iv);
  }, []);

  const max = 60;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * 100},${32 - (Math.min(v, max) / max) * 30}`).join(" ");
  const cur = vals[vals.length - 1];

  return (
    <Panel title="NETPULSE" tag="RING·2">
      <div className="flex items-end justify-between">
        <div>
          <div className="font-disp acc t-glow text-4xl leading-none tabular-nums">{cur.toFixed(0)}</div>
          <div className="mt-1 text-[10px] tracking-widest text-dim">MS RTT · /dev/web</div>
        </div>
        <div className="text-right text-[10px] leading-4 text-dim">
          <div>
            loss <span className="acc">0.0%</span>
          </div>
          <div>
            ttl <span className="text-ink">64</span>
          </div>
          <div>
            route <span className="text-ink">loopback</span>
          </div>
        </div>
      </div>
      <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="mt-2 h-14 w-full">
        <defs>
          <linearGradient id="np" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(var(--acc-rgb),0.35)" />
            <stop offset="100%" stopColor="rgba(var(--acc-rgb),0)" />
          </linearGradient>
        </defs>
        <polygon points={`0,32 ${pts} 100,32`} fill="url(#np)" />
        <polyline points={pts} fill="none" stroke="var(--acc)" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
      </svg>
    </Panel>
  );
}

/* -------------------------------- file tree -------------------------------- */

function TreeRow({
  name,
  node,
  path,
  depth,
  expanded,
  toggle,
  onOpen,
}: {
  name: string;
  node: FsNode;
  path: string[];
  depth: number;
  expanded: Set<string>;
  toggle: (k: string) => void;
  onOpen: (display: string) => void;
}) {
  const key = path.join("/");
  const isDir = node.type === "dir";
  const open = expanded.has(key);

  if (!isDir) {
    return (
      <button
        onClick={() => onOpen(toDisplay(path))}
        className="group flex w-full items-center gap-1.5 px-1 py-[3px] text-left text-[12px] text-ink/85 transition-colors hover:bg-[rgba(var(--acc-rgb),0.08)] hover:text-[var(--acc)]"
        style={{ paddingLeft: depth * 12 + 4 }}
      >
        <span className="text-faint">·</span>
        <span className="flex-1 truncate">{name}</span>
        <span className="text-[10px] text-faint opacity-0 transition-opacity group-hover:opacity-100">cat</span>
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => toggle(key)}
        className="flex w-full items-center gap-1.5 px-1 py-[3px] text-left text-[12px] transition-colors hover:bg-[rgba(var(--acc-rgb),0.08)]"
        style={{ paddingLeft: depth * 12 + 4 }}
      >
        <span className="acc text-[10px]">{open ? "▾" : "▸"}</span>
        <span className="acc font-semibold">{name}/</span>
      </button>
      {open &&
        Object.entries(node.children)
          .sort((a, b) => {
            const ad = a[1].type === "dir" ? 0 : 1;
            const bd = b[1].type === "dir" ? 0 : 1;
            return ad - bd || a[0].localeCompare(b[0]);
          })
          .map(([n, c]) => (
            <TreeRow
              key={n}
              name={n}
              node={c}
              path={[...path, n]}
              depth={depth + 1}
              expanded={expanded}
              toggle={toggle}
              onOpen={onOpen}
            />
          ))}
    </div>
  );
}

export function FilesPanel({ onOpen }: { onOpen: (displayPath: string) => void }) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(["", "src"]));
  const toggle = (k: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  return (
    <Panel title="INODES" tag="RING·1">
      <div className="mb-1 flex items-center justify-between text-[10px] tracking-widest text-faint">
        <span>~/terminalweb</span>
        <span>click → cat</span>
      </div>
      {FS.type === "dir" &&
        Object.entries(FS.children)
          .sort((a, b) => {
            const ad = a[1].type === "dir" ? 0 : 1;
            const bd = b[1].type === "dir" ? 0 : 1;
            return ad - bd || a[0].localeCompare(b[0]);
          })
          .map(([n, c]) => (
            <TreeRow
              key={n}
              name={n}
              node={c}
              path={[n]}
              depth={0}
              expanded={expanded}
              toggle={toggle}
              onOpen={onOpen}
            />
          ))}
    </Panel>
  );
}
