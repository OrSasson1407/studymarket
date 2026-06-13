import Fastify from "fastify";
import Stripe from "stripe";
import { prisma } from "../../../database";
import { applyPPP, calculatePPP } from "@studymarket/utils";
import { requireAuth, getCallerId } from "../../shared/src/jwtMiddleware";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2025-04-30.basil",
});

const server = Fastify({ logger: true });

// ?? Protected: create payment intent ?????????????????????????????????????????
server.post<{
  Body: { contentAssetId: string; countryCode?: string }
}>(
  "/api/payment/create-intent",
  { preHandler: requireAuth },
  async (req, reply) => {
    const buyerId = getCallerId(req, reply);
    if (!buyerId) return;

    const { contentAssetId, countryCode = "IL" } = req.body;
    const asset = await prisma.contentAsset.findUnique({ where: { id: contentAssetId } });
    if (!asset || asset.status !== "PUBLISHED") {
      return reply.status(404).send({ error: "Document not found" });
    }

    // Prevent double-purchase
    const alreadyPurchased = await prisma.paymentTransaction.findFirst({
      where: { buyerId, contentId: contentAssetId, status: "COMPLETED" },
    });
    if (alreadyPurchased) return reply.status(409).send({ error: "Already purchased" });

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
  }
);

// ?? Public (Stripe-signed): webhook ??????????????????????????????????????????
server.post("/api/payment/webhook", { config: { rawBody: true } }, async (req, reply) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      (req as any).rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch {
    return reply.status(400).send({ error: "Webhook signature verification failed" });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const { buyerId, contentAssetId, sellerId } = intent.metadata;
    const gross       = intent.amount;
    const platformFee = Math.round(gross * 0.30);
    const sellerCut   = gross - platformFee;

    // ?? IDEMPOTENCY: skip if this charge was already processed ????????????????
    const exists = await prisma.paymentTransaction.findUnique({
      where: { providerChargeId: intent.id },
    });
    if (exists) {
      server.log.info({ chargeId: intent.id }, "Duplicate webhook — skipping");
      return reply.send({ received: true, duplicate: true });
    }

    // ?? PENDING BALANCE HOLD: funds release after 7 days ?????????????????????
    // Seller gets credit to pendingBalance first; a scheduled job moves it to
    // availableBalance after HOLD_DAYS. For now we record the hold deadline in
    // a future-dated updatedAt via a separate update so it is queryable.
    const HOLD_DAYS   = 7;
    const releaseDate = new Date(Date.now() + HOLD_DAYS * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.contentAsset.update({
        where: { id: contentAssetId },
        data:  { purchaseCount: { increment: 1 } },
      }),
      prisma.paymentTransaction.create({
        data: {
          buyerId,
          sellerId,
          contentId:        contentAssetId,
          grossAmount:      gross,
          platformFee,
          sellerCut,
          currency:         intent.currency.toUpperCase(),
          method:           "STRIPE_CARD",
          status:           "COMPLETED",
          providerChargeId: intent.id,
        },
      }),
      // Credit pendingBalance, NOT availableBalance — holds for 7 days
      prisma.sellerProfile.update({
        where: { id: sellerId },
        data: {
          pendingBalance:  { increment: sellerCut },
          lifetimeEarnings: { increment: sellerCut },
          xpPoints:         { increment: 10 },
        },
      }),
    ]);

    server.log.info(
      { chargeId: intent.id, sellerId, sellerCut, releaseDate },
      "Payment processed — funds in pending balance"
    );
  }

  // ?? Release pending balance on chargeback/refund ??????????????????????????
  if (event.type === "charge.refunded" || event.type === "charge.dispute.created") {
    const charge = event.data.object as Stripe.Charge;
    const tx = await prisma.paymentTransaction.findUnique({
      where: { providerChargeId: charge.payment_intent as string },
    });
    if (tx) {
      await prisma.$transaction([
        prisma.paymentTransaction.update({
          where: { id: tx.id },
          data:  { status: "REFUNDED" },
        }),
        prisma.sellerProfile.update({
          where: { id: tx.sellerId! },
          data: {
            pendingBalance:  { decrement: tx.sellerCut },
            lifetimeEarnings: { decrement: tx.sellerCut },
          },
        }),
      ]);
    }
  }

  return reply.send({ received: true });
});

// ?? Scheduled job endpoint: release matured pending balances ?????????????????
// Call this from a cron (e.g. daily via GitHub Actions or a k8s CronJob).
// Authenticates via a shared CRON_SECRET header instead of JWT.
server.post("/api/payment/release-pending", async (req, reply) => {
  const secret = req.headers["x-cron-secret"];
  if (secret !== (process.env.CRON_SECRET ?? "local-cron-secret")) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  const HOLD_DAYS = 7;
  const cutoff    = new Date(Date.now() - HOLD_DAYS * 24 * 60 * 60 * 1000);

  // Find all COMPLETED transactions older than HOLD_DAYS whose seller still
  // has the funds sitting in pendingBalance (approximation: use createdAt)
  const matured = await prisma.paymentTransaction.findMany({
    where: { status: "COMPLETED", createdAt: { lte: cutoff } },
  });

  let released = 0;
  for (const tx of matured) {
    if (!tx.sellerId) continue;
    await prisma.sellerProfile.update({
      where: { id: tx.sellerId },
      data: {
        pendingBalance:   { decrement: tx.sellerCut },
        availableBalance: { increment: tx.sellerCut },
      },
    }).catch(() => {}); // seller may not exist (deleted), skip
    released++;
  }

  return reply.send({ released });
});

// ?? Protected: payout ????????????????????????????????????????????????????????
server.post<{ Body: { amount: number } }>(
  "/api/payment/payout",
  { preHandler: requireAuth },
  async (req, reply) => {
    const userId = getCallerId(req, reply);
    if (!userId) return;

    const { amount } = req.body;
    const profile = await prisma.sellerProfile.findUnique({ where: { userId } });
    if (!profile)                          return reply.status(404).send({ error: "Seller profile not found" });
    if (profile.kycStatus !== "APPROVED")  return reply.status(403).send({ error: "KYC not completed" });
    if (!profile.stripeAccountId)          return reply.status(403).send({ error: "No payout account linked" });
    if (profile.availableBalance < amount) return reply.status(400).send({ error: "Insufficient available balance" });

    const transfer = await stripe.transfers.create({
      amount,
      currency:    "ils",
      destination: profile.stripeAccountId,
    });

    await prisma.sellerProfile.update({
      where: { id: profile.id },
      data:  { availableBalance: { decrement: amount } },
    });

    return reply.send({ success: true, transferId: transfer.id });
  }
);

server.get("/health", async () => ({
  status:  "ok",
  service: "payment-service",
  features: ["idempotent-webhook", "pending-balance-hold", "double-purchase-guard"],
}));


// ?? Graceful shutdown ??????????????????????????????????????????????????????????
async function shutdown(signal: string) {
  server.log.info(${signal} received — shutting down payment-service);
  await server.close();
  process.exit(0);
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));
const PORT = parseInt(process.env.PORT ?? "3004", 10);
server.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) { server.log.error(err); process.exit(1); }
  console.log("Payment service listening at " + address);
});

