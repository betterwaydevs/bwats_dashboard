import { NextResponse } from "next/server";
import fs from "fs";
import { REPORTS_DIR } from "@/lib/config";
import type { ReportFile } from "@/lib/types";

function humanizeFilename(filename: string): string {
  return filename
    .replace(/\.html$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function GET() {
  try {
    if (!fs.existsSync(REPORTS_DIR)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(REPORTS_DIR).filter((f) => f.endsWith(".html"));

    const reports: ReportFile[] = files.map((filename) => {
      const filePath = `${REPORTS_DIR}/${filename}`;
      const stats = fs.statSync(filePath);
      return {
        filename,
        title: humanizeFilename(filename),
        size: stats.size,
        modified: stats.mtime.toISOString(),
      };
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Failed to list reports:", error);
    return NextResponse.json(
      { error: "Failed to list reports" },
      { status: 500 }
    );
  }
}
