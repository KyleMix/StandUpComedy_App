import { promises as fs } from "node:fs";
import path from "node:path";
import { cleanupSnapshot } from "@/lib/maintenance/cleanup";

async function main() {
  const { report } = await cleanupSnapshot();
  const reportLines: string[] = [];
  reportLines.push("# Cleanup Report");
  reportLines.push("");
  reportLines.push(`Generated At: ${report.generatedAt}`);
  reportLines.push("");
  reportLines.push("## Whitelist Emails");
  for (const email of report.whitelist) {
    reportLines.push(`- ${email}`);
  }
  reportLines.push("");
  reportLines.push("## Collection Summary");
  reportLines.push("| Collection | Kept | Removed |");
  reportLines.push("| --- | ---: | ---: |");
  const sortedKeys = Object.keys(report.collections).sort();
  for (const key of sortedKeys) {
    const { kept, removed } = report.collections[key];
    reportLines.push(`| ${key} | ${kept} | ${removed} |`);
  }
  reportLines.push("");
  if (report.scrubbedAdSlotEmails.length > 0) {
    reportLines.push("## Scrubbed Ad Slot Emails");
    for (const email of report.scrubbedAdSlotEmails) {
      reportLines.push(`- ${email}`);
    }
    reportLines.push("");
  }

  const docsDir = path.join(process.cwd(), "docs", "cleanup");
  await fs.mkdir(docsDir, { recursive: true });
  const reportPath = path.join(docsDir, "cleanup-report.md");
  await fs.writeFile(reportPath, reportLines.join("\n"));
  console.log(`Cleanup complete. Report written to ${reportPath}`);
}

main().catch((error) => {
  console.error("Cleanup failed", error);
  process.exit(1);
});
