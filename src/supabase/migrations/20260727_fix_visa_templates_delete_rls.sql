-- visa_templates DELETE RLS düzeltmesi
-- Sorun: eski politika sadece status='pending' silmeye izin veriyordu.
-- Şablonlar artık status='approved' oluşturuluyor, bu yüzden silinemiyordu.
-- Çözüm: firmanın kendi non-global şablonlarını status'tan bağımsız silmesine izin ver.

-- Olası eski politikaları temizle (hangisi varsa)
DROP POLICY IF EXISTS "Users can delete own pending templates"       ON public.visa_templates;
DROP POLICY IF EXISTS "allow_delete_pending"                         ON public.visa_templates;
DROP POLICY IF EXISTS "delete_own_templates"                         ON public.visa_templates;
DROP POLICY IF EXISTS "delete_own_pending_templates"                 ON public.visa_templates;
DROP POLICY IF EXISTS "visa_templates_delete"                        ON public.visa_templates;
DROP POLICY IF EXISTS "Companies can delete own templates"           ON public.visa_templates;

-- Yeni politika: şirketin kendi non-global şablonlarını her statüste silebilir
CREATE POLICY "allow_delete_own_nonglobal_templates"
  ON public.visa_templates
  FOR DELETE
  TO authenticated
  USING (
    is_global = false
    AND company_id = (
      SELECT company_id FROM public.users WHERE id = auth.uid() LIMIT 1
    )
  );
