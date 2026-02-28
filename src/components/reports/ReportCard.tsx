import Link from "next/link";
import { FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReportFile } from "@/lib/types";

interface ReportCardProps {
  report: ReportFile;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function ReportCard({ report }: ReportCardProps) {
  return (
    <Link href={`/reports/${report.path}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardHeader className="flex flex-row items-center gap-3 px-4 pb-2">
          <FileText className="size-8 shrink-0 text-muted-foreground" />
          <CardTitle className="text-sm leading-snug line-clamp-2">
            <span className="text-muted-foreground">{report.taskId}</span>{" "}
            {report.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatBytes(report.size)}</span>
            <span>
              {new Date(report.modified).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
