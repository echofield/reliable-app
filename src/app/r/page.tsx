'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getActiveChallenge, Challenge } from '@/lib/api/reliable'

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatCountdown(targetDate: string): string {
  const now = new Date()
  const target = new Date(targetDate)
  const diff = target.getTime() - now.getTime()

  if (diff <= 0) return 'Started'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `${days}d ${hours}h`
  return `${hours}h`
}

export default function ReliableLanding() {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadChallenge() {
      try {
        const data = await getActiveChallenge()
        setChallenge(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load challenge')
      } finally {
        setLoading(false)
      }
    }
    loadChallenge()
  }, [])

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <Link href="/r" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[var(--forest)]" />
            <span className="text-sm font-medium tracking-widest uppercase">Reliable</span>
          </Link>
          <Link href="/me" className="btn-ghost text-sm">
            My Record
          </Link>
        </header>

        {/* Hero */}
        <div className="mb-16 animate-fade-up">
          <h1 className="text-4xl md:text-5xl font-light mb-6 leading-tight">
            Prove your execution.<br />
            <span className="text-[var(--forest)] font-medium">Win the pool.</span>
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-xl leading-relaxed">
            Stake money on your commitment. Complete 7 days of proof.
            Those who finish share the pool of those who quit.
          </p>
        </div>

        {/* How It Works */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { step: '01', title: 'Stake', desc: 'Choose your commitment level. Higher stakes = more skin in the game.' },
            { step: '02', title: 'Prove', desc: 'Submit proof every day for 7 days. Miss one day and you forfeit.' },
            { step: '03', title: 'Win', desc: 'Complete all 7 days. Split the pool with fellow completers.' },
          ].map((item, i) => (
            <div key={item.step} className={`card animate-fade-up stagger-${i + 1}`}>
              <div className="text-xs text-[var(--muted)] mb-2">{item.step}</div>
              <h3 className="text-lg font-medium mb-2">{item.title}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Active Challenge */}
        {loading ? (
          <div className="card-elevated p-8 text-center">
            <div className="spinner mx-auto mb-4" />
            <p className="text-[var(--muted)]">Loading challenge...</p>
          </div>
        ) : error ? (
          <div className="card border-red-500 p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-secondary">
              Try Again
            </button>
          </div>
        ) : challenge ? (
          <div className="card-elevated animate-scale-in">
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-6">
              <span className={`badge ${challenge.status === 'open' ? 'badge-success' : 'badge-info'}`}>
                {challenge.status === 'open' ? 'Joining Open' : challenge.status === 'active' ? 'In Progress' : challenge.status}
              </span>
              {challenge.status === 'open' && (
                <span className="text-sm text-[var(--muted)]">
                  Starts in {formatCountdown(challenge.start_date)}
                </span>
              )}
            </div>

            {/* Challenge Info */}
            <h2 className="text-2xl font-medium mb-3">{challenge.title}</h2>
            <p className="text-[var(--muted)] mb-6 leading-relaxed">{challenge.description}</p>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div>
                <div className="text-xs text-[var(--muted)] uppercase tracking-wide mb-1">Pool</div>
                <div className="text-xl font-medium text-[var(--forest)]">{challenge.pool_total_display}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--muted)] uppercase tracking-wide mb-1">Participants</div>
                <div className="text-xl font-medium">{challenge.participant_count}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--muted)] uppercase tracking-wide mb-1">Duration</div>
                <div className="text-xl font-medium">{challenge.duration_days} Days</div>
              </div>
              <div>
                <div className="text-xs text-[var(--muted)] uppercase tracking-wide mb-1">
                  {challenge.status === 'open' ? 'Join By' : 'Ends'}
                </div>
                <div className="text-xl font-medium">
                  {formatDate(challenge.status === 'open' ? challenge.join_deadline : challenge.end_date)}
                </div>
              </div>
            </div>

            {/* Stake Options */}
            {challenge.status === 'open' && (
              <div className="mb-8">
                <div className="text-xs text-[var(--muted)] uppercase tracking-wide mb-3">Stake Options</div>
                <div className="flex flex-wrap gap-3">
                  {challenge.stake_options.map((opt) => (
                    <div
                      key={opt.amount_cents}
                      className="px-4 py-2 border-2 border-[var(--border)] text-center min-w-[80px]"
                    >
                      <span className="font-medium">{opt.amount_display}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Proof Requirement */}
            <div className="bg-[var(--forest-50)] border-2 border-[var(--forest)] p-4 mb-8">
              <div className="text-xs text-[var(--forest)] uppercase tracking-wide mb-1">Daily Proof Required</div>
              <p className="text-sm text-[var(--forest-600)]">{challenge.proof_description}</p>
            </div>

            {/* CTA */}
            <Link
              href={`/r/${challenge.public_id}`}
              className="btn-primary w-full text-center block"
            >
              {challenge.status === 'open' ? 'Join Challenge' : 'View Challenge'}
            </Link>
          </div>
        ) : (
          <div className="card-elevated p-8 text-center">
            <div className="w-16 h-16 border-2 border-[var(--border)] flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">-</span>
            </div>
            <h3 className="text-xl font-medium mb-2">No Active Challenge</h3>
            <p className="text-[var(--muted)] mb-6">
              The next challenge hasn&apos;t been announced yet. Check back soon.
            </p>
            <Link href="/me" className="btn-secondary">
              View My Record
            </Link>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-[var(--border)] text-center">
          <p className="text-xs text-[var(--muted)]">
            Powered by SYMIONE PAY &middot; Proof creates trust
          </p>
        </footer>
      </div>
    </main>
  )
}
