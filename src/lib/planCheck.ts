import { supabase } from './supabase'

const APPLICATION_LIMITS: Record<string, number> = { basic: 30, pro: 100 }
const USER_LIMITS: Record<string, number> = { basic: 3, pro: 5 }

export async function checkApplicationLimit(companyId: string): Promise<{ allowed: boolean; message?: string }> {
  const { data: company } = await supabase
    .from('companies')
    .select('plan')
    .eq('id', companyId)
    .single()

  if (!company) return { allowed: true }

  const limit = APPLICATION_LIMITS[company.plan]
  if (!limit) return { allowed: true }

  const { data: count } = await supabase.rpc('get_monthly_application_count', { p_company_id: companyId })

  if ((count || 0) >= limit) {
    return {
      allowed: false,
      message: `${company.plan === 'basic' ? 'Basic' : 'Pro'} paketinizde aylık maksimum ${limit} dosya hakkınız var. Üst pakete geçmek için bizimle iletişime geçin.`
    }
  }

  return { allowed: true }
}

export async function checkUserLimit(companyId: string): Promise<{ allowed: boolean; message?: string }> {
  const { data: company } = await supabase
    .from('companies')
    .select('plan, extra_user_count')
    .eq('id', companyId)
    .single()

  if (!company) return { allowed: true }

  const baseLimit = USER_LIMITS[company.plan]
  if (!baseLimit) return { allowed: true }

  const totalLimit = baseLimit + (company.extra_user_count || 0)

  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)

  if ((count || 0) >= totalLimit) {
    return {
      allowed: false,
      message: `Paketinizde maksimum ${totalLimit} kullanıcı ekleyebilirsiniz. Ekstra kullanıcı veya üst paket için bizimle iletişime geçin.`
    }
  }

  return { allowed: true }
}
