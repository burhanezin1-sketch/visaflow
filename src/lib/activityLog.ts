import { supabase } from './supabase'

export function logAction(
  companyId: string,
  userId: string | undefined | null,
  userName: string,
  action: string,
  entityType?: string | null,
  entityId?: string | null,
  entityName?: string | null
) {
  supabase.from('activity_logs').insert({
    company_id: companyId,
    user_id: userId ?? null,
    user_name: userName,
    action,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
    entity_name: entityName ?? null,
  }).then(({ error }) => {
    if (error) console.error('[activityLog] insert failed:', error.message)
  })
}
