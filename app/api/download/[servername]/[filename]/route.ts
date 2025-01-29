import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

export async function GET(
  request: Request,
  { params }: { params: { servername: string; filename: string } }
) {
  try {
    const configPath = path.join(os.homedir(), '/../etc/wireguard/client', params.servername, params.filename);
    
    try {
      await fs.access(configPath);
    } catch {
      return NextResponse.json(
        { error: 'Файл конфигурации не найден' },
        { status: 404 }
      );
    }

    const fileContent = await fs.readFile(configPath, 'utf-8');

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename=${params.filename}`);
    headers.set('Content-Type', 'application/octet-stream');

    return new NextResponse(fileContent, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Ошибка при скачивании конфигурации:', error);
    return NextResponse.json(
      { error: 'Ошибка при скачивании конфигурации' },
      { status: 500 }
    );
  }
}