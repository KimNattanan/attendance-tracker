"use server"
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { findMatchUserFace } from "@/lib/utils";

export async function loginUser(faceId: Float32Array<ArrayBufferLike>) {
  if (!faceId) {
    throw new Error("faceId is required");
  }
  const faceIdJson = JSON.stringify(Array.from(faceId));

  const users = await prisma.user.findMany({
    select: { id: true, faceId: true },
  });

  let best = findMatchUserFace(users, faceId)

  if (!best) {
    const user = await prisma.user.create({
      data: {
        faceId: faceIdJson,
      }
    });
    best = { id: user.id, distance: 0 }
  }

  const cookieStore = await cookies();
  cookieStore.set("userId", best.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 3, // 3 days
  });

  return { id: best.id, faceId: faceIdJson };
}

