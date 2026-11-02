import rateLimit from 'express-rate-limit';

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000;
const max = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 60;
const aiMax = Number(process.env.AI_RATE_LIMIT_MAX) || 20;

export const globalRateLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

export const aiRateLimiter = rateLimit({
  windowMs,
  max: aiMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI rate limit exceeded. Please wait before sending another message.' },
  keyGenerator: (req) => {
    // Rate limit per authenticated user, not per IP
    return (req as { userId?: string }).userId ?? req.ip ?? 'unknown';
  },
});
