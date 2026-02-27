import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { REPORTS_DIR } from "@/lib/config";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Prevent directory traversal
    const sanitized = path.basename(filename);
    const filePath = path.join(REPORTS_DIR, sanitized);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Report not found: ${sanitized}` },
        { status: 404 }
      );
    }

    const content = fs.readFileSync(filePath);

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/html",
        "Content-Length": content.length.toString(),
      },
    });
  } catch (error) {
    console.error("Failed to serve report:", error);
    return NextResponse.json(
      { error: "Failed to serve report" },
      { status: 500 }
    );
  }
}
