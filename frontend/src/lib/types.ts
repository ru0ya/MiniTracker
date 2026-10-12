export const STATUSES = ["open", "in_progress", "closed"] as const;
export type TicketStatus = (typeof STATUSES)[number];

export const PRIORITIES = ["low", "medium", "high"] as const;
export type TicketPriority = (typeof PRIORITIES)[number];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  closed: "Closed",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
