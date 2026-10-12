"use client";

import { useActionState } from "react";

import { createTicketAction } from "@/app/actions";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
} from "@/lib/types";

const inputClass =
  "w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-50";

export function CreateTicketForm() {
  const [state, formAction, isPending] = useActionState(createTicketAction, {
    error: null,
    key: 0,
  });

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        New ticket
      </h2>
      <form action={formAction} className="flex flex-col gap-3">
        <div key={state.key} className="flex flex-col gap-3">
          <input
            className={inputClass}
            name="title"
            placeholder="Title"
            required
            maxLength={20}
          />
          <input
            className={inputClass}
            name="description"
            placeholder="Description (optional)"
            maxLength={80}
          />
          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Priority
              <select name="priority" className={inputClass} defaultValue="medium">
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Status
              <select name="status" className={inputClass} defaultValue="open">
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isPending ? "Creating…" : "Create Ticket"}
          </button>
          {state.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
          )}
        </div>
      </form>
    </section>
  );
}