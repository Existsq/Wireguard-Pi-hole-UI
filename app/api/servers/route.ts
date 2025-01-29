import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

interface ServerConfig {
  name: string;
  address: string;
  dns: string;
}

export async function GET() {
  try {
    const wireguardPath = path.join(os.homedir(), '/../etc/wireguard/client');
    const directories = await fs.readdir(wireguardPath, { withFileTypes: true });
    
    const servers: ServerConfig[] = await Promise.all(
      directories
        .filter(dirent => dirent.isDirectory())
        .map(async (dirent) => {
          const name = dirent.name;
          const configPath = path.join(wireguardPath, name, `${name}.conf`);
          
          try {
            const configContent = await fs.readFile(configPath, 'utf-8');
            
            // Извлекаем Address и DNS из конфигурации
            const addressMatch = configContent.match(/Address\s*=\s*([^\n]+)/);
            const dnsMatch = configContent.match(/DNS\s*=\s*([^\n]+)/);
            
            const fullAddress = addressMatch ? addressMatch[1].trim() : '';
            const maskedAddress = fullAddress.slice(0, -3)
            
            return {
              name,
              address: maskedAddress,
              dns: dnsMatch ? dnsMatch[1].trim() : ''
            };
          } catch (error) {
            console.error(`Ошибка чтения конфигурации для ${name}:`, error);
            return {
              name,
              address: '',
              dns: ''
            };
          }
        })
    );

    return NextResponse.json(servers);
  } catch (error) {
    console.error('Ошибка при получении списка серверов:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении списка серверов' },
      { status: 500 }
    );
  }
} 