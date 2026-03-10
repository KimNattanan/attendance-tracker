import { prisma } from "@/lib/prisma";

type CreateAttendanceInput = {
  latitude: number;
  longitude: number;
  faceId: string;
};

export async function createAttendance({
  latitude,
  longitude,
  faceId,
}: CreateAttendanceInput) {
  if (!faceId) {
    throw new Error("faceId is required");
  }

  const user = await prisma.user.findFirst({
    where: { faceId },
  });

  if (!user) {
    throw new Error("User not found. Please register first.");
  }

  const attendance = await prisma.attendance.create({
    data: {
      userId: user.id,
      latitude,
      longtitude: longitude,
    },
  });

  return attendance;
}

