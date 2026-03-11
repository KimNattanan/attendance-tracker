"use server"

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { ServerActionResult } from "@/lib/server-action";

export async function deleteUser(): Promise<ServerActionResult> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  cookieStore.delete("userId");
  return { success: true };
}

