const NOTIFICATION_URL    = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006';
const INTERNAL_SECRET     = process.env.INTERNAL_SECRET          || 'internal-secret-local';

export async function notifyPurchase(payload: {
  to: string; buyerName: string; docTitle: string; downloadUrl: string;
}) {
  try {
    await fetch(`${NOTIFICATION_URL}/api/notifications/email/purchase`, {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-internal-secret': INTERNAL_SECRET,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[payment-service] failed to send purchase notification', err);
  }
}