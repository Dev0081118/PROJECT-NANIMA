import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { WebSocketServer } from 'ws';

import { globalRateLimiter } from './middleware/rateLimit.middleware';
import { authRouter } from './routes/auth.routes';
import { mediaRouter } from './routes/media.routes';
import { memoriesRouter } from './routes/memories.routes';
import { conversationRouter } from './routes/conversation.routes';
import { voiceRouter } from './routes/voice.routes';
import { avatarRouter } from './routes/avatar.routes';
import { familyRouter } from './routes/family.routes';
import { setupConversationWebSocket } from './services/conversation.service';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ─── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8081',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(globalRateLimiter);

// ─── Health check (no auth required) ──────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'maa-backend',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    providers: {
      llm: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
      stt: process.env.SARVAM_API_KEY ? 'configured' : 'not_configured',
      tts: process.env.SARVAM_API_KEY ? 'configured' : 'not_configured',
      voiceClone: 'pending_consent_verification',
      avatar: 'pending_consent_verification',
    },
  });
});

// ─── API routes ────────────────────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/media', mediaRouter);
app.use('/memories', memoriesRouter);
app.use('/conversation', conversationRouter);
app.use('/voice', voiceRouter);
app.use('/avatar', avatarRouter);
app.use('/family', familyRouter);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err.message);
  if (process.env.NODE_ENV === 'development') {
    res.status(500).json({ error: err.message, stack: err.stack });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── HTTP + WebSocket server ───────────────────────────────────────────────────
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/conversation' });
setupConversationWebSocket(wss);

server.listen(PORT, () => {
  console.log(`\n🙏 Maa Backend running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   WebSocket: ws://localhost:${PORT}/ws/conversation`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

export { app, server };
