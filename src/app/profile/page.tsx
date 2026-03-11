"use client"
import { useAppContext } from "@/components/AppContext";
import AttendanceList from "@/features/attendances/components/AttendaceList";
import { Button } from "@/components/ui/button";
import { deleteUser } from "@/features/users/api/delete-user";
import { logoutUser } from "@/features/users/api/logout-user";
import { useRouter } from "next/navigation";

export default function Profile(){

  const { userId, setUserId } = useAppContext();
  const router = useRouter();

  return (
    <div className="pb-16">
      <div className="mx-auto w-fit font-bold my-8 flex flex-col items-center gap-4 border-b border-black pb-2 px-4">
        <div className="text-sm">UserID</div>
        <div className="text-xs text-slate-600">{userId||"...loading..."}</div>
      </div>
      <div className="flex flex-col gap-2 items-center">
        <Button variant="outline" className="w-fit px-8" onClick={async () => {
          const result = await logoutUser();
          if (!result.success) {
            window.alert(result.error);
            return;
          }
          setUserId("");
          if (window.location.pathname !== "/") {
            window.location.href = "/";
          }
        }}>Logout</Button>
        <Button
          variant="destructive"
          className="w-fit px-8"
          onClick={async () => {
            const confirmed = window.confirm(
              "Are you sure you want to delete your account? This action cannot be undone."
            );
            if (!confirmed) return;
            const result = await deleteUser();
            if (!result.success) {
              window.alert(result.error);
              return;
            }
            setUserId("");
            if (window.location.pathname !== "/") {
              window.location.href = "/";
            }
          }}
        >
          Delete Account
        </Button>
      </div>
      <AttendanceList userId={userId}/>
    </div>
  )
}