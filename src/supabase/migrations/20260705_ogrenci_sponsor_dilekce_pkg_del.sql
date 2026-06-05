-- occupation_doc_packages: ogrenci paketinden Sponsor Dilekçesi ve Sponsorun Mesleki kaydını sil
DELETE FROM public.occupation_doc_packages
WHERE  occupation = 'ogrenci'
  AND  doc_name ILIKE '%Sponsor Dilekçesi ve Sponsorun Mesleki%';
