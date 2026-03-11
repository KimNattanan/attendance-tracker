'use client'

import { getUser } from "@/features/users/api/get-user";
import { createContext, ReactNode, useContext, useEffect, useState } from "react"

type AppContextType = {
  userId: string,
  setUserId: (userId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }:{ children: ReactNode }){
  
  const [userId, setUserId] = useState("");
  
  useEffect(()=>{
    (async () => {
      setUserId(await getUser());
    })();
  },[]);

  return (
    <AppContext.Provider value={{
      userId,
      setUserId,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(){
  const context = useContext(AppContext)
  if(!context){
    throw new Error("useAppContext must be used inside AppContextProvider");
  }
  return context;
}