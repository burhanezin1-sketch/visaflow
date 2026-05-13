import { supabase } from './supabase'

export async function checkApplicationLimit(companyId: string): Promise<{ allowed: boolean; message?: string }> {
  const { data: company } = await supabase
    .from('companies')
    .select('plan')
    .eq('id', companyId)
    .single()

  if (!company) return { allowed: true }

  if (company.plan === 'pro' || company.plan === 'kurumsal') {
    return { allowed: true }
  }

  const { count } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .neq('status', 'completed')

  const limit = 50
  if ((count || 0) >= limit) {
    return {
      allowed: false,
      message: 'Starter paketinizde maksimum 50 aktif başvuru hakkınız var. Pro pakete geçmek için bizimle iletişime geçin.'
    }
  }

  return { allowed: true }
}
