import Fastify from "fastify";
import Stripe from "stripe";
import { prisma } from "../../../database";
import { requireAuth, getCallerId } from "../../shared/src/jwtMiddleware";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2025-04-30.basil",
});

const server = Fastify({ logger: true });

// ?? Tier ? Stripe price ID map (set real IDs in env) ?????????????????????????
const TIER_PRICE_IDS: Record<string, string> = {
  INDIVIDUAL_MONTHLY:  process.env.STRIPE_PRICE_MONTHLY   ?? "price_monthly_placeholder",
  INDIVIDUAL_SEMESTER: process.env.STRIPE_PRICE_SEMESTER  ?? "price_semester_placeholder",
};

// ?? Protected: create a Stripe Checkout session for a subscription ?????????????
server.post<{ Body: { tier: string; successUrl: string; cancelUrl: string } }>(
  "/api/subscriptions/checkout",
  { preHandler: requireAuth },
  async (req, reply) => {
    const userId = getCallerId(req, reply);
    if (!userId) return;

    const { tier, successUrl, cancelUrl } = req.body;
    const priceId = TIER_PRICE_IDS[tier];
    if (!priceId) return reply.status(400).send({ error: `Unknown tier: ${tier}` });

    // Prevent duplicate active subscriptions
    const existing = await prisma.subscriptionAccess.findFirst({
      where: { userId, status: "ACTIVE" },
    });
    if (existing) return reply.status(409).send({ error: "Already has an active subscription" });

    const session = await stripe.checkout.sessions.create({
      mode:        "subscription",
      line_items:  [{ price: priceId, quantity: 1 }],
      metadata:    { userId, tier },
      success_url: successUrl,
      cancel_url:  cancelUrl,
    });

    return reply.send({ checkoutUrl: session.url });
  }
);

// ?? Protected: get current user's subscription status ?????????????????????????
server.get(
  "/api/subscriptions/me",
  { preHandler: requireAuth },
  async (req, reply) => {
    const userId = getCallerId(req, reply);
    if (!userId) return;

    const sub = await prisma.subscriptionAccess.findFirst({
      where:   { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
    if (!sub) return reply.send({ active: false });

    return reply.send({
      active:              true,
      tier:                sub.tier,
      currentPeriodEnd:    sub.currentPeriodEnd,
      cancelAtPeriodEnd:   sub.cancelAtPeriodEnd,
      providerSubscriptionId: sub.providerSubscriptionId,
    });
  }
);

// ?? Protected: cancel subscription at period end ???????????????????????????????
server.post(
  "/api/subscriptions/cancel",
  { preHandler: requireAuth },
  async (req, reply) => {
    const userId = getCallerId(req, reply);
    if (!userId) return;

    const sub = await prisma.subscriptionAccess.findFirst({
      where: { userId, status: "ACTIVE" },
    });
    if (!sub?.providerSubscriptionId) {
      return reply.status(404).send({ error: "No active subscription found" });
    }

    await stripe.subscriptions.update(sub.providerSubscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.subscriptionAccess.update({
      where: { id: sub.id },
      data:  { cancelAtPeriodEnd: true },
    });

    return reply.send({ success: true, cancelAtPeriodEnd: true });
  }
);

// ?? Public (Stripe-signed): subscription webhook ???????????????????????????????
server.post("/api/subscriptions/webhook", { config: { rawBody: true } }, async (req, reply) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      (req as any).rawBody,
      sig,
      process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET ?? ""
    );
  } catch {
    return reply.status(400).send({ error: "Webhook signature verification failed" });
  }

  // ?? New subscription created ???????????????????????????????????????????????
  if (event.type === "customer.subscription.created" || event.type === "checkout.session.completed") {
    let userId: string | undefined;
    let tier:   string | undefined;
    let stripeSub: Stripe.Subscription | undefined;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Session;
      if (session.mode !== "subscription") return reply.send({ received: true });
      userId    = session.metadata?.userId;
      tier      = session.metadata?.tier;
      const subId = typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;
      if (subId) stripeSub = await stripe.subscriptions.retrieve(subId);
    } else {
      stripeSub = event.data.object as Stripe.Subscription;
      userId    = stripeSub.metadata?.userId;
      tier      = stripeSub.metadata?.tier;
    }

    if (!userId || !tier || !stripeSub) return reply.send({ received: true });

    const period = stripeSub.items.data[0]?.current_period_end;
    await prisma.subscriptionAccess.create({
      data: {
        userId,
        tier,
        status:                "ACTIVE",
        providerSubscriptionId: stripeSub.id,
        currentPeriodStart:    new Date(stripeSub.items.data[0]?.current_period_start * 1000 ?? Date.now()),
        currentPeriodEnd:      new Date((period ?? Math.floor(Date.now() / 1000) + 2592000) * 1000),
        cancelAtPeriodEnd:     stripeSub.cancel_at_period_end,
      },
    });
  }

  // ?? Subscription renewed ???????????????????????????????????????????????????
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const subId   = typeof invoice.subscription === "string"
      ? invoice.subscription : (invoice.subscription as any)?.id;
    if (!subId) return reply.send({ received: true });

    const stripeSub = await stripe.subscriptions.retrieve(subId);
    const period    = stripeSub.items.data[0]?.current_period_end;
    await prisma.subscriptionAccess.updateMany({
      where: { providerSubscriptionId: subId },
      data:  {
        status:           "ACTIVE",
        currentPeriodEnd: new Date((period ?? Math.floor(Date.now() / 1000) + 2592000) * 1000),
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
      },
    });
  }

  // ?? Subscription expired / canceled ???????????????????????????????????????
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    await prisma.subscriptionAccess.updateMany({
      where: { providerSubscriptionId: sub.id },
      data:  { status: "EXPIRED" },
    });
  }

  // ?? Payment failed ?????????????????????????????????????????????????????????
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const subId   = typeof invoice.subscription === "string"
      ? invoice.subscription : (invoice.subscription as any)?.id;
    if (subId) {
      await prisma.subscriptionAccess.updateMany({
        where: { providerSubscriptionId: subId },
        data:  { status: "PAST_DUE" },
      });
    }
  }

  return reply.send({ received: true });
});

// ?? Internal: check if a user has an active subscription ??????????????????????
// Used by content-service to gate subscription-only content
server.get<{ Params: { userId: string } }>(
  "/api/subscriptions/check/:userId",
  async (req, reply) => {
    const secret = req.headers["x-internal-secret"];
    if (secret !== (process.env.INTERNAL_SECRET ?? "internal-secret-local")) {
      return reply.status(403).send({ error: "Forbidden" });
    }
    const sub = await prisma.subscriptionAccess.findFirst({
      where: {
        userId: req.params.userId,
        status: "ACTIVE",
        currentPeriodEnd: { gte: new Date() },
      },
    });
    return reply.send({ active: !!sub, tier: sub?.tier ?? null });
  }
);

server.get("/health", async () => ({ status: "ok", service: "subscription-service" }));

const PORT = parseInt(process.env.PORT ?? "3008", 10);
server.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) { server.log.error(err); process.exit(1); }
  console.log("Subscription service listening at " + address);
});
