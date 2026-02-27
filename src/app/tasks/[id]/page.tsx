"use client";

import { use } from "react";
import Link from "next/link";
import { useBacklog } from "@/hooks/useBacklog";
import { useSpec } from "@/hooks/useSpec";
import { useProgress } from "@/hooks/useProgress";
import { Header } from "@/components/layout/Header";
import { TaskHeader } from "@/components/task-detail/TaskHeader";
import { SpecViewer } from "@/components/task-detail/SpecViewer";
import { ProgressTimeline } from "@/components/task-detail/ProgressTimeline";
import { ChecklistProgress } from "@/components/task-detail/ChecklistProgress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil } from "lucide-react";

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { tasks, loading: backlogLoading } = useBacklog();
  const { spec, loading: specLoading } = useSpec(id);
  const { progress, loading: progressLoading } = useProgress(id);

  const task = tasks.find((t) => t.id === id);
  const loading = backlogLoading || specLoading || progressLoading;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Header
        title={task ? `${task.id}: ${task.title}` : id}
        actions={
          spec && (
            <Link href={`/tasks/${id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit Spec
              </Button>
            </Link>
          )
        }
      />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <>
          {task && <TaskHeader task={task} spec={spec ?? undefined} />}

          {spec && spec.checkboxes.total > 0 && (
            <ChecklistProgress
              total={spec.checkboxes.total}
              checked={spec.checkboxes.checked}
            />
          )}

          <Tabs defaultValue="spec" className="w-full">
            <TabsList>
              <TabsTrigger value="spec">Spec</TabsTrigger>
              <TabsTrigger value="progress">
                Progress
                {progress && ` (${progress.sessions.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="spec" className="mt-4">
              {spec ? (
                <SpecViewer htmlContent={spec.htmlContent} />
              ) : (
                <div className="text-muted-foreground text-center py-12">
                  No spec file found for {id}
                </div>
              )}
            </TabsContent>

            <TabsContent value="progress" className="mt-4">
              {progress ? (
                <ProgressTimeline sessions={progress.sessions} />
              ) : (
                <div className="text-muted-foreground text-center py-12">
                  No progress log yet for {id}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
