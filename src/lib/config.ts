import path from "path";

export const FEATURES_DIR =
  process.env.FEATURES_DIR ||
  path.join(process.cwd(), "..", "team", "features");

export const REPORTS_DIR =
  process.env.REPORTS_DIR ||
  path.join(
    process.cwd(),
    "..",
    "nearshore-talent-compass",
    "tests",
    "report"
  );

export const SCREENSHOTS_DIR =
  process.env.SCREENSHOTS_DIR ||
  path.join(
    process.cwd(),
    "..",
    "nearshore-talent-compass",
    "tests",
    "screenshots"
  );

export const PLAYWRIGHT_REPORT_DIR =
  process.env.PLAYWRIGHT_REPORT_DIR ||
  path.join(
    process.cwd(),
    "..",
    "nearshore-talent-compass",
    "playwright-report"
  );

export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
