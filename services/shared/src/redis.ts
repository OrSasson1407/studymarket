import { createClient } from 'redis';

const client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

client.on('error', (err) => console.error('[redis] client error', err));

let connected = false;
export async function getRedis() {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client;
}