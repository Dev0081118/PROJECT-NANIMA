import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../src/middleware/auth.middleware';
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = 'test-secret';
process.env.JWT_ACCESS_SECRET = ACCESS_SECRET;

function mockReqResNext() {
  const req = { headers: {} } as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe('Auth Middleware', () => {
  it('rejects requests without Authorization header', () => {
    const { req, res, next } = mockReqResNext();
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects malformed Authorization header', () => {
    const { req, res, next } = mockReqResNext();
    req.headers.authorization = 'NotBearer token';
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('accepts valid JWT and attaches userId', () => {
    const { req, res, next } = mockReqResNext();
    const token = jwt.sign({ sub: 'user-123', email: 'test@test.com' }, ACCESS_SECRET, { expiresIn: '15m' });
    req.headers.authorization = `Bearer ${token}`;

    requireAuth(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect((req as { userId?: string }).userId).toBe('user-123');
  });

  it('rejects expired JWT', () => {
    const { req, res, next } = mockReqResNext();
    const token = jwt.sign({ sub: 'user-123', email: 'test@test.com' }, ACCESS_SECRET, { expiresIn: '-1s' });
    req.headers.authorization = `Bearer ${token}`;

    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    const body = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(body.error).toContain('expired');
  });

  it('rejects invalid JWT signature', () => {
    const { req, res, next } = mockReqResNext();
    const token = jwt.sign({ sub: 'user-123', email: 'test@test.com' }, 'wrong-secret', { expiresIn: '15m' });
    req.headers.authorization = `Bearer ${token}`;

    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
