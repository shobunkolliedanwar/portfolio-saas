import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileEditor } from '@/components/profile/profile-editor'
import { unstable_noStore as noStore } from 'next/cache'

export default async function ProfilePage() {
  noStore()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: experiences },
    { data: educations },
    { data: skills },
    { data: projects },
    { data: certifications },
    { data: subscription },   // ← tambah ini
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('experiences').select('*').eq('user_id', user.id).order('order_index'),
    supabase.from('educations').select('*').eq('user_id', user.id).order('order_index'),
    supabase.from('skills').select('*').eq('user_id', user.id).order('order_index'),
    supabase.from('projects').select('*').eq('user_id', user.id).order('order_index'),
    supabase.from('certifications').select('*').eq('user_id', user.id).order('order_index'),
    supabase.from('subscriptions').select('plan, status, current_period_end').eq('user_id', user.id).single(),  // ← tambah ini
  ])

  // Cek apakah subscription masih aktif
  const isSubActive = subscription?.status === 'active' &&
    (!subscription?.current_period_end || new Date(subscription.current_period_end) > new Date())
  const plan = isSubActive ? (subscription?.plan ?? 'free') : 'free'

  return (
    <ProfileEditor
      initialData={{
        profile: profile!,
        experiences: experiences ?? [],
        educations: educations ?? [],
        skills: skills ?? [],
        projects: projects ?? [],
        certifications: certifications ?? [],
      }}
      plan={plan}   // ← tambah ini
    />
  )
}