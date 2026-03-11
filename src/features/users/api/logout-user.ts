"use server"

import { cookies } from "next/headers";
import type { ServerActionResult } from "@/lib/server-action";

export async function logoutUser(): Promise<ServerActionResult> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  cookieStore.delete("userId");
  return { success: true };
}

