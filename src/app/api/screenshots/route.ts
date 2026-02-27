import { NextResponse } from "next/server";
import fs from "fs";
import { SCREENSHOTS_DIR } from "@/lib/config";
import type { ScreenshotFile } from "@/lib/types";

export async function GET() {
  try {
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
      return NextResponse.json([]);
    }

    const files = fs
      .readdirSync(SCREENSHOTS_DIR)
      .filter((f) => f.endsWith(".png"));

    const screenshots: ScreenshotFile[] = files.map((filename) => {
      const filePath = `${SCREENSHOTS_DIR}/${filename}`;
      const stats = fs.statSync(filePath);
      return {
        filename,
        url: `/api/screenshots/${encodeURIComponent(filename)}`,
        modified: stats.mtime.toISOString(),
      };
    });

    return NextResponse.json(screenshots);
  } catch (error) {
    console.error("Failed to list screenshots:", error);
    return NextResponse.json(
      { error: "Failed to list screenshots" },
      { status: 500 }
    );
  }
}
