"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportViewerProps {
  filename: string;
}

export function ReportViewer({ filename }: ReportViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative h-[calc(100vh-10rem)] w-full">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col gap-4 p-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}
      <iframe
        src={`/api/reports/${filename}`}
        className="h-full w-full rounded-md border"
        sandbox="allow-same-origin allow-scripts"
        onLoad={() => setIsLoading(false)}
        title={filename}
      />
    </div>
  );
}
