"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ScreenshotFile } from "@/lib/types";

interface ScreenshotGalleryProps {
  screenshots: ScreenshotFile[];
}

export function ScreenshotGallery({ screenshots }: ScreenshotGalleryProps) {
  const [selected, setSelected] = useState<ScreenshotFile | null>(null);

  if (screenshots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No screenshots found.</p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {screenshots.map((screenshot) => (
          <button
            key={screenshot.filename}
            onClick={() => setSelected(screenshot)}
            className="group relative overflow-hidden rounded-lg border bg-muted transition-colors hover:border-primary/50"
          >
            <img
              src={screenshot.url}
              alt={screenshot.filename}
              className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
              <span className="text-[10px] text-white line-clamp-1">
                {screenshot.filename}
              </span>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-4xl p-2">
          <DialogTitle className="sr-only">
            {selected?.filename ?? "Screenshot"}
          </DialogTitle>
          {selected && (
            <div className="flex flex-col gap-2">
              <img
                src={selected.url}
                alt={selected.filename}
                className="max-h-[80vh] w-full rounded-md object-contain"
              />
              <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
                <span>{selected.filename}</span>
                <span>
                  {new Date(selected.modified).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
