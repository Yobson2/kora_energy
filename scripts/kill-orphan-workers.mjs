// Kills Turbopack workers left behind by a dev server that died abruptly.
// On Windows, killing `next dev` does not kill its `.next/dev/build/*.js` workers;
// they pile up across restarts until the page file is exhausted and every new
// node process dies with "Fatal JavaScript out of memory". Runs as `predev`.
// Workers whose parent is still alive belong to a running server and are kept.
import { execFileSync } from "node:child_process";
import path from "node:path";

if (process.platform !== "win32") process.exit(0);

const marker = path.join(process.cwd(), ".next", "dev", "build").toLowerCase();

let processes;
try {
  const json = execFileSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,Name,CommandLine | ConvertTo-Json -Compress",
    ],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, windowsHide: true }
  );
  processes = [].concat(JSON.parse(json));
} catch {
  process.exit(0); // never block `npm run dev` on the cleanup itself
}

const alive = new Set(processes.map((p) => p.ProcessId));
const orphans = processes.filter(
  (p) =>
    p.Name === "node.exe" &&
    p.CommandLine?.toLowerCase().includes(marker) &&
    !alive.has(p.ParentProcessId)
);

for (const { ProcessId } of orphans) {
  try {
    process.kill(ProcessId);
  } catch {
    // already gone
  }
}
if (orphans.length > 0) {
  console.log(`Killed ${orphans.length} orphaned Turbopack worker(s) from a previous dev server.`);
}
