export type PlanType = 'free' | 'pro' | 'business'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due'
export type UserRole = 'user' | 'admin' | 'superadmin'

export interface Profile {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
    bio: string | null
    email: string
    phone: string | null
    location: string | null
    website: string | null
    linkedin_url: string | null
    github_url: string | null
    twitter_url: string | null
    is_published: boolean
    created_at: string
    updated_at: string
}

export interface Subscription {
    id: string
    user_id: string
    plan: PlanType
    status: SubscriptionStatus
    current_period_start: string
    current_period_end: string | null
    created_at: string
}

export interface UserWithDetails {
    profile: Profile
    subscription: Subscription
    role: UserRole
}

export interface Profile {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
    bio: string | null
    tagline: string | null
    email: string
    phone: string | null
    location: string | null
    website: string | null
    linkedin_url: string | null
    github_url: string | null
    twitter_url: string | null
    template_id: string
    primary_color: string
    is_published: boolean
    portfolio_views: number
    created_at: string
    updated_at: string
}

export interface Experience {
    id: string
    user_id: string
    company: string
    position: string
    location: string | null
    start_date: string
    end_date: string | null
    is_current: boolean
    description: string | null
    order_index: number
}

export interface Education {
    id: string
    user_id: string
    institution: string
    degree: string
    field_of_study: string | null
    start_date: string
    end_date: string | null
    is_current: boolean
    gpa: string | null
    description: string | null
    order_index: number
}

export interface Skill {
    id: string
    user_id: string
    name: string
    level: number
    category: string
    order_index: number
}

export interface Project {
    id: string
    user_id: string
    title: string
    description: string | null
    tech_stack: string[]
    url: string | null
    github_url: string | null
    image_url: string | null
    is_featured: boolean
    order_index: number
}

export interface Certification {
    id: string
    user_id: string
    name: string
    issuer: string
    issue_date: string | null
    expiry_date: string | null
    credential_url: string | null
    order_index: number
}

export interface PortfolioData {
    profile: Profile
    experiences: Experience[]
    educations: Education[]
    skills: Skill[]
    projects: Project[]
    certifications: Certification[]
}

export interface Subscription {
    id: string
    user_id: string
    plan: PlanType
    status: SubscriptionStatus
    current_period_start: string
    current_period_end: string | null
    created_at: string
}

export interface UserWithDetails {
    profile: Profile
    subscription: Subscription
    role: UserRole
}