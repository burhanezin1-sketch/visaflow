ALTER TABLE public.service_prices
  ADD COLUMN IF NOT EXISTS nationality text DEFAULT NULL;
