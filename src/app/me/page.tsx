'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  getUserProfile,
  getUserRecords,
  getUserParticipations,
  UserProfile,
  KernelRecord,
  Participation,
} from '@/lib/api/reliable'

// Mock user - in production this comes from auth
const MOCK_USER_ID = 'user_demo_001'

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function MyRecordPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [records, setRecords] = useState<KernelRecord[]>([])
  const [participations, setParticipations] = useState<Participation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'records' | 'active'>('records')

  useEffect(() => {
    async function loadData() {
      try {
        const [profileData, recordsData, participationsData] = await Promise.all([
          getUserProfile(MOCK_USER_ID),
          getUserRecords(MOCK_USER_ID),
          getUserParticipations(MOCK_USER_ID),
        ])
        setProfile(profileData)
        setRecords(recordsData)
        setParticipations(participationsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const activeParticipations = participations.filter((p) => p.status === 'active' || p.status === 'pending')

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-[var(--muted)]">Loading your record...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <Link href="/r" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[var(--forest)]" />
            <span className="text-sm font-medium tracking-widest uppercase">Reliable</span>
          </Link>
          <Link href="/r" className="btn-ghost text-sm">
            Find Challenge
          </Link>
        </header>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium mb-2">My Record</h1>
          <p className="text-[var(--muted)]">Your execution history, sealed on-chain.</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border-2 border-red-500 p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Profile Stats */}
        {profile ? (
          <div className="card-elevated mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-medium text-[var(--forest)]">
                  {Math.round(profile.completion_rate * 100)}%
                </div>
                <div className="text-xs text-[var(--muted)] uppercase tracking-wide mt-1">Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-medium">
                  {profile.completed_challenges}/{profile.total_challenges}
                </div>
                <div className="text-xs text-[var(--muted)] uppercase tracking-wide mt-1">Challenges</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-medium">{profile.longest_streak}</div>
                <div className="text-xs text-[var(--muted)] uppercase tracking-wide mt-1">Best Streak</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-medium ${profile.net_position_cents >= 0 ? 'text-[var(--forest)]' : 'text-red-500'}`}>
                  {profile.net_position_display}
                </div>
                <div className="text-xs text-[var(--muted)] uppercase tracking-wide mt-1">Net Position</div>
              </div>
            </div>

            {/* Detailed Stats Row */}
            <div className="mt-6 pt-6 border-t border-[var(--border)] grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm font-medium">{profile.total_staked_display}</div>
                <div className="text-xs text-[var(--muted)]">Total Staked</div>
              </div>
              <div>
                <div className="text-sm font-medium text-[var(--forest)]">{profile.total_earned_display}</div>
                <div className="text-xs text-[var(--muted)]">Total Earned</div>
              </div>
              <div>
                <div className="text-sm font-medium text-red-500">-{profile.total_lost_cents > 0 ? `€${profile.total_lost_cents / 100}` : '€0'}</div>
                <div className="text-xs text-[var(--muted)]">Total Lost</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-elevated mb-8 text-center py-8">
            <div className="w-16 h-16 border-2 border-[var(--border)] flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">?</span>
            </div>
            <h3 className="text-lg font-medium mb-2">No Record Yet</h3>
            <p className="text-[var(--muted)] mb-4">Complete your first challenge to build your kernel.</p>
            <Link href="/r" className="btn-primary">
              Find a Challenge
            </Link>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[var(--border)]">
          <button
            onClick={() => setActiveTab('records')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'records'
                ? 'text-[var(--forest)] border-b-2 border-[var(--forest)]'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            Kernel Records ({records.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'active'
                ? 'text-[var(--forest)] border-b-2 border-[var(--forest)]'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            Active ({activeParticipations.length})
          </button>
        </div>

        {/* Records List */}
        {activeTab === 'records' && (
          <div className="space-y-4">
            {records.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-[var(--muted)]">No kernel records yet. Complete a challenge to seal your first record.</p>
              </div>
            ) : (
              records.map((record) => (
                <div key={record.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium">{record.challenge_title}</h3>
                      <p className="text-xs text-[var(--muted)]">Sealed {formatDate(record.sealed_at)}</p>
                    </div>
                    <span className={`badge ${record.outcome === 'completed' ? 'badge-success' : 'badge-error'}`}>
                      {record.outcome === 'completed' ? 'Completed' : 'Failed'}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-medium">{record.days_completed}/{record.days_required}</div>
                      <div className="text-xs text-[var(--muted)]">Days</div>
                    </div>
                    <div>
                      <div className="text-lg font-medium">{Math.round(record.completion_rate * 100)}%</div>
                      <div className="text-xs text-[var(--muted)]">Rate</div>
                    </div>
                    <div>
                      <div className="text-lg font-medium">€{record.stake_amount_cents / 100}</div>
                      <div className="text-xs text-[var(--muted)]">Staked</div>
                    </div>
                    <div>
                      <div className={`text-lg font-medium ${record.net_result_cents >= 0 ? 'text-[var(--forest)]' : 'text-red-500'}`}>
                        {record.net_result_cents >= 0 ? '+' : ''}€{record.net_result_cents / 100}
                      </div>
                      <div className="text-xs text-[var(--muted)]">Net</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Active Participations */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            {activeParticipations.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-[var(--muted)] mb-4">No active challenges.</p>
                <Link href="/r" className="btn-primary">
                  Find a Challenge
                </Link>
              </div>
            ) : (
              activeParticipations.map((p) => (
                <Link key={p.id} href={`/r/${p.challenge_id}`} className="card-interactive block">
                  <div className="flex items-center justify-between mb-4">
                    <span className="badge badge-info">Day {p.days_completed + 1}/7</span>
                    <span className="text-sm text-[var(--muted)]">{p.stake_display}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="grid grid-cols-7 gap-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                      const completed = p.daily_proofs.some((dp) => dp.day === day)
                      return (
                        <div
                          key={day}
                          className={`h-2 ${completed ? 'bg-[var(--forest)]' : 'bg-[var(--border)]'}`}
                        />
                      )
                    })}
                  </div>

                  <div className="mt-4 text-sm text-[var(--muted)]">
                    {p.current_streak} day streak
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-[var(--border)] text-center">
          <p className="text-xs text-[var(--muted)]">
            Kernel records are immutable proof of your execution history.
          </p>
        </footer>
      </div>
    </main>
  )
}
