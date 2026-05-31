import { supabase } from './supabase'

export async function getVisaDocs(
  applicationId: string,
  country: string,
  visaType: string,
  occupation?: string | null
) {
  const { data, error } = await supabase.rpc('get_visa_documents', {
    p_application_id: applicationId,
    p_country: country,
    p_visa_type: visaType,
    p_occupation: occupation ?? null,
  })
  if (error) throw error
  return data ?? []
}
