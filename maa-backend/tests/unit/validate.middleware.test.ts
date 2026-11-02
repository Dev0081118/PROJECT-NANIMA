import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { validate } from '../../src/middleware/validate.middleware';
import { z } from 'zod';

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe('Validate Middleware', () => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  it('passes valid data to next()', () => {
    const req = { body: { email: 'test@test.com', password: 'password123' } } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    validate(schema)(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid email', () => {
    const req = { body: { email: 'not-an-email', password: 'password123' } } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    validate(schema)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Validation failed' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 for short password', () => {
    const req = { body: { email: 'test@test.com', password: 'short' } } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    validate(schema)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('includes field paths in validation errors', () => {
    const req = { body: { email: 'bad', password: '' } } as Request;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    validate(schema)(req, res, next);
    const call = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.details).toBeDefined();
    expect(Array.isArray(call.details)).toBe(true);
  });
});
