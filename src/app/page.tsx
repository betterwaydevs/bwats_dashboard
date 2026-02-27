"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useBacklog } from "@/hooks/useBacklog";
import { Header } from "@/components/layout/Header";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { TypeBadge } from "@/components/dashboard/TypeBadge";
import { MiniPipeline } from "@/components/task-detail/DeliveryPipeline";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import type { BacklogTask, DeliveryStage } from "@/lib/types";

const AGENT_MAP: Record<string, { label: string; color: string }[]> = {
  BACK: [{ label: "backend-developer", color: "bg-purple-500" }],
  FRONT: [{ label: "frontend-developer", color: "bg-cyan-500" }],
  BOTH: [
    { label: "backend-developer", color: "bg-purple-500" },
    { label: "frontend-developer", color: "bg-cyan-500" },
  ],
  EXT: [{ label: "chrome-ext-developer", color: "bg-orange-500" }],
  TEST: [{ label: "qa-tester", color: "bg-pink-500" }],
  "FRONT/INFRA": [{ label: "frontend-developer", color: "bg-cyan-500" }],
};

function TaskRow({
  task,
  deliveryStages,
}: {
  task: BacklogTask;
  deliveryStages?: DeliveryStage[];
}) {
  const agents = AGENT_MAP[task.type] || [];

  return (
    <Link href={`/tasks/${task.id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="flex items-center gap-4 py-3 px-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-muted-foreground">
                {task.id}
              </span>
              <StatusBadge status={task.status} />
              <TypeBadge type={task.type} />
              {deliveryStages && deliveryStages.length > 0 && (
                <MiniPipeline stages={deliveryStages} />
              )}
            </div>
            <p className="mt-1 font-medium truncate">{task.title}</p>
            {agents.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {agents.map((agent) => (
                  <div
                    key={agent.label}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <span
                      className={`size-2 rounded-full ${agent.color}`}
                    />
                    {agent.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}

function StatusSection({
  title,
  icon: Icon,
  tasks,
  deliveries,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ElementType;
  tasks: BacklogTask[];
  deliveries: Record<string, DeliveryStage[]>;
  defaultOpen?: boolean;
}) {
  if (tasks.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="size-5" />
        <h2 className="text-lg font-semibold">{title}</h2>
        <Badge variant="secondary" className="ml-1">
          {tasks.length}
        </Badge>
      </div>
      <div className="space-y-2">
        {(defaultOpen ? tasks : tasks.slice(0, 5)).map((task) => (
          <TaskRow
            key={`${task.id}-${task.title}`}
            task={task}
            deliveryStages={deliveries[task.id]}
          />
        ))}
        {!defaultOpen && tasks.length > 5 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            +{tasks.length - 5} more
          </p>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { tasks, loading, error } = useBacklog();
  const [deliveries, setDeliveries] = useState<Record<string, DeliveryStage[]>>({});

  useEffect(() => {
    async function fetchDeliveries() {
      try {
        const res = await fetch("/api/delivery");
        if (res.ok) {
          const data = await res.json();
          setDeliveries(data);
        }
      } catch {
        // Silently fail — delivery dots are optional
      }
    }
    fetchDeliveries();
  }, []);

  const { inProgress, done, pending, blocked } = useMemo(() => {
    const inProgress: BacklogTask[] = [];
    const done: BacklogTask[] = [];
    const pending: BacklogTask[] = [];
    const blocked: BacklogTask[] = [];

    for (const t of tasks) {
      switch (t.status) {
        case "in-progress":
          inProgress.push(t);
          break;
        case "done":
          done.push(t);
          break;
        case "blocked":
          blocked.push(t);
          break;
        default:
          pending.push(t);
      }
    }
    return { inProgress, done, pending, blocked };
  }, [tasks]);

  if (error) {
    return (
      <div className="p-6">
        <Header title="Dashboard" />
        <div className="mt-8 text-center text-destructive">
          Failed to load backlog: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Header title="Dashboard" subtitle={`${tasks.length} tasks tracked`} />

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <>
          <StatsBar tasks={tasks} />

          <StatusSection
            title="In Progress"
            icon={Clock}
            tasks={inProgress}
            deliveries={deliveries}
          />

          {blocked.length > 0 && (
            <StatusSection
              title="Blocked"
              icon={AlertCircle}
              tasks={blocked}
              deliveries={deliveries}
            />
          )}

          <Separator />

          <StatusSection
            title="Completed"
            icon={CheckCircle2}
            tasks={done}
            deliveries={deliveries}
            defaultOpen={false}
          />

          <StatusSection
            title="Pending"
            icon={FileText}
            tasks={pending}
            deliveries={deliveries}
            defaultOpen={false}
          />
        </>
      )}
    </div>
  );
}
