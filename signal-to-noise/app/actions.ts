"use server";

import { revalidatePath } from "next/cache";
import { markArticleRead, markAllRead } from "@/lib/db";

// Server Action: mark a single article as read (e.g. after opening it
// in the reading pane), then refresh the list so it drops off.
export async function markReadAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await markArticleRead(id);
  revalidatePath("/");
}

// Server Action: "Mark All as Read" button. Optionally scoped to the
// currently selected feed so users can clear one source at a time.
export async function markAllReadAction(formData: FormData) {
  const feedIdRaw = formData.get("feedId");
  const feedId = feedIdRaw ? Number(feedIdRaw) : undefined;
  await markAllRead(feedId);
  revalidatePath("/");
}
