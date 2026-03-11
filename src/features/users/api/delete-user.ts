"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function deleteUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  cookieStore.delete("userId");
}

