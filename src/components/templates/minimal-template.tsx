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

export function MinimalTemplate({ data }: Props) {
    const { profile, experiences, educations, skills, projects, certifications } = data
    const color = profile.primary_color || '#6366f1'

    return (
        <div className="font-sans text-gray-800 bg-white min-h-screen" style={{ fontSize: 14 }}>
            {/* Header */}
            <div className="px-8 py-10 border-b" style={{ borderColor: '#f1f5f9' }}>
                <div className="flex items-start gap-5">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.full_name ?? ''}
                            className="w-16 h-16 rounded-full object-cover shrink-0" />
                    ) : (
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold shrink-0"
                            style={{ background: color }}>
                            {profile.full_name?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                    )}
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">{profile.full_name || 'Nama Kamu'}</h1>
                        {profile.tagline && <p className="mt-1 font-medium" style={{ color }}>{profile.tagline}</p>}
                        {profile.bio && <p className="mt-2 text-gray-500 text-sm leading-relaxed">{profile.bio}</p>}
                        <div className="flex flex-wrap gap-3 mt-3">
                            {profile.location && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <MapPin className="h-3 w-3" />{profile.location}
                                </span>
                            )}
                            {profile.email && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <Mail className="h-3 w-3" />{profile.email}
                                </span>
                            )}
                            {profile.phone && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <Phone className="h-3 w-3" />{profile.phone}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2 mt-2">
                            {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-600"><FaLinkedin className="h-4 w-4" /></a>}
                            {profile.github_url && <a href={profile.github_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-600"><FaGithub className="h-4 w-4" /></a>}
                            {profile.twitter_url && <a href={profile.twitter_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-600"><FaTwitter className="h-4 w-4" /></a>}
                            {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-600"><Globe className="h-4 w-4" /></a>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 py-6 space-y-8">
                {/* Pengalaman */}
                {experiences.length > 0 && (
                    <section>
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Pengalaman</h2>
                        <div className="space-y-5">
                            {experiences.map(exp => (
                                <div key={exp.id} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: color }} />
                                        <div className="w-px flex-1 mt-1" style={{ background: color + '30' }} />
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-900">{exp.position}</p>
                                                <p className="text-sm" style={{ color }}>{exp.company}</p>
                                                {exp.location && <p className="text-xs text-gray-400">{exp.location}</p>}
                                            </div>
                                            <p className="text-xs text-gray-400 whitespace-nowrap ml-3">
                                                {formatDate(exp.start_date)} – {formatDate(exp.end_date, exp.is_current)}
                                            </p>
                                        </div>
                                        {exp.description && <p className="text-sm text-gray-500 mt-2 leading-relaxed">{exp.description}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Pendidikan */}
                {educations.length > 0 && (
                    <section>
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Pendidikan</h2>
                        <div className="space-y-4">
                            {educations.map(edu => (
                                <div key={edu.id} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: color }} />
                                        <div className="w-px flex-1 mt-1" style={{ background: color + '30' }} />
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-900">{edu.institution}</p>
                                                <p className="text-sm text-gray-600">{edu.degree}{edu.field_of_study ? ` — ${edu.field_of_study}` : ''}</p>
                                                {edu.gpa && <p className="text-xs text-gray-400">IPK: {edu.gpa}</p>}
                                            </div>
                                            <p className="text-xs text-gray-400 whitespace-nowrap ml-3">
                                                {formatDate(edu.start_date)} – {formatDate(edu.end_date, edu.is_current)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <section>
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Skill</h2>
                        <div className="flex flex-wrap gap-2">
                            {skills.map(skill => (
                                <div key={skill.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                                    style={{ background: color + '15', color }}>
                                    <span>{skill.name}</span>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(l => (
                                            <div key={l} className="w-1 h-1 rounded-full"
                                                style={{ background: l <= skill.level ? color : color + '30' }} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Proyek */}
                {projects.length > 0 && (
                    <section>
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Proyek</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {projects.map(project => (
                                <div key={project.id} className="border rounded-xl p-4" style={{ borderColor: '#e2e8f0' }}>
                                    <div className="flex items-start justify-between">
                                        <p className="font-semibold text-gray-900">{project.title}</p>
                                        <div className="flex gap-2 ml-3">
                                            {project.url && <a href={project.url} target="_blank" rel="noreferrer" style={{ color }}><ExternalLink className="h-4 w-4" /></a>}
                                            {project.github_url && <a href={project.github_url} target="_blank" rel="noreferrer" className="text-gray-400"><FaGithub className="h-4 w-4" /></a>}
                                        </div>
                                    </div>
                                    {project.description && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{project.description}</p>}
                                    {project.tech_stack?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {project.tech_stack.map(tech => (
                                                <span key={tech} className="text-xs px-2 py-0.5 rounded-full"
                                                    style={{ background: color + '15', color }}>{tech}</span>
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