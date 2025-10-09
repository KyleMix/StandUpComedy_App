import { promises as fs } from "node:fs";
import path from "node:path";
import execa from "execa";

interface TsPruneIssue {
  file: string;
  exportName: string;
}

interface AnalyzerSummary {
  knipFiles: string[];
  tsPrune: TsPruneIssue[];
  depcheckUnusedDeps: string[];
  depcheckUnusedDevDeps: string[];
}

const ROOT = process.cwd();
const CLEANUP_DIR = path.join(ROOT, "docs", "cleanup");

const PROTECTED_PREFIXES = [
  "app/",
  "pages/",
  "lib/dataStore",
  "lib/maintenance",
  "lib/auth",
  "lib/rbac",
  "lib/zodSchemas",
  "scripts/",
  "prisma/",
  "public/",
  "docs/",
];

const PROTECTED_FILES = new Set([
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "tailwind.config.ts",
  "postcss.config.js",
  "tsconfig.json",
  "eslint.config.js",
  ".eslintrc.js",
  "prettier.config.js",
  "package.json",
]);

const PROTECTED_DEPENDENCIES = new Set<string>([
  "next",
  "react",
  "react-dom",
  "typescript",
  "ts-prune",
  "depcheck",
  "knip",
  "execa",
  "postcss",
  "dotenv",
]);

const PACKAGE_JSON_PATH = path.join(ROOT, "package.json");

const normalizePath = (value: string): string => value.replace(/\\/g, "/").replace(/^\.\//, "");

function isProtectedFile(filePath: string): boolean {
  const normalized = normalizePath(filePath);
  if (PROTECTED_FILES.has(normalized)) {
    return true;
  }
  return PROTECTED_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

async function ensureCleanupDir(): Promise<void> {
  await fs.mkdir(CLEANUP_DIR, { recursive: true });
}

async function runKnip(): Promise<string[]> {
  try {
    const { stdout } = await execa("knip", ["--reporter", "json"], { cwd: ROOT });
    const data = JSON.parse(stdout) as { files?: string[] };
    return (data.files ?? []).map(normalizePath);
  } catch (error) {
    if (typeof error === "object" && error !== null && "stdout" in error) {
      try {
        const parsed = JSON.parse((error as { stdout?: string }).stdout ?? "") as { files?: string[] };
        return (parsed.files ?? []).map(normalizePath);
      } catch (parseError) {
        console.warn("Failed to parse knip output", parseError);
        return [];
      }
    }
    throw error;
  }
}

async function runTsPrune(): Promise<TsPruneIssue[]> {
  const { stdout } = await execa("ts-prune", ["--ignore", ".*\\.test\\.tsx?"], { cwd: ROOT });
  const lines = stdout.split("\n").map((line) => line.trim()).filter(Boolean);
  const issues: TsPruneIssue[] = [];
  for (const line of lines) {
    const match = line.match(/^(.*?):(\d+) - (.*)$/);
    if (!match) continue;
    const [, file, , exportNameRaw] = match;
    const exportName = exportNameRaw.trim();
    issues.push({ file: normalizePath(file), exportName });
  }
  return issues;
}

async function runDepcheck(): Promise<{ unusedDeps: string[]; unusedDevDeps: string[] }> {
  try {
    const { stdout } = await execa("depcheck", ["--json", "--ignore-bin-package=true"], { cwd: ROOT });
    const data = JSON.parse(stdout) as {
      dependencies?: string[];
      devDependencies?: string[];
    };
    return {
      unusedDeps: data.dependencies ?? [],
      unusedDevDeps: data.devDependencies ?? [],
    };
  } catch (error) {
    if (typeof error === "object" && error !== null && "stdout" in error) {
      try {
        const parsed = JSON.parse((error as { stdout?: string }).stdout ?? "") as {
          dependencies?: string[];
          devDependencies?: string[];
        };
        return {
          unusedDeps: parsed.dependencies ?? [],
          unusedDevDeps: parsed.devDependencies ?? [],
        };
      } catch (parseError) {
        console.warn("Failed to parse depcheck output", parseError);
      }
    }
    throw error;
  }
}

async function removeFiles(files: string[]): Promise<string[]> {
  const removed: string[] = [];
  for (const relative of files) {
    if (isProtectedFile(relative)) continue;
    const absolute = path.join(ROOT, relative);
    try {
      await fs.rm(absolute, { recursive: true, force: true });
      removed.push(relative);
    } catch (error) {
      console.warn(`Unable to remove ${relative}:`, error);
    }
  }
  return removed;
}

async function removeDependencies(
  deps: string[],
  section: "dependencies" | "devDependencies",
  packageJson: Record<string, any>
): Promise<string[]> {
  const removed: string[] = [];
  if (!Array.isArray(deps) || deps.length === 0) {
    return removed;
  }
  const target = packageJson[section] ?? {};
  for (const dep of deps) {
    if (PROTECTED_DEPENDENCIES.has(dep)) continue;
    if (target && Object.prototype.hasOwnProperty.call(target, dep)) {
      delete target[dep];
      removed.push(dep);
    }
  }
  if (removed.length > 0) {
    packageJson[section] = target;
  }
  return removed;
}

function summarizeIssues(summary: AnalyzerSummary): string {
  const lines: string[] = [];
  lines.push("# Analyzer Summary");
  lines.push("");
  lines.push(`- Knip unused files: ${summary.knipFiles.length}`);
  lines.push(`- ts-prune unused exports: ${summary.tsPrune.length}`);
  lines.push(
    `- depcheck unused dependencies: ${summary.depcheckUnusedDeps.length} (runtime), ${summary.depcheckUnusedDevDeps.length} (dev)`
  );
  lines.push("");
  return lines.join("\n");
}

async function writeFileLog(removed: string[], summary: AnalyzerSummary, protectedFlagged: string[]): Promise<void> {
  const lines: string[] = [];
  lines.push("# Removed Files");
  lines.push("");
  lines.push(`Generated at: ${new Date().toISOString()}`);
  lines.push("");
  lines.push(summarizeIssues(summary));
  lines.push("## Deleted Files");
  if (removed.length === 0) {
    lines.push("- None");
  } else {
    for (const file of removed) {
      lines.push(`- ${file}`);
    }
  }
  lines.push("");
  lines.push("## Protected Files Flagged by Analyzers");
  if (protectedFlagged.length === 0) {
    lines.push("- None");
  } else {
    for (const file of protectedFlagged) {
      lines.push(`- ${file}`);
    }
  }
  lines.push("");
  const exportNotes = summary.tsPrune
    .filter((issue) => !removed.includes(issue.file))
    .map((issue) => `- ${issue.file}: ${issue.exportName}`);
  lines.push("## Remaining Unused Exports (manual review)");
  if (exportNotes.length === 0) {
    lines.push("- None");
  } else {
    lines.push(...exportNotes);
  }
  lines.push("");
  await fs.writeFile(path.join(CLEANUP_DIR, "removed_files.md"), lines.join("\n"));
}

async function writeDependencyLog(removedDeps: string[], removedDevDeps: string[], summary: AnalyzerSummary): Promise<void> {
  const lines: string[] = [];
  lines.push("# Removed Dependencies");
  lines.push("");
  lines.push(`Generated at: ${new Date().toISOString()}`);
  lines.push("");
  lines.push(summarizeIssues(summary));
  lines.push("## Runtime Dependencies");
  if (removedDeps.length === 0) {
    lines.push("- None");
  } else {
    for (const dep of removedDeps) {
      lines.push(`- ${dep}`);
    }
  }
  lines.push("");
  lines.push("## Dev Dependencies");
  if (removedDevDeps.length === 0) {
    lines.push("- None");
  } else {
    for (const dep of removedDevDeps) {
      lines.push(`- ${dep}`);
    }
  }
  lines.push("");
  await fs.writeFile(path.join(CLEANUP_DIR, "removed_deps.md"), lines.join("\n"));
}

async function main(): Promise<void> {
  await ensureCleanupDir();

  const [knipFiles, tsPruneIssues, depcheckResult] = await Promise.all([
    runKnip(),
    runTsPrune(),
    runDepcheck(),
  ]);

  const tsPruneFiles = new Set(tsPruneIssues.map((issue) => issue.file));
  const removableCandidates = knipFiles.filter((file) => tsPruneFiles.has(file));
  const protectedFlagged = removableCandidates.filter((file) => isProtectedFile(file));
  const removable = removableCandidates.filter((file) => !isProtectedFile(file));

  const removedFiles = await removeFiles(removable);

  const pkgRaw = await fs.readFile(PACKAGE_JSON_PATH, "utf8");
  const packageJson = JSON.parse(pkgRaw) as Record<string, any>;

  const removedDeps = await removeDependencies(depcheckResult.unusedDeps, "dependencies", packageJson);
  const removedDevDeps = await removeDependencies(depcheckResult.unusedDevDeps, "devDependencies", packageJson);

  if (removedDeps.length > 0 || removedDevDeps.length > 0) {
    await fs.writeFile(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2));
    console.log("Reinstalling dependencies to update lockfile...");
    await execa("npm", ["install"], { cwd: ROOT, stdio: "inherit" });
  }

  const summary: AnalyzerSummary = {
    knipFiles,
    tsPrune: tsPruneIssues,
    depcheckUnusedDeps: depcheckResult.unusedDeps,
    depcheckUnusedDevDeps: depcheckResult.unusedDevDeps,
  };

  await writeFileLog(removedFiles, summary, protectedFlagged);
  await writeDependencyLog(removedDeps, removedDevDeps, summary);

  console.log("Analysis complete.");
  if (removedFiles.length > 0) {
    console.log(`Removed files: ${removedFiles.join(", ")}`);
  }
  if (removedDeps.length > 0 || removedDevDeps.length > 0) {
    console.log(
      `Removed dependencies: ${[...removedDeps, ...removedDevDeps].join(", ") || "none"}`
    );
  }
}

main().catch((error) => {
  console.error("Analyzer run failed", error);
  process.exit(1);
});
