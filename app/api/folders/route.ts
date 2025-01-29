import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const foldersPath = path.join(process.cwd(), "profiles");
    
    // Создаем папку profiles, если она не существует
    try {
      await fs.access(foldersPath);
    } catch {
      await fs.mkdir(foldersPath, { recursive: true });
    }
    
    const folders = await fs.readdir(foldersPath, { withFileTypes: true });
    
    const profileFolders = folders
      .filter(dirent => dirent.isDirectory())
      .map(dirent => ({
        name: dirent.name,
        address: "local",
        dns: "local"
      }));

    return NextResponse.json(profileFolders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read folders" }, { status: 500 });
  }
} 