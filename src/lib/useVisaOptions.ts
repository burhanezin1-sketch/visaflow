'use client'
import { useState, useEffect } from 'react'

export type VisaOptionsMap = Record<string, string[]>

let _cache: VisaOptionsMap | null = null
let _cacheTime = 0
const CACHE_MS = 60_000

export function useVisaOptions() {
  const [optionsMap, setOptionsMap] = useState<VisaOptionsMap>(_cache || {})
  const [loading, setLoading] = useState(!_cache)

  useEffect(() => {
    if (_cache && Date.now() - _cacheTime < CACHE_MS) {
      setOptionsMap(_cache)
      setLoading(false)
      return
    }
    fetch('/api/visa-options')
      .then(r => r.json())
      .then((data: VisaOptionsMap) => {
        _cache = data
        _cacheTime = Date.now()
        setOptionsMap(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const countries = Object.keys(optionsMap)
  const visaTypesFor = (country: string): string[] => optionsMap[country] || []

  return { countries, visaTypesFor, loading }
}
