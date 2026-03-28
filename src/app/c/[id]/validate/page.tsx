'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  getPublicChallenge,
  getPendingProofs,
  validateProof,
  validateAllProofs,
  type CreatorChallengePublic,
  type PendingProof,
} from '@/lib/api/reliable'

type PageState = 'loading' | 'ready' | 'empty' | 'error'

export default function ValidateProofsPage() {
  const params = useParams()
  const id = params.id as string

  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<PageState>('loading')
  const [challenge, setChallenge] = useState<CreatorChallengePublic | null>(null)
  const [proofs, setProofs] = useState<PendingProof[]>([])
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState<Set<string>>(new Set())
  const [approvingAll, setApprovingAll] = useState(false)
  const [expandedProof, setExpandedProof] = useState<string | null>(null)

  // Mock: In reality, get from auth/session
  const userId = 'mock-creator-id'

  useEffect(() => {
    setMounted(true)
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [challengeData, proofsData] = await Promise.all([
        getPublicChallenge(id),
        getPendingProofs(id, userId),
      ])

      setChallenge(challengeData)
      setProofs(proofsData.proofs)

      if (proofsData.proofs.length === 0) {
        setState('empty')
      } else {
        setState('ready')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load proofs')
      setState('error')
    }
  }

  const handleValidate = async (proofId: string, approved: boolean) => {
    setProcessing(prev => new Set(prev).add(proofId))

    try {
      await validateProof(id, proofId, userId, approved)
      setProofs(prev => prev.filter(p => p.id !== proofId))

      if (proofs.length === 1) {
        setState('empty')
      }
    } catch (err) {
      console.error('Failed to validate proof:', err)
    } finally {
      setProcessing(prev => {
        const next = new Set(prev)
        next.delete(proofId)
        return next
      })
    }
  }

  const handleApproveAll = async () => {
    if (proofs.length === 0) return

    setApprovingAll(true)

    try {
      const proofIds = proofs.map(p => p.id)
      await validateAllProofs(id, userId, proofIds, true)
      setProofs([])
      setState('empty')
    } catch (err) {
      console.error('Failed to approve all:', err)
    } finally {
      setApprovingAll(false)
    }
  }

  const currentDay = challenge
    ? challenge.duration_days - (challenge.days_remaining || 0)
    : 0

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap');
    .validate-page { --paper: #FAF8F2; --ink: #1A1A1A; --green: #1B4332; --warmgrey: #C9C5BC; --faint: #E8E5DE; --red: #c53030; font-family: 'Inter', system-ui, sans-serif; }
    .validate-page::before { content: ""; position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.025; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
    .font-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    .animate-fade-up { animation: fadeUp 0.5s ease-out forwards; }
    .animate-pulse-slow { animation: pulse 2s ease-in-out infinite; }
    .proof-card { border: 1px solid var(--faint); padding: 16px; margin-bottom: 12px; transition: all 0.2s ease; }
    .proof-card:hover { border-color: var(--warmgrey); }
    .proof-thumb { width: 64px; height: 64px; object-fit: cover; cursor: pointer; }
    .proof-expanded { max-height: 300px; width: 100%; object-fit: contain; margin-top: 12px; }
    .action-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 18px; transition: all 0.2s ease; }
    .action-btn.approve { background: rgba(27, 67, 50, 0.1); color: var(--green); }
    .action-btn.approve:hover { background: var(--green); color: #fff; }
    .action-btn.reject { background: rgba(197, 48, 48, 0.1); color: var(--red); }
    .action-btn.reject:hover { background: var(--red); color: #fff; }
    .action-btn:disabled { opacity: 0.3; cursor: not-allowed; }
    .approve-all-btn { background: var(--green); color: #fff; padding: 12px 24px; text-align: center; font-size: 12px; font-weight: 500; letter-spacing: 0.1em; }
    .approve-all-btn:hover { opacity: 0.9; }
    .approve-all-btn:disabled { opacity: 0.5; }
    .count-badge { background: var(--green); color: #fff; padding: 4px 8px; font-size: 11px; font-weight: 500; }
  `

  if (!mounted) return null

  return (
    <>
      <style jsx global>{styles}</style>
      <div className="validate-page min-h-screen flex flex-col" style={{ background: 'var(--paper)' }}>
        {/* Header */}
        <header className="px-6 py-4" style={{ borderBottom: '0.5px solid var(--faint)' }}>
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Link
              href={`/c/${id}`}
              className="flex items-center gap-2 text-[11px] tracking-[0.1em] transition-opacity hover:opacity-60"
              style={{ color: 'var(--ink)', opacity: 0.4 }}
            >
              &larr; BACK
            </Link>
            <span className="text-[10px] font-medium tracking-[0.2em]" style={{ color: 'var(--ink)', opacity: 0.3 }}>
              VALIDATE
            </span>
          </div>
        </header>

        {/* Loading State */}
        {state === 'loading' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center animate-pulse-slow" style={{ border: '1px solid var(--faint)' }}>
                <span style={{ color: 'var(--green)', fontSize: '20px' }}>&#x25A0;</span>
              </div>
              <p className="text-[11px] tracking-[0.2em]" style={{ color: 'var(--ink)', opacity: 0.4 }}>
                LOADING PROOFS...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center" style={{ border: '2px solid var(--red)' }}>
                <span style={{ color: 'var(--red)', fontSize: '28px' }}>&#x2715;</span>
              </div>
              <h1 className="font-serif text-[28px] mb-4" style={{ color: 'var(--ink)' }}>
                Access Denied
              </h1>
              <p className="text-[14px] mb-8" style={{ color: 'var(--ink)', opacity: 0.5 }}>
                {error}
              </p>
              <Link href={`/c/${id}`} className="inline-block py-3 px-6 text-[11px] tracking-[0.15em]" style={{ background: 'var(--green)', color: '#fff' }}>
                BACK TO CHALLENGE
              </Link>
            </div>
          </div>
        )}

        {/* Empty State */}
        {state === 'empty' && (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center max-w-md animate-fade-up">
              <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center" style={{ border: '2px solid var(--green)' }}>
                <span style={{ color: 'var(--green)', fontSize: '28px' }}>&#x2713;</span>
              </div>
              <h1 className="font-serif text-[32px] mb-4" style={{ color: 'var(--ink)' }}>
                All Caught Up
              </h1>
              <p className="text-[14px] mb-8" style={{ color: 'var(--ink)', opacity: 0.5 }}>
                No proofs pending review. Check back later.
              </p>
              <Link href={`/c/${id}`} className="inline-block py-3 px-6 text-[11px] tracking-[0.15em]" style={{ background: 'var(--green)', color: '#fff' }}>
                BACK TO CHALLENGE
              </Link>
            </div>
          </div>
        )}

        {/* Ready State - Proof List */}
        {state === 'ready' && challenge && (
          <main className="flex-1 px-6 py-8 relative z-10">
            <div className="max-w-2xl mx-auto animate-fade-up">
              {/* Title + Count */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="font-serif text-[24px] leading-[1.2] tracking-[-0.02em]" style={{ color: 'var(--ink)' }}>
                    {challenge.title}
                  </h1>
                  <p className="text-[12px] mt-1" style={{ color: 'var(--ink)', opacity: 0.4 }}>
                    Day {currentDay}
                  </p>
                </div>
                <div className="count-badge">
                  {proofs.length} pending
                </div>
              </div>

              {/* Approve All Button */}
              <button
                onClick={handleApproveAll}
                disabled={approvingAll || proofs.length === 0}
                className="approve-all-btn w-full mb-6"
              >
                {approvingAll ? 'APPROVING...' : `APPROVE ALL ${proofs.length} PROOFS`}
              </button>

              {/* Proof Cards */}
              <div>
                {proofs.map((proof) => (
                  <div key={proof.id} className="proof-card">
                    <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      {proof.file_url && (
                        <img
                          src={proof.file_url}
                          alt="Proof"
                          className="proof-thumb"
                          onClick={() => setExpandedProof(expandedProof === proof.id ? null : proof.id)}
                        />
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate" style={{ color: 'var(--ink)' }}>
                          {proof.participant_name || proof.participant_email}
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--ink)', opacity: 0.4 }}>
                          Day {proof.day} &middot; {new Date(proof.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleValidate(proof.id, true)}
                          disabled={processing.has(proof.id)}
                          className="action-btn approve"
                          title="Approve"
                        >
                          &#x2713;
                        </button>
                        <button
                          onClick={() => handleValidate(proof.id, false)}
                          disabled={processing.has(proof.id)}
                          className="action-btn reject"
                          title="Reject"
                        >
                          &#x2715;
                        </button>
                      </div>
                    </div>

                    {/* Expanded Image */}
                    {expandedProof === proof.id && proof.file_url && (
                      <img
                        src={proof.file_url}
                        alt="Proof (expanded)"
                        className="proof-expanded"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}
      </div>
    </>
  )
}
