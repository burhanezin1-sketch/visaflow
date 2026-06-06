-- Kural 52-53: Kanada + Kültürel Vize konaklama sil + İkametgah metni kesin override (DEDUP sonrası)

DROP FUNCTION IF EXISTS public.get_visa_documents(uuid, text, text, text);

CREATE FUNCTION public.get_visa_documents(
  p_application_id uuid,
  p_country        text,
  p_visa_type      text,
  p_occupation     text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_package    text;
  non_schengen CONSTANT text[] := ARRAY[
    'Amerika Birleşik Devletleri',
    'Kanada',
    'İngiltere',
    'Japonya',
    'Güney Kore'
  ];
BEGIN
  IF auth.uid() IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM   public.applications a
    JOIN   public.users u ON u.company_id = a.company_id
    WHERE  a.id = p_application_id
      AND  u.id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Erişim reddedildi: başvuru firmanıza ait değil';
  END IF;

  DELETE FROM public.user_submitted_docs
  WHERE  application_id = p_application_id;

  SELECT package_name INTO v_package
  FROM   public.visa_package_rules
  WHERE  visa_type  = p_visa_type
    AND  is_active  = true
    AND  (occupation = p_occupation OR occupation IS NULL)
    AND  (country    = p_country    OR country    IS NULL)
  ORDER BY
    CASE WHEN country    = p_country    THEN 0 ELSE 1 END,
    CASE WHEN occupation = p_occupation THEN 0 ELSE 1 END,
    priority ASC
  LIMIT 1;

  -- ---------------------------------------------------------
  -- KATMAN 1: Standart evraklar
  -- ---------------------------------------------------------
  INSERT INTO public.user_submitted_docs
    (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.standard_travel_docs
  WHERE
    NOT (p_country = ANY(non_schengen) AND doc_name ILIKE '%30.000 €%')
    AND NOT (p_visa_type = 'Transit Vize'
             AND (doc_name ILIKE '%uçak%' OR doc_name ILIKE '%bileti%'))
  ORDER BY
    CASE
      WHEN p_country = 'İtalya' AND doc_name ILIKE '%seyahat sağlık sigortası%'
        THEN 4.5
      ELSE order_num::numeric
    END;

  -- ---------------------------------------------------------
  -- KATMAN 2: Meslek paketi
  -- ---------------------------------------------------------
  IF v_package IS NOT NULL
     AND v_package NOT IN ('none', 'isveren_evraklari')
  THEN
    INSERT INTO public.user_submitted_docs
      (application_id, doc_name, delivery_type, status)
    SELECT p_application_id, doc_name, delivery_type, 'pending'
    FROM   public.occupation_doc_packages
    WHERE  occupation = v_package
    ORDER  BY order_num;
  END IF;

  IF p_occupation = 'ogrenci' AND (v_package IS NULL OR v_package != 'ogrenci') THEN
    INSERT INTO public.user_submitted_docs
      (application_id, doc_name, delivery_type, status)
    SELECT p_application_id, doc_name, delivery_type, 'pending'
    FROM   public.occupation_doc_packages
    WHERE  occupation = 'ogrenci'
      AND  doc_name   ILIKE '%öğrenci belgesi%'
    ORDER  BY order_num;
  END IF;

  -- ---------------------------------------------------------
  -- KATMAN 3: Ulkeye özgü evraklar
  -- ---------------------------------------------------------
  INSERT INTO public.user_submitted_docs
    (application_id, doc_name, delivery_type, status)
  SELECT p_application_id, doc_name, delivery_type, 'pending'
  FROM   public.country_specific_docs
  WHERE  (country IS NULL OR country = p_country)
    AND  (visa_type IS NULL OR visa_type = p_visa_type)
    AND  (occupation IS NULL OR occupation = p_occupation)
    AND NOT (
      visa_type IS NULL
      AND (doc_name ILIKE '%başvuru formu%' OR doc_name ILIKE '%vize formu%')
      AND EXISTS (
        SELECT 1 FROM public.country_specific_docs sub
        WHERE  (sub.country IS NULL OR sub.country = p_country)
          AND  sub.visa_type = p_visa_type
          AND  (sub.doc_name ILIKE '%başvuru formu%' OR sub.doc_name ILIKE '%vize formu%')
      )
    )
    AND NOT (
      country IS NULL
      AND doc_name ILIKE '%davet%'
      AND EXISTS (
        SELECT 1 FROM public.country_specific_docs sub
        WHERE  sub.country   = p_country
          AND  sub.visa_type = p_visa_type
          AND  sub.doc_name  ILIKE '%davet%'
      )
    )
  ORDER BY
    CASE WHEN country   = p_country THEN 0 ELSE 1 END,
    CASE WHEN visa_type IS NOT NULL THEN 0 ELSE 1 END,
    order_num;

  -- ---------------------------------------------------------
  -- POST-PROCESSING
  -- ---------------------------------------------------------

  -- 1. Mukerrer sigorta
  IF EXISTS (
    SELECT 1 FROM public.user_submitted_docs
    WHERE  application_id = p_application_id AND doc_name ILIKE '%tüm Schengen%'
  ) THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id AND doc_name = 'Seyahat sağlık sigortası';
  END IF;

  -- 2. Calisan/isveren meslekleri icin sponsor evraklarini sil
  IF p_occupation IN ('sirket_sahibi', 'serbest_meslek', 'calisan') THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%Sponsor tarafından%' OR doc_name ILIKE '%Sponsorun SGK%'
        OR doc_name ILIKE '%Sponsorun İşveren%' OR doc_name ILIKE '%Sponsor (eş/veli)%'
        OR doc_name ILIKE '%Sponsor banka%' OR doc_name ILIKE '%Aile cüzdanı%'
        OR doc_name ILIKE '%nikah cüzdanı%' OR doc_name ILIKE '%masraf taahhütname%'
        OR doc_name ILIKE '%veli/sponsor%'
      );
  END IF;

  -- 3. Sirket_sahibi/serbest_meslek tekil sirket evraklari temizligi
  IF p_occupation IN ('sirket_sahibi', 'serbest_meslek') THEN
    IF EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%Şirket evrakları (güncel vergi levhası%'
    ) THEN
      DELETE FROM public.user_submitted_docs
      WHERE  application_id = p_application_id
        AND (
          doc_name ILIKE 'Vergi levhası%' OR doc_name ILIKE 'Şirket faaliyet belgesi%'
          OR doc_name ILIKE 'Ticaret sicil gazetesi%' OR doc_name ILIKE 'İmza sirküleri%'
        );
    END IF;
  END IF;

  -- 4. Emekli
  IF p_occupation = 'emekli' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (doc_name ILIKE '%Şirket antetli kağıdına%' OR doc_name ILIKE '%Maaş Bordrosu%' OR doc_name ILIKE '%SGK İşe Giriş%');

    IF NOT EXISTS (SELECT 1 FROM public.user_submitted_docs WHERE application_id = p_application_id AND doc_name ILIKE '%Şahsi Vize Talep Dilekçesi%') THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Şahsi Vize Talep Dilekçesi (konsolosluğa hitaben yazılmış, seyahat amacını ve dönüş taahhüdünü belirten ıslak imzalı dilekçe)', 'digital', 'pending');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.user_submitted_docs WHERE application_id = p_application_id AND doc_name ILIKE '%Emeklilik Belgesi%') THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Emeklilik Belgesi (e-Devlet barkodlu emekli aylık bilgisi belgesi)', 'digital', 'pending');
    END IF;
  END IF;

  -- 5. Ogrenci
  IF p_occupation = 'ogrenci' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%Sponsorun İşveren İzin%' OR doc_name ILIKE '%Sponsor İşveren İzin%'
        OR doc_name ILIKE '%Sponsorun işveren izin%' OR doc_name ILIKE '%Aile cüzdanı%'
        OR doc_name ILIKE '%nikah cüzdanı%'
      );

    DELETE FROM public.user_submitted_docs
    WHERE (application_id = p_application_id AND LOWER(doc_name) LIKE '%şahsi%banka%')
       OR (application_id = p_application_id AND LOWER(doc_name) LIKE '%banka hesap%'
           AND LOWER(doc_name) NOT LIKE '%sponsor%' AND LOWER(doc_name) NOT LIKE '%şirket%');

    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%Sponsor Dilekçesi ve Sponsorun%';

    UPDATE public.user_submitted_docs
    SET    doc_name = REPLACE(doc_name, 'Sponsor (eş/veli)', 'Sponsor (Anne/Baba/Veli)')
    WHERE  application_id = p_application_id AND doc_name ILIKE '%Sponsor (eş/veli)%';

    IF NOT EXISTS (SELECT 1 FROM public.user_submitted_docs WHERE application_id = p_application_id AND doc_name ILIKE '%Sponsor Dilekçesi%') THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Sponsor Dilekçesi ve Sponsorun Mesleki/Finansal Evrakları (anne, baba veya velinin gelir belgesi ve taahhütnamesi)', 'digital', 'pending');
    END IF;
  END IF;

  -- 6. Devlet Memuru
  IF p_occupation = 'devlet_memuru' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%işveren izin%' OR doc_name ILIKE '%İşveren İzin/Görev%'
        OR doc_name ILIKE '%Şirket antetli%' OR doc_name ILIKE '%SGK İşe Giriş%'
        OR doc_name ILIKE '%Ticaret Sicil%' OR doc_name ILIKE '%Faaliyet Belgesi%'
        OR doc_name ILIKE '%İmza Sirküleri%' OR doc_name ILIKE '%Vergi Levhası%'
      );

    UPDATE public.user_submitted_docs
    SET    doc_name = 'Maaş bordrosu (e-Devlet üzerinden alınan son 3 aya ait barkodlu e-Bordro)'
    WHERE  application_id = p_application_id AND doc_name ILIKE '%maaş bordrosu%';

    IF NOT EXISTS (SELECT 1 FROM public.user_submitted_docs WHERE application_id = p_application_id AND doc_name ILIKE '%Görev Belgesi%') THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES
        (p_application_id, 'Çalışma Belgesi / Görev Belgesi (e-Devletten barkodlu veya kurumdan ıslak imzalı/mühürlü)', 'digital', 'pending'),
        (p_application_id, 'Resmi İzin Belgesi (bağlı bulunulan kurumdan mühürlü ve ıslak imzalı seyahat izin yazısı)', 'digital', 'pending');
    END IF;

    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%Resmi İzin Belgesi%'
      AND  doc_name NOT ILIKE '%Görev belgesi%';
  END IF;

  -- 7. Ev Hanimi + Calismiyor
  IF p_occupation IN ('ev_hanimi_meslek', 'ev_hanimi') THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%Şirket antetli%' OR doc_name ILIKE '%Maaş Bordrosu%'
        OR doc_name ILIKE '%SGK İşe Giriş%' OR doc_name ILIKE '%şahsi banka hesap dökümü%'
        OR doc_name ILIKE '%işveren izin%'
      );

    IF p_occupation = 'ev_hanimi_meslek' AND NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id
        AND (doc_name ILIKE '%Aile cüzdanı%' OR doc_name ILIKE '%nikah cüzdanı%')
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Aile cüzdanı / nikah cüzdanı fotokopisi (sponsorla olan evlilik ve akrabalık bağını kanıtlar)', 'digital', 'pending');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.user_submitted_docs WHERE application_id = p_application_id AND doc_name ILIKE '%Sponsorluk Yazısı%') THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Sponsorluk Yazısı ve Masrafları Karşılayacak Birinci Derece Yakının Tüm Finansal Evrakları (maaş/emekli bordrosu, banka dökümü, vergi levhası)', 'digital', 'pending');
    END IF;
  END IF;

  -- 8. Schengen disi ulkelerde calisan
  IF p_country = ANY(non_schengen) AND p_occupation = 'calisan' THEN
    UPDATE public.user_submitted_docs
    SET    doc_name = 'Şirket İzin ve Görev Belgesi (şirketin antetli kağıdına, yetkili imzalı, kaşeli ve görev/izin tarihlerini içeren yazı)'
    WHERE  application_id = p_application_id AND doc_name ILIKE '%işveren izin%';
  END IF;

  -- 9. Almanya
  IF p_country = 'Almanya' THEN
    UPDATE public.user_submitted_docs
    SET    doc_name = 'Son 3 aylık şahsi banka hesap dökümü (banka kaşeli/imzalı)'
    WHERE  application_id = p_application_id AND doc_name ILIKE '%banka hesap dökümü%' AND doc_name ILIKE '%İmza Sirküleri%';
  END IF;

  -- 10. Italya
  IF p_country = 'İtalya' THEN
    UPDATE public.user_submitted_docs
    SET    doc_name = 'Son 3 aylık şahsi banka hesap dökümü (banka kaşeli/imzalı)'
    WHERE  application_id = p_application_id AND doc_name ILIKE '%banka hesap dökümü%' AND doc_name ILIKE '%İmza Sirküleri%';
  END IF;

  -- 11. Fransa
  IF p_country = 'Fransa' THEN
    IF EXISTS (SELECT 1 FROM public.user_submitted_docs WHERE application_id = p_application_id AND doc_name ILIKE '%İngilizce veya Fransızca%') THEN
      DELETE FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name = 'Şirket antetli kağıdına yazılmış vize talep dilekçesi (imzalı ve kaşeli)';
    END IF;
  END IF;

  -- 12. İngiltere: banka + sigorta
  IF p_country = 'İngiltere' THEN
    UPDATE public.user_submitted_docs
    SET    doc_name = 'Son 3 aylık şahsi banka hesap dökümü (banka kaşeli/imzalı)'
    WHERE  application_id = p_application_id AND doc_name ILIKE '%banka hesap dökümü%' AND doc_name ILIKE '%İmza Sirküleri%';

    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id AND doc_name ILIKE '%seyahat sağlık sigortası%';
  END IF;

  -- 13. Japonya
  IF p_country = 'Japonya' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id AND doc_name ILIKE '%seyahat sağlık sigortası%';

    UPDATE public.user_submitted_docs
    SET    doc_name = 'Son 3 aylık şahsi banka hesap dökümü (banka kaşeli/imzalı)'
    WHERE  application_id = p_application_id AND doc_name ILIKE '%banka hesap dökümü%' AND doc_name ILIKE '%İmza Sirküleri%';
  END IF;

  -- 14. Güney Kore
  IF p_country = 'Güney Kore' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id AND doc_name ILIKE '%seyahat sağlık sigortası%';

    UPDATE public.user_submitted_docs
    SET    doc_name = 'Son 3 aylık şahsi banka hesap dökümü (banka kaşeli/imzalı)'
    WHERE  application_id = p_application_id AND doc_name ILIKE '%banka hesap dökümü%' AND doc_name ILIKE '%İmza Sirküleri%';
  END IF;

  -- 15. Kanada
  IF p_country = 'Kanada' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id AND doc_name ILIKE '%seyahat sağlık sigortası%';

    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id AND doc_name ILIKE '%uçak bileti rezervasyonu%';

    UPDATE public.user_submitted_docs
    SET    doc_name = 'Son 3 aylık şahsi banka hesap dökümü (banka kaşeli/imzalı)'
    WHERE  application_id = p_application_id AND doc_name ILIKE '%banka hesap dökümü%' AND doc_name ILIKE '%İmza Sirküleri%';
  END IF;

  -- 16. Amerika Birlesik Devletleri
  IF p_country = 'Amerika Birleşik Devletleri' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (doc_name ILIKE '%Schengen%' OR doc_name ILIKE '%30.000 €%' OR doc_name ILIKE '%Ulusal (D Tipi)%');

    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id AND doc_name ILIKE '%seyahat sağlık sigortası%';

    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id AND doc_name ILIKE '%uçak bileti rezervasyonu%';

    UPDATE public.user_submitted_docs
    SET    doc_name = 'Son 3 aylık şahsi banka hesap dökümü (banka kaşeli/imzalı)'
    WHERE  application_id = p_application_id AND doc_name ILIKE '%banka hesap dökümü%' AND doc_name ILIKE '%İmza Sirküleri%';

    UPDATE public.user_submitted_docs
    SET    doc_name = '2 adet Amerika vizesine uygun biyometrik fotoğraf (50x50 mm, kare, beyaz fon)'
    WHERE  application_id = p_application_id AND doc_name ILIKE '%biyometrik fotoğraf%';

    IF NOT EXISTS (SELECT 1 FROM public.user_submitted_docs WHERE application_id = p_application_id AND doc_name ILIKE '%DS-160%') THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'DS-160 Başvuru Formu Onay Sayfası (barkodlu online çıktı — ceac.state.gov adresinden doldurulur)', 'digital', 'pending');
    END IF;
  END IF;

  -- 17. Ticari/İş Gezisi
  IF p_visa_type = 'Ticari/İş Gezisi' THEN
    IF NOT EXISTS (SELECT 1 FROM public.user_submitted_docs WHERE application_id = p_application_id AND doc_name ILIKE '%Görevlendirme Yazısı%') THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Şirket/Kurum Görevlendirme Yazısı (görevi ve seyahat amacını belirten ıslak imzalı/kaşeli yazı)', 'digital', 'pending');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.user_submitted_docs WHERE application_id = p_application_id AND doc_name ILIKE '%Ticari Davetiye%') THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Resmi Ticari Davetiye (karşı firmadan veya fuar organizasyonundan gelen davet mektubu)', 'digital', 'pending');
    END IF;
  END IF;

  -- 18. Aile/Arkadaş Ziyareti
  IF p_visa_type = 'Aile/Arkadaş Ziyareti' THEN
    IF NOT EXISTS (SELECT 1 FROM public.user_submitted_docs WHERE application_id = p_application_id AND doc_name ILIKE '%Belediye%Davetiye%') THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Belediye / Yabancılar Dairesi Onaylı Orijinal Davetiye (davet eden kişinin bulunduğu ülkeden resmi onaylı belge)', 'digital', 'pending');
    END IF;
  END IF;

  -- 19. Aile Birleşimi Vizesi
  IF p_visa_type = 'Aile Birleşimi Vizesi' THEN
    IF NOT EXISTS (SELECT 1 FROM public.user_submitted_docs WHERE application_id = p_application_id AND doc_name ILIKE '%Uluslararası Evlenme%') THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Uluslararası Evlenme Kayıt Örneği (Formül B) ve Dil Yeterlilik Belgesi (gerekli ülkeler için A1 sertifikası)', 'digital', 'pending');
    END IF;
  END IF;

  -- 20. Eğitim/Öğrenci
  IF p_visa_type = 'Eğitim/Öğrenci' THEN
    IF NOT EXISTS (SELECT 1 FROM public.user_submitted_docs WHERE application_id = p_application_id AND doc_name ILIKE '%Kabul Mektubu%') THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Kabul Mektubu / Akreditasyon Belgesi (gidilecek okul veya üniversiteden resmi kayıt onayı)', 'digital', 'pending');
    END IF;
  END IF;

  -- 21. Tedavi/Sağlık Vizesi
  IF p_visa_type = 'Tedavi/Sağlık Vizesi' THEN
    IF NOT EXISTS (SELECT 1 FROM public.user_submitted_docs WHERE application_id = p_application_id AND doc_name ILIKE '%Sağlık Raporu%') THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Sağlık Raporu ve Karşı Hastaneden Kabul Belgesi (tedavi detaylarını ve maliyet üstlenimini gösteren evraklar)', 'digital', 'pending');
    END IF;
  END IF;

  -- 22. Kültürel Vize
  IF p_visa_type = 'Kültürel Vize' THEN
    IF NOT EXISTS (SELECT 1 FROM public.user_submitted_docs WHERE application_id = p_application_id AND doc_name ILIKE '%Etkinlik%Davet%') THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Etkinlik / Davet Katılım Belgesi (kültürel veya sportif organizasyon davetiyesi ve program)', 'digital', 'pending');
    END IF;
  END IF;

  -- 23. Ev Hanimi/Calismiyor: sahsi banka kalintisini temizle
  IF p_occupation IN ('ev_hanimi', 'ev_hanimi_meslek', 'calismiyor') THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id AND LOWER(doc_name) LIKE '%şahsi banka hesap%';
  END IF;

  -- 24. İngiltere/Kanada/İrlanda: tercüme ibaresi (~* regex — karakter/aksan bağımsız)
  IF p_country IN ('İngiltere', 'Kanada', 'İrlanda') THEN
    IF p_country = 'İngiltere' THEN
      UPDATE public.user_submitted_docs
      SET    doc_name = '2 adet biyometrik fotoğraf (35x45 mm, son 1 ay içinde çekilmiş, arka fonu açık gri veya krem renkli İngiltere standardında)'
      WHERE  application_id = p_application_id
        AND  doc_name ILIKE '%fotoğraf%'
        AND  doc_name ILIKE '%35x45%';
    END IF;

    UPDATE public.user_submitted_docs
    SET    doc_name = doc_name || ' (İngilizce mütercim tercüman onaylı çevirisi ile birlikte)'
    WHERE  application_id = p_application_id
      AND (
        doc_name ~* 'kamet'
        OR doc_name ~* 'n.f.s'
        OR doc_name ~* 'kimlik'
      )
      AND  doc_name NOT ILIKE '%tercüme%'
      AND  doc_name NOT ILIKE '%tercüman%'
      AND  doc_name NOT ILIKE '%çeviri%';
  END IF;

  -- 25. Çalışma/İş Vizesinde Visitor Visa formunu sil
  IF p_visa_type = 'Çalışma/İş Vizesi' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id AND doc_name ILIKE '%visitor visa formu%';
  END IF;

  -- 26. Ev Hanımı/Çalışmıyor: sponsor olmayan banka dökümleri sil
  IF p_occupation IN ('ev_hanimi', 'ev_hanimi_meslek', 'calismiyor') THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND  LOWER(doc_name) LIKE '%banka hesap dökümü%'
      AND  LOWER(doc_name) NOT LIKE '%sponsor%';
  END IF;

  -- 27. Global: tüm banka hesap dökümlerini teke düşür — şirket bankası hariç
  DELETE FROM public.user_submitted_docs a
  USING  public.user_submitted_docs b
  WHERE  a.application_id = p_application_id
    AND  b.application_id = p_application_id
    AND  a.doc_name ILIKE '%banka hesap dökümü%'
    AND  b.doc_name ILIKE '%banka hesap dökümü%'
    AND  a.doc_name NOT ILIKE '%şirket%'
    AND  b.doc_name NOT ILIKE '%şirket%'
    AND  a.ctid > b.ctid;

  -- 28. İlk kalan banka dökümünü standart isme çek
  UPDATE public.user_submitted_docs
  SET    doc_name = 'Son 3 aylık şahsi banka hesap dökümü (banka kaşeli ve ıslak imzalı)'
  WHERE  application_id = p_application_id
    AND  doc_name ILIKE '%banka hesap dökümü%'
    AND  doc_name NOT ILIKE '%şirket%'
    AND  doc_name NOT ILIKE '%sponsor%';

  -- 29. İngiltere: fotoğraf standardı + tercüme ibaresi (son override)
  IF p_country = 'İngiltere' THEN
    UPDATE public.user_submitted_docs
    SET    doc_name = '2 adet biyometrik fotoğraf (35x45 mm, son 1 ay içinde çekilmiş, arka fonu açık gri veya krem renkli İngiltere standardında)'
    WHERE  application_id = p_application_id
      AND  (doc_name ILIKE '%fotoğraf%' OR doc_name ILIKE '%fotograf%');

    UPDATE public.user_submitted_docs
    SET    doc_name = doc_name || ' (İngilizce mütercim tercüman onaylı çevirisi ile birlikte)'
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%ikametgah%'
        OR doc_name ILIKE '%nüfus%'
        OR doc_name ILIKE '%nufus%'
        OR doc_name ILIKE '%kimlik%'
      )
      AND  doc_name NOT ILIKE '%tercüme%'
      AND  doc_name NOT ILIKE '%tercüman%';
  END IF;

  -- 30. Almanya + Çalışma/İş Vizesi: iş sözleşmesi + Videx güncelleme
  IF p_country = 'Almanya' AND p_visa_type = 'Çalışma/İş Vizesi' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%Arbeitsvertrag%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES
        (p_application_id, 'Almanya iş sözleşmesi (Arbeitsvertrag) — aslı ve 2 adet fotokopisi', 'physical', 'pending'),
        (p_application_id, 'Somut iş teklifi formu (Erklärung zum Beschäftigungsverhältnis) — işveren tarafından doldurulmuş', 'digital', 'pending'),
        (p_application_id, 'Diploma veya mesleki eğitim sertifikası (Almanca tercümesi ve varsa denklik belgesi / Anabin çıktısı ile)', 'physical', 'pending');
    END IF;

    UPDATE public.user_submitted_docs
    SET    doc_name = 'Ulusal (D Tipi) Vize Başvuru Formu (Videx) — el yazısı ile imzalanmış, 2 nüsha'
    WHERE  application_id = p_application_id AND doc_name ILIKE '%Videx%';
  END IF;

  -- 31. Global banka dökümü fallback — öğrenci hariç, hiç banka dökümü yoksa ekle
  IF p_occupation != 'ogrenci' AND NOT EXISTS (
    SELECT 1 FROM public.user_submitted_docs
    WHERE  application_id = p_application_id AND doc_name ILIKE '%banka%hesap%'
  ) THEN
    INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
    VALUES (p_application_id, 'Son 3 aylık şahsi banka hesap dökümü (ıslak imzalı/kaşeli)', 'digital', 'pending');
  END IF;

  -- 32. Almanya + Eğitim/Öğrenci: akademik belgeler + Sperrkonto + sigorta güncelleme
  IF p_country = 'Almanya' AND p_visa_type = 'Eğitim/Öğrenci' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%özgeçmiş%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES
        (p_application_id, 'İngilizce veya Almanca özgeçmiş (CV)', 'digital', 'pending'),
        (p_application_id, 'Motivasyon mektubu (Almanyada eğitim alma amacını detaylandıran Almanca veya İngilizce imzalı mektup)', 'digital', 'pending'),
        (p_application_id, 'Almanya bloke hesap (Sperrkonto) onay belgesi (tam burs yoksa konsolosluğun belirlediği yıllık tutarın bloke edildiğine dair resmi onay)', 'digital', 'pending');
    END IF;

    UPDATE public.user_submitted_docs
    SET    doc_name = 'Seyahat sağlık sigortası + Incoming/AT11 sağlık sigortası (Almanyada geçerli, eğitim süresini kapsayan poliçe)'
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%seyahat sağlık sigortası%';
  END IF;

  -- 33. Kültürel Vize: davetiye/etkinlik mükerrerlerini teke düşür + adı standartlaştır
  IF p_visa_type = 'Kültürel Vize' THEN
    DELETE FROM public.user_submitted_docs a
    USING  public.user_submitted_docs b
    WHERE  a.application_id = p_application_id
      AND  b.application_id = p_application_id
      AND (a.doc_name ILIKE '%etkinlik%' OR a.doc_name ILIKE '%davet%katılım%' OR a.doc_name ILIKE '%davet mektubu%')
      AND (b.doc_name ILIKE '%etkinlik%' OR b.doc_name ILIKE '%davet%katılım%' OR b.doc_name ILIKE '%davet mektubu%')
      AND  a.ctid > b.ctid;

    UPDATE public.user_submitted_docs
    SET    doc_name = 'Davet eden kurumdan resmi davet mektubu / etkinlik katılım belgesi (kültürel veya sportif organizasyon detaylarını içeren)'
    WHERE  application_id = p_application_id
      AND (doc_name ILIKE '%etkinlik%' OR doc_name ILIKE '%davet%katılım%' OR doc_name ILIKE '%davet mektubu%');
  END IF;

  -- 34. Tedavi/Sağlık Vizesi: mükerrer sigorta + hastane davetiye dedup
  IF p_visa_type ILIKE '%Tedavi%' OR p_visa_type ILIKE '%Sağlık%' THEN
    IF EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id
        AND  doc_name ILIKE '%tüm Schengen%'
        AND  doc_name ILIKE '%sigorta%'
    ) THEN
      DELETE FROM public.user_submitted_docs
      WHERE  application_id = p_application_id
        AND  doc_name ILIKE '%sigorta%'
        AND  doc_name NOT ILIKE '%tüm Schengen%';
    END IF;

    DELETE FROM public.user_submitted_docs a
    USING  public.user_submitted_docs b
    WHERE  a.application_id = p_application_id
      AND  b.application_id = p_application_id
      AND (a.doc_name ILIKE '%hastaneden kabul%' OR a.doc_name ILIKE '%hastaneden randevu%' OR a.doc_name ILIKE '%tedavi göreceği%')
      AND (b.doc_name ILIKE '%hastaneden kabul%' OR b.doc_name ILIKE '%hastaneden randevu%' OR b.doc_name ILIKE '%tedavi göreceği%')
      AND  a.ctid > b.ctid;

    UPDATE public.user_submitted_docs
    SET    doc_name = 'Tedavi göreceği hastaneden resmi randevu / kabul belgesi ve davet mektubu (tedavi detaylarını ve maliyetini belirten, aslı)'
    WHERE  application_id = p_application_id
      AND (doc_name ILIKE '%hastaneden kabul%' OR doc_name ILIKE '%hastaneden randevu%' OR doc_name ILIKE '%tedavi göreceği%');
  END IF;

  -- 35. Transit Vize: SGK/bordro/şirket evraklarını tamamen sil
  IF p_visa_type = 'Transit Vize' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%SGK%'
        OR doc_name ILIKE '%bordro%'
        OR doc_name ILIKE '%maaş%'
        OR doc_name ILIKE '%şirket evrak%'
        OR doc_name ILIKE '%imza sirkü%'
        OR doc_name ILIKE '%faaliyet belgesi%'
        OR doc_name ILIKE '%ticaret sicil%'
        OR doc_name ILIKE '%vergi levhası%'
        OR doc_name ILIKE '%işveren izin%'
      );
  END IF;

  -- 36. Almanya + Transit Vize: Almanca tercüme ibaresi
  IF p_country = 'Almanya' AND p_visa_type = 'Transit Vize' THEN
    UPDATE public.user_submitted_docs
    SET    doc_name = doc_name || ' (Almanca tercümeli)'
    WHERE  application_id = p_application_id
      AND (
        doc_name ~* 'kamet'
        OR doc_name ILIKE '%nüfus kayıt%'
      )
      AND  doc_name NOT ILIKE '%tercüme%'
      AND  doc_name NOT ILIKE '%almanca%';
  END IF;

  -- 37. Güney Kore + Turistik: konaklama rezervasyonu + seyahat planı
  IF p_country = 'Güney Kore' AND p_visa_type = 'Turistik' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%konaklama rezervasyonu%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES
        (p_application_id, 'Otel / konaklama rezervasyonu (başvuru formundaki adres ile eşleşen İngilizce rezervasyon)', 'digital', 'pending'),
        (p_application_id, 'Günlük seyahat planı (Korede gezilecek yerleri gün gün detaylandıran İngilizce Travel Itinerary)', 'digital', 'pending');
    END IF;
  END IF;

  -- 38. Japonya + Turistik: konaklama rezervasyonu + Schedule of Stay formu
  IF p_country = 'Japonya' AND p_visa_type = 'Turistik' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%konaklama rezervasyonu%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES
        (p_application_id, 'Otel / konaklama rezervasyonu (uçuş tarihleri ve seyahat planı ile uyumlu İngilizce belge)', 'digital', 'pending'),
        (p_application_id, 'Resmi Japonya seyahat planı formu (Schedule of Stay — gün gün konaklama, aktivite ve iletişim bilgilerini içeren resmi şablon)', 'digital', 'pending');
    END IF;
  END IF;

  -- 39. İngiltere + Turistik: konaklama rezervasyonu + tercüme ibaresi kaldır
  IF p_country = 'İngiltere' AND p_visa_type = 'Turistik' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%konaklama rezervasyonu%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Otel / konaklama rezervasyonu (seyahat tarihleri ile uyumlu İngilizce belge)', 'digital', 'pending');
    END IF;

    UPDATE public.user_submitted_docs
    SET    doc_name = REGEXP_REPLACE(doc_name, '\s*\(İngilizce mütercim tercüman onaylı çevirisi ile birlikte\)', '', 'gi')
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%nüfus kayıt%'
        OR doc_name ILIKE '%nüfus cüzdanı%'
        OR doc_name ILIKE '%kimlik%'
      );
  END IF;

  -- 40. Kanada + Turistik: IMM 5257 sil, IRCC portal formu + uçak/konaklama ekle, tercüme ibaresi kaldır
  IF p_country = 'Kanada' AND p_visa_type = 'Turistik' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id AND doc_name ILIKE '%IMM 5257%';

    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%IRCC%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Kanada yeni IRCC portal online başvuru formu (portal üzerinden dinamik doldurulur)', 'firma', 'pending');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%uçak bileti rezervasyonu%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES
        (p_application_id, 'Gidiş-dönüş uçak bileti rezervasyonu', 'digital', 'pending'),
        (p_application_id, 'Otel / konaklama rezervasyonu (seyahat tarihleri ile uyumlu)', 'digital', 'pending');
    END IF;

    UPDATE public.user_submitted_docs
    SET    doc_name = REGEXP_REPLACE(doc_name, '\s*\(İngilizce mütercim tercüman onaylı çevirisi ile birlikte\)', '', 'gi')
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%nüfus kayıt%'
        OR doc_name ILIKE '%nüfus cüzdanı%'
        OR doc_name ILIKE '%kimlik%'
      );
  END IF;

  -- 41. Amerika + Turistik: randevu/ödeme belgesi ekle, uçak/otel rezervasyonunu sil
  IF p_country = 'Amerika Birleşik Devletleri' AND p_visa_type = 'Turistik' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%Randevu Onay%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES
        (p_application_id, 'Randevu onay belgesi (Visa Appointment Confirmation sayfası çıktısı)', 'firma', 'pending'),
        (p_application_id, 'Vize ücreti ödeme dekontu (MRV makbuzu)', 'firma', 'pending');
    END IF;

    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%uçak bileti rezervasyonu%'
        OR doc_name ILIKE '%otel%rezervasyon%'
        OR doc_name ILIKE '%konaklama rezervasyonu%'
      );
  END IF;

  -- 42. Almanya + Turistik: konaklama + devlet memuru görev belgesi + emekli banka dökümü güncelleme
  IF p_country = 'Almanya' AND p_visa_type = 'Turistik' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%konaklama rezervasyonu%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Otel / konaklama rezervasyonu (uçak bileti tarihleri ile tam uyumlu)', 'digital', 'pending');
    END IF;

    IF p_occupation = 'devlet_memuru' THEN
      UPDATE public.user_submitted_docs
      SET    doc_name = 'Görev belgesi ve resmi izin belgesi (bağlı bulunulan kamu kurumundan, seyahat tarihlerini içeren, mühürlü ve ıslak imzalı veya e-imzalı asıl belge)'
      WHERE  application_id = p_application_id
        AND (doc_name ILIKE '%Çalışma Belgesi%' OR doc_name ILIKE '%Görev Belgesi%');
    END IF;

    IF p_occupation = 'emekli' THEN
      UPDATE public.user_submitted_docs
      SET    doc_name = 'Son 3 aylık şahsi banka hesap dökümü (özellikle emekli maaşının yattığı hesap olmalı, içinde yeterli bakiye bulunan, banka kaşeli, ıslak imzalı ve imza sirküleri ile birlikte)'
      WHERE  application_id = p_application_id
        AND  doc_name ILIKE '%banka hesap dökümü%'
        AND  doc_name NOT ILIKE '%şirket%';
    END IF;
  END IF;

  -- 43. Almanya + Turistik + öğrenci: şirket dilekçesi/sponsor mükerrer sil, sponsorluk dilekçesi ekle
  IF p_country = 'Almanya' AND p_visa_type = 'Turistik' AND p_occupation = 'ogrenci' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%şirket antetli%';

    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%masraf taahhütname%'
        OR doc_name ILIKE '%Sponsor tarafından yazılmış%'
        OR doc_name ILIKE '%Sponsorluk Yazısı%'
      );

    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%Sponsorluk Dilekçesi%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Sponsorluk dilekçesi (anne veya baba tarafından konsolosluğa hitaben yazılmış, seyahat masraflarını karşılayacağını taahhüt eden ıslak imzalı yazı)', 'digital', 'pending');
    END IF;
  END IF;

  -- 44. Ogrenci: mükerrer/gereksiz sponsor ve dilekce kayitlarini temizle (her durumda)
  IF p_occupation = 'ogrenci' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%Sponsor Dilekçesi ve Sponsorun Mesleki%'
        OR doc_name ILIKE '%Sponsorun Mesleki/Finansal%'
        OR doc_name ILIKE '%masraf taahhütname%'
        OR doc_name ILIKE '%Şirket antetli kağıdına yazılmış vize talep%'
      );
  END IF;

  -- 45. Almanya + Turistik + calisan: konaklama rezervasyonu ekle
  IF p_country = 'Almanya' AND p_visa_type = 'Turistik' AND p_occupation = 'calisan' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%konaklama rezervasyonu%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Otel / konaklama rezervasyonu (uçak bileti seyahat tarihleri ile tam uyumlu)', 'digital', 'pending');
    END IF;
  END IF;

  -- ---------------------------------------------------------
  -- DEDUP: ayni doc_name, ctid kucuk olan (ilk eklenen) kalir
  -- ---------------------------------------------------------
  DELETE FROM public.user_submitted_docs a
  USING  public.user_submitted_docs b
  WHERE  a.application_id = p_application_id
    AND  b.application_id = p_application_id
    AND  a.doc_name = b.doc_name
    AND  a.ctid > b.ctid;

  -- 46. Almanya + Turistik + isveren: calisandan sizinti dilekce sil, sahsi dilekce + Bagkur ekle (DEDUP sonrasi)
  IF p_country = 'Almanya' AND p_visa_type = 'Turistik' AND p_occupation = 'isveren' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%antetli%dilekçe%';

    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%vize talep dilekçesi%'
      AND  doc_name NOT ILIKE '%şahsi%';

    INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
    SELECT p_application_id, 'Şahsi vize talep dilekçesi (konsolosluğa hitaben yazılmış, seyahat amacını ve tarihlerini belirten, ıslak imzalı mektup)', 'digital', 'pending'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%Şahsi vize talep%'
    );

    INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
    SELECT p_application_id, 'SGK 4B (Bağkur) hizmet dökümü (e-devletten barkodlu, tüm sigorta geçmişini gösteren)', 'digital', 'pending'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%Bağkur%'
    );
  END IF;

  -- 47. calismiyor / ev_hanimi / ev_hanimi_meslek: sponsorluk temizligi + dilekce + banka ekle (DEDUP sonrasi)
  IF p_occupation IN ('calismiyor', 'ev_hanimi', 'ev_hanimi_meslek') THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%Sponsorun İşveren%'
        OR doc_name ILIKE '%Sponsorun işveren%'
        OR doc_name ILIKE '%aile cüzdanı%'
        OR doc_name ILIKE '%nikah cüzdanı%'
        OR doc_name ILIKE '%masraf taahhütname%'
        OR doc_name ILIKE '%Sponsorluk Yazısı ve Masrafları%'
        OR doc_name ILIKE '%Sponsor tarafından yazılmış%'
      );

    INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
    SELECT p_application_id,
      'Sponsorluk dilekçesi (sponsor tarafından konsolosluğa hitaben yazılmış, yakınlık derecesini ve tüm masrafları karşılayacağını belirten ıslak imzalı mektup)',
      'digital', 'pending'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%Sponsorluk dilekçesi%'
    );

    INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
    SELECT p_application_id,
      'Başvuru sahibine ait son 3 aylık şahsi banka hesap dökümü (banka kaşeli ve ıslak imzalı)',
      'digital', 'pending'
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%Başvuru Sahibine Ait%banka%'
    );
  END IF;

  -- 48. Calisma/Is Vizesi: sponsorluk + ucak rezervasyonu sil, sahsi banka dedup (DEDUP sonrasi)
  IF p_visa_type = 'Çalışma/İş Vizesi' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%Sponsorluk dilekçesi%'
        OR doc_name ILIKE '%uçak bileti rezervasyonu%'
      );

    DELETE FROM public.user_submitted_docs a
    USING  public.user_submitted_docs b
    WHERE  a.application_id = p_application_id
      AND  b.application_id = p_application_id
      AND  a.doc_name ILIKE '%şahsi banka hesap dökümü%'
      AND  b.doc_name ILIKE '%şahsi banka hesap dökümü%'
      AND  a.ctid > b.ctid;
  END IF;

  -- 49. Aile Birlesimi Vizesi: ucak + mukerrer sigorta + isveren izin sil (DEDUP sonrasi)
  IF p_visa_type = 'Aile Birleşimi Vizesi' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%gidiş-dönüş uçak%';

    DELETE FROM public.user_submitted_docs a
    USING  public.user_submitted_docs b
    WHERE  a.application_id = p_application_id
      AND  b.application_id = p_application_id
      AND  a.doc_name ILIKE '%seyahat sağlık sigortası%'
      AND  b.doc_name ILIKE '%seyahat sağlık sigortası%'
      AND  a.ctid > b.ctid;

    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%işveren izin yazısı%'
        OR doc_name ILIKE '%işveren izin/görev%'
      );
  END IF;

  -- 50. Schengen disi ulkelerde Schengen form/evrak kalıntılarını sil (DEDUP sonrasi)
  IF p_country IN ('Amerika Birleşik Devletleri', 'Kanada', 'İngiltere', 'Japonya', 'Güney Kore', 'İrlanda') THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%Schengen%';
  END IF;

  -- 51. Kanada: e-devlet belgelerinin acıklamalarını güncelle (DEDUP sonrasi)
  IF p_country = 'Kanada' THEN
    UPDATE public.user_submitted_docs
    SET    doc_name = REPLACE(
             doc_name,
             '(İngilizce mütercim tercüman onaylı çevirisi ile birlikte)',
             '(e-devletten İngilizce olarak barkodlu alınmalıdır)'
           )
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%nüfus cüzdanı%'
        OR doc_name ILIKE '%nüfus kayıt%'
        OR doc_name ILIKE '%ikametgah%'
      );
  END IF;

  -- 52. Kanada + Kültürel Vize: konaklama rezervasyonunu koşulsuz sil (DEDUP sonrasi)
  IF p_country = 'Kanada' AND p_visa_type = 'Kültürel Vize' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%konaklama rezervasyonu%';
  END IF;

  -- 53. Kanada: İkametgah metnini kesin override et — e-devlet ibaresi (DEDUP sonrasi)
  IF p_country = 'Kanada' THEN
    UPDATE public.user_submitted_docs
    SET    doc_name = 'İkametgah belgesi (e-devlet, barkodlu) (e-devletten İngilizce olarak barkodlu alınmalıdır)'
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%ikametgah%';
  END IF;

END;
$$;
