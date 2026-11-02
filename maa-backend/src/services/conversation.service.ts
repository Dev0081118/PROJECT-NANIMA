import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';
import { buildResponse } from './ai/rag.service';
import { query } from '../db/client';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-secret-change-in-production';

interface WSMessage {
  type: 'text' | 'audio_chunk' | 'end_turn' | 'ping';
  sessionId?: string;
  text?: string;
  audioBase64?: string;
  language?: string;
}

interface WSClient {
  ws: WebSocket;
  userId: string;
  sessionId?: string;
}

const clients = new Map<string, WSClient>();

export function setupConversationWebSocket(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    // Extract token from query string: ws://host/ws/conversation?token=...
    const url = new URL(req.url || '', `http://localhost`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4001, 'Authentication required');
      return;
    }

    let userId: string;
    try {
      const payload = jwt.verify(token, ACCESS_SECRET) as { sub: string };
      userId = payload.sub;
    } catch {
      ws.close(4001, 'Invalid token');
      return;
    }

    const clientId = `${userId}-${Date.now()}`;
    clients.set(clientId, { ws, userId });

    console.log(`[WS] Client connected: ${clientId}`);
    ws.send(JSON.stringify({ type: 'connected', clientId }));

    ws.on('message', async (data) => {
      let msg: WSMessage;
      try {
        msg = JSON.parse(data.toString());
      } catch {
        ws.send(JSON.stringify({ type: 'error', error: 'Invalid JSON message' }));
        return;
      }

      if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
        return;
      }

      if (msg.type === 'text' && msg.text && msg.sessionId) {
        const client = clients.get(clientId);
        if (client) client.sessionId = msg.sessionId;

        try {
          // Verify session ownership
          const session = await query(
            'SELECT id FROM conversation_sessions WHERE id = $1 AND user_id = $2',
            [msg.sessionId, userId]
          );
          if (!session.length) {
            ws.send(JSON.stringify({ type: 'error', error: 'Session not found' }));
            return;
          }

          ws.send(JSON.stringify({ type: 'thinking' }));

          // Save user turn
          await query(
            'INSERT INTO conversation_turns (session_id, role, transcript_text) VALUES ($1, $2, $3)',
            [msg.sessionId, 'USER', msg.text]
          );

          // Load recent history
          const history = await query<{ role: string; transcript_text: string }>(
            `SELECT role, transcript_text FROM conversation_turns
             WHERE session_id = $1 ORDER BY created_at DESC LIMIT 10`,
            [msg.sessionId]
          );
          const chatHistory = history.reverse().map(t => ({
            role: t.role === 'USER' ? 'user' as const : 'assistant' as const,
            content: t.transcript_text,
          }));

          const { responseText, memoriesUsed, confidenceLevel } = await buildResponse(
            userId,
            msg.text,
            chatHistory,
            msg.language || 'gu'
          );

          // Save assistant turn
          await query(
            `INSERT INTO conversation_turns (session_id, role, transcript_text, memory_ids_used, confidence_level)
             VALUES ($1, 'ASSISTANT', $2, $3, $4)`,
            [msg.sessionId, responseText, memoriesUsed, confidenceLevel]
          );

          ws.send(JSON.stringify({
            type: 'response',
            text: responseText,
            memoriesUsed: memoriesUsed.length,
            confidenceLevel,
          }));
        } catch (err) {
          console.error('[WS] Error processing message:', err);
          ws.send(JSON.stringify({ type: 'error', error: 'Failed to generate response' }));
        }
      }
    });

    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`[WS] Client disconnected: ${clientId}`);
    });

    ws.on('error', (err) => {
      console.error(`[WS] Error for ${clientId}:`, err.message);
      clients.delete(clientId);
    });
  });
}
