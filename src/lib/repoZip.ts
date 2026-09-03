import { flatten } from "../data/fs";

export const PUSH_MD = `# Push Terminalweb to GitHub

## PATH A — browser upload (no git needed)

1. On github.com/<you>/Terminalweb: open README.md -> trash icon -> "Commit changes".
   Do the same for LICENSE. (The repo must be empty first — these two files are
   the ones GitHub seeds when you tick "Add a README" + a license.)
2. Unzip this archive somewhere.
3. On the now-empty repo page: "Add file" -> "Upload files", then DRAG THE
   CONTENTS of the unzipped folder into the dashed box (not the folder itself).
4. "Commit changes". Done — every file appears.

## PATH B — git CLI

    cd <unzipped-folder>
    git init && git add .
    git commit -m "Terminalweb: phosphor shell v2.5.0"
    git branch -M main
    git remote add origin https://github.com/<you>/Terminalweb.git
    git pull origin main --allow-unrelated-histories
    git push -u origin main

If the pull stops with "CONFLICT (add/add): Merge conflict in README.md":

    git checkout --ours README.md LICENSE
    git add .
    git commit -m "merge github seed files"
    git push -u origin main

## Why GitHub showed only README + LICENSE

Those are GitHub's own new-repo seed files. A push from an unrelated local
history is rejected until you merge them in (--allow-unrelated-histories),
or you delete them in the web UI first (Path A does that).

Be kind to your phosphors. — twsh
`;

export async function buildRepoZipBlob(): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const files = flatten();
  files.forEach(([p, c]) => zip.file(p, c));
  zip.file("PUSH_TO_GITHUB.md", PUSH_MD);
  return zip.generateAsync({ type: "blob" });
}

/** Packs the repo and triggers a browser download. Returns the file count. */
export async function downloadRepoZip(): Promise<number> {
  const count = flatten().length + 1;
  const blob = await buildRepoZipBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "terminalweb-repo.zip";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return count;
}
