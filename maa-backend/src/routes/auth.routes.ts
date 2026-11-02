import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { query, queryOne } from '../db/client';
import { validate } from '../middleware/validate.middleware';

export const authRouter = Router();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-secret-change-in-production';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production';
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY_DAYS = 30;

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  familyName: z.string().min(1).max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

function generateTokens(userId: string, email: string) {
  const accessToken = jwt.sign({ sub: userId, email }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRY,
  } as jwt.SignOptions);

  const refreshTokenRaw = crypto.randomBytes(64).toString('hex');
  const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');

  const refreshJwt = jwt.sign({ sub: userId, jti: refreshTokenHash }, REFRESH_SECRET, {
    expiresIn: `${REFRESH_EXPIRY_DAYS}d`,
  } as jwt.SignOptions);

  return { accessToken, refreshJwt, refreshTokenHash };
}

// POST /auth/register
authRouter.post('/register', validate(registerSchema), async (req, res) => {
  const { email, password, familyName } = req.body as z.infer<typeof registerSchema>;

  try {
    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await query<{ id: string }>(
      'INSERT INTO users (email, password_hash, family_name) VALUES ($1, $2, $3) RETURNING id',
      [email, passwordHash, familyName ?? null]
    );

    // Create empty family profile
    await query(
      'INSERT INTO family_profiles (user_id) VALUES ($1)',
      [user.id]
    );

    const { accessToken, refreshJwt, refreshTokenHash } = generateTokens(user.id, email);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRY_DAYS);

    await query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshTokenHash, expiresAt.toISOString()]
    );

    return res.status(201).json({
      accessToken,
      refreshToken: refreshJwt,
      user: { id: user.id, email, familyName },
    });
  } catch (err) {
    console.error('[auth/register]', err);
    return res.status(500).json({ error: 'Registration failed.' });
  }
});

// POST /auth/login
authRouter.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  try {
    const user = await queryOne<{ id: string; email: string; password_hash: string; family_name: string }>(
      'SELECT id, email, password_hash, family_name FROM users WHERE email = $1',
      [email]
    );

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const { accessToken, refreshJwt, refreshTokenHash } = generateTokens(user.id, user.email);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRY_DAYS);

    await query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshTokenHash, expiresAt.toISOString()]
    );

    return res.json({
      accessToken,
      refreshToken: refreshJwt,
      user: { id: user.id, email: user.email, familyName: user.family_name },
    });
  } catch (err) {
    console.error('[auth/login]', err);
    return res.status(500).json({ error: 'Login failed.' });
  }
});

// POST /auth/refresh
authRouter.post('/refresh', validate(refreshSchema), async (req, res) => {
  const { refreshToken } = req.body as z.infer<typeof refreshSchema>;

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET) as { sub: string; jti: string };

    const tokenRecord = await queryOne<{ id: string; user_id: string; revoked: boolean; expires_at: string }>(
      'SELECT id, user_id, revoked, expires_at FROM refresh_tokens WHERE token_hash = $1',
      [payload.jti]
    );

    if (!tokenRecord || tokenRecord.revoked || new Date(tokenRecord.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }

    // Rotate: revoke old token
    await query('UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1', [tokenRecord.id]);

    const user = await queryOne<{ id: string; email: string }>(
      'SELECT id, email FROM users WHERE id = $1',
      [tokenRecord.user_id]
    );
    if (!user) return res.status(401).json({ error: 'User not found.' });

    const { accessToken, refreshJwt, refreshTokenHash } = generateTokens(user.id, user.email);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRY_DAYS);

    await query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshTokenHash, expiresAt.toISOString()]
    );

    return res.json({ accessToken, refreshToken: refreshJwt });
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token.' });
  }
});

// POST /auth/logout
authRouter.post('/logout', async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, REFRESH_SECRET) as { jti: string };
      await query('UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1', [payload.jti]);
    } catch {
      // Token already invalid — that's fine
    }
  }
  return res.json({ message: 'Logged out.' });
});
