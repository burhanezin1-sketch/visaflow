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

export async function checkUserLimit(companyId: string): Promise<{ allowed: boolean; message?: string }> {
  const { data: company } = await supabase
    .from('companies')
    .select('plan')
    .eq('id', companyId)
    .single()

  if (!company) return { allowed: true }

  const { data: planLimit } = await supabase
    .from('plan_limits')
    .select('max_users')
    .eq('plan', company.plan)
    .single()

  if (!planLimit || planLimit.max_users === null) return { allowed: true }

  const { count } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)

  if ((count || 0) >= planLimit.max_users) {
    return {
      allowed: false,
      message: `Starter paketinizde maksimum ${planLimit.max_users} kullanıcı (admin dahil) ekleyebilirsiniz. Pro pakete geçmek için bizimle iletişime geçin.`
    }
  }

  return { allowed: true }
}
