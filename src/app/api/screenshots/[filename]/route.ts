import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { SCREENSHOTS_DIR } from "@/lib/config";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Prevent directory traversal
    const sanitized = path.basename(filename);
    const filePath = path.join(SCREENSHOTS_DIR, sanitized);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Screenshot not found: ${sanitized}` },
        { status: 404 }
      );
    }

    const content = fs.readFileSync(filePath);

    return new NextResponse(content, {
      headers: {
        "Content-Type": "image/png",
        "Content-Length": content.length.toString(),
      },
    });
  } catch (error) {
    console.error("Failed to serve screenshot:", error);
    return NextResponse.json(
      { error: "Failed to serve screenshot" },
      { status: 500 }
    );
  }
}
