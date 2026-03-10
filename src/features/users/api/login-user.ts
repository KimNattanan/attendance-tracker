import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function loginUser(faceId: string) {
  if (!faceId) {
    throw new Error("faceId is required");
  }

  const user =
    (await prisma.user.findFirst({
      where: { faceId },
    })) ??
    (await prisma.user.create({
      data: { faceId },
    }));

  const cookieStore = await cookies();

  cookieStore.set("userId", user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 3, // 3 days
  });

  return user;
}

