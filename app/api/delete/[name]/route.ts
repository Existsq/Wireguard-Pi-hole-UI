import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export async function DELETE(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const dirPath = path.join(os.homedir(), '/../etc/wireguard/client', params.name);
    const configPath = path.join(dirPath, `${params.name}.conf`);

    // Удаляем файл конфигурации через sudo
    await execAsync(`sudo rm "${configPath}"`);
    // Удаляем директорию через sudo
    await execAsync(`sudo rm -r "${dirPath}"`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка при удалении конфигурации:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении конфигурации' },
      { status: 500 }
    );
  }
} 