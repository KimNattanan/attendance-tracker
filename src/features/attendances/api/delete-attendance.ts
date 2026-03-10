import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function deleteAttendance(attendanceId: number) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await prisma.attendance.delete({
    where: { id: attendanceId, userId: userId },
  });
}

