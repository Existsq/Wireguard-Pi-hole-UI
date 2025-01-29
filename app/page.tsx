'use client';

import { ServerCard } from "@/components/dashboard/servers/server-card"
import { useState, useEffect } from "react";

interface Config {
  name: string;
  address: string;
  dns: string;
}

export default function HomePage() {
  const [configs, setConfigs] = useState<Config[]>([]);

  useEffect(() => {
    const fetchConfigs = async () => {
      const response = await fetch('/api/servers');
      const data = await response.json();
      setConfigs(data);
    };

    fetchConfigs();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {configs.map((config) => (
          <ServerCard
            key={config.name}
            name={config.name}
            address={config.address}
            dns={config.dns}
          />
        ))}
      </div>
    </div>
  )
}
