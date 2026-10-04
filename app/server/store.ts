import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Lead, Project } from "@/app/lib/domain";
import { seedLeads, seedProjects } from "@/app/server/seed";

/**
 * Persistence boundary.
 *
 * Everything above this file talks to the `Store` interface, never to a file
 * or a driver. The shipped adapter keeps the whole dataset in one JSON
 * document  fine for a concept with hundreds of rows, trivial to run anywhere,
 * and honest about what it is. The production swap is a Postgres adapter
 * implementing the same interface (schema in docs/schema.sql); no route,
 * page or component changes when that happens.
 *
 * Adapter selection, by KORA_STORE:
 *   file    (default) .data/kora.json, atomic writes, serialised
 *   memory  per-process, resets on restart  for read-only hosts and demos
 */

export type Dataset = {
  version: 1;
  leads: Lead[];
  projects: Project[];
};

export interface Store {
  read(): Promise<Dataset>;
  /** Applies `mutate` to the latest dataset and persists it, serialised. */
  update<T>(mutate: (data: Dataset) => T): Promise<T>;
}

function seed(): Dataset {
  return { version: 1, leads: seedLeads(), projects: seedProjects() };
}

/**
 * Mutations run one at a time through a promise chain, so two submissions
 * arriving together can never interleave a read-modify-write and lose one.
 */
class Serial {
  private tail: Promise<unknown> = Promise.resolve();
  run<T>(task: () => Promise<T>): Promise<T> {
    const next = this.tail.then(task, task);
    this.tail = next.catch(() => undefined);
    return next;
  }
}

class MemoryStore implements Store {
  private data: Dataset = seed();
  private serial = new Serial();

  async read() {
    return structuredClone(this.data);
  }

  update<T>(mutate: (data: Dataset) => T) {
    return this.serial.run(async () => {
      const draft = structuredClone(this.data);
      const result = mutate(draft);
      this.data = draft;
      return result;
    });
  }
}

class JsonFileStore implements Store {
  private serial = new Serial();
  constructor(private readonly file: string) {}

  async read(): Promise<Dataset> {
    try {
      return JSON.parse(await readFile(this.file, "utf8")) as Dataset;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const initial = seed();
      await this.write(initial);
      return initial;
    }
  }

  update<T>(mutate: (data: Dataset) => T) {
    return this.serial.run(async () => {
      const draft = await this.read();
      const result = mutate(draft);
      await this.write(draft);
      return result;
    });
  }

  /** Write-then-rename, so a crash mid-write never leaves half a file. */
  private async write(data: Dataset) {
    await mkdir(path.dirname(this.file), { recursive: true });
    const temp = `${this.file}.${process.pid}.tmp`;
    await writeFile(temp, JSON.stringify(data, null, 2), "utf8");
    await renameWithRetry(temp, this.file);
  }
}

/**
 * On Windows, replacing a file fails with EPERM/EBUSY while another request
 * has it open for reading (reads are not serialised, only writes are). The
 * window is milliseconds, so a short backoff resolves it  the same strategy
 * graceful-fs uses. Any other error, or a lock that outlasts the retries, is
 * thrown as usual.
 */
async function renameWithRetry(from: string, to: string, attempts = 8) {
  for (let attempt = 1; ; attempt++) {
    try {
      await rename(from, to);
      return;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (attempt >= attempts || (code !== "EPERM" && code !== "EBUSY" && code !== "EACCES"))
        throw error;
      await new Promise((resolve) => setTimeout(resolve, 15 * attempt));
    }
  }
}

// One store per server process, kept on globalThis so dev hot-reload does not
// create a second memory store that silently forgets the first one's writes.
const globalStore = globalThis as unknown as { __koraStore?: Store };

export function getStore(): Store {
  if (!globalStore.__koraStore) {
    globalStore.__koraStore =
      process.env.KORA_STORE === "memory"
        ? new MemoryStore()
        : new JsonFileStore(path.join(process.cwd(), ".data", "kora.json"));
  }
  return globalStore.__koraStore;
}
