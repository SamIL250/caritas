-- How the donor chose to pay (Stripe checkout vs offline instructions).

alter table public.donations
  add column if not exists payment_method text not null default 'stripe';
comment on column public.donations.payment_method is
  'stripe | bank_transfer | mtn_momo | airtel_money | manual (dashboard-entered).';
create index if not exists donations_payment_method_idx on public.donations (payment_method);
