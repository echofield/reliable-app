/**
 * RELIABLE V0 API Client
 * 7-Day Execution Challenge System
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const normalizedEndpoint = endpoint.includes('?')
    ? endpoint.replace('?', '/?')
    : endpoint.endsWith('/') ? endpoint : `${endpoint}/`
  const url = `${API_URL}${normalizedEndpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new ApiError(response.status, error.detail || 'Request failed')
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

// === Types ===

export interface StakeOption {
  amount_cents: number
  amount_display: string
}

export interface Challenge {
  id: string
  public_id: string
  title: string
  description: string
  proof_description: string
  proof_type: string
  duration_days: number
  status: 'open' | 'active' | 'resolving' | 'resolved' | 'cancelled'
  join_deadline: string
  start_date: string
  end_date: string
  stake_options: StakeOption[]
  currency: string
  pool_total_cents: number
  pool_total_display: string
  participant_count: number
  active_count: number
  completed_count: number
  failed_count: number
  platform_fee_percent: number
}

export interface DailyProofSummary {
  day: number
  status: 'submitted' | 'validated' | 'rejected'
  submitted_at: string
}

export interface Participation {
  id: string
  challenge_id: string
  user_id: string
  stake_amount_cents: number
  stake_display: string
  status: 'pending' | 'active' | 'completed' | 'failed' | 'withdrawn'
  days_completed: number
  current_streak: number
  failed_on_day: number | null
  payout_amount_cents: number | null
  payout_display: string | null
  daily_proofs: DailyProofSummary[]
  joined_at: string
}

export interface DailyProof {
  id: string
  day_number: number
  proof_type: string
  proof_url: string | null
  status: 'submitted' | 'validated' | 'rejected'
  deadline: string
  submitted_at: string
}

export interface UserProfile {
  user_id: string
  total_challenges: number
  completed_challenges: number
  failed_challenges: number
  completion_rate: number
  total_staked_cents: number
  total_staked_display: string
  total_earned_cents: number
  total_earned_display: string
  total_lost_cents: number
  net_position_cents: number
  net_position_display: string
  current_streak: number
  longest_streak: number
}

export interface KernelRecord {
  id: string
  challenge_title: string
  outcome: 'completed' | 'failed'
  days_completed: number
  days_required: number
  completion_rate: number
  stake_amount_cents: number
  payout_amount_cents: number
  net_result_cents: number
  sealed_at: string
}

// === API Functions ===

/**
 * Get the currently active or open challenge
 */
export async function getActiveChallenge(): Promise<Challenge | null> {
  return request<Challenge | null>('/api/v1/reliable/challenge/active')
}

/**
 * Get a challenge by public ID
 */
export async function getChallenge(publicId: string): Promise<Challenge> {
  return request<Challenge>(`/api/v1/reliable/challenge/${publicId}`)
}

/**
 * Join a challenge with a stake
 */
export async function joinChallenge(
  publicId: string,
  data: {
    user_id: string
    user_email: string
    stake_amount_cents: number
    payment_intent_id: string
    connected_account_id?: string
  }
): Promise<Participation> {
  return request<Participation>(`/api/v1/reliable/challenge/${publicId}/join`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Get current user's participation in a challenge
 */
export async function getMyParticipation(
  publicId: string,
  userId: string
): Promise<Participation | null> {
  return request<Participation | null>(
    `/api/v1/reliable/challenge/${publicId}/me?user_id=${userId}`
  )
}

/**
 * Submit daily proof
 */
export async function submitDailyProof(
  participationId: string,
  data: {
    day_number: number
    proof_type: 'url' | 'image'
    proof_url?: string
    proof_image_key?: string
  }
): Promise<DailyProof> {
  return request<DailyProof>(`/api/v1/reliable/participation/${participationId}/proof`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Get user's kernel profile (reputation)
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  return request<UserProfile | null>(`/api/v1/reliable/user/${userId}/profile`)
}

/**
 * Get user's kernel records (challenge history)
 */
export async function getUserRecords(userId: string): Promise<KernelRecord[]> {
  return request<KernelRecord[]>(`/api/v1/reliable/user/${userId}/records`)
}

/**
 * Get all participations for a user
 */
export async function getUserParticipations(userId: string): Promise<Participation[]> {
  return request<Participation[]>(`/api/v1/reliable/user/${userId}/participations`)
}

// === Admin Functions ===

/**
 * Create a new challenge (admin)
 */
export async function createChallenge(data: {
  title: string
  description: string
  proof_description: string
  proof_type?: string
  allowed_domains?: string[]
  duration_days?: number
  join_window_hours?: number
  stake_options_cents?: number[]
  platform_fee_percent?: number
}): Promise<Challenge> {
  return request<Challenge>('/api/v1/reliable/challenge', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Start a challenge (admin)
 */
export async function startChallenge(publicId: string): Promise<Challenge> {
  return request<Challenge>(`/api/v1/reliable/challenge/${publicId}/start`, {
    method: 'POST',
  })
}

/**
 * Resolve a challenge (admin)
 */
export async function resolveChallenge(publicId: string): Promise<Challenge> {
  return request<Challenge>(`/api/v1/reliable/challenge/${publicId}/resolve`, {
    method: 'POST',
  })
}
