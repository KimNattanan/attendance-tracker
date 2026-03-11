"use server"

import { prisma } from "@/lib/prisma";
import type { Location } from "@/lib/utils";
import { calculateLocationDistance } from "@/lib/utils";

type TimeRange = {
  start?: Date;
  end?: Date;
};

type FindAttendancesWithFiltersInput = {
  userId: string;
  location?: Location;
  timeRange: TimeRange;
};

export async function findAttendancesWithFilters({
  userId,
  location,
  timeRange,
}: FindAttendancesWithFiltersInput){
  const attendances = await prisma.attendance.findMany({
    where: {
      userId,
      createdAt: {
        gte: timeRange.start,
        lte: timeRange.end,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if(!location) return attendances;

  return attendances.filter((attendance) => {
    const distance = calculateLocationDistance(
      location.lat,
      location.lng,
      attendance.latitude,
      attendance.longitude,
    );

    return distance <= 200;
  });
}
