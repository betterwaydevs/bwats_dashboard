"use client";

import { useState, useMemo } from "react";
import { useBacklog } from "@/hooks/useBacklog";
import { Header } from "@/components/layout/Header";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { PrioritySection } from "@/components/dashboard/PrioritySection";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BacklogTask, Priority } from "@/lib/types";

const PRIORITY_ORDER: Priority[] = [
  "high",
  "medium",
  "low",
  "quick-fix",
  "intern",
  "completed",
];

const PRIORITY_LABELS: Record<Priority, string> = {
  high: "Active / High Priority",
  medium: "Medium Priority",
  low: "Low Priority / Future",
  "quick-fix": "Quick Fixes",
  intern: "Delegated to Intern",
  completed: "Completed",
};

export default function DashboardPage() {
  const { tasks, loading, error } = useBacklog();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      return true;
    });
  }, [tasks, statusFilter, typeFilter]);

  const tasksByPriority = useMemo(() => {
    const grouped: Record<string, BacklogTask[]> = {};
    for (const priority of PRIORITY_ORDER) {
      const priorityTasks = filteredTasks.filter(
        (t) => t.priority === priority
      );
      if (priorityTasks.length > 0) {
        grouped[priority] = priorityTasks;
      }
    }
    return grouped;
  }, [filteredTasks]);

  const uniqueStatuses = useMemo(
    () => [...new Set(tasks.map((t) => t.status))],
    [tasks]
  );
  const uniqueTypes = useMemo(
    () => [...new Set(tasks.map((t) => t.type).filter(Boolean))],
    [tasks]
  );

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
      <Header
        title="Dashboard"
        subtitle={`${tasks.length} tasks tracked`}
      />

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <>
          <StatsBar tasks={tasks} />

          <div className="flex flex-wrap gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {uniqueStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    <StatusBadge status={s} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {Object.entries(tasksByPriority).map(([priority, priorityTasks]) => (
            <PrioritySection
              key={priority}
              priority={PRIORITY_LABELS[priority as Priority] || priority}
              tasks={priorityTasks}
              defaultOpen={priority !== "completed" && priority !== "intern"}
            />
          ))}
        </>
      )}
    </div>
  );
}
