import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')

  console.log('clients:', clients)
  console.log('error:', error)

  return (
    <main>
      <h1>Visaflow Test</h1>
      <pre>{JSON.stringify(error, null, 2)}</pre>
      <pre>{JSON.stringify(clients, null, 2)}</pre>
    </main>
  )
}