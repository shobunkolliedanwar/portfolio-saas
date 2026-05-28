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