import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileEditor } from '@/components/profile/profile-editor'

export default async function ProfilePage() {
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
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('experiences').select('*').eq('user_id', user.id).order('order_index'),
    supabase.from('educations').select('*').eq('user_id', user.id).order('order_index'),
    supabase.from('skills').select('*').eq('user_id', user.id).order('order_index'),
    supabase.from('projects').select('*').eq('user_id', user.id).order('order_index'),
    supabase.from('certifications').select('*').eq('user_id', user.id).order('order_index'),
  ])

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
    />
  )
}