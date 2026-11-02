/**
 * LLM Provider abstraction.
 * Currently implemented with OpenAI SDK (OpenAI-compatible interface).
 * To swap to a different provider, implement a new class satisfying LLMProvider
 * and update the factory at the bottom of this file.
 */

import OpenAI from 'openai';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMProvider {
  complete(messages: ChatMessage[]): Promise<string>;
  completeStream(messages: ChatMessage[]): AsyncGenerator<string>;
}

class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('[LLM] OPENAI_API_KEY not set. AI responses will be unavailable.');
    }
    this.client = new OpenAI({ apiKey: apiKey || 'not-configured' });
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  async complete(messages: ChatMessage[]): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      return '[AI service not configured. Please set OPENAI_API_KEY in backend .env]';
    }
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });
    return response.choices[0]?.message?.content || '';
  }

  async *completeStream(messages: ChatMessage[]): AsyncGenerator<string> {
    if (!process.env.OPENAI_API_KEY) {
      yield '[AI service not configured. Please set OPENAI_API_KEY in backend .env]';
      return;
    }
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    });
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield delta;
    }
  }
}

// Factory — swap this to change LLM provider
export function createLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER || 'openai';
  switch (provider) {
    case 'openai':
    default:
      return new OpenAIProvider();
  }
}

export const llm = createLLMProvider();

/**
 * Generate text embeddings for semantic memory search.
 * Returns a 1536-dimensional vector (text-embedding-3-small).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    // Return zero vector for development without API key
    console.warn('[LLM] Embedding skipped: OPENAI_API_KEY not set.');
    return new Array(1536).fill(0);
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.embeddings.create({
    model: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}
