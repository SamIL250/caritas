-- One row per Stripe PaymentIntent / Checkout completion reference (webhook + success-page finalize may race).
create unique index if not exists donations_stripe_payment_intent_id_unique
  on public.donations (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;
