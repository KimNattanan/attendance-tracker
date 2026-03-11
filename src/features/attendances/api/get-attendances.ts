"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Position } from "@/components/MapPicker";

type TimeRange = {
  start?: Date;
  end?: Date;
};

type FindAttendancesWithFiltersInput = {
  userId: string;
  position?: Position;
  timeRange: TimeRange;
};

const EARTH_RADIUS_METERS = 6371000;

function toRadians(deg: number) {
  return (deg * Math.PI) / 180;
}

function distanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

export async function findAttendancesWithFilters({
  userId,
  position,
  timeRange,
}: FindAttendancesWithFiltersInput) {
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

  if(!position) return attendances;

  return attendances.filter((attendance) => {
    const distance = distanceInMeters(
      position.lat,
      position.lng,
      attendance.latitude,
      attendance.longitude,
    );

    return distance <= 200;
  });
}

// export async function findCurrentUserAttendances(timeRange?: TimeRange) {
//   const cookieStore = await cookies();
//   const userId = cookieStore.get("userId")?.value;

//   if (!userId) {
//     throw new Error("Unauthorized");
//   }

//   const where: NonNullable<
//     Parameters<typeof prisma.attendance.findMany>[0]
//   >["where"] = {
//     userId,
//   };

//   if (timeRange) {
//     where.createdAt = {
//       gte: timeRange.start,
//       lte: timeRange.end,
//     };
//   }

//   const attendances = await prisma.attendance.findMany({
//     where: where,
//     orderBy: {
//       createdAt: "desc",
//     },
//   });

//   return attendances;
// }

