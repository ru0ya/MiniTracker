"use client";

import { useOptimistic, useState, useTransition } from "react";

import { updateTicketStatusAction } from "@/app/actions";
import { STATUSES, STATUS_LABELS, type TicketStatus } from "@/lib/types";

export function TicketStatusSelect({
  id,
  status,
}: {
  id: string;
  status: TicketStatus;
}) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(next: TicketStatus) {
    if (next === optimisticStatus) return;
    setError(null);
    startTransition(async () => {
      setOptimisticStatus(next);
      const result = await updateTicketStatusAction(id, next);
      if (!result.success) {
        setError(result.error ?? "Failed to update status");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        aria-label="Ticket status"
        value={optimisticStatus}
        onChange={(event) => handleChange(event.target.value as TicketStatus)}
        className="rounded-md border border-black/10 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50"
      >
        {STATUSES.map((option) => (
          <option key={option} value={option}>
            {STATUS_LABELS[option]}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
      )}
    </div>
  );
}