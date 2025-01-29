"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ServerContextType {
  currentServer: string | null;
  setCurrentServer: (serverName: string) => void;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const useServer = () => {
  const context = useContext(ServerContext);
  if (!context) {
    throw new Error("useServer must be used within a ServerProvider");
  }
  return context;
};

export const ServerProvider = ({ children }: { children: ReactNode }) => {
  const [currentServer, setCurrentServer] = useState<string | null>(null);

  return (
    <ServerContext.Provider value={{ currentServer, setCurrentServer }}>
      {children}
    </ServerContext.Provider>
  );
};