'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  getChallenge,
  getMyParticipation,
  joinChallenge,
  submitDailyProof,
  Challenge,
  Participation,
} from '@/lib/api/reliable'

// Mock user - in production this comes from auth
const MOCK_USER_ID = 'user_demo_001'
const MOCK_USER_EMAIL = 'demo@reliable.app'

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getDayStatus(
  dayNumber: number,
  participation: Participation | null,
  challenge: Challenge
): 'completed' | 'current' | 'upcoming' | 'missed' | 'locked' {
  if (!participation) return 'locked'

  const now = new Date()
  const startDate = new Date(challenge.start_date)
  const currentDay = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  // Check if proof was submitted for this day
  const proof = participation.daily_proofs.find((p) => p.day === dayNumber)
  if (proof) return 'completed'

  // Check if failed
  if (participation.status === 'failed' && participation.failed_on_day && dayNumber >= participation.failed_on_day) {
    return 'missed'
  }

  if (dayNumber < currentDay) return 'missed'
  if (dayNumber === currentDay && challenge.status === 'active') return 'current'
  return 'upcoming'
}

function getCurrentDay(challenge: Challenge): number {
  const now = new Date()
  const startDate = new Date(challenge.start_date)
  return Math.max(1, Math.min(7, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1))
}

export default function ChallengePage() {
  const params = useParams()
  const publicId = params.id as string

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [participation, setParticipation] = useState<Participation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Join flow
  const [selectedStake, setSelectedStake] = useState<number | null>(null)
  const [joining, setJoining] = useState(false)

  // Proof submission
  const [proofUrl, setProofUrl] = useState('')
  const [submittingProof, setSubmittingProof] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [challengeData, participationData] = await Promise.all([
        getChallenge(publicId),
        getMyParticipation(publicId, MOCK_USER_ID),
      ])
      setChallenge(challengeData)
      setParticipation(participationData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenge')
    } finally {
      setLoading(false)
    }
  }, [publicId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleJoin = async () => {
    if (!selectedStake || !challenge) return
    setJoining(true)
    setError(null)

    try {
      // In production, you'd create a payment intent with Stripe first
      const mockPaymentIntentId = `pi_mock_${Date.now()}`

      const newParticipation = await joinChallenge(publicId, {
        user_id: MOCK_USER_ID,
        user_email: MOCK_USER_EMAIL,
        stake_amount_cents: selectedStake,
        payment_intent_id: mockPaymentIntentId,
      })
      setParticipation(newParticipation)
      await loadData() // Refresh challenge stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join challenge')
    } finally {
      setJoining(false)
    }
  }

  const handleSubmitProof = async () => {
    if (!proofUrl || !participation || !challenge) return
    setSubmittingProof(true)
    setError(null)

    try {
      const currentDay = getCurrentDay(challenge)
      await submitDailyProof(participation.id, {
        day_number: currentDay,
        proof_type: 'url',
        proof_url: proofUrl,
      })
      setProofUrl('')
      await loadData() // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit proof')
    } finally {
      setSubmittingProof(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-[var(--muted)]">Loading challenge...</p>
        </div>
      </main>
    )
  }

  if (error && !challenge) {
    return (
      <main className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="card-elevated p-8 text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/r" className="btn-secondary">
            Back to Home
          </Link>
        </div>
      </main>
    )
  }

  if (!challenge) return null

  const currentDay = challenge.status === 'active' ? getCurrentDay(challenge) : 0
  const isResolved = challenge.status === 'resolved'

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <Link href="/r" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[var(--forest)]" />
            <span className="text-sm font-medium tracking-widest uppercase">Reliable</span>
          </Link>
          <Link href="/me" className="btn-ghost text-sm">
            My Record
          </Link>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-2 border-red-500 p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Challenge Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`badge ${
              challenge.status === 'open' ? 'badge-success' :
              challenge.status === 'active' ? 'badge-info' :
              challenge.status === 'resolved' ? 'badge-default' : 'badge-warning'
            }`}>
              {challenge.status === 'open' ? 'Join Open' :
               challenge.status === 'active' ? 'Day ' + currentDay + '/7' :
               challenge.status}
            </span>
            {participation && (
              <span className={`badge ${
                participation.status === 'active' ? 'badge-success' :
                participation.status === 'completed' ? 'badge-info' :
                participation.status === 'failed' ? 'badge-error' : 'badge-default'
              }`}>
                {participation.status === 'active' ? 'You\'re in' :
                 participation.status === 'completed' ? 'Completed' :
                 participation.status === 'failed' ? 'Failed' : participation.status}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-medium mb-3">{challenge.title}</h1>
          <p className="text-[var(--muted)] leading-relaxed">{challenge.description}</p>
        </div>

        {/* Pool Stats */}
        <div className="card-elevated mb-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-medium text-[var(--forest)]">{challenge.pool_total_display}</div>
              <div className="text-xs text-[var(--muted)] uppercase tracking-wide">Pool</div>
            </div>
            <div>
              <div className="text-2xl font-medium">{challenge.active_count}/{challenge.participant_count}</div>
              <div className="text-xs text-[var(--muted)] uppercase tracking-wide">Active</div>
            </div>
            <div>
              <div className="text-2xl font-medium text-[var(--forest)]">{challenge.completed_count}</div>
              <div className="text-xs text-[var(--muted)] uppercase tracking-wide">Completed</div>
            </div>
          </div>
        </div>

        {/* Not Joined - Join Flow */}
        {!participation && challenge.status === 'open' && (
          <div className="card-elevated mb-8">
            <h3 className="text-lg font-medium mb-4">Join the Challenge</h3>

            <div className="mb-6">
              <div className="text-xs text-[var(--muted)] uppercase tracking-wide mb-3">Select Your Stake</div>
              <div className="flex flex-wrap gap-3">
                {challenge.stake_options.map((opt) => (
                  <button
                    key={opt.amount_cents}
                    onClick={() => setSelectedStake(opt.amount_cents)}
                    className={`px-6 py-3 border-2 transition-all ${
                      selectedStake === opt.amount_cents
                        ? 'border-[var(--forest)] bg-[var(--forest-50)]'
                        : 'border-[var(--border)] hover:border-[var(--forest)]'
                    }`}
                  >
                    <span className="font-medium">{opt.amount_display}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[var(--forest-50)] border-2 border-[var(--forest)] p-4 mb-6">
              <div className="text-xs text-[var(--forest)] uppercase tracking-wide mb-1">Daily Proof Required</div>
              <p className="text-sm text-[var(--forest-600)]">{challenge.proof_description}</p>
            </div>

            <button
              onClick={handleJoin}
              disabled={!selectedStake || joining}
              className="btn-primary w-full"
            >
              {joining ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner" />
                  Joining...
                </span>
              ) : selectedStake ? (
                `Stake ${challenge.stake_options.find(o => o.amount_cents === selectedStake)?.amount_display} & Join`
              ) : (
                'Select a stake amount'
              )}
            </button>
          </div>
        )}

        {/* Joined - Progress View */}
        {participation && (
          <>
            {/* 7-Day Progress Grid */}
            <div className="card mb-8">
              <h3 className="text-lg font-medium mb-4">Your Progress</h3>
              <div className="grid grid-cols-7 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                  const status = getDayStatus(day, participation, challenge)
                  return (
                    <div
                      key={day}
                      className={`aspect-square flex flex-col items-center justify-center border-2 transition-all ${
                        status === 'completed' ? 'bg-[var(--forest)] border-[var(--forest)] text-white' :
                        status === 'current' ? 'border-[var(--forest)] bg-[var(--forest-50)]' :
                        status === 'missed' ? 'bg-red-50 border-red-500 text-red-500' :
                        'border-[var(--border)] text-[var(--muted)]'
                      }`}
                    >
                      <span className="text-lg font-medium">{day}</span>
                      {status === 'completed' && <span className="text-xs">Done</span>}
                      {status === 'current' && <span className="text-xs text-[var(--forest)]">Now</span>}
                      {status === 'missed' && <span className="text-xs">X</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Submit Proof - Only if active and current day */}
            {participation.status === 'active' && challenge.status === 'active' && (
              <div className="card-elevated mb-8">
                <h3 className="text-lg font-medium mb-2">Day {currentDay} Proof</h3>
                <p className="text-sm text-[var(--muted)] mb-4">{challenge.proof_description}</p>

                {participation.daily_proofs.find((p) => p.day === currentDay) ? (
                  <div className="bg-[var(--forest-50)] border-2 border-[var(--forest)] p-4 text-center">
                    <span className="text-[var(--forest)] font-medium">Day {currentDay} proof submitted</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <input
                      type="url"
                      value={proofUrl}
                      onChange={(e) => setProofUrl(e.target.value)}
                      placeholder="https://..."
                      className="input"
                    />
                    <button
                      onClick={handleSubmitProof}
                      disabled={!proofUrl || submittingProof}
                      className="btn-primary w-full"
                    >
                      {submittingProof ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="spinner" />
                          Submitting...
                        </span>
                      ) : (
                        'Submit Proof'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Your Stake Info */}
            <div className="card mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-[var(--muted)] uppercase tracking-wide mb-1">Your Stake</div>
                  <div className="text-xl font-medium">{participation.stake_display}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[var(--muted)] uppercase tracking-wide mb-1">Days Completed</div>
                  <div className="text-xl font-medium">{participation.days_completed}/7</div>
                </div>
              </div>
            </div>

            {/* Failed State */}
            {participation.status === 'failed' && (
              <div className="card border-red-500 bg-red-50 mb-8">
                <h3 className="text-lg font-medium text-red-600 mb-2">Challenge Failed</h3>
                <p className="text-sm text-red-600">
                  You missed the proof deadline on day {participation.failed_on_day}. Your stake has been forfeited to the pool.
                </p>
              </div>
            )}

            {/* Completed State */}
            {participation.status === 'completed' && (
              <div className="card-elevated border-[var(--forest)] bg-[var(--forest-50)] mb-8">
                <h3 className="text-lg font-medium text-[var(--forest)] mb-2">Challenge Completed!</h3>
                <p className="text-sm text-[var(--forest-600)] mb-4">
                  You completed all 7 days. Your payout will be distributed when the challenge resolves.
                </p>
                {participation.payout_amount_cents && (
                  <div className="text-2xl font-medium text-[var(--forest)]">
                    Payout: {participation.payout_display}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Resolved Challenge - Results */}
        {isResolved && (
          <div className="card-elevated mb-8">
            <h3 className="text-lg font-medium mb-4">Challenge Results</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-[var(--muted)] uppercase tracking-wide mb-1">Completers</div>
                <div className="text-xl font-medium text-[var(--forest)]">{challenge.completed_count}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--muted)] uppercase tracking-wide mb-1">Failed</div>
                <div className="text-xl font-medium text-red-500">{challenge.failed_count}</div>
              </div>
            </div>
            {participation?.payout_amount_cents && participation.payout_amount_cents > 0 && (
              <div className="bg-[var(--forest)] text-white p-4 text-center">
                <div className="text-xs uppercase tracking-wide mb-1">Your Payout</div>
                <div className="text-2xl font-medium">{participation.payout_display}</div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-[var(--border)] text-center">
          <Link href="/me" className="btn-secondary">
            View My Record
          </Link>
        </footer>
      </div>
    </main>
  )
}
