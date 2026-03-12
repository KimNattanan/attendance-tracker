"use server"

import { prisma } from "@/lib/prisma";
import type { ServerActionResult } from "@/lib/server-action";
import { findMatchUserFace } from "@/lib/utils";

type CreateAttendanceInput = {
  faceId: Float32Array<ArrayBufferLike>;
  latitude: number;
  longitude: number;
  attendanceType: string;
};

export async function createAttendance(
  input: CreateAttendanceInput
): Promise<ServerActionResult<{ id: number; userId: string; type: string; latitude: number; longitude: number; createdAt: Date }>> {
  const { faceId, latitude, longitude, attendanceType } = input;

  if (!faceId) {
    return { success: false, error: "faceId is required" };
  }

  const users = await prisma.user.findMany();
  const best = await findMatchUserFace(users, faceId);

  if (!best) {
    return {
      success: false,
      error: "User not found. Please register if this is your first time.",
    };
  }

  const attendance = await prisma.attendance.create({
    data: {
      userId: best.id,
      latitude,
      longitude,
      type: attendanceType,
    },
  });

  return { success: true, data: attendance };
}

