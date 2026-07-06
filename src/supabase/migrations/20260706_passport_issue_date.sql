ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS passport_issue_date date;
