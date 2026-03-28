'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getPublicChallenge, type CreatorChallengePublic } from '@/lib/api/reliable'

type PageState = 'loading' | 'open' | 'active' | 'resolving' | 'resolved' | 'error'

export default function ChallengeRoomPage() {
  const params = useParams()
  const id = params.id as string

  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<PageState>('loading')
  const [challenge, setChallenge] = useState<CreatorChallengePublic | null>(null)
  const [error, setError] = useState('')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadChallenge()
  }, [id])

  const loadChallenge = async () => {
    try {
      const data = await getPublicChallenge(id)
      setChallenge(data)
      setState(data.status)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Challenge not found')
      setState('error')
    }
  }

  const handleJoin = async () => {
    setJoining(true)
    // TODO: Implement Stripe checkout flow
    await new Promise(resolve => setTimeout(resolve, 1000))
    setJoining(false)
    alert('Join flow coming soon - will redirect to Stripe Checkout')
  }

  const formatMoney = (cents: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100)
  }

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap');
    .challenge-room { --paper: #FAF8F2; --ink: #1A1A1A; --green: #1B4332; --warmgrey: #C9C5BC; --faint: #E8E5DE; font-family: 'Inter', system-ui, sans-serif; }
    .challenge-room::before { content: ""; position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.025; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
    .font-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    .animate-fade-up { animation: fadeUp 0.5s ease-out forwards; }
    .animate-pulse-slow { animation: pulse 2s ease-in-out infinite; }
    .big-pool { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 64px; font-weight: 300; letter-spacing: -0.02em; line-height: 1; }
    .stat-card { padding: 16px 20px; border: 1px solid var(--faint); text-align: center; }
    .stat-value { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; font-weight: 400; }
    .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.4; }
    .cta-box { background: var(--green); color: #fff; padding: 32px; text-align: center; }
    .cta-main { font-size: 16px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 4px; }
    .cta-sub { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; letter-spacing: -0.01em; }
    .proof-box { padding: 20px; background: var(--faint); }
    .creator-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; background: rgba(27, 67, 50, 0.08); }
  `

  if (!mounted) return null

  return (
    <>
      <style jsx global>{styles}</style>
      <div className="challenge-room min-h-screen flex flex-col" style={{ background: 'var(--paper)' }}>
        {/* Loading State */}
        {state === 'loading' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center animate-pulse-slow" style={{ border: '1px solid var(--faint)' }}>
                <span style={{ color: 'var(--green)', fontSize: '20px' }}>&#x25A0;</span>
              </div>
              <p className="text-[11px] tracking-[0.2em]" style={{ color: 'var(--ink)', opacity: 0.4 }}>
                LOADING CHALLENGE...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center" style={{ border: '2px solid #c53030' }}>
                <span style={{ color: '#c53030', fontSize: '28px' }}>&#x2715;</span>
              </div>
              <h1 className="font-serif text-[28px] mb-4" style={{ color: 'var(--ink)' }}>
                Challenge Not Found
              </h1>
              <p className="text-[14px] mb-8" style={{ color: 'var(--ink)', opacity: 0.5 }}>
                {error}
              </p>
              <Link href="/" className="inline-block py-3 px-6 text-[11px] tracking-[0.15em]" style={{ background: 'var(--green)', color: '#fff' }}>
                GO HOME
              </Link>
            </div>
          </div>
        )}

        {/* Challenge Room */}
        {challenge && (state === 'open' || state === 'active' || state === 'resolving' || state === 'resolved') && (
          <>
            {/* Header with Creator */}
            <header className="px-6 py-4" style={{ borderBottom: '0.5px solid var(--faint)' }}>
              <div className="max-w-lg mx-auto flex items-center justify-between">
                {/* Creator Info */}
                <div className="flex items-center gap-3">
                  {challenge.creator.avatar_url ? (
                    <img
                      src={challenge.creator.avatar_url}
                      alt={challenge.creator.name || 'Creator'}
                      className="w-10 h-10 object-cover"
                      style={{ border: '1px solid var(--faint)' }}
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center" style={{ background: 'var(--faint)' }}>
                      <span className="text-[16px]" style={{ color: 'var(--green)' }}>&#x25A0;</span>
                    </div>
                  )}
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: 'var(--ink)' }}>
                      {challenge.creator.name || 'Creator'}
                    </p>
                    {challenge.creator.verified && (
                      <div className="creator-badge mt-1">
                        <span className="text-[8px] tracking-[0.1em]" style={{ color: 'var(--green)' }}>VERIFIED</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="text-right">
                  <span className="text-[9px] font-medium tracking-[0.15em] px-2 py-1" style={{
                    background: state === 'open' ? 'var(--green)' : 'var(--faint)',
                    color: state === 'open' ? '#fff' : 'var(--ink)',
                  }}>
                    {state === 'open' && 'OPEN'}
                    {state === 'active' && `DAY ${challenge.duration_days - (challenge.days_remaining || 0)}/${challenge.duration_days}`}
                    {state === 'resolving' && 'RESOLVING'}
                    {state === 'resolved' && 'COMPLETED'}
                  </span>
                </div>
              </div>
            </header>

            <main className="flex-1 px-6 py-10 relative z-10">
              <div className="max-w-lg mx-auto animate-fade-up">
                {/* Challenge Title */}
                <h1 className="font-serif text-[36px] leading-[1.1] tracking-[-0.02em] text-center mb-8" style={{ color: 'var(--ink)' }}>
                  {challenge.title}
                </h1>

                {/* Big Pool Number */}
                <div className="text-center mb-8">
                  <p className="big-pool" style={{ color: 'var(--green)' }}>
                    {challenge.pool_display}
                  </p>
                  <p className="text-[12px] tracking-[0.1em] mt-2" style={{ color: 'var(--ink)', opacity: 0.4 }}>
                    IN THE POOL
                  </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="stat-card">
                    <p className="stat-value" style={{ color: 'var(--ink)' }}>{challenge.participant_count}</p>
                    <p className="stat-label">joined</p>
                  </div>
                  <div className="stat-card">
                    <p className="stat-value" style={{ color: 'var(--ink)' }}>{challenge.duration_days}</p>
                    <p className="stat-label">days</p>
                  </div>
                  <div className="stat-card">
                    <p className="stat-value" style={{ color: 'var(--green)' }}>{challenge.stake_display}</p>
                    <p className="stat-label">entry</p>
                  </div>
                </div>

                {/* Proof Requirements */}
                <div className="proof-box mb-8">
                  <p className="text-[9px] font-medium tracking-[0.2em] mb-2" style={{ color: 'var(--ink)', opacity: 0.4 }}>
                    PROOF REQUIRED
                  </p>
                  <p className="text-[14px]" style={{ color: 'var(--ink)' }}>
                    {challenge.proof_description || challenge.description}
                  </p>
                </div>

                {/* Join CTA - Only for Open Challenges */}
                {state === 'open' && (
                  <>
                    <div className="cta-box mb-4">
                      <p className="cta-main">
                        PUT {challenge.stake_display} ON YOURSELF.
                      </p>
                      <p className="cta-sub">
                        FINISH OR LOSE IT.
                      </p>
                    </div>

                    <button
                      onClick={handleJoin}
                      disabled={joining}
                      className="w-full py-4 text-[12px] font-medium tracking-[0.15em] hover:opacity-90 transition-opacity disabled:opacity-50"
                      style={{ background: 'var(--green)', color: '#fff' }}
                    >
                      {joining ? 'PROCESSING...' : `JOIN FOR ${challenge.stake_display}`}
                    </button>
                  </>
                )}

                {/* Active Challenge - Submit Proof */}
                {state === 'active' && (
                  <div className="text-center">
                    <p className="text-[14px] mb-4" style={{ color: 'var(--ink)', opacity: 0.5 }}>
                      Challenge in progress. {challenge.days_remaining} days remaining.
                    </p>
                    <Link
                      href={`/c/${id}/proof`}
                      className="inline-block py-4 px-8 text-[12px] font-medium tracking-[0.15em] hover:opacity-90"
                      style={{ background: 'var(--green)', color: '#fff' }}
                    >
                      SUBMIT TODAY&apos;S PROOF
                    </Link>
                  </div>
                )}

                {/* Resolved Challenge - Show Results */}
                {state === 'resolved' && challenge.stats && (
                  <div className="text-center p-6" style={{ border: '1px solid var(--faint)' }}>
                    <p className="text-[9px] font-medium tracking-[0.2em] mb-4" style={{ color: 'var(--green)' }}>
                      CHALLENGE COMPLETED
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-serif text-[24px]" style={{ color: 'var(--green)' }}>
                          {challenge.stats.completed_count}
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--ink)', opacity: 0.4 }}>finished</p>
                      </div>
                      <div>
                        <p className="font-serif text-[24px]" style={{ color: 'var(--ink)' }}>
                          {challenge.stats.failed_count}
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--ink)', opacity: 0.4 }}>failed</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Social Proof - Past Results */}
                {challenge.stats && state === 'open' && (
                  <div className="mt-8 p-4 text-center" style={{ background: 'var(--faint)' }}>
                    <p className="text-[9px] font-medium tracking-[0.2em] mb-2" style={{ color: 'var(--ink)', opacity: 0.4 }}>
                      LAST CHALLENGE
                    </p>
                    <p className="font-serif text-[20px]" style={{ color: 'var(--green)' }}>
                      {formatMoney(challenge.stats.last_win_amount, challenge.currency)} won
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: 'var(--ink)', opacity: 0.4 }}>
                      {challenge.stats.completed_count} completed / {challenge.stats.failed_count} failed
                    </p>
                  </div>
                )}
              </div>
            </main>

            {/* Footer */}
            <footer className="px-6 py-4" style={{ borderTop: '0.5px solid var(--faint)' }}>
              <div className="max-w-lg mx-auto flex items-center justify-center">
                <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                  <span className="text-[10px]" style={{ color: 'var(--warmgrey)' }}>powered by</span>
                  <span className="text-[10px] font-medium tracking-[0.2em]" style={{ color: 'var(--ink)', opacity: 0.5 }}>RELIABLE</span>
                </Link>
              </div>
            </footer>
          </>
        )}
      </div>
    </>
  )
}
