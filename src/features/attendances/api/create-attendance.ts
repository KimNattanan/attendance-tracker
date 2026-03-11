"use server"

import { prisma } from "@/lib/prisma";
import { findMatchUserFace } from "@/lib/utils";

type CreateAttendanceInput = {
  faceId: Float32Array<ArrayBufferLike>;
  latitude: number;
  longitude: number;
  attendanceType: string;
};

export async function createAttendance({
  faceId,
  latitude,
  longitude,
  attendanceType,
}: CreateAttendanceInput){
  if(!faceId){
    throw new Error("faceId is required");
  }

  const users = await prisma.user.findMany();

  const best = findMatchUserFace(users, faceId)

  if(!best){
    throw new Error("User not found. Please register if this is your first time.");
  }

  const attendance = await prisma.attendance.create({
    data: {
      userId: best.id,
      latitude,
      longitude: longitude,
      type: attendanceType,
    },
  });

  return attendance;
}

