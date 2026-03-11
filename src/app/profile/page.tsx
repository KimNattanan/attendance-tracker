"use client"
import { useAppContext } from "@/components/AppContext";
import AttendanceList from "@/components/AttendaceList";

export default function Profile(){

  const { userId } = useAppContext();

  return (
    <div>
      <div className="mx-auto w-fit text-sm text-slate-600 font-medium">UserID: {userId||"...loading..."}</div>
      <AttendanceList userId={userId}/>
    </div>
  )
}