import { useEffect, useState } from "react";
import { downloadRepoZip } from "../lib/repoZip";

type Tab = "web" | "cli";

async function copyText(t: string) {
  try {
    await navigator.clipboard.writeText(t);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = t;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

function Copy({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => {
        void copyText(text);
        setOk(true);
        setTimeout(() => setOk(false), 1400);
      }}
      className={
        "shrink-0 border px-1.5 py-0.5 text-[10px] tracking-widest transition-all duration-150 " +
        (ok
          ? "acc border-[color:var(--acc)] bg-[color:var(--acc)]/10"
          : "border-line text-faint hover:border-[color:var(--acc)] hover:text-[color:var(--acc)]")
      }
    >
      {ok ? "COPIED ✔" : "COPY"}
    </button>
  );
}

function Cmd({ text }: { text: string }) {
  return (
    <div className="mt-1.5 flex items-center justify-between gap-2 border border-line bg-[#0a0f11] px-3 py-2">
      <code className="break-all text-[12px] text-ink/90">
        <span className="acc mr-2">$</span>
        {text}
      </code>
      <Copy text={text} />
    </div>
  );
}

const Num = ({ n }: { n: string }) => (
  <span className="t-glow acc w-8 shrink-0 font-disp text-2xl leading-none">{n}</span>
);

const TrashIcon = () => (
  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.3">
    <path d="M2.5 4.5h11M6.5 4V2.5h3V4M4 4.5l.8 9h6.4l.8-9M6.5 7v4M9.5 7v4" />
  </svg>
);

const TrayIcon = () => (
  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4 15v4h16v-4" />
  </svg>
);

export default function PublishModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("web");
  const [user, setUser] = useState("your-username");
  const [packing, setPacking] = useState(false);
  const [packed, setPacked] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const dl = async () => {
    setPacking(true);
    try {
      await downloadRepoZip();
      setPacked(true);
    } finally {
      setPacking(false);
    }
  };

  const remote = `https://github.com/${user.trim() || "your-username"}/Terminalweb.git`;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 md:p-6">
      <div className="fadein absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} />

      <div className="modal-pop panel relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden">
        {/* accent strip */}
        <div className="h-[3px] w-full shrink-0 bg-[var(--acc)] shadow-[0_0_18px_rgba(var(--acc-rgb),0.7)]" />

        {/* header */}
        <header className="flex shrink-0 items-start justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="t-glow acc font-disp text-3xl leading-none tracking-wider">
              PUBLISH → GITHUB
            </h2>
            <p className="mt-1 text-[11.5px] text-dim">
              this sandbox can't push to GitHub for you — here's the shortest path. pick one:
            </p>
          </div>
          <button
            onClick={onClose}
            className="border border-line p-1.5 text-dim transition-colors hover:border-err hover:text-err"
            title="close (esc)"
          >
            <svg viewBox="0 0 12 12" className="h-3 w-3" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </button>
        </header>

        {/* download (both paths start here) */}
        <div className="shrink-0 px-5 pt-4">
          <button
            onClick={() => void dl()}
            className="group w-full border border-[color:var(--acc)] bg-[color:var(--acc)]/10 px-4 py-3 text-left transition-all duration-200 hover:bg-[color:var(--acc)]/20 hover:shadow-[0_0_26px_rgba(var(--acc-rgb),0.35)]"
          >
            <div className="acc font-disp text-2xl leading-none tracking-wider">
              {packed ? "✔ PACKED — CHECK YOUR DOWNLOADS" : packing ? "PACKING…" : "⇩ DOWNLOAD terminalweb-repo.zip"}
            </div>
            <div className="mt-1 text-[11px] text-dim">
              every file of this repository + PUSH_TO_GITHUB.md. unzip it — that folder{" "}
              <span className="text-ink/80">is</span> the repo.
            </div>
          </button>
        </div>

        {/* tabs */}
        <div className="flex shrink-0 gap-2 px-5 pt-4">
          {(
            [
              ["web", "BROWSER UPLOAD", "no git needed"],
              ["cli", "GIT CLI", "classic push"],
            ] as Array<[Tab, string, string]>
          ).map(([k, title, sub]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={
                "flex-1 border px-3 py-2 text-left transition-all duration-150 " +
                (tab === k
                  ? "border-[color:var(--acc)] bg-[color:var(--acc)]/10"
                  : "border-line hover:border-[color:var(--acc)]/50")
              }
            >
              <div className={"font-disp text-lg leading-none tracking-wider " + (tab === k ? "acc" : "text-dim")}>
                {title}
              </div>
              <div className="mt-0.5 text-[10px] tracking-widest text-faint">{sub.toUpperCase()}</div>
            </button>
          ))}
        </div>

        {/* body */}
        <div className="term-scroll shrink overflow-y-auto px-5 py-4">
          {tab === "web" ? (
            <div className="space-y-5">
              <div className="flex gap-2">
                <Num n="01" />
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-ink">Empty the GitHub repo first</div>
                  <p className="mt-1 text-[12px] leading-5 text-dim">
                    README.md + LICENSE up there are <span className="text-ink/80">GitHub's seed files</span> —
                    they're the only reason you see nothing else. On your Terminalweb repo page, open each one,
                    hit the trash icon, and commit:
                  </p>
                  <div className="mt-2 space-y-1">
                    {["README.md", "LICENSE"].map((n) => (
                      <div key={n} className="flex items-center justify-between border border-line bg-panel px-3 py-1.5">
                        <span className="text-[12px] text-ink/80">{n}</span>
                        <span className="flex items-center gap-1.5 text-[10px] tracking-widest text-err">
                          <TrashIcon /> DELETE → COMMIT CHANGES
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Num n="02" />
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-ink">Upload via GitHub's dropzone</div>
                  <p className="mt-1 text-[12px] leading-5 text-dim">
                    On the now-empty repo page: <span className="acc">Add file → Upload files</span>. Then drag the{" "}
                    <span className="text-ink/80">contents</span> of the unzipped folder into the box —{" "}
                    <span className="text-err">not the folder itself</span>, or everything lands in a subfolder.
                  </p>
                  <div className="mt-2 border-2 border-dashed border-line px-4 py-6 text-center transition-colors duration-200 hover:border-[color:var(--acc)]">
                    <span className="text-dim">
                      <TrayIcon />
                    </span>
                    <div className="mt-2 text-[12px] text-dim">
                      Drag files here to add them to your repository
                    </div>
                    <div className="mt-0.5 text-[10px] tracking-widest text-faint">
                      ↑ THIS IS GITHUB'S BOX — DROP THE UNZIPPED CONTENTS IN
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Num n="03" />
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-ink">Commit changes</div>
                  <p className="mt-1 text-[12px] leading-5 text-dim">
                    GitHub uploads straight to <span className="text-cy">main</span>. The file list now shows
                    package.json, CHANGELOG.md, src/, docs/, public/ — the whole repo.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-[10px] tracking-widest text-faint">YOUR REMOTE (type your GitHub handle):</div>
                <div className="mt-1.5 flex items-center gap-2 border border-line bg-[#0a0f11] px-3 py-2">
                  <code className="break-all text-[12px] text-ink/90">{remote}</code>
                  <Copy text={remote} />
                </div>
                <input
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  spellCheck={false}
                  className="mt-2 w-52 border border-line bg-panel px-2.5 py-1.5 text-[12.5px] text-ink outline-none transition-colors focus:border-[color:var(--acc)]"
                />
              </div>

              <div>
                <div className="text-[10px] tracking-widest text-faint">FROM THE UNZIPPED FOLDER, IN ORDER:</div>
                <Cmd text="git init && git add ." />
                <Cmd text='git commit -m "Terminalweb: phosphor shell v2.4.1"' />
                <Cmd text="git branch -M main" />
                <Cmd text={`git remote add origin ${remote}`} />
                <Cmd text="git pull origin main --allow-unrelated-histories" />
                <Cmd text="git push -u origin main" />
              </div>

              <div className="border-l-2 border-am pl-3">
                <div className="font-disp text-base leading-none tracking-wider text-am">
                  IF PULL STOPS WITH "CONFLICT (add/add)"
                </div>
                <p className="mt-1 text-[11.5px] leading-5 text-dim">
                  That's GitHub's seeded README/LICENSE clashing with yours. Keep your copies and merge:
                </p>
                <Cmd text='git checkout --ours README.md LICENSE && git add . && git commit -m "merge seed files"' />
                <p className="mt-1 text-[11.5px] text-dim">
                  then <span className="acc">git push -u origin main</span> again.
                </p>
              </div>

              <p className="text-[11px] text-faint">
                needs git installed + a signed-in credential (PAT or <span className="text-dim">gh auth login</span>).
              </p>
            </div>
          )}

          {/* stuck section */}
          <div className="mt-6 border border-line bg-panel/60 px-4 py-3">
            <div className="font-disp text-base leading-none tracking-wider text-mg">
              STILL ONLY README + LICENSE UP THERE?
            </div>
            <ul className="mt-2 space-y-1 text-[11.5px] leading-5 text-dim">
              <li>
                <span className="acc">▸</span> push said <span className="text-err">rejected / non-fast-forward</span>?
                → you skipped the <span className="text-ink/80">pull --allow-unrelated-histories</span> merge (CLI step 5).
              </li>
              <li>
                <span className="acc">▸</span> files landed under a weird subfolder? → you dragged the folder itself,
                not its contents. Delete and re-upload.
              </li>
              <li>
                <span className="acc">▸</span> wrong repo? → check with <span className="text-ink/80">git remote -v</span>{" "}
                and compare the handle above.
              </li>
              <li>
                <span className="acc">▸</span> no git at all? → use the <span className="acc">BROWSER UPLOAD</span> tab — zero git required.
              </li>
            </ul>
          </div>

          <p className="mt-4 pb-1 text-center text-[10px] tracking-widest text-faint">
            THIS COACH RUNS 100% IN YOUR TAB — NOTHING LEAVES IT
          </p>
        </div>
      </div>
    </div>
  );
}
