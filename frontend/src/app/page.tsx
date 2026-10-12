import Link from "next/link";

import { Suspense } from "react";

import { CreateTicketForm } from "@/components/create-ticket-form";
import { TicketList } from "@/components/ticket-list";
import { listTickets } from "@/lib/api";

const PAGE_SIZE = 10;

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string }>;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          MiniTracker
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Track tickets, their priority, and status.
        </p>
      </header>
      <CreateTicketForm />
      <Suspense fallback={<TicketsSkeleton />}>
        {searchParams.then((params) => {
          const offset = Math.max(0, Number(params.offset ?? 0) || 0);
          return <Tickets offset={offset} />;
        })}
      </Suspense>
    </div>
  );
}

async function Tickets({ offset }: { offset: number }) {
  const data = await listTickets({ limit: PAGE_SIZE, offset });
  const hasPrevious = offset > 0;
  const hasNext = offset + PAGE_SIZE < data.count;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Tickets
        </h2>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {data.count} total
        </span>
      </div>

      <TicketList tickets={data.results} />

      {data.count > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          {hasPrevious ? (
            <Link
              href={`/?offset=${offset - PAGE_SIZE}`}
              className="rounded-md border border-black/10 px-3 py-1.5 text-sm font-medium dark:border-white/15"
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {offset + 1}–{Math.min(offset + PAGE_SIZE, data.count)} of{" "}
            {data.count}
          </span>
          {hasNext ? (
            <Link
              href={`/?offset=${offset + PAGE_SIZE}`}
              className="rounded-md border border-black/10 px-3 py-1.5 text-sm font-medium dark:border-white/15"
            >
              Next
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </section>
  );
}

function TicketsSkeleton() {
  return (
    <section className="flex flex-col gap-4">
      <div className="h-6 w-36 animate-pulse rounded bg-black/5 dark:bg-white/10" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-lg border border-black/10 bg-white dark:border-white/15 dark:bg-zinc-900"
          />
        ))}
      </div>
    </section>
  );
}