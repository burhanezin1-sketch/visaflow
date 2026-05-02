import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useCompany() {
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCompany() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase.from('users').select('company_id').eq('id', user.id).single()
      setCompanyId(data?.company_id || null)
      setLoading(false)
    }
    fetchCompany()
  }, [])

  return { companyId, loading }
}