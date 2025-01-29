import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';

const execAsync = promisify(exec);

async function getServerPublicKey() {
  const publicKeyPath = path.join(os.homedir(), '/../etc/wireguard/publickey');
  try {
    const publicKey = await fs.readFile(publicKeyPath, 'utf-8');
    return publicKey.trim();
  } catch (error) {
    throw new Error('Не удалось прочитать публичный ключ сервера');
  }
}

async function generateKeys() {
  const { stdout: privateKey } = await execAsync('wg genkey');
  const { stdout: publicKey } = await execAsync(`echo "${privateKey.trim()}" | wg pubkey`);
  return {
    privateKey: privateKey.trim(),
    publicKey: publicKey.trim()
  };
}

async function findNextAvailableIP() {
  const basePath = path.join(os.homedir(), '/../etc/wireguard/client');
  const baseIP = '192.168.15.';
  const usedIPs = new Set();

  try {
    const directories = await fs.readdir(basePath);
    
    for (const dir of directories) {
      const configPath = path.join(basePath, dir, `${dir}.conf`);
      try {
        const content = await fs.readFile(configPath, 'utf-8');
        const match = content.match(/Address\s*=\s*192\.168\.15\.(\d+)/);
        if (match) {
          usedIPs.add(parseInt(match[1]));
        }
      } catch (error) {
        // Пропускаем ошибки чтения файла
        continue;
      }
    }

    // Находим минимальное свободное число от 2 до 255
    for (let i = 2; i <= 255; i++) {
      if (!usedIPs.has(i)) {
        return `${baseIP}${i}`;
      }
    }

    throw new Error('Нет свободных IP адресов');

  } catch (error) {
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { profileName } = await request.json();

    if (!profileName) {
      return NextResponse.json(
        { error: 'Имя профиля не указано' },
        { status: 400 }
      );
    }

    const dirPath = path.join(os.homedir(), '/../etc/wireguard/client', profileName);
    const configPath = path.join(dirPath, `${profileName}.conf`);

    // Проверяем, не существует ли уже такой профиль
    try {
      await fs.access(dirPath);
      return NextResponse.json(
        { error: 'Профиль с таким именем уже существует' },
        { status: 409 }
      );
    } catch {
      // Это нормально, если директория не существует
    }

    // Получаем публичный ключ сервера
    const serverPublicKey = await getServerPublicKey();

    // Генерируем ключи для клиента
    const { privateKey, publicKey } = await generateKeys();
    
    // Находим следующий свободный IP
    const ip = await findNextAvailableIP();
    const ipWithoutMask = ip.split('/')[0];

    // Создаем конфигурацию
    const config = `[Interface]
PrivateKey = ${privateKey}
Address = ${ip}/24
DNS = 192.168.15.1

[Peer]
PublicKey = ${serverPublicKey}
AllowedIPs = 0.0.0.0/0
Endpoint = 80.76.43.102:51194
PersistentKeepalive = 25
`;

    // Создаем директорию и файл конфигурации через sudo
    await execAsync(`sudo mkdir -p "${dirPath}"`);
    await execAsync(`sudo bash -c 'echo "${config}" > "${configPath}"'`);

    // Добавляем пир в конфигурацию WireGuard
    await execAsync(`sudo wg set wg0 peer "${publicKey}" persistent-keepalive 25 allowed-ips "${ipWithoutMask}"`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Ошибка при создании профиля:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ошибка при создании профиля' },
      { status: 500 }
    );
  }
} 