import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { REPORTS_DIR } from "@/lib/config";
import type { ReportFile } from "@/lib/types";

function humanizeFilename(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function GET() {
  try {
    if (!fs.existsSync(REPORTS_DIR)) {
      return NextResponse.json([]);
    }

    const reports: ReportFile[] = [];

    // Each subdirectory is a task ID
    const entries = fs.readdirSync(REPORTS_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const taskId = entry.name;
      const taskDir = path.join(REPORTS_DIR, taskId);
      const files = fs.readdirSync(taskDir);

      for (const filename of files) {
        // Only list HTML reports, not individual screenshots/assets
        if (!filename.endsWith(".html")) continue;
        const filePath = path.join(taskDir, filename);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) continue;

        reports.push({
          taskId,
          filename,
          title: humanizeFilename(filename),
          size: stat.size,
          modified: stat.mtime.toISOString(),
          path: `${taskId}/${filename}`,
        });
      }
    }

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Failed to list reports:", error);
    return NextResponse.json(
      { error: "Failed to list reports" },
      { status: 500 }
    );
  }
}
