import Fastify from 'fastify';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? '');

const FROM_EMAIL = process.env.FROM_EMAIL ?? 'noreply@studymarket.io';
const server     = Fastify({ logger: true });

type EmailPayload = { to: string; subject: string; html: string };

async function sendEmail(payload: EmailPayload) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('[notifications] SENDGRID_API_KEY not set — email skipped:', payload.subject);
    return;
  }
  await sgMail.send({ from: FROM_EMAIL, ...payload });
}

// ?? POST /api/notifications/email/verify ?????????????????????????????????????
server.post<{ Body: { to: string; verificationUrl: string } }>(
  '/api/notifications/email/verify',
  async (req, reply) => {
    const { to, verificationUrl } = req.body;
    await sendEmail({
      to,
      subject: 'Verify your StudyMarket account',
      html: `
        <h2>Welcome to StudyMarket!</h2>
        <p>Click the link below to verify your institutional email:</p>
        <a href="${verificationUrl}" style="background:#1C6E8F;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0;">
          Verify Email
        </a>
        <p style="color:#78716c;font-size:12px;">Link expires in 24 hours.</p>
      `,
    });
    return reply.send({ sent: true });
  }
);

// ?? POST /api/notifications/email/purchase ????????????????????????????????????
server.post<{ Body: { to: string; buyerName: string; docTitle: string; downloadUrl: string } }>(
  '/api/notifications/email/purchase',
  async (req, reply) => {
    const { to, buyerName, docTitle, downloadUrl } = req.body;
    await sendEmail({
      to,
      subject: `Your purchase: ${docTitle}`,
      html: `
        <h2>Hi ${buyerName}, your document is ready!</h2>
        <p>You purchased <strong>${docTitle}</strong>.</p>
        <a href="${downloadUrl}" style="background:#1C6E8F;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0;">
          Download Now
        </a>
        <p style="color:#78716c;font-size:12px;">Secure link — expires in 72 hours.</p>
      `,
    });
    return reply.send({ sent: true });
  }
);

// ?? POST /api/notifications/email/price-drop ?????????????????????????????????
server.post<{ Body: { to: string; docTitle: string; oldPrice: number; newPrice: number; currency: string } }>(
  '/api/notifications/email/price-drop',
  async (req, reply) => {
    const { to, docTitle, oldPrice, newPrice, currency } = req.body;
    const symbol = currency === 'ILS' ? '¤' : '$';
    await sendEmail({
      to,
      subject: `Price drop alert: ${docTitle}`,
      html: `
        <h2>Price Drop!</h2>
        <p><strong>${docTitle}</strong> dropped from <s>${symbol}${oldPrice / 100}</s> to <strong>${symbol}${newPrice / 100}</strong>.</p>
        <p style="color:#78716c;font-size:12px;">You received this because you followed this document.</p>
      `,
    });
    return reply.send({ sent: true });
  }
);

server.get('/health', async () => ({ status: 'ok', service: 'notification-service' }));

const PORT = parseInt(process.env.PORT ?? '3006', 10);
server.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) { server.log.error(err); process.exit(1); }
  console.log('Notification service listening at ' + address);
});
