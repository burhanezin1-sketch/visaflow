-- ============================================================
-- VECTROPUS — RLS Policy Kurulumu
-- Supabase SQL Editor'a yapıştırıp çalıştırın
-- ============================================================


-- ── BÖLÜM 1: YARDIMCI FONKSİYON ────────────────────────────
-- SECURITY DEFINER: users tablosu kendi policy'sini evaluate
-- ederken bu fonksiyonu çağırır; RLS'yi bypass ederek çalışır,
-- sonsuz öz-referans döngüsünü önler.

CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid()
$$;


-- ── BÖLÜM 1b: EKSIK KOLONLAR (yoksa ekle) ───────────────────
-- notes tablosunda company_id zorunlu (RLS policy bunu kullanır)

ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id);


-- ── BÖLÜM 2: TÜM TABLOLARDA RLS'Yİ AKTİF ET ────────────────

ALTER TABLE public.activity_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destruction_log   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_limits       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_prices    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.superadmins       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visa_documents    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_messages       ENABLE ROW LEVEL SECURITY;


-- ── BÖLÜM 3: MEVCUT POLİCYLARİ TEMİZLE ─────────────────────

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM   pg_policies
    WHERE  schemaname = 'public'
      AND  tablename IN (
             'activity_logs', 'applications', 'clients', 'companies',
             'destruction_log', 'documents', 'leads', 'notes', 'payments',
             'plan_limits', 'service_prices', 'superadmins', 'tasks',
             'transfer_requests', 'users', 'visa_documents', 'wa_messages'
           )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON public.%I',
      r.policyname, r.tablename
    );
  END LOOP;
END;
$$;


-- ── BÖLÜM 4: POLİCY'LER ──────────────────────────────────────


-- ──────────────────────────────────────────────────────────────
-- superadmins
-- Yalnızca kendi satırını okuyabilir.
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "superadmins_select"
  ON public.superadmins
  FOR SELECT
  USING (id = auth.uid());


-- ──────────────────────────────────────────────────────────────
-- plan_limits  (global, salt-okunur tablo)
-- Kimlik doğrulanmış herkes okur; superadmin yazar.
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "plan_limits_select"
  ON public.plan_limits
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "plan_limits_insert"
  ON public.plan_limits
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "plan_limits_update"
  ON public.plan_limits
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "plan_limits_delete"
  ON public.plan_limits
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );


-- ──────────────────────────────────────────────────────────────
-- visa_documents  (global şablon tablosu — company_id yok)
-- Kimlik doğrulanmış herkes okur; superadmin yazar.
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "visa_documents_select"
  ON public.visa_documents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "visa_documents_insert"
  ON public.visa_documents
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "visa_documents_update"
  ON public.visa_documents
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "visa_documents_delete"
  ON public.visa_documents
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );


-- ──────────────────────────────────────────────────────────────
-- destruction_log  (yalnızca superadmin)
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "destruction_log_select"
  ON public.destruction_log
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "destruction_log_insert"
  ON public.destruction_log
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "destruction_log_update"
  ON public.destruction_log
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "destruction_log_delete"
  ON public.destruction_log
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );


-- ──────────────────────────────────────────────────────────────
-- companies  (primary key = id, company_id kolonu yoktur)
-- Kullanıcı kendi firmasını görür; superadmin tümünü yönetir.
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "companies_select"
  ON public.companies
  FOR SELECT
  USING (
    id = public.get_my_company_id()
    OR EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "companies_insert"
  ON public.companies
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "companies_update"
  ON public.companies
  FOR UPDATE
  USING (
    id = public.get_my_company_id()
    OR EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "companies_delete"
  ON public.companies
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );


-- ──────────────────────────────────────────────────────────────
-- users  (SECURITY DEFINER fonksiyonu ile öz-referans önlendi)
-- Aynı firmadaki tüm kullanıcıları görür; superadmin tümünü yönetir.
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "users_select"
  ON public.users
  FOR SELECT
  USING (
    company_id = public.get_my_company_id()
    OR EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "users_insert"
  ON public.users
  FOR INSERT
  WITH CHECK (
    company_id = public.get_my_company_id()
    OR EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "users_update"
  ON public.users
  FOR UPDATE
  USING (
    company_id = public.get_my_company_id()
    OR EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "users_delete"
  ON public.users
  FOR DELETE
  USING (
    company_id = public.get_my_company_id()
    OR EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );


-- ──────────────────────────────────────────────────────────────
-- FİRMA KAPSAMLI TABLOLAR (company_id kolonu var)
--
-- SELECT  : kendi firması  +  superadmin
-- INSERT  : yalnızca kendi firması
-- UPDATE  : yalnızca kendi firması
-- DELETE  : yalnızca kendi firması
-- ──────────────────────────────────────────────────────────────


-- clients ──────────────────────────────────────────────────────

CREATE POLICY "clients_select"
  ON public.clients
  FOR SELECT
  USING (
    company_id = public.get_my_company_id()
    OR EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "clients_insert"
  ON public.clients
  FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "clients_update"
  ON public.clients
  FOR UPDATE
  USING (company_id = public.get_my_company_id());

CREATE POLICY "clients_delete"
  ON public.clients
  FOR DELETE
  USING (company_id = public.get_my_company_id());


-- applications ─────────────────────────────────────────────────

CREATE POLICY "applications_select"
  ON public.applications
  FOR SELECT
  USING (
    company_id = public.get_my_company_id()
    OR EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "applications_insert"
  ON public.applications
  FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "applications_update"
  ON public.applications
  FOR UPDATE
  USING (company_id = public.get_my_company_id());

CREATE POLICY "applications_delete"
  ON public.applications
  FOR DELETE
  USING (company_id = public.get_my_company_id());


-- documents ────────────────────────────────────────────────────

CREATE POLICY "documents_select"
  ON public.documents
  FOR SELECT
  USING (
    company_id = public.get_my_company_id()
    OR EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "documents_insert"
  ON public.documents
  FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "documents_update"
  ON public.documents
  FOR UPDATE
  USING (company_id = public.get_my_company_id());

CREATE POLICY "documents_delete"
  ON public.documents
  FOR DELETE
  USING (company_id = public.get_my_company_id());


-- payments ─────────────────────────────────────────────────────

CREATE POLICY "payments_select"
  ON public.payments
  FOR SELECT
  USING (
    company_id = public.get_my_company_id()
    OR EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "payments_insert"
  ON public.payments
  FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "payments_update"
  ON public.payments
  FOR UPDATE
  USING (company_id = public.get_my_company_id());

CREATE POLICY "payments_delete"
  ON public.payments
  FOR DELETE
  USING (company_id = public.get_my_company_id());


-- leads ────────────────────────────────────────────────────────

CREATE POLICY "leads_select"
  ON public.leads
  FOR SELECT
  USING (
    company_id = public.get_my_company_id()
    OR EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "leads_insert"
  ON public.leads
  FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "leads_update"
  ON public.leads
  FOR UPDATE
  USING (company_id = public.get_my_company_id());

CREATE POLICY "leads_delete"
  ON public.leads
  FOR DELETE
  USING (company_id = public.get_my_company_id());


-- activity_logs ────────────────────────────────────────────────

CREATE POLICY "activity_logs_select"
  ON public.activity_logs
  FOR SELECT
  USING (
    company_id = public.get_my_company_id()
    OR EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "activity_logs_insert"
  ON public.activity_logs
  FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "activity_logs_update"
  ON public.activity_logs
  FOR UPDATE
  USING (company_id = public.get_my_company_id());

CREATE POLICY "activity_logs_delete"
  ON public.activity_logs
  FOR DELETE
  USING (company_id = public.get_my_company_id());


-- wa_messages ──────────────────────────────────────────────────

CREATE POLICY "wa_messages_select"
  ON public.wa_messages
  FOR SELECT
  USING (
    company_id = public.get_my_company_id()
    OR EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "wa_messages_insert"
  ON public.wa_messages
  FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "wa_messages_update"
  ON public.wa_messages
  FOR UPDATE
  USING (company_id = public.get_my_company_id());

CREATE POLICY "wa_messages_delete"
  ON public.wa_messages
  FOR DELETE
  USING (company_id = public.get_my_company_id());


-- service_prices ───────────────────────────────────────────────

CREATE POLICY "service_prices_select"
  ON public.service_prices
  FOR SELECT
  USING (
    company_id = public.get_my_company_id()
    OR EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "service_prices_insert"
  ON public.service_prices
  FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "service_prices_update"
  ON public.service_prices
  FOR UPDATE
  USING (company_id = public.get_my_company_id());

CREATE POLICY "service_prices_delete"
  ON public.service_prices
  FOR DELETE
  USING (company_id = public.get_my_company_id());


-- notes ────────────────────────────────────────────────────────

CREATE POLICY "notes_select"
  ON public.notes
  FOR SELECT
  USING (
    company_id = public.get_my_company_id()
    OR EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "notes_insert"
  ON public.notes
  FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "notes_update"
  ON public.notes
  FOR UPDATE
  USING (company_id = public.get_my_company_id());

CREATE POLICY "notes_delete"
  ON public.notes
  FOR DELETE
  USING (company_id = public.get_my_company_id());


-- tasks ────────────────────────────────────────────────────────

CREATE POLICY "tasks_select"
  ON public.tasks
  FOR SELECT
  USING (
    company_id = public.get_my_company_id()
    OR EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "tasks_insert"
  ON public.tasks
  FOR INSERT
  WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "tasks_update"
  ON public.tasks
  FOR UPDATE
  USING (company_id = public.get_my_company_id());

CREATE POLICY "tasks_delete"
  ON public.tasks
  FOR DELETE
  USING (company_id = public.get_my_company_id());


-- ──────────────────────────────────────────────────────────────
-- transfer_requests
--
-- SELECT  : from_user veya to_user olan  +  superadmin
-- INSERT  : yalnızca gönderen (from_user = auth.uid())
-- UPDATE  : yalnızca alıcı (to_user)  +  superadmin
-- DELETE  : gönderen veya superadmin
-- ──────────────────────────────────────────────────────────────

CREATE POLICY "transfer_requests_select"
  ON public.transfer_requests
  FOR SELECT
  USING (
    from_user = auth.uid()
    OR to_user = auth.uid()
    OR EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "transfer_requests_insert"
  ON public.transfer_requests
  FOR INSERT
  WITH CHECK (from_user = auth.uid());

CREATE POLICY "transfer_requests_update"
  ON public.transfer_requests
  FOR UPDATE
  USING (
    to_user = auth.uid()
    OR EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );

CREATE POLICY "transfer_requests_delete"
  ON public.transfer_requests
  FOR DELETE
  USING (
    from_user = auth.uid()
    OR EXISTS (SELECT 1 FROM public.superadmins WHERE id = auth.uid())
  );
