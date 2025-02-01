import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const configs = JSON.parse(await file.text());

    for (const config of configs) {
      const dirPath = path.join(os.homedir(), '/../etc/wireguard/client', config.Name);
      const configPath = path.join(dirPath, `${config.Name}.conf`);

      // Создаем директорию
      await execAsync(`sudo mkdir -p "${dirPath}"`);

      // Создаем конфигурационный файл
      const configContent = `[Interface]
PrivateKey = ${config.PrivateKey}
Address = ${config.Address}
DNS = ${config.DNS}

[Peer]
PublicKey = ${process.env.SERVER_PUBLIC_KEY}
Endpoint = ${process.env.SERVER_ENDPOINT}
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = ${config.KeepAlive}`;

      await execAsync(`sudo bash -c 'echo "${configContent}" > "${configPath}"'`);

      // Добавляем пир в WireGuard
      await execAsync(`sudo wg set wg0 peer ${config.PublicKey} allowed-ips ${config.Address} persistent-keepalive ${config.KeepAlive}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка при импорте:', error);
    return NextResponse.json(
      { error: 'Ошибка при импорте конфигураций' },
      { status: 500 }
    );
  }
} 