"use client";

import type React from "react";
import { useMemo, useState } from "react"
import { formatDateTime } from "@/lib/utils";
import { Button } from "../../../components/ui/button";
import { deleteAttendance } from "@/features/attendances/api/delete-attendance";
import { useAppContext } from "../../../components/AppContext";
import { Loader2 } from "lucide-react";

export type Attendance = {
  id: number;
  userId: string;
  type: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
};

function getTypeMeta(type: string){
  if(type === "check-in"){
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

export function AttendanceBox({
  data,
  invalidateData,
  onShowMap,
}: {
  data: Attendance;
  invalidateData: () => Promise<void>;
  onShowMap: (data: Attendance) => void;
}){
  const typeMeta = useMemo(() => getTypeMeta(data.type), [data.type]);
  const { userId } = useAppContext();
  const [deletePending, setDeletePending] = useState(false);
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletePending(true);
    try {
      await deleteAttendance(data.id);
      await invalidateData();
    } catch(e) {
      console.error(e);
    } finally {
      setDeletePending(false);
    }
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
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deletePending}>
              Delete
            </Button>
            {deletePending && (
              <div className="ml-2 text-xs text-destructive flex items-center gap-1">
                <Loader2 className="size-4 animate-spin" />
                Deleting...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}