'use server'

import { cookies } from "next/headers";

export async function getUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if(!userId){
    return '';
  }
  return userId;
}

