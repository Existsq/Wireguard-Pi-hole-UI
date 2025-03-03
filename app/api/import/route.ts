import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Функция получения IP-адреса сервера
async function getServerIP() {
  try {
    const { stdout } = await execAsync("curl -4 -s icanhazip.com");
    return stdout.trim();
  } catch (error) {
    console.error("Ошибка при получении IPv4:", error);
    throw new Error("Не удалось получить IPv4 сервера");
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Файл конфигурации не найден" }, { status: 400 });
    }

    const configs = JSON.parse(await file.text());
    const serverIP = await getServerIP();
    
    // Читаем основной приватный ключ заранее
    const mainPublicKeyPath = "/etc/wireguard/publickey";
    let mainPrivateKey = "";

    try {
      mainPrivateKey = (await fs.readFile(mainPublicKeyPath, "utf-8")).trim();
    } catch (error) {
      console.error(`Ошибка чтения ${mainPublicKeyPath}:`, error);
      return NextResponse.json({ error: "Ошибка чтения основного приватного ключа" }, { status: 500 });
    }

    for (const config of configs) {
      const dirPath = `/etc/wireguard/client/${config.Name}`;
      const configPath = path.join(dirPath, `${config.Name}.conf`);
      const publicKeyPath = path.join(dirPath, "publickey");
      const privateKeyPath = path.join(dirPath, "privatekey");

      try {
        // Создаём директорию (если её нет)
        await execAsync(`sudo mkdir -p "${dirPath}"`);

        // Записываем ключи в файлы
        await fs.writeFile(publicKeyPath, config.PublicKey, { mode: 0o600 });
        await fs.writeFile(privateKeyPath, config.PrivateKey, { mode: 0o600 });

        // Создаём конфигурационный файл
        const configContent = `[Interface]
PrivateKey = ${config.PrivateKey}
Address = ${config.Address}/24
DNS = ${config.DNS}

[Peer]
PublicKey = ${mainPublicKeyPath}
AllowedIPs = 0.0.0.0/0
Endpoint = ${serverIP}:51194
PersistentKeepalive = ${config.KeepAlive}`;

        await fs.writeFile(configPath, configContent, { mode: 0o600 });

        // Добавляем пир в WireGuard
        await execAsync(
          `sudo wg set wg0 peer ${config.PublicKey} allowed-ips ${config.Address} persistent-keepalive ${config.KeepAlive}`
        );
      } catch (error) {
        console.error(`Ошибка обработки конфигурации для ${config.Name}:`, error);
        return NextResponse.json({ error: `Ошибка обработки ${config.Name}` }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка при импорте:", error);
    return NextResponse.json(
      { error: "Ошибка при импорте конфигураций" },
      { status: 500 }
    );
  }
}