import type {
  Paginated,
  Ticket,
  TicketPriority,
  TicketStatus,
} from "./types";

const BASE = "/tickets";

async function toErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
      if (typeof data.detail === "string") return data.detail;
      const parts = Object.entries(data).map(
        ([field, value]) =>
          `${field}: ${Array.isArray(value) ? value.join(", ") : String(value)}`,
      );
      if (parts.length > 0) return parts.join("; ");
    }
  } catch {
    // fall through to status text
  }
  return res.statusText || `Request failed (${res.status})`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(await toErrorMessage(res));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export interface ListTicketsParams {
  limit?: number;
  offset?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
}

export function listTickets(
  params: ListTicketsParams = {},
): Promise<Paginated<Ticket>> {
  const search = new URLSearchParams();
  search.set("limit", String(params.limit ?? 10));
  search.set("offset", String(params.offset ?? 0));
  if (params.status) search.set("status", params.status);
  if (params.priority) search.set("priority", params.priority);
  return request<Paginated<Ticket>>(`${BASE}/?${search.toString()}`);
}

export interface CreateTicketInput {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
}

export function createTicket(input: CreateTicketInput): Promise<Ticket> {
  return request<Ticket>(`${BASE}/`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateTicketStatus(
  id: string,
  status: TicketStatus,
): Promise<Ticket> {
  return request<Ticket>(`${BASE}/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
