"use client";

import { use } from "react";
import { Header } from "@/components/layout/Header";
import { ReportViewer } from "@/components/reports/ReportViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ReportViewPage({
  params,
}: {
  params: Promise<{ filename: string }>;
}) {
  const { filename } = use(params);

  const title = decodeURIComponent(filename)
    .replace(/\.html$/, "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="p-4 md:p-6 space-y-4 h-full flex flex-col">
      <Header
        title={title}
        actions={
          <Link href="/reports">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        }
      />
      <div className="flex-1 min-h-0">
        <ReportViewer filename={decodeURIComponent(filename)} />
      </div>
    </div>
  );
}
