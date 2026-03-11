import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaHome } from "react-icons/fa";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="fixed bottom-8 right-8 sm:bottom-16 sm:right-16 z-50 text-black">
        <Link href="/" className="">
          <Button className="rounded-full items-center w-12 h-12 p-8 flex-col gap-0">
            <FaHome className="size-6"/>
            <div className="text-xs">home</div>
          </Button>
        </Link>
      </div>
      {children}
    </>
  );
}