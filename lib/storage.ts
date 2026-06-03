import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import slugify from 'slugify';

export type StorageFolder = 'documents' | 'applications' | 'pdfs';

const folderMap: Record<StorageFolder, string> = {
  documents: '/uploads/documents',
  applications: '/uploads/applications',
  pdfs: '/uploads/pdfs'
};

function resolveDiskPath(folder: StorageFolder, filename: string) {
  return path.join(process.cwd(), 'public', folderMap[folder], filename);
}

export async function saveFile(folder: StorageFolder, file: File) {
  const extension = path.extname(file.name);
  const baseName = slugify(path.basename(file.name, extension), {
    lower: true,
    strict: true,
    trim: true
  });
  const filename = `${Date.now()}-${baseName || 'file'}${extension}`;
  const diskPath = resolveDiskPath(folder, filename);

  await mkdir(path.dirname(diskPath), { recursive: true });
  await writeFile(diskPath, Buffer.from(await file.arrayBuffer()));

  return {
    filename,
    diskPath,
    publicPath: `${folderMap[folder]}/${filename}`
  };
}

export async function ensureFolder(folder: StorageFolder) {
  const diskPath = resolveDiskPath(folder, '.gitkeep');
  await mkdir(path.dirname(diskPath), { recursive: true });
}