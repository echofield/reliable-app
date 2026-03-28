/**
 * RELIABLE API Client
 * Creator Challenge Room + V0 Execution Challenge System
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
  const url = `${API_URL}${endpoint}`

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

  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

// === V0 Types ===

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

// === Creator Challenge Room Types ===

export interface CreatorChallenge {
  id: string
  slug: string
  preset: string | null
  title: string
  description: string
  proof_description: string
  proof_type: 'image' | 'screenshot' | 'url'
  duration_days: number
  stake_amount_cents: number
  stake_display: string
  currency: string
  creator_id: string
  creator_email: string
  creator_name: string | null
  creator_avatar_url: string | null
  creator_fee_percent: number
  platform_fee_percent: number
  status: 'open' | 'active' | 'resolving' | 'resolved' | 'cancelled'
  participant_count: number
  pool_total_cents: number
  pool_display: string
  days_remaining: number | null
  starts_at: string | null
  ends_at: string | null
  created_at: string
}

export interface CreatorChallengePublic {
  id: string
  slug: string
  title: string
  description: string
  proof_description: string
  proof_type: 'image' | 'screenshot' | 'url'
  duration_days: number
  stake_amount_cents: number
  stake_display: string
  currency: string
  creator: {
    name: string | null
    avatar_url: string | null
    verified: boolean
  }
  status: 'open' | 'active' | 'resolving' | 'resolved'
  participant_count: number
  pool_total_cents: number
  pool_display: string
  days_remaining: number | null
  starts_at: string | null
  ends_at: string | null
  stats: {
    last_win_amount: number
    completed_count: number
    failed_count: number
  } | null
}

export interface PendingProof {
  id: string
  participant_id: string
  participant_email: string
  participant_name: string | null
  day: number
  proof_type: string
  file_url: string | null
  file_name: string | null
  submitted_at: string
}

export interface PlatformStats {
  total_pool_all_time: number
  challenges_completed: number
  average_completion_rate: number
  recent_wins: Array<{
    amount: number
    participant_count: number
    resolved_at: string
  }>
}

// === V0 API Functions ===

export async function getActiveChallenge(): Promise<Challenge | null> {
  return request<Challenge | null>('/api/v1/reliable/challenge/active')
}

export async function getChallenge(publicId: string): Promise<Challenge> {
  return request<Challenge>(`/api/v1/reliable/challenge/${publicId}`)
}

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

export async function getMyParticipation(
  publicId: string,
  userId: string
): Promise<Participation | null> {
  return request<Participation | null>(
    `/api/v1/reliable/challenge/${publicId}/me?user_id=${userId}`
  )
}

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

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  return request<UserProfile | null>(`/api/v1/reliable/user/${userId}/profile`)
}

export async function getUserRecords(userId: string): Promise<KernelRecord[]> {
  return request<KernelRecord[]>(`/api/v1/reliable/user/${userId}/records`)
}

export async function getUserParticipations(userId: string): Promise<Participation[]> {
  return request<Participation[]>(`/api/v1/reliable/user/${userId}/participations`)
}

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

export async function startChallenge(publicId: string): Promise<Challenge> {
  return request<Challenge>(`/api/v1/reliable/challenge/${publicId}/start`, {
    method: 'POST',
  })
}

export async function resolveChallenge(publicId: string): Promise<Challenge> {
  return request<Challenge>(`/api/v1/reliable/challenge/${publicId}/resolve`, {
    method: 'POST',
  })
}

// === Creator Challenge Room API Functions ===

export async function createCreatorChallenge(data: {
  preset?: string
  title: string
  description: string
  proof_description?: string
  proof_type?: 'image' | 'screenshot' | 'url'
  duration_days: number
  stake_amount_cents: number
  currency?: string
  creator_fee_percent?: number
  slug?: string
}, userId: string, userEmail: string): Promise<{ challenge: CreatorChallenge; public_url: string }> {
  return request(`/api/v1/reliable/challenges?user_id=${encodeURIComponent(userId)}&user_email=${encodeURIComponent(userEmail)}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getPublicChallenge(slug: string): Promise<CreatorChallengePublic> {
  return request<CreatorChallengePublic>(`/api/v1/reliable/challenges/${slug}`)
}

export async function joinCreatorChallenge(
  slug: string,
  userEmail: string
): Promise<{ client_secret: string; payment_intent_id: string; participation_id: string }> {
  return request(`/api/v1/reliable/challenges/${slug}/join`, {
    method: 'POST',
    headers: {
      'X-User-Email': userEmail,
    },
  })
}

export async function getMyCreatorParticipation(
  slug: string,
  userId: string
): Promise<Participation | null> {
  return request(`/api/v1/reliable/challenges/${slug}/me?user_id=${encodeURIComponent(userId)}`)
}

export async function submitCreatorProof(
  slug: string,
  userId: string,
  data: {
    day: number
    proof_type: 'image' | 'screenshot' | 'url'
    file_key?: string
    file_name?: string
    url?: string
  }
): Promise<{ proof_id: string; status: string }> {
  return request(`/api/v1/reliable/challenges/${slug}/proof?user_id=${encodeURIComponent(userId)}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getPendingProofs(
  slug: string,
  userId: string
): Promise<{ proofs: PendingProof[] }> {
  return request(`/api/v1/reliable/challenges/${slug}/proofs/pending?user_id=${encodeURIComponent(userId)}`)
}

export async function validateProof(
  slug: string,
  proofId: string,
  userId: string,
  approved: boolean
): Promise<{ proof_id: string; status: string }> {
  return request(`/api/v1/reliable/challenges/${slug}/proofs/${proofId}/validate?user_id=${encodeURIComponent(userId)}`, {
    method: 'POST',
    body: JSON.stringify({ approved }),
  })
}

export async function validateAllProofs(
  slug: string,
  userId: string,
  proofIds: string[],
  approved: boolean
): Promise<{ validated_count: number }> {
  return request(`/api/v1/reliable/challenges/${slug}/proofs/validate-all?user_id=${encodeURIComponent(userId)}`, {
    method: 'POST',
    body: JSON.stringify({ approved, proof_ids: proofIds }),
  })
}

export async function getPlatformStats(): Promise<PlatformStats> {
  return request<PlatformStats>('/api/v1/reliable/stats')
}

export async function getMyCreatedChallenges(
  userId: string
): Promise<{ challenges: CreatorChallenge[] }> {
  return request(`/api/v1/reliable/challenges/created?user_id=${encodeURIComponent(userId)}`)
}
