"use server"

import { cookies } from "next/headers";

export async function logoutUser(){
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if(!userId){
    throw new Error("Unauthorized");
  }

  cookieStore.delete("userId");
}

