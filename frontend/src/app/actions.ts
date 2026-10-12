"use server";

import { refresh } from "next/cache";

import { createTicket, updateTicketStatus } from "@/lib/api";
import type { TicketPriority, TicketStatus } from "@/lib/types";

export interface CreateTicketState {
  error: string | null;
  key: number;
}

export async function createTicketAction(
  prev: CreateTicketState,
  formData: FormData,
): Promise<CreateTicketState> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "") as TicketStatus;
  const priority = String(formData.get("priority") ?? "") as TicketPriority;

  try {
    await createTicket({ title, description, status, priority });
  } catch (err) {
    return {
      ...prev,
      error: err instanceof Error ? err.message : "Failed to create ticket",
    };
  }

  refresh();
  return { error: null, key: prev.key + 1 };
}

export type UpdateTicketStatusResult = {
  success: boolean;
  error?: string;
};

export async function updateTicketStatusAction(
  id: string,
  status: TicketStatus,
): Promise<UpdateTicketStatusResult> {
  try {
    await updateTicketStatus(id, status);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update status",
    };
  }

  refresh();
  return { success: true };
}