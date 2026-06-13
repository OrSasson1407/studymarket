import { Queue } from 'bullmq';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// FIXED: Using BullMQ instead of fire-and-forget HTTP requests
export const notificationQueue = new Queue('notifications', {
  connection: { url: REDIS_URL }
});

export async function notifyPurchase(payload: {
  to: string; buyerName: string; docTitle: string; downloadUrl: string;
}) {
  try {
    await notificationQueue.add('purchase-email', payload, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 }
    });
    console.log('[payment-service] Queued purchase notification for', payload.to);
  } catch (err) {
    console.error('[payment-service] failed to queue notification', err);
  }
}
