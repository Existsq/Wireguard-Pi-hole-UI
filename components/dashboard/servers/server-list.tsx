"use client";
import React from "react";
import {
  ServerCard,
  ServerCardSkeleton,
} from "@/components/dashboard/servers/server-card";

export type Layout = {
  viewMode: "grid" | "list";
};

export type ServerData = {
  name: string;
  owner: string;
  members: string;
  hasPremium: boolean;
  address: string;
  dns: string;
};

const gridLayoutStyle: string =
  "grid grid-cols-1 gap-4 gap-y-6 w-full px-6 lg:px-16 pt-4 pb-16";

const listLayoutStyle: string =
  "flex flex-col gap-4 w-full px-6 lg:px-16 pt-4 pb-16";

const fetchData = async (): Promise<ServerData[]> => {
  const response = await fetch("/api/servers", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  return response.json();
};

export default function ServerList({ viewMode }: Layout) {
  const [data, setData] = React.useState<ServerData[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const fetchServerData = React.useCallback(async () => {
    try {
      const newData = await fetchData();
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, []);

  React.useEffect(() => {
    fetchServerData();
    
    const interval = setInterval(fetchServerData, 5000); // Обновление каждые 5 секунд
    
    return () => clearInterval(interval);
  }, [fetchServerData]);

  if (error) {
    return (
      <div className="flex justify-center items-center text-2xl text-white font-semibold row-span-2 min-h-screen">
        No profiles added
      </div>
    );
  }

  return (
    <div className={viewMode === "grid" ? gridLayoutStyle : listLayoutStyle}>
      {data ? (
        data.length > 0 ? (
          data.map((server: ServerData) => (
            <div key={server.name}>
              <ServerCard 
                {...server} 
                onUpdate={fetchServerData}
              />
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center text-xl text-white font-semibold w-full min-h-[200px]">
            No profiles added
          </div>
        )
      ) : (
        <ServerListSkeleton viewMode={viewMode} />
      )}
    </div>
  );
}

export function ServerListSkeleton({ viewMode }: Layout) {
  return (
    <div className={viewMode === "grid" ? gridLayoutStyle : listLayoutStyle}>
      {Array.from({ length: 9 }).map((_, index) => (
        <ServerCardSkeleton key={index} />
      ))}
    </div>
  );
}
