import { PriorityBadge, StatusBadge } from "@/components/badges";
import type { Ticket } from "@/lib/types";

export function TicketList({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-black/10 p-6 text-center text-sm text-zinc-500 dark:border-white/15 dark:text-zinc-400">
        No tickets yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {tickets.map((ticket) => (
        <li
          key={ticket.id}
          className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-zinc-900"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                {ticket.title}
              </h3>
              <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                {ticket.description}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
            Created {new Date(ticket.created_at).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
}