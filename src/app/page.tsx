"use client"

import { useAppContext } from "@/components/AppContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function App(){
  const { userId } = useAppContext();
  const router = useRouter();

  const [searchValue, setSearchValue] = useState("");
  const handleSearch = () => {
    const trimmed = searchValue.trim();
    if(!trimmed) return;

    router.push(`/search/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="min-h-screen flex justify-center px-4 py-8">
      <div className="w-full max-w-xl space-y-8">
        <section className="space-y-3 border rounded-md p-4">
          <p className="text-sm font-medium">
            Login to manage your attendance
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/login" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Login / Register</Button>
            </Link>

            {userId!=='' ? (
              <Link href="/profile" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Profile
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                disabled
              >
                Profile (requires login)
              </Button>
            )}
          </div>
        </section>

        <section className="space-y-3 border rounded-md p-4">
          <p className="text-sm font-medium">Check Attendance</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/check-in" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Check In</Button>
            </Link>
            <Link href="/check-out" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
              >
                Check Out
              </Button>
            </Link>
          </div>
        </section>

        <section className="space-y-4 border rounded-md p-4">
          <p className="text-sm font-medium">Search attendance</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="UserID"
              className="flex-1"
            />
          </div>

          <div>
            <Button
              type="button"
              disabled={!searchValue.trim()}
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
