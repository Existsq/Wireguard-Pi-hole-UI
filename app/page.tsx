'use client';

import { ServerCard } from "@/components/dashboard/servers/server-card"
import { useState, useEffect, useCallback } from "react";

interface Config {
  name: string;
  address: string;
  dns: string;
}

export default function HomePage() {
  const [configs, setConfigs] = useState<Config[]>([]);

  const fetchConfigs = useCallback(async () => {
    try {
      const response = await fetch('/api/servers', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setConfigs(data);
    } catch (error) {
      console.error('Error fetching configs:', error);
    }
  }, []);

  // Начальная загрузка и периодическое обновление
  useEffect(() => {
    fetchConfigs();
    const interval = setInterval(fetchConfigs, 2000);
    return () => clearInterval(interval);
  }, [fetchConfigs]);

  return (
    <div className="min-h-screen">
      <div className="px-6 pt-4 pb-16 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {configs.map((config) => (
          <ServerCard
            key={config.name}
            name={config.name}
            address={config.address}
            dns={config.dns}
            onUpdate={fetchConfigs}
          />
        ))}
      </div>
    </div>
  )
}
