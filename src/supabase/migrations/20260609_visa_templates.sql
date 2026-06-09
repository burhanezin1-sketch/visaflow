-- visa_templates tablosu: firma şablonları + global kütüphane

CREATE TABLE IF NOT EXISTS public.visa_templates (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id  uuid        REFERENCES public.companies(id) ON DELETE CASCADE,
  country     text        NOT NULL,
  visa_type   text        NOT NULL,
  occupation  text        NOT NULL,
  docs        jsonb       NOT NULL DEFAULT '[]',
  status      text        DEFAULT 'pending'
              CHECK (status IN ('pending', 'approved', 'rejected')),
  is_global   boolean     DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visa_templates_company   ON public.visa_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_visa_templates_lookup    ON public.visa_templates(country, visa_type, occupation);
CREATE INDEX IF NOT EXISTS idx_visa_templates_global    ON public.visa_templates(is_global, status);

ALTER TABLE public.visa_templates ENABLE ROW LEVEL SECURITY;

-- Firma kendi şablonlarını görür + is_global+approved olanları herkes görür
CREATE POLICY "vt_select" ON public.visa_templates
  FOR SELECT TO authenticated
  USING (
    (company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    ))
    OR (is_global = true AND status = 'approved')
  );

-- Firma kendi şablonlarını oluşturabilir
CREATE POLICY "vt_insert" ON public.visa_templates
  FOR INSERT TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Firma kendi şablonlarını güncelleyebilir (pending olanları)
CREATE POLICY "vt_update_own" ON public.visa_templates
  FOR UPDATE TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
    AND status = 'pending'
  );

-- Superadmin her şeyi güncelleyebilir (service_role bypass eder)
