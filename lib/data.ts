import fs from 'fs';
import path from 'path';

export interface ClassicItem {
  idx: number;
  id: string;
  title: string;
  author: string;
  category: string;
  summary?: string;
  word_count: number;
  filename: string;
}

const ROOT_DIR = process.cwd();
const MANIFEST_PATH = path.join(ROOT_DIR, 'manifest.json');
const MARKDOWN_DIR = path.join(ROOT_DIR, 'classics_markdown');

export function getManifest(): ClassicItem[] {
  try {
    if (fs.existsSync(MANIFEST_PATH)) {
      const data = fs.readFileSync(MANIFEST_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading manifest:', err);
  }
  return [];
}

export function getClassicById(id: string): { meta: ClassicItem | null; content: string } {
  const manifest = getManifest();
  const meta = manifest.find((item) => item.id === id) || null;
  if (!meta) {
    return { meta: null, content: '' };
  }

  const filePath = path.join(MARKDOWN_DIR, meta.filename);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return { meta, content };
    }
  } catch (err) {
    console.error(`Error reading markdown for ${id}:`, err);
  }

  return { meta, content: '' };
}
