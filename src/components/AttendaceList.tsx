"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic";
import { findAttendancesWithFilters } from "@/features/attendances/api/get-attendances";
import { formatDateTime } from "@/lib/utils";
import { Button } from "./ui/button";
import { deleteAttendance } from "@/features/attendances/api/delete-attendance";
import type { Position } from "@/components/MapPicker";
import { useAppContext } from "./AppContext";

const LocationMapView = dynamic(
  () => import("@/components/LocationMapView"),
  { ssr: false }
);

const MapPicker = dynamic(
  () => import("@/components/MapPicker"),
  { ssr: false }
);

type Attendance = {
  id: number;
  userId: string;
  type: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
};

function getTypeMeta(type: string) {
  if (type === "check-in") {
    return {
      label: "Check In",
      badgeClass:
        "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200",
      cardClass:
        "border-emerald-200/70 bg-emerald-50/30 hover:bg-emerald-50/50",
    };
  }

  return {
    label: "Check Out",
    badgeClass: "bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-200",
    cardClass: "border-rose-200/70 bg-rose-50/30 hover:bg-rose-50/50",
  };
}

function AttendanceBox({
  data,
  invalidateData,
  onShowMap,
}: {
  data: Attendance;
  invalidateData: () => Promise<void>;
  onShowMap: (data: Attendance) => void;
}) {
  const typeMeta = useMemo(() => getTypeMeta(data.type), [data.type]);
  const { userId } = useAppContext();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteAttendance(data.id);
    await invalidateData();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onShowMap(data)}
      onKeyDown={(e) => e.key === "Enter" && onShowMap(data)}
      className={[
        "cursor-pointer rounded-lg border p-4 transition-colors",
        "shadow-sm hover:shadow",
        typeMeta.cardClass,
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                typeMeta.badgeClass,
              ].join(" ")}
            >
              {typeMeta.label}
            </span>
            <div className="text-sm font-medium text-slate-900">
              {formatDateTime(data.createdAt).join(" ")}
            </div>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-slate-700 sm:grid-cols-2">
            <div className="truncate">
              <span className="text-slate-500">Lat</span>{" "}
              <span className="font-mono">{data.latitude}</span>
            </div>
            <div className="truncate">
              <span className="text-slate-500">Lng</span>{" "}
              <span className="font-mono">{data.longitude}</span>
            </div>
          </div>
        </div>

        {userId === data.userId && (
          <div className="flex shrink-0 items-center justify-end">
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AttendanceList({ userId }:{ userId: string }) {
  const [items, setItems] = useState<Attendance[]>([]);
  const [mapAttendance, setMapAttendance] = useState<Attendance | null>(null);
  const [timeFrom, setTimeFrom] = useState<string>("");
  const [timeTo, setTimeTo] = useState<string>("");
  const [positionFilter, setPositionFilter] = useState<Position | null>(null);
  const [isLocationFilterOpen, setIsLocationFilterOpen] = useState(false);
  const [pendingPosition, setPendingPosition] = useState<Position | null>(null);

  const hasActiveFilters =
    !!timeFrom || !!timeTo || positionFilter !== null;

  const fetchData = async (options?: { reset?: boolean }) => {
    const useFilters = !options?.reset;

    const timeRange: { start?: Date; end?: Date } = {};
    let position: Position | undefined;

    if (useFilters) {
      if (timeFrom) {
        timeRange.start = new Date(timeFrom);
      }
      if (timeTo) {
        timeRange.end = new Date(timeTo);
      }
      if (positionFilter) {
        position = positionFilter;
      }
    }

    const attendances = await findAttendancesWithFilters({
      userId,
      timeRange,
      position,
    });
    setItems(attendances);
  }

  useEffect(() => {
    fetchData();
  }, [userId])

  useEffect(() => {
    if (!mapAttendance) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMapAttendance(null);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mapAttendance])

  const handleApplyFilters = () => {
    fetchData();
  };

  const handleClearFilters = () => {
    setTimeFrom("");
    setTimeTo("");
    setPositionFilter(null);
    setPendingPosition(null);
    fetchData({ reset: true });
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6">
      <div className="mb-4 space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-900">
              Attendance
            </h2>
            <p className="text-sm text-slate-600">
              Recent check-ins and check-outs
            </p>
          </div>
          <div className="text-right text-xs sm:text-sm text-slate-600">
            <div>
              {items.length} {items.length === 1 ? "record" : "records"}
            </div>
            {hasActiveFilters && (
              <div className="mt-0.5 text-[11px] text-emerald-700">
                Filters active
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <label className="flex flex-col gap-1 text-xs text-slate-600">
                <span>From</span>
                <input
                  type="datetime-local"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </label>
            </div>
            <div className="flex-1">
              <label className="flex flex-col gap-1 text-xs text-slate-600">
                <span>To</span>
                <input
                  type="datetime-local"
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end sm:justify-end">
            <div className="text-xs text-slate-600">
              <div className="mb-1 font-medium">Location</div>
              <button
                type="button"
                onClick={() => {
                  setPendingPosition(positionFilter);
                  setIsLocationFilterOpen(true);
                }}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50"
              >
                {positionFilter
                  ? `Within 200m of ${positionFilter.lat.toFixed(
                      4,
                    )}, ${positionFilter.lng.toFixed(4)}`
                  : "Anywhere"}
              </button>
            </div>

            <div className="flex gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
              >
                Clear
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApplyFilters}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          No attendance records found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {items.map((v) => (
            <AttendanceBox
              key={v.id}
              data={v}
              invalidateData={fetchData}
              onShowMap={setMapAttendance}
            />
          ))}
        </div>
      )}

      {mapAttendance && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Location map"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMapAttendance(null)}
          />
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  {mapAttendance.type === "check-in" ? "Check In" : "Check Out"} location
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMapAttendance(null)}
                  className="shrink-0"
                >
                  Close
                </Button>
              </div>
              <p className="mt-0.5 text-xs text-slate-600">
                {formatDateTime(mapAttendance.createdAt).join(" ")} ·{" "}
                {mapAttendance.latitude.toFixed(5)}, {mapAttendance.longitude.toFixed(5)}
              </p>
            </div>
            <div className="p-2 sm:p-3">
              <LocationMapView
                lat={mapAttendance.latitude}
                lng={mapAttendance.longitude}
              />
            </div>
          </div>
        </div>
      )}

      {isLocationFilterOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Location filter"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsLocationFilterOpen(false)}
          />
          <div className="relative z-10 flex w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Filter by location
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-600">
                    Click on the map to choose a point. Attendance within 200m will match.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLocationFilterOpen(false)}
                  className="shrink-0"
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="p-3 sm:p-4">
              <div className="mb-3 text-xs text-slate-600">
                {pendingPosition
                  ? `Selected: ${pendingPosition.lat.toFixed(
                      5,
                    )}, ${pendingPosition.lng.toFixed(5)}`
                  : "Anywhere (no specific point selected)"}
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <MapPicker
                  defaultPos={pendingPosition}
                  onChange={(pos) => setPendingPosition(pos)}
                />
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPendingPosition(null);
                    setPositionFilter(null);
                    setIsLocationFilterOpen(false);
                    fetchData({ reset: true });
                  }}
                >
                  Clear location
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setPositionFilter(pendingPosition);
                    setIsLocationFilterOpen(false);
                    fetchData();
                  }}
                >
                  Apply location
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}