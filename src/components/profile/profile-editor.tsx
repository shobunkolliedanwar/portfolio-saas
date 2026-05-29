'use client'

import { useState, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Eye, EyeOff, Share2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { PortfolioData } from '@/types'
import { BasicInfoForm } from './basic-info-form'
import { ExperienceForm } from './experience-form'
import { EducationForm } from './education-form'
import { SkillsForm } from './skills-form'
import { ProjectsForm } from './projects-form'
import { TemplateSelector } from './template-selector'
import { PortfolioPreview } from './portfolio-preview'
import { ShareDialog } from './share-dialog'

interface Props {
    initialData: PortfolioData,
    plan: string
}

export function ProfileEditor({ initialData }: Props) {
    const [data, setData] = useState<PortfolioData>(initialData)
    const [publishing, setPublishing] = useState(false)
    const [showShare, setShowShare] = useState(false)
    const [showPreview, setShowPreview] = useState(true)

    const updateData = useCallback((partial: Partial<PortfolioData>) => {
        setData(prev => ({ ...prev, ...partial }))
    }, [])

    async function togglePublish() {
        setPublishing(true)
        const supabase = createClient()
        const newStatus = !data.profile.is_published

        const { error } = await supabase
            .from('profiles')
            .update({ is_published: newStatus })
            .eq('id', data.profile.id)

        if (error) {
            toast.error('Gagal mengubah status portfolio')
        } else {
            updateData({ profile: { ...data.profile, is_published: newStatus } })
            toast.success(newStatus ? 'Portfolio dipublish!' : 'Portfolio disembunyikan')
        }
        setPublishing(false)
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Profil & Portfolio</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        portfolio.id/<span className="font-mono">{data.profile.username}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(p => !p)}
                    >
                        {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                        {showPreview ? 'Sembunyikan preview' : 'Tampilkan preview'}
                    </Button>
                    {data.profile.is_published && (
                        <Button variant="outline" size="sm" onClick={() => setShowShare(true)}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Bagikan
                        </Button>
                    )}
                    <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5">
                        <Switch
                            id="publish"
                            checked={data.profile.is_published}
                            onCheckedChange={togglePublish}
                            disabled={publishing}
                        />
                        <Label htmlFor="publish" className="text-sm cursor-pointer">
                            {publishing ? <Loader2 className="h-3 w-3 animate-spin" /> :
                                data.profile.is_published ? 'Published' : 'Draft'}
                        </Label>
                    </div>
                </div>
            </div>

            {/* Layout: editor + preview */}
            <div className={`flex gap-6 ${showPreview ? 'lg:grid lg:grid-cols-2' : ''}`}>
                {/* Editor panel */}
                <div className="flex-1 min-w-0">
                    <Tabs defaultValue="basic">
                        <TabsList className="w-full grid grid-cols-3 lg:grid-cols-6 mb-4">
                            <TabsTrigger value="basic">Info</TabsTrigger>
                            <TabsTrigger value="experience">Karir</TabsTrigger>
                            <TabsTrigger value="education">Pendidikan</TabsTrigger>
                            <TabsTrigger value="skills">Skill</TabsTrigger>
                            <TabsTrigger value="projects">Proyek</TabsTrigger>
                            <TabsTrigger value="template">Template</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic">
                            <BasicInfoForm
                                profile={data.profile}
                                onUpdate={(profile) => updateData({ profile })}
                            />
                        </TabsContent>

                        <TabsContent value="experience">
                            <ExperienceForm
                                experiences={data.experiences}
                                userId={data.profile.id}
                                onUpdate={(experiences) => updateData({ experiences })}
                            />
                        </TabsContent>

                        <TabsContent value="education">
                            <EducationForm
                                educations={data.educations}
                                userId={data.profile.id}
                                onUpdate={(educations) => updateData({ educations })}
                            />
                        </TabsContent>

                        <TabsContent value="skills">
                            <SkillsForm
                                skills={data.skills}
                                userId={data.profile.id}
                                plan={plan}
                                onUpdate={(skills) => updateData({ skills })}
                            />
                        </TabsContent>

                        <TabsContent value="projects">
                            <ProjectsForm
                                projects={data.projects}
                                userId={data.profile.id}
                                plan={plan}
                                onUpdate={(projects) => updateData({ projects })}
                            />
                        </TabsContent>

                        <TabsContent value="template">
                            <TemplateSelector
                                profile={data.profile}
                                onUpdate={(profile) => updateData({ profile })}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Preview panel */}
                {showPreview && (
                    <div className="hidden lg:block">
                        <div className="sticky top-0">
                            <p className="text-xs text-muted-foreground mb-2 font-medium">PREVIEW LIVE</p>
                            <div className="border rounded-xl overflow-hidden bg-white" style={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                                <PortfolioPreview data={data} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showShare && (
                <ShareDialog
                    username={data.profile.username}
                    onClose={() => setShowShare(false)}
                />
            )}
        </div>
    )
}