'use client'

import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCompany } from '@/lib/useCompany'
import { useIsMobile } from '@/lib/useIsMobile'
import { checkApplicationLimit } from '@/lib/planCheck'

// ── Kolon eşleştirme ──────────────────────────────────────────────────────────
const TARGET_COLS = [
  { key: 'full_name',    label: 'Ad Soyad',    required: true  },
  { key: 'phone',        label: 'Telefon',      required: false },
  { key: 'email',        label: 'E-posta',      required: false },
  { key: 'country',      label: 'Ülke',         required: false },
  { key: 'visa_type',    label: 'Vize Tipi',    required: false },
  { key: 'occupation',   label: 'Meslek',       required: false },
  { key: 'nationality',  label: 'Uyruk',        required: false },
  { key: 'passport_no',  label: 'Pasaport No',  required: false },
  { key: 'notes',        label: 'Notlar',       required: false },
] as const

type TargetKey = (typeof TARGET_COLS)[number]['key']

interface ParsedRow { [col: string]: string }
interface ImportResult { row: number; name: string; status: 'ok' | 'skip' | 'error'; message: string }

// ── Şablon verisi ──────────────────────────────────────────────────────────────
const TEMPLATE_HEADERS = ['Ad Soyad', 'Telefon', 'Email', 'Ülke', 'Vize Tipi', 'Meslek', 'Uyruk', 'Pasaport No', 'Notlar']
const TEMPLATE_EXAMPLE = [
  ['Ahmet Yılmaz',  '+90 555 111 22 33', 'ahmet@example.com', 'Almanya', 'Turistik', 'calisan',  'Türkiye Cumhuriyeti',    'TR1234567', 'Acele dosya'],
  ['Fatma Kaya',    '+90 532 444 55 66', 'fatma@example.com', 'Fransa',  'Turistik', 'ogrenci',  'Türkiye Cumhuriyeti',    'TR7654321', ''],
  ['Mariam Hassan', '+90 541 777 88 99', 'mariam@example.com', 'Almanya', 'Turistik', 'calisan', 'Suriye Arap Cumhuriyeti', '',          ''],
]

export default function ImportPage() {
  const { companyId } = useCompany()
  const isMobile = useIsMobile()

  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName]   = useState('')
  const [headers, setHeaders]     = useState<string[]>([])
  const [rows, setRows]           = useState<ParsedRow[]>([])
  const [mapping, setMapping]     = useState<Record<string, TargetKey | ''>>({})
  const [dragOver, setDragOver]   = useState(false)

  const [importing, setImporting] = useState(false)
  const [results, setResults]     = useState<ImportResult[]>([])
  const [done, setDone]           = useState(false)

  // ── Şablon indir ─────────────────────────────────────────────────────────────
  async function downloadTemplate() {
    const XLSX = await import('xlsx')
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...TEMPLATE_EXAMPLE])
    ws['!cols'] = TEMPLATE_HEADERS.map((h, i) => ({ wch: i === 6 ? 28 : 22 }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Müşteriler')
    XLSX.writeFile(wb, 'vectropus_musteri_sablonu.xlsx')
  }

  // ── Dosya işle ──────────────────────────────────────────────────────────────
  async function processFile(file: File) {
    setResults([]); setDone(false)
    setFileName(file.name)

    const XLSX = await import('xlsx')
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const raw: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

    if (raw.length < 2) return

    const rawHdrs  = (raw[0] as string[]).map(h => String(h).trim())
    const normHdrs = rawHdrs.map(h => h.toLowerCase())

    const dataRows: ParsedRow[] = raw.slice(1)
      .filter(r => r.some(c => String(c).trim()))
      .map(r => Object.fromEntries(normHdrs.map((h, i) => [h, String(r[i] ?? '').trim()])))

    setHeaders(rawHdrs)
    setRows(dataRows)

    const autoMap: Record<string, TargetKey | ''> = {}
    for (const h of normHdrs) {
      const n = h.replace(/\s+/g, '')
      if      (n.includes('ad') && n.includes('soyad'))                                  autoMap[h] = 'full_name'
      else if (n.includes('tel') || n.includes('gsm'))                                   autoMap[h] = 'phone'
      else if (n.includes('mail'))                                                        autoMap[h] = 'email'
      else if (n.includes('ülke') || n.includes('ulke') || n.includes('country'))        autoMap[h] = 'country'
      else if (n.includes('vize') || n.includes('visa'))                                 autoMap[h] = 'visa_type'
      else if (n.includes('meslek') || n.includes('occupation') || n.includes('job'))    autoMap[h] = 'occupation'
      else if (n.includes('uyruk') || n.includes('nationality') || n.includes('vatandaş')) autoMap[h] = 'nationality'
      else if (n.includes('pasaport') || n.includes('passport'))                         autoMap[h] = 'passport_no'
      else if (n.includes('not'))                                                         autoMap[h] = 'notes'
      else autoMap[h] = ''
    }
    setMapping(autoMap)
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) processFile(f)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) processFile(f)
  }

  // ── İçe Aktar ───────────────────────────────────────────────────────────────
  async function runImport() {
    if (!companyId || !rows.length) return

    const fullNameCol = Object.entries(mapping).find(([, v]) => v === 'full_name')?.[0]
    if (!fullNameCol) return

    setImporting(true)
    setResults([])
    setDone(false)

    const { data: { user } } = await supabase.auth.getUser()

    // Hizmet fiyatları + uyruk ek ücretleri — toplu çek
    const { data: prices }     = await supabase.from('service_prices').select('*').eq('company_id', companyId)
    const { data: surcharges } = await supabase.from('nationality_surcharges').select('*').eq('company_id', companyId)

    const res: ImportResult[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const get = (key: TargetKey) => {
        const col = Object.entries(mapping).find(([, v]) => v === key)?.[0]
        return col ? (row[col] || '') : ''
      }

      const fullName   = get('full_name')
      if (!fullName) {
        res.push({ row: i + 2, name: '—', status: 'skip', message: 'Ad Soyad boş, satır atlandı' })
        continue
      }

      const limitCheck = await checkApplicationLimit(companyId)
      if (!limitCheck.allowed) {
        res.push({ row: i + 2, name: fullName, status: 'error', message: limitCheck.message || 'Aylık limit doldu' })
        continue
      }

      const phone       = get('phone')
      const email       = get('email')
      const country     = get('country')
      const visaType    = get('visa_type')
      const occupation  = get('occupation')
      const nationality = get('nationality') || 'Türkiye Cumhuriyeti'
      const passportNo  = get('passport_no')
      const notes       = get('notes')

      // Telefon duplikat kontrolü
      if (phone) {
        const { data: existing } = await supabase
          .from('clients').select('id, full_name')
          .eq('company_id', companyId).eq('phone', phone).maybeSingle()
        if (existing) {
          res.push({ row: i + 2, name: fullName, status: 'skip', message: `Telefon zaten kayıtlı: ${existing.full_name}` })
          continue
        }
      }

      // Client ekle
      const { data: client, error: clientErr } = await supabase
        .from('clients')
        .insert({
          company_id:  companyId,
          danisan_id:  user?.id,
          full_name:   fullName,
          phone:       phone || null,
          email:       email || null,
          passport_no: passportNo || null,
        })
        .select().single()

      if (clientErr || !client) {
        res.push({ row: i + 2, name: fullName, status: 'error', message: clientErr?.message || 'Müşteri eklenemedi' })
        continue
      }

      // Application ekle (ülke/vize bilgisi varsa)
      if (country || visaType) {
        // Nationality sütunu yoksa retry without it
        let { data: newApp, error: appErr } = await supabase
          .from('applications')
          .insert({
            company_id:  companyId,
            client_id:   client.id,
            country:     country   || 'Belirtilmedi',
            visa_type:   visaType  || 'Belirtilmedi',
            occupation:  occupation || null,
            nationality: nationality,
            status:      'missing',
            notes:       notes || null,
          })
          .select('id').single()

        if (!newApp && appErr) {
          const { data: retried } = await supabase
            .from('applications')
            .insert({
              company_id: companyId,
              client_id:  client.id,
              country:    country  || 'Belirtilmedi',
              visa_type:  visaType || 'Belirtilmedi',
              occupation: occupation || null,
              status:     'missing',
              notes:      notes || null,
            })
            .select('id').single()
          newApp = retried
        }

        // INSERT başarılı ama select dönmediyse refetch
        if (!newApp) {
          const { data: refetched } = await supabase
            .from('applications').select('id')
            .eq('client_id', client.id).order('created_at', { ascending: false }).maybeSingle()
          newApp = refetched
        }

        const appId = newApp?.id ?? null

        if (appId && country && visaType) {
          // ── 4-way şablon eşleştirme (visa_templates) ──
          const nat = nationality || 'Türkiye Cumhuriyeti'
          let matchedDocs: any[] | null = null

          const { data: ownTpl } = await supabase
            .from('visa_templates').select('docs')
            .eq('company_id', companyId).neq('status', 'rejected')
            .ilike('country', country).ilike('visa_type', visaType)
            .ilike('occupation', occupation || '').ilike('nationality', nat)
            .limit(1).maybeSingle()

          if (ownTpl?.docs && Array.isArray(ownTpl.docs) && ownTpl.docs.length > 0) {
            matchedDocs = ownTpl.docs
          } else {
            const { data: globalTpl } = await supabase
              .from('visa_templates').select('docs')
              .eq('is_global', true).eq('status', 'approved')
              .ilike('country', country).ilike('visa_type', visaType)
              .ilike('occupation', occupation || '').ilike('nationality', nat)
              .limit(1).maybeSingle()
            if (globalTpl?.docs && Array.isArray(globalTpl.docs) && globalTpl.docs.length > 0) {
              matchedDocs = globalTpl.docs
            }
          }

          if (matchedDocs) {
            await supabase.from('user_submitted_docs').delete().eq('application_id', appId)
            await supabase.from('user_submitted_docs').insert(
              matchedDocs.map((d: any) => ({
                application_id: appId,
                doc_name:       d.doc_name,
                delivery_type:  d.delivery_type,
                description:    d.description || '',
                status:         'pending',
              }))
            )
          } else {
            // Fallback: RPC (3-katmanlı eski sistem)
            await supabase.rpc('get_visa_documents', {
              p_application_id: appId,
              p_country:        country,
              p_visa_type:      visaType,
              p_occupation:     occupation || null,
            })
          }

          // ── Ödeme kaydı: hizmet bedeli + uyruk ek ücreti ──
          const price = (prices || []).find((p: any) =>
            p.country?.toLowerCase()   === country.toLowerCase() &&
            p.visa_type?.toLowerCase() === visaType.toLowerCase()
          )
          const sur = (surcharges || []).find((s: any) =>
            s.nationality?.trim().toLowerCase() === nat.trim().toLowerCase()
          )

          if (price) {
            const sameCurrency  = !sur || sur.currency === price.currency
            const totalAmount   = price.price + (sameCurrency && sur ? sur.surcharge_amount : 0)
            await supabase.from('payments').insert({
              company_id:     companyId,
              application_id: appId,
              total_amount:   totalAmount,
              paid_amount:    0,
              currency:       price.currency || 'TRY',
              notes: sur
                ? `Hizmet: ${price.price} ${price.currency} + Uyruk ek ücreti: ${sur.surcharge_amount} ${sur.currency}${sur.reason ? ` (${sur.reason})` : ''}`
                : null,
            })
          }
        }
      }

      res.push({
        row:     i + 2,
        name:    fullName,
        status:  'ok',
        message: country
          ? `${country} / ${visaType}${nationality !== 'Türkiye Cumhuriyeti' ? ` — ${nationality}` : ''}`
          : 'Ülke belirtilmedi',
      })

      setResults([...res])
    }

    setResults(res)
    setImporting(false)
    setDone(true)
  }

  const ok      = results.filter(r => r.status === 'ok').length
  const skipped = results.filter(r => r.status === 'skip').length
  const errors  = results.filter(r => r.status === 'error').length

  const labelS: React.CSSProperties = {
    display: 'block', fontSize: '10px', fontWeight: '600', color: '#9aaabb',
    marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.8px',
  }
  const selS: React.CSSProperties = {
    padding: '7px 10px', border: '1.5px solid #e2e2e8', borderRadius: '7px',
    fontSize: '12px', background: '#f5f5f7', outline: 'none', fontFamily: 'inherit', width: '100%',
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e8e4da', padding: isMobile ? '0.75rem 1rem' : '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <h2 style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '500', margin: 0, color: '#0d1f35' }}>
          Toplu Müşteri İçe Aktar
        </h2>
        <button
          onClick={downloadTemplate}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', fontSize: '12px', fontWeight: '500', background: '#f0f6ff', color: '#1a5fa5', border: '1px solid #b8d4f0', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          ↓ Şablon İndir
        </button>
      </div>

      <div style={{ padding: isMobile ? '0.75rem' : '1.5rem', overflowY: 'auto', flex: 1, background: '#faf8f3' }}>

        {/* Adım 1 – Dosya Yükle */}
        <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '14px', padding: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#378ADD', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
            Adım 1 — Dosya Seç
          </div>

          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? '#378ADD' : '#d0d8e4'}`,
              borderRadius: '12px', padding: '2.5rem', textAlign: 'center',
              cursor: 'pointer', background: dragOver ? '#f0f6ff' : '#fafbfc', transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#0d1f35', marginBottom: '4px' }}>
              {fileName || 'Excel veya CSV dosyasını buraya sürükleyin'}
            </div>
            <div style={{ fontSize: '12px', color: '#9aaabb' }}>
              {fileName ? `${rows.length} satır okundu` : '.xlsx, .xls veya .csv — maks. 10MB'}
            </div>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={onFileInput} style={{ display: 'none' }} />

          {!fileName && (
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#9aaabb', textAlign: 'center' }}>
              Şablon formatını görmek için{' '}
              <button onClick={downloadTemplate} style={{ background: 'none', border: 'none', color: '#1a5fa5', cursor: 'pointer', fontSize: '12px', padding: 0, fontFamily: 'inherit', textDecoration: 'underline' }}>
                örnek Excel şablonunu indirin
              </button>
            </div>
          )}
        </div>

        {/* Adım 2 – Kolon Eşleştirme */}
        {headers.length > 0 && (
          <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '14px', padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#378ADD', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
              Adım 2 — Kolon Eşleştir
            </div>
            <p style={{ fontSize: '12px', color: '#9aaabb', margin: '0 0 1rem' }}>
              Dosyadaki kolonların hangi alanlara karşılık geldiğini seçin.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
              {headers.map(h => (
                <div key={h}>
                  <label style={labelS}>{h}</label>
                  <select
                    value={mapping[h.toLowerCase()] || ''}
                    onChange={e => setMapping({ ...mapping, [h.toLowerCase()]: e.target.value as TargetKey | '' })}
                    style={selS}
                  >
                    <option value="">— Atla —</option>
                    {TARGET_COLS.map(t => (
                      <option key={t.key} value={t.key}>{t.label}{t.required ? ' *' : ''}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Adım 3 – Önizleme + İçe Aktar */}
        {rows.length > 0 && !done && (
          <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '14px', padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#378ADD', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
              Adım 3 — Önizleme & İçe Aktar
            </div>
            <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                <thead>
                  <tr>
                    {headers.map(h => (
                      <th key={h} style={{ fontSize: '10px', fontWeight: '600', color: '#9aaabb', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #f0ede6', background: '#faf8f3', whiteSpace: 'nowrap' }}>
                        {h}
                        {mapping[h.toLowerCase()] && <span style={{ color: '#378ADD' }}> → {TARGET_COLS.find(t => t.key === mapping[h.toLowerCase()])?.label}</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      {headers.map(h => (
                        <td key={h} style={{ padding: '8px 12px', fontSize: '12px', borderBottom: '1px solid #f0ede6', color: '#0d1f35', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row[h.toLowerCase()] || <span style={{ color: '#d0d8e4' }}>—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 5 && (
              <div style={{ fontSize: '12px', color: '#9aaabb', marginBottom: '1rem', textAlign: 'center' }}>
                + {rows.length - 5} satır daha
              </div>
            )}
            <button
              onClick={runImport}
              disabled={importing || !Object.values(mapping).some(v => v === 'full_name')}
              style={{ width: '100%', padding: '12px', background: '#1a3a5c', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: importing ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: importing || !Object.values(mapping).some(v => v === 'full_name') ? 0.6 : 1 }}
            >
              {importing ? `İçe aktarılıyor... (${results.length}/${rows.length})` : `↑ ${rows.length} satırı içe aktar`}
            </button>
            {!Object.values(mapping).some(v => v === 'full_name') && (
              <p style={{ fontSize: '11px', color: '#c0392b', marginTop: '6px', textAlign: 'center' }}>
                "Ad Soyad" kolonu eşleştirilmeden içe aktarma yapılamaz.
              </p>
            )}
          </div>
        )}

        {/* Sonuçlar */}
        {results.length > 0 && (
          <div style={{ background: 'white', border: '1px solid #e8e4da', borderRadius: '14px', padding: '1.5rem' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#378ADD', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>
              İçe Aktarma Sonuçları
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '1.25rem' }}>
              {[
                { label: 'Başarılı', value: ok,      color: '#1a7a45', bg: '#edfaf3' },
                { label: 'Atlandı',  value: skipped,  color: '#92600a', bg: '#fff8ec' },
                { label: 'Hata',     value: errors,   color: '#c0392b', bg: '#fef0ee' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: '10px', padding: '0.875rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: '700', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: s.color, marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ maxHeight: '320px', overflowY: 'auto', border: '1px solid #f0ede6', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Satır', 'Ad Soyad', 'Durum', 'Mesaj'].map(h => (
                      <th key={h} style={{ fontSize: '10px', fontWeight: '600', color: '#9aaabb', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #f0ede6', background: '#faf8f3', position: 'sticky', top: 0 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i}>
                      <td style={{ padding: '7px 12px', fontSize: '12px', color: '#9aaabb', borderBottom: '1px solid #f8f5f0' }}>{r.row}</td>
                      <td style={{ padding: '7px 12px', fontSize: '12px', fontWeight: '500', borderBottom: '1px solid #f8f5f0' }}>{r.name}</td>
                      <td style={{ padding: '7px 12px', borderBottom: '1px solid #f8f5f0' }}>
                        <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: r.status === 'ok' ? '#edfaf3' : r.status === 'skip' ? '#fff8ec' : '#fef0ee', color: r.status === 'ok' ? '#1a7a45' : r.status === 'skip' ? '#92600a' : '#c0392b' }}>
                          {r.status === 'ok' ? 'Eklendi' : r.status === 'skip' ? 'Atlandı' : 'Hata'}
                        </span>
                      </td>
                      <td style={{ padding: '7px 12px', fontSize: '12px', color: '#5a6a7a', borderBottom: '1px solid #f8f5f0' }}>{r.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {done && (
              <button
                onClick={() => { setFileName(''); setHeaders([]); setRows([]); setResults([]); setDone(false); setMapping({}) }}
                style={{ marginTop: '1rem', width: '100%', padding: '10px', background: '#f5f5f7', color: '#5a6a7a', border: '1px solid #e2e2e8', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Yeni İçe Aktarma
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
