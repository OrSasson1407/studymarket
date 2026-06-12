import Fastify from 'fastify';
import Stripe from 'stripe';
import { prisma } from '../../../database';
import { applyPPP, calculatePPP } from '@studymarket/utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2025-04-30.basil',
});

const server = Fastify({ logger: true });

// ?? POST /api/payments/create-intent ?????????????????????????????????????????
// Creates a Stripe PaymentIntent; returns clientSecret to the frontend.
server.post<{
  Body: { buyerId: string; contentAssetId: string; countryCode?: string }
}>('/api/payments/create-intent', async (req, reply) => {
  const { buyerId, contentAssetId, countryCode = 'IL' } = req.body;

  const asset = await prisma.contentAsset.findUnique({ where: { id: contentAssetId } });
  if (!asset || asset.status !== 'LIVE') return reply.status(404).send({ error: 'Document not found' });

  const pppAdjustment = calculatePPP(countryCode, asset.priceAmount);
  const finalAmount   = applyPPP(asset.priceAmount, pppAdjustment);

  const intent = await stripe.paymentIntents.create({
    amount:   finalAmount,
    currency: asset.currency.toLowerCase(),
    metadata: { buyerId, contentAssetId, sellerId: asset.sellerId },
  });

  return reply.send({
    clientSecret: intent.client_secret,
    amount:       finalAmount,
    currency:     asset.currency,
    pppApplied:   pppAdjustment,
  });
});

// ?? POST /api/payments/webhook — Stripe webhook ???????????????????????????????
server.post('/api/payments/webhook', {
  config: { rawBody: true },
}, async (req, reply) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      (req as any).rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ''
    );
  } catch (err: any) {
    return reply.status(400).send({ error: 'Webhook signature verification failed' });
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent  = event.data.object as Stripe.PaymentIntent;
    const { buyerId, contentAssetId, sellerId } = intent.metadata;

    const gross      = intent.amount;
    const platformFee = Math.round(gross * 0.30);
    const sellerCut  = gross - platformFee;

    // Record the ledger entry & update seller balance
    await Promise.all([
      prisma.contentAsset.update({
        where: { id: contentAssetId },
        data:  { purchaseCount: { increment: 1 } },
      }),
      prisma.sellerProfile.update({
        where: { id: sellerId },
        data: {
          availableBalance: { increment: sellerCut },
          lifetimeEarnings: { increment: sellerCut },
          xpPoints:         { increment: 10 },
        },
      }),
    ]);
  }

  return reply.send({ received: true });
});

// ?? POST /api/payments/payout ?????????????????????????????????????????????????
server.post<{ Body: { sellerId: string; amount: number } }>('/api/payments/payout', async (req, reply) => {
  const { sellerId, amount } = req.body;
  const profile = await prisma.sellerProfile.findUnique({ where: { id: sellerId } });

  if (!profile)                         return reply.status(404).send({ error: 'Seller not found' });
  if (profile.kycStatus !== 'APPROVED') return reply.status(403).send({ error: 'KYC not completed' });
  if (!profile.stripeAccountId)         return reply.status(403).send({ error: 'No payout account linked' });
  if (profile.availableBalance < amount) return reply.status(400).send({ error: 'Insufficient balance' });

  const transfer = await stripe.transfers.create({
    amount,
    currency:    'ils',
    destination: profile.stripeAccountId,
  });

  await prisma.sellerProfile.update({
    where: { id: sellerId },
    data:  { availableBalance: { decrement: amount } },
  });

  return reply.send({ success: true, transferId: transfer.id });
});

server.get('/health', async () => ({ status: 'ok', service: 'payment-service' }));

const PORT = parseInt(process.env.PORT ?? '3004', 10);
server.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) { server.log.error(err); process.exit(1); }
  console.log('Payment service listening at ' + address);
});
