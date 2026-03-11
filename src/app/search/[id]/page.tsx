"use client"

import AttendanceList from "@/features/attendances/components/AttendaceList";
import { useParams, useSearchParams } from "next/navigation";

export default function Search(){
  const params = useParams<{id: string}>();
  const userId = params.id
  return (
    <div>
      <AttendanceList userId={userId}/>
    </div>
  )
}