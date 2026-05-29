import type { PortfolioData } from '@/types'
import { MinimalTemplate } from '@/components/templates/minimal-template'
import { ModernTemplate } from '@/components/templates/modern-template'

interface Props {
    data: PortfolioData
}

export function PortfolioPreview({ data }: Props) {
    if (data.profile.template_id === 'modern') {
        return <ModernTemplate data={data} />
    }
    return <MinimalTemplate data={data} />
}