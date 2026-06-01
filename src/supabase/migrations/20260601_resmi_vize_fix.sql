-- ============================================================
-- 20260601_resmi_vize_fix.sql
-- Resmi Vize düzeltmesi:
--   1. Tüm meslekler için package_name = 'none'
--      (kişisel finansal evrak gelmesin; görev evrakları yeterli)
--   2. Sponsor / aile cüzdanı / nikah evraklarını temizle
--   3. Doğru evrak listesini taze yükle
-- ============================================================

-- ── 1. Meslek paketi: 'none' ──────────────────────────────────
UPDATE public.visa_package_rules
SET    package_name = 'none'
WHERE  visa_type = 'Resmi Vize';

-- ── 2. Yanlış evrakları temizle ───────────────────────────────
DELETE FROM public.country_specific_docs
WHERE  visa_type = 'Resmi Vize'
  AND  (
         doc_name ILIKE '%sponsor%'
      OR doc_name ILIKE '%aile cüzdanı%'
      OR doc_name ILIKE '%nikah%'
       );

-- ── 3. Evrak listesini sıfırla ve doğru haliyle yükle ─────────
DELETE FROM public.country_specific_docs
WHERE  visa_type = 'Resmi Vize';

INSERT INTO public.country_specific_docs
  (country, visa_type, doc_name, delivery_type, order_num)
VALUES
  (NULL, 'Resmi Vize', 'Resmi vize başvuru formu (imzalı)',                           'firma',   1),
  (NULL, 'Resmi Vize', 'Görev / misyon belgesi (kurumdan imzalı ve mühürlü)',         'digital', 2),
  (NULL, 'Resmi Vize', 'Davet eden ülkenin kurumundan resmi davet yazısı',            'digital', 3),
  (NULL, 'Resmi Vize', 'Gidiş-dönüş uçak bileti rezervasyonu',                       'digital', 4),
  (NULL, 'Resmi Vize', 'Görev süresi ve amacını açıklayan yazı',                      'digital', 5),
  (NULL, 'Resmi Vize', 'Son 3 aylık banka hesap dökümü (banka kaşeli/imzalı)',        'digital', 6);
