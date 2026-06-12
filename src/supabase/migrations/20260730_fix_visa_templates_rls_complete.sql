-- visa_templates RLS tam düzeltme
-- Sorunlar:
--   1. DELETE policy hiç yoktu → şablonlar silinemiyordu
--   2. UPDATE policy sadece status='pending' için → approved şablonlar düzenlenemiyordu
-- Çözüm: firma kendi non-global şablonlarını status'tan bağımsız silebilir ve düzenleyebilir

-- Tüm eski DELETE politikalarını temizle
DROP POLICY IF EXISTS "Users can delete own pending templates"        ON public.visa_templates;
DROP POLICY IF EXISTS "allow_delete_pending"                          ON public.visa_templates;
DROP POLICY IF EXISTS "delete_own_templates"                          ON public.visa_templates;
DROP POLICY IF EXISTS "delete_own_pending_templates"                  ON public.visa_templates;
DROP POLICY IF EXISTS "visa_templates_delete"                         ON public.visa_templates;
DROP POLICY IF EXISTS "Companies can delete own templates"            ON public.visa_templates;
DROP POLICY IF EXISTS "allow_delete_own_nonglobal_templates"          ON public.visa_templates;

-- Tüm eski UPDATE politikalarını temizle
DROP POLICY IF EXISTS "vt_update_own"                                 ON public.visa_templates;
DROP POLICY IF EXISTS "Companies can update own templates"            ON public.visa_templates;
DROP POLICY IF EXISTS "allow_update_own_templates"                    ON public.visa_templates;

-- DELETE: firmanın kendi non-global şablonlarını her statüste silebilir
CREATE POLICY "vt_delete_own"
  ON public.visa_templates
  FOR DELETE
  TO authenticated
  USING (
    is_global = false
    AND company_id = (
      SELECT company_id FROM public.users WHERE id = auth.uid() LIMIT 1
    )
  );

-- UPDATE: firmanın kendi non-global şablonlarını her statüste düzenleyebilir
CREATE POLICY "vt_update_own"
  ON public.visa_templates
  FOR UPDATE
  TO authenticated
  USING (
    is_global = false
    AND company_id = (
      SELECT company_id FROM public.users WHERE id = auth.uid() LIMIT 1
    )
  )
  WITH CHECK (
    is_global = false
    AND company_id = (
      SELECT company_id FROM public.users WHERE id = auth.uid() LIMIT 1
    )
  );
