import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import QRCode from 'qrcode';
import os from 'os';

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const configPath = path.join(os.homedir(), '/../etc/wireguard/client', params.name, `${params.name}.conf`);
    const configContent = await fs.readFile(configPath, 'utf-8');
    
    const qrCode = await QRCode.toDataURL(configContent);
    
    return NextResponse.json({ qrCode });
  } catch (error) {
    console.error('Ошибка при генерации QR-кода:', error);
    return NextResponse.json(
      { error: 'Ошибка при генерации QR-кода' },
      { status: 500 }
    );
  }
} 