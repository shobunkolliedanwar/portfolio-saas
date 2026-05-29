import type { PortfolioData } from '@/types'
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  ExternalLink
} from 'lucide-react'

import {
  FaLinkedin,
  FaGithub,
  FaTwitter
} from 'react-icons/fa'

interface Props {
    data: PortfolioData
}

function formatDate(dateStr: string | null, isCurrent?: boolean) {
    if (isCurrent) return 'Sekarang'
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
}

export function ModernTemplate({ data }: Props) {
    const { profile, experiences, educations, skills, projects } = data
    const color = profile.primary_color || '#06b6d4'

    return (
        <div className="font-sans flex min-h-screen" style={{ fontSize: 13 }}>
            {/* Sidebar */}
            <div className="w-2/5 text-white shrink-0 px-6 py-8 space-y-6" style={{ background: color }}>
                <div className="text-center">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.full_name ?? ''}
                            className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-white/30" />
                    ) : (
                        <div className="w-20 h-20 rounded-full mx-auto bg-white/20 flex items-center justify-center text-3xl font-bold">
                            {profile.full_name?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                    )}
                    <h1 className="mt-3 text-lg font-bold">{profile.full_name || 'Nama Kamu'}</h1>
                    {profile.tagline && <p className="text-sm text-white/80 mt-1">{profile.tagline}</p>}
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Kontak</p>
                    {profile.email && <p className="flex items-center gap-2 text-xs text-white/90"><Mail className="h-3 w-3" />{profile.email}</p>}
                    {profile.phone && <p className="flex items-center gap-2 text-xs text-white/90"><Phone className="h-3 w-3" />{profile.phone}</p>}
                    {profile.location && <p className="flex items-center gap-2 text-xs text-white/90"><MapPin className="h-3 w-3" />{profile.location}</p>}
                    {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-white/90 hover:text-white"><Globe className="h-3 w-3" />Website</a>}
                </div>

                {skills.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Skill</p>
                        {skills.slice(0, 12).map(skill => (
                            <div key={skill.id}>
                                <div className="flex justify-between text-xs text-white/90 mb-1">
                                    <span>{skill.name}</span>
                                    <span>{skill.level * 20}%</span>
                                </div>
                                <div className="h-1 rounded-full bg-white/20">
                                    <div className="h-1 rounded-full bg-white/80" style={{ width: `${skill.level * 20}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-3 justify-center pt-2">
                    {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-white/70 hover:text-white"><FaLinkedin className="h-4 w-4" /></a>}
                    {profile.github_url && <a href={profile.github_url} target="_blank" rel="noreferrer" className="text-white/70 hover:text-white"><FaGithub className="h-4 w-4" /></a>}
                    {profile.twitter_url && <a href={profile.twitter_url} target="_blank" rel="noreferrer" className="text-white/70 hover:text-white"><FaTwitter className="h-4 w-4" /></a>}
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 bg-gray-50 px-6 py-8 space-y-7 overflow-y-auto">
                {profile.bio && (
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color }}>Tentang saya</h2>
                        <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
                    </section>
                )}

                {experiences.length > 0 && (
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color }}>Pengalaman</h2>
                        <div className="space-y-4">
                            {experiences.map(exp => (
                                <div key={exp.id} className="bg-white rounded-lg p-4 border border-gray-100">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-gray-900">{exp.position}</p>
                                            <p className="text-sm font-medium" style={{ color }}>{exp.company}</p>
                                            {exp.location && <p className="text-xs text-gray-400">{exp.location}</p>}
                                        </div>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {formatDate(exp.start_date)} – {formatDate(exp.end_date, exp.is_current)}
                                        </span>
                                    </div>
                                    {exp.description && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{exp.description}</p>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {educations.length > 0 && (
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color }}>Pendidikan</h2>
                        <div className="space-y-3">
                            {educations.map(edu => (
                                <div key={edu.id} className="bg-white rounded-lg p-4 border border-gray-100">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-gray-900">{edu.institution}</p>
                                            <p className="text-xs text-gray-500">{edu.degree}{edu.field_of_study ? ` — ${edu.field_of_study}` : ''}</p>
                                            {edu.gpa && <p className="text-xs" style={{ color }}>IPK: {edu.gpa}</p>}
                                        </div>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {formatDate(edu.start_date)} – {formatDate(edu.end_date, edu.is_current)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {projects.length > 0 && (
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color }}>Proyek</h2>
                        <div className="grid grid-cols-1 gap-3">
                            {projects.map(proj => (
                                <div key={proj.id} className="bg-white rounded-lg p-4 border border-gray-100">
                                    <div className="flex items-start justify-between">
                                        <p className="font-semibold text-gray-900">{proj.title}</p>
                                        <div className="flex gap-1.5 ml-2">
                                            {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" style={{ color }}><ExternalLink className="h-3.5 w-3.5" /></a>}
                                            {proj.github_url && <a href={proj.github_url} target="_blank" rel="noreferrer" className="text-gray-400"><FaGithub className="h-3.5 w-3.5" /></a>}
                                        </div>
                                    </div>
                                    {proj.description && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{proj.description}</p>}
                                    {proj.tech_stack?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {proj.tech_stack.map(t => (
                                                <span key={t} className="text-xs px-2 py-0.5 rounded text-white" style={{ background: color }}>{t}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}