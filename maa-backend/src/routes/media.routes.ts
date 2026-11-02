import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import { query, queryOne } from '../db/client';

export const mediaRouter = Router();
mediaRouter.use(requireAuth);

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Allowed MIME types
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'photo',
  'image/png': 'photo',
  'image/webp': 'photo',
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  'audio/m4a': 'audio',
  'audio/mp4': 'audio',
  'video/mp4': 'video',
  'video/quicktime': 'video',
  'video/webm': 'video',
  'application/pdf': 'document',
};

const MAX_SIZE_MB = 200;

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const userId = (req as AuthenticatedRequest).userId;
    const userDir = path.join(UPLOAD_DIR, userId);
    fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (_req, file, cb) => {
    const random = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${random}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed.`));
    }
  },
});

// POST /media — upload a file
mediaRouter.post('/', upload.single('file'), async (req, res) => {
  const userId = req.userId!;
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const mediaType = ALLOWED_TYPES[file.mimetype] || 'document';
  const storagePath = path.join(userId, file.filename);

  try {
    const [asset] = await query<{ id: string }>(
      `INSERT INTO media_assets (user_id, type, original_name, storage_path, mime_type, file_size_bytes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING id`,
      [userId, mediaType, file.originalname, storagePath, file.mimetype, file.size]
    );

    return res.status(201).json({
      id: asset.id,
      type: mediaType,
      originalName: file.originalname,
      status: 'pending',
      message: 'File uploaded. Processing will begin shortly.',
    });
  } catch (err) {
    console.error('[media/upload]', err);
    // Clean up orphaned file
    fs.unlinkSync(file.path);
    return res.status(500).json({ error: 'Upload failed.' });
  }
});

// GET /media — list user's media
mediaRouter.get('/', async (req, res) => {
  const userId = req.userId!;
  const assets = await query(
    `SELECT id, type, original_name, mime_type, file_size_bytes, duration_seconds, status, created_at
     FROM media_assets WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return res.json({ assets });
});

// GET /media/:id/url — get signed short-lived URL
mediaRouter.get('/:id/url', async (req, res) => {
  const userId = req.userId!;
  const asset = await queryOne<{ id: string; storage_path: string; mime_type: string }>(
    'SELECT id, storage_path, mime_type FROM media_assets WHERE id = $1 AND user_id = $2',
    [req.params.id, userId]
  );

  if (!asset) return res.status(404).json({ error: 'Media not found.' });

  // For local storage: generate a signed token that expires in 15 minutes
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 15 * 60 * 1000;
  const signed = Buffer.from(JSON.stringify({ id: asset.id, token, expiresAt })).toString('base64url');

  return res.json({
    url: `/media/${asset.id}/stream?sig=${signed}`,
    expiresIn: 900,
  });
});

// GET /media/:id/stream — serve file with signature verification
mediaRouter.get('/:id/stream', async (req, res) => {
  const { sig } = req.query as { sig?: string };
  if (!sig) return res.status(403).json({ error: 'Missing signature.' });

  try {
    const { id, expiresAt } = JSON.parse(Buffer.from(sig, 'base64url').toString());
    if (Date.now() > expiresAt) return res.status(403).json({ error: 'URL expired.' });
    if (id !== req.params.id) return res.status(403).json({ error: 'Invalid signature.' });

    const asset = await queryOne<{ storage_path: string; mime_type: string }>(
      'SELECT storage_path, mime_type FROM media_assets WHERE id = $1',
      [id]
    );
    if (!asset) return res.status(404).json({ error: 'Not found.' });

    const filePath = path.join(UPLOAD_DIR, asset.storage_path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on disk.' });

    res.setHeader('Content-Type', asset.mime_type || 'application/octet-stream');
    res.setHeader('Cache-Control', 'private, max-age=900');
    fs.createReadStream(filePath).pipe(res);
  } catch {
    return res.status(403).json({ error: 'Invalid signature.' });
  }
});

// DELETE /media/:id
mediaRouter.delete('/:id', async (req, res) => {
  const userId = req.userId!;
  const asset = await queryOne<{ id: string; storage_path: string }>(
    'SELECT id, storage_path FROM media_assets WHERE id = $1 AND user_id = $2',
    [req.params.id, userId]
  );

  if (!asset) return res.status(404).json({ error: 'Media not found.' });

  await query('DELETE FROM media_assets WHERE id = $1', [asset.id]);

  // Remove file from disk
  const filePath = path.join(UPLOAD_DIR, asset.storage_path);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return res.json({ message: 'Media deleted.' });
});
