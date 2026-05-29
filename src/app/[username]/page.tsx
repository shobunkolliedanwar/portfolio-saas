import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { MinimalTemplate } from '@/components/templates/minimal-template'
import { ModernTemplate } from '@/components/templates/modern-template'
import type { PortfolioData } from '@/types'

interface Props {
    params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params

    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, bio, avatar_url, tagline')
        .eq('username', username)
        .eq('is_published', true)
        .single()

    if (!profile) {
        return {
            title: 'Portfolio tidak ditemukan',
        }
    }

    return {
        title: `${profile.full_name} — Portfolio`,
        description:
            profile.bio ||
            profile.tagline ||
            `Portfolio profesional ${profile.full_name}`,
        openGraph: {
            title: profile.full_name ?? '',
            description: profile.bio ?? '',
            images: profile.avatar_url ? [profile.avatar_url] : [],
        },
    }
}

export default async function PublicPortfolioPage({ params }: Props) {
    const { username } = await params

    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .eq('is_published', true)
        .single()

    if (!profile) {
        notFound()
    }

    // Fire and forget
    void supabase.rpc('increment_portfolio_views', {
        profile_id: profile.id,
    })

    const [
        { data: experiences },
        { data: educations },
        { data: skills },
        { data: projects },
        { data: certifications },
    ] = await Promise.all([
        supabase
            .from('experiences')
            .select('*')
            .eq('user_id', profile.id)
            .order('order_index'),

        supabase
            .from('educations')
            .select('*')
            .eq('user_id', profile.id)
            .order('order_index'),

        supabase
            .from('skills')
            .select('*')
            .eq('user_id', profile.id)
            .order('order_index'),

        supabase
            .from('projects')
            .select('*')
            .eq('user_id', profile.id)
            .order('order_index'),

        supabase
            .from('certifications')
            .select('*')
            .eq('user_id', profile.id)
            .order('order_index'),
    ])

    const portfolioData: PortfolioData = {
        profile,
        experiences: experiences ?? [],
        educations: educations ?? [],
        skills: skills ?? [],
        projects: projects ?? [],
        certifications: certifications ?? [],
    }

    return (
        <main>
            {profile.template_id === 'modern' ? (
                <ModernTemplate data={portfolioData} />
            ) : (
                <MinimalTemplate data={portfolioData} />
            )}
        </main>
    )
}