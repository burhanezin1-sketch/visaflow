-- Kanada/Ingiltere/Irlanda: tercume ILIKE duzeltmesi + Kanada fotograf kurali

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
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%tüm Schengen%'
  ) THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND  doc_name = 'Seyahat sağlık sigortası';
  END IF;

  -- 2. Calisan/isveren meslekleri icin sponsor evraklarini sil
  IF p_occupation IN ('sirket_sahibi', 'serbest_meslek', 'calisan') THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%Sponsor tarafından%'
        OR doc_name ILIKE '%Sponsorun SGK%'
        OR doc_name ILIKE '%Sponsorun İşveren%'
        OR doc_name ILIKE '%Sponsor (eş/veli)%'
        OR doc_name ILIKE '%Sponsor banka%'
        OR doc_name ILIKE '%Aile cüzdanı%'
        OR doc_name ILIKE '%nikah cüzdanı%'
        OR doc_name ILIKE '%masraf taahhütname%'
        OR doc_name ILIKE '%veli/sponsor%'
      );
  END IF;

  -- 3. Sirket_sahibi/serbest_meslek tekil sirket evraklari temizligi
  IF p_occupation IN ('sirket_sahibi', 'serbest_meslek') THEN
    IF EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id
        AND  doc_name ILIKE '%Şirket evrakları (güncel vergi levhası%'
    ) THEN
      DELETE FROM public.user_submitted_docs
      WHERE  application_id = p_application_id
        AND (
          doc_name ILIKE 'Vergi levhası%'
          OR doc_name ILIKE 'Şirket faaliyet belgesi%'
          OR doc_name ILIKE 'Ticaret sicil gazetesi%'
          OR doc_name ILIKE 'İmza sirküleri%'
        );
    END IF;
  END IF;

  -- 4. Emekli
  IF p_occupation = 'emekli' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%Şirket antetli kağıdına%'
        OR doc_name ILIKE '%Maaş Bordrosu%'
        OR doc_name ILIKE '%SGK İşe Giriş%'
      );

    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id
        AND  doc_name ILIKE '%Şahsi Vize Talep Dilekçesi%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Şahsi Vize Talep Dilekçesi (konsolosluğa hitaben yazılmış, seyahat amacını ve dönüş taahhüdünü belirten ıslak imzalı dilekçe)', 'digital', 'pending');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id
        AND  doc_name ILIKE '%Emeklilik Belgesi%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Emeklilik Belgesi (e-Devlet barkodlu emekli aylık bilgisi belgesi)', 'digital', 'pending');
    END IF;
  END IF;

  -- 5. Ogrenci
  IF p_occupation = 'ogrenci' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%Sponsorun İşveren İzin%'
        OR doc_name ILIKE '%Sponsor İşveren İzin%'
        OR doc_name ILIKE '%Sponsorun işveren izin%'
        OR doc_name ILIKE '%Aile cüzdanı%'
        OR doc_name ILIKE '%nikah cüzdanı%'
      );

    DELETE FROM public.user_submitted_docs
    WHERE (
      application_id = p_application_id
      AND LOWER(doc_name) LIKE '%şahsi%banka%'
    ) OR (
      application_id = p_application_id
      AND LOWER(doc_name) LIKE '%banka hesap%'
      AND LOWER(doc_name) NOT LIKE '%sponsor%'
      AND LOWER(doc_name) NOT LIKE '%şirket%'
    );

    UPDATE public.user_submitted_docs
    SET    doc_name = REPLACE(doc_name, 'Sponsor (eş/veli)', 'Sponsor (Anne/Baba/Veli)')
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%Sponsor (eş/veli)%';

    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id
        AND  doc_name ILIKE '%Sponsor Dilekçesi%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Sponsor Dilekçesi ve Sponsorun Mesleki/Finansal Evrakları (anne, baba veya velinin gelir belgesi ve taahhütnamesi)', 'digital', 'pending');
    END IF;
  END IF;

  -- 6. Devlet Memuru
  IF p_occupation = 'devlet_memuru' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%işveren izin%'
        OR doc_name ILIKE '%İşveren İzin/Görev%'
        OR doc_name ILIKE '%Şirket antetli%'
        OR doc_name ILIKE '%SGK İşe Giriş%'
        OR doc_name ILIKE '%Ticaret Sicil%'
        OR doc_name ILIKE '%Faaliyet Belgesi%'
        OR doc_name ILIKE '%İmza Sirküleri%'
        OR doc_name ILIKE '%Vergi Levhası%'
      );

    UPDATE public.user_submitted_docs
    SET    doc_name = 'Maaş bordrosu (e-Devlet üzerinden alınan son 3 aya ait barkodlu e-Bordro)'
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%maaş bordrosu%';

    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id
        AND  doc_name ILIKE '%Görev Belgesi%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES
        (p_application_id, 'Çalışma Belgesi / Görev Belgesi (e-Devletten barkodlu veya kurumdan ıslak imzalı/mühürlü)', 'digital', 'pending'),
        (p_application_id, 'Resmi İzin Belgesi (bağlı bulunulan kurumdan mühürlü ve ıslak imzalı seyahat izin yazısı)', 'digital', 'pending');
    END IF;
  END IF;

  -- 7. Ev Hanimi + Calismiyor
  IF p_occupation IN ('ev_hanimi_meslek', 'ev_hanimi') THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%Şirket antetli%'
        OR doc_name ILIKE '%Maaş Bordrosu%'
        OR doc_name ILIKE '%SGK İşe Giriş%'
        OR doc_name ILIKE '%şahsi banka hesap dökümü%'
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

    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id
        AND  doc_name ILIKE '%Sponsorluk Yazısı%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Sponsorluk Yazısı ve Masrafları Karşılayacak Birinci Derece Yakının Tüm Finansal Evrakları (maaş/emekli bordrosu, banka dökümü, vergi levhası)', 'digital', 'pending');
    END IF;
  END IF;

  -- 8. Schengen disi ulkelerde calisan
  IF p_country = ANY(non_schengen) AND p_occupation = 'calisan' THEN
    UPDATE public.user_submitted_docs
    SET    doc_name = 'Şirket İzin ve Görev Belgesi (şirketin antetli kağıdına, yetkili imzalı, kaşeli ve görev/izin tarihlerini içeren yazı)'
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%işveren izin%';
  END IF;

  -- 9. Almanya
  IF p_country = 'Almanya' THEN
    UPDATE public.user_submitted_docs
    SET    doc_name = 'Son 3 aylık şahsi banka hesap dökümü (banka kaşeli/imzalı)'
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%banka hesap dökümü%'
      AND  doc_name ILIKE '%İmza Sirküleri%';
  END IF;

  -- 10. Italya
  IF p_country = 'İtalya' THEN
    UPDATE public.user_submitted_docs
    SET    doc_name = 'Son 3 aylık şahsi banka hesap dökümü (banka kaşeli/imzalı)'
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%banka hesap dökümü%'
      AND  doc_name ILIKE '%İmza Sirküleri%';
  END IF;

  -- 11. Fransa
  IF p_country = 'Fransa' THEN
    IF EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id
        AND  doc_name ILIKE '%İngilizce veya Fransızca%'
    ) THEN
      DELETE FROM public.user_submitted_docs
      WHERE  application_id = p_application_id
        AND  doc_name = 'Şirket antetli kağıdına yazılmış vize talep dilekçesi (imzalı ve kaşeli)';
    END IF;
  END IF;

  -- 12. İngiltere
  IF p_country = 'İngiltere' THEN
    UPDATE public.user_submitted_docs
    SET    doc_name = 'Son 3 aylık şahsi banka hesap dökümü (banka kaşeli/imzalı)'
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%banka hesap dökümü%'
      AND  doc_name ILIKE '%İmza Sirküleri%';

    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%seyahat sağlık sigortası%';
  END IF;

  -- 13. Japonya
  IF p_country = 'Japonya' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%seyahat sağlık sigortası%';

    UPDATE public.user_submitted_docs
    SET    doc_name = 'Son 3 aylık şahsi banka hesap dökümü (banka kaşeli/imzalı)'
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%banka hesap dökümü%'
      AND  doc_name ILIKE '%İmza Sirküleri%';
  END IF;

  -- 14. Güney Kore
  IF p_country = 'Güney Kore' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%seyahat sağlık sigortası%';

    UPDATE public.user_submitted_docs
    SET    doc_name = 'Son 3 aylık şahsi banka hesap dökümü (banka kaşeli/imzalı)'
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%banka hesap dökümü%'
      AND  doc_name ILIKE '%İmza Sirküleri%';
  END IF;

  -- 15. Kanada
  IF p_country = 'Kanada' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%seyahat sağlık sigortası%';

    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%uçak bileti rezervasyonu%';

    UPDATE public.user_submitted_docs
    SET    doc_name = 'Son 3 aylık şahsi banka hesap dökümü (banka kaşeli/imzalı)'
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%banka hesap dökümü%'
      AND  doc_name ILIKE '%İmza Sirküleri%';
  END IF;

  -- 16. Amerika Birlesik Devletleri
  IF p_country = 'Amerika Birleşik Devletleri' THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%Schengen%'
        OR doc_name ILIKE '%30.000 €%'
        OR doc_name ILIKE '%Ulusal (D Tipi)%'
      );

    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%seyahat sağlık sigortası%';

    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%uçak bileti rezervasyonu%';

    UPDATE public.user_submitted_docs
    SET    doc_name = 'Son 3 aylık şahsi banka hesap dökümü (banka kaşeli/imzalı)'
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%banka hesap dökümü%'
      AND  doc_name ILIKE '%İmza Sirküleri%';

    UPDATE public.user_submitted_docs
    SET    doc_name = '2 adet Amerika vizesine uygun biyometrik fotoğraf (50x50 mm, kare, beyaz fon)'
    WHERE  application_id = p_application_id
      AND  doc_name ILIKE '%biyometrik fotoğraf%';

    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id
        AND  doc_name ILIKE '%DS-160%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'DS-160 Başvuru Formu Onay Sayfası (barkodlu online çıktı — ceac.state.gov adresinden doldurulur)', 'digital', 'pending');
    END IF;
  END IF;

  -- 17. Ticari/İş Gezisi
  IF p_visa_type = 'Ticari/İş Gezisi' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%Görevlendirme Yazısı%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Şirket/Kurum Görevlendirme Yazısı (görevi ve seyahat amacını belirten ıslak imzalı/kaşeli yazı)', 'digital', 'pending');
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%Ticari Davetiye%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Resmi Ticari Davetiye (karşı firmadan veya fuar organizasyonundan gelen davet mektubu)', 'digital', 'pending');
    END IF;
  END IF;

  -- 18. Aile/Arkadaş Ziyareti
  IF p_visa_type = 'Aile/Arkadaş Ziyareti' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%Belediye%Davetiye%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Belediye / Yabancılar Dairesi Onaylı Orijinal Davetiye (davet eden kişinin bulunduğu ülkeden resmi onaylı belge)', 'digital', 'pending');
    END IF;
  END IF;

  -- 19. Aile Birleşimi Vizesi
  IF p_visa_type = 'Aile Birleşimi Vizesi' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%Uluslararası Evlenme%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Uluslararası Evlenme Kayıt Örneği (Formül B) ve Dil Yeterlilik Belgesi (gerekli ülkeler için A1 sertifikası)', 'digital', 'pending');
    END IF;
  END IF;

  -- 20. Eğitim/Öğrenci
  IF p_visa_type = 'Eğitim/Öğrenci' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%Kabul Mektubu%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Kabul Mektubu / Akreditasyon Belgesi (gidilecek okul veya üniversiteden resmi kayıt onayı)', 'digital', 'pending');
    END IF;
  END IF;

  -- 21. Tedavi/Sağlık Vizesi
  IF p_visa_type = 'Tedavi/Sağlık Vizesi' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%Sağlık Raporu%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Sağlık Raporu ve Karşı Hastaneden Kabul Belgesi (tedavi detaylarını ve maliyet üstlenimini gösteren evraklar)', 'digital', 'pending');
    END IF;
  END IF;

  -- 22. Kültürel Vize
  IF p_visa_type = 'Kültürel Vize' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_submitted_docs
      WHERE  application_id = p_application_id AND doc_name ILIKE '%Etkinlik%Davet%'
    ) THEN
      INSERT INTO public.user_submitted_docs (application_id, doc_name, delivery_type, status)
      VALUES (p_application_id, 'Etkinlik / Davet Katılım Belgesi (kültürel veya sportif organizasyon davetiyesi ve program)', 'digital', 'pending');
    END IF;
  END IF;

  -- 23. Ev Hanimi/Calismiyor: sahsi banka kalintisini temizle
  IF p_occupation IN ('ev_hanimi', 'ev_hanimi_meslek', 'calismiyor') THEN
    DELETE FROM public.user_submitted_docs
    WHERE  application_id = p_application_id
      AND  LOWER(doc_name) LIKE '%şahsi banka hesap%';
  END IF;

  -- 24. Kanada/İngiltere/İrlanda: fotograf + tercume ibaresi
  IF p_country IN ('Kanada', 'İngiltere', 'İrlanda') THEN
    IF p_country = 'Kanada' THEN
      UPDATE public.user_submitted_docs
      SET    doc_name = '2 adet biyometrik fotoğraf (35x45 mm, son 6 ayda çekilmiş, arkasında fotoğrafçının kaşesi ve çekim tarihi olan Kanada standardında)'
      WHERE  application_id = p_application_id
        AND  doc_name ILIKE '%fotoğraf%'
        AND  doc_name ILIKE '%35x45%';
    END IF;

    UPDATE public.user_submitted_docs
    SET    doc_name = doc_name || ' (İngilizce mütercim tercüman onaylı çevirisi ile birlikte)'
    WHERE  application_id = p_application_id
      AND (
        doc_name ILIKE '%nüfus%'
        OR doc_name ILIKE '%ikametgah%'
        OR doc_name ILIKE '%ikamet%'
        OR doc_name ILIKE '%kimlik%'
        OR doc_name ILIKE '%sicil%'
      )
      AND  doc_name NOT ILIKE '%tercüme%'
      AND  doc_name NOT ILIKE '%tercüman%';
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

END;
$$;
