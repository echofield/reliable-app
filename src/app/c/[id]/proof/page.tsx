'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getPublicChallenge, submitCreatorProof, type CreatorChallengePublic } from '@/lib/api/reliable'

type PageState = 'loading' | 'ready' | 'uploading' | 'submitted' | 'error'

export default function ProofSubmissionPage() {
  const params = useParams()
  const id = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<PageState>('loading')
  const [challenge, setChallenge] = useState<CreatorChallengePublic | null>(null)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')

  // Mock: In reality, get from auth/session
  const userId = 'mock-user-id'
  const currentDay = 5 // Mock: would be calculated from challenge start date

  useEffect(() => {
    setMounted(true)
    loadChallenge()
  }, [id])

  const loadChallenge = async () => {
    try {
      const data = await getPublicChallenge(id)
      setChallenge(data)

      if (data.status !== 'active') {
        setError('Challenge is not currently active')
        setState('error')
        return
      }

      setState('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Challenge not found')
      setState('error')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    if (!challenge) return

    setState('uploading')
    setError('')

    try {
      // TODO: Upload file to S3 first, then submit proof
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (challenge.proof_type === 'url') {
        await submitCreatorProof(id, userId, {
          day: currentDay,
          proof_type: 'url',
          url: urlInput,
        })
      } else {
        await submitCreatorProof(id, userId, {
          day: currentDay,
          proof_type: challenge.proof_type,
          file_key: 'mock-file-key',
          file_name: selectedFile?.name || 'proof.jpg',
        })
      }

      setState('submitted')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit proof')
      setState('ready')
    }
  }

  const isValid = challenge?.proof_type === 'url'
    ? urlInput.trim().length > 0
    : selectedFile !== null

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap');
    .proof-page { --paper: #FAF8F2; --ink: #1A1A1A; --green: #1B4332; --warmgrey: #C9C5BC; --faint: #E8E5DE; font-family: 'Inter', system-ui, sans-serif; }
    .proof-page::before { content: ""; position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.025; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
    .font-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    .animate-fade-up { animation: fadeUp 0.5s ease-out forwards; }
    .animate-pulse-slow { animation: pulse 2s ease-in-out infinite; }
    .upload-zone { border: 2px dashed var(--faint); padding: 40px; text-align: center; cursor: pointer; transition: all 0.2s ease; }
    .upload-zone:hover { border-color: var(--green); background: rgba(27, 67, 50, 0.02); }
    .upload-zone.has-file { border-style: solid; border-color: var(--green); }
    .day-badge { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: var(--green); color: #fff; }
    .day-badge span { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; }
  `

  if (!mounted) return null

  return (
    <>
      <style jsx global>{styles}</style>
      <div className="proof-page min-h-screen flex flex-col" style={{ background: 'var(--paper)' }}>
        {/* Header */}
        <header className="px-6 py-4" style={{ borderBottom: '0.5px solid var(--faint)' }}>
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <Link
              href={`/c/${id}`}
              className="flex items-center gap-2 text-[11px] tracking-[0.1em] transition-opacity hover:opacity-60"
              style={{ color: 'var(--ink)', opacity: 0.4 }}
            >
              &larr; BACK
            </Link>
            <span className="text-[10px] font-medium tracking-[0.2em]" style={{ color: 'var(--ink)', opacity: 0.3 }}>
              RELIABLE
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
                LOADING...
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
                Cannot Submit Proof
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

        {/* Ready State - Upload Form */}
        {(state === 'ready' || state === 'uploading') && challenge && (
          <main className="flex-1 px-6 py-10 relative z-10">
            <div className="max-w-lg mx-auto animate-fade-up">
              {/* Day Indicator */}
              <div className="text-center mb-8">
                <div className="day-badge mx-auto mb-4">
                  <span>{currentDay}</span>
                </div>
                <p className="text-[9px] font-medium tracking-[0.2em]" style={{ color: 'var(--ink)', opacity: 0.4 }}>
                  DAY {currentDay} OF {challenge.duration_days}
                </p>
              </div>

              {/* Challenge Title */}
              <h1 className="font-serif text-[28px] leading-[1.2] tracking-[-0.02em] text-center mb-4" style={{ color: 'var(--ink)' }}>
                {challenge.title}
              </h1>

              {/* Proof Requirement */}
              <p className="text-[14px] text-center mb-10" style={{ color: 'var(--ink)', opacity: 0.5 }}>
                {challenge.proof_description || challenge.description}
              </p>

              {/* Upload Zone for Image/Screenshot */}
              {(challenge.proof_type === 'image' || challenge.proof_type === 'screenshot') && (
                <div className="mb-8">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`upload-zone ${selectedFile ? 'has-file' : ''}`}
                  >
                    {previewUrl ? (
                      <div>
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-48 mx-auto mb-4 object-contain"
                        />
                        <p className="text-[12px]" style={{ color: 'var(--ink)', opacity: 0.5 }}>
                          {selectedFile?.name}
                        </p>
                        <p className="text-[11px] mt-2" style={{ color: 'var(--green)' }}>
                          Click to change
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center" style={{ border: '1px solid var(--faint)' }}>
                          <span style={{ color: 'var(--green)', fontSize: '20px' }}>&#x2191;</span>
                        </div>
                        <p className="text-[14px] mb-2" style={{ color: 'var(--ink)' }}>
                          Upload your proof
                        </p>
                        <p className="text-[12px]" style={{ color: 'var(--ink)', opacity: 0.4 }}>
                          Click or drag an image here
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* URL Input */}
              {challenge.proof_type === 'url' && (
                <div className="mb-8">
                  <label className="text-[10px] font-medium tracking-[0.15em] mb-2 block" style={{ color: 'var(--ink)', opacity: 0.4 }}>
                    PROOF URL
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-3 text-[15px] outline-none"
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--faint)',
                      color: 'var(--ink)',
                    }}
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!isValid || state === 'uploading'}
                className="w-full py-4 text-[12px] font-medium tracking-[0.15em] transition-opacity disabled:opacity-30"
                style={{ background: 'var(--green)', color: '#fff' }}
              >
                {state === 'uploading' ? 'SUBMITTING...' : 'SUBMIT PROOF'}
              </button>

              <p className="text-[11px] text-center mt-4" style={{ color: 'var(--ink)', opacity: 0.3 }}>
                Your proof will be reviewed by the challenge creator
              </p>
            </div>
          </main>
        )}

        {/* Submitted State */}
        {state === 'submitted' && (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center max-w-md animate-fade-up">
              <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center" style={{ border: '2px solid var(--green)' }}>
                <span style={{ color: 'var(--green)', fontSize: '28px' }}>&#x2713;</span>
              </div>

              <p className="text-[9px] font-medium tracking-[0.2em] mb-4" style={{ color: 'var(--green)' }}>
                DAY {currentDay} COMPLETE
              </p>

              <h1 className="font-serif text-[32px] leading-[1.1] tracking-[-0.02em] mb-4" style={{ color: 'var(--ink)' }}>
                Proof Submitted
              </h1>

              <p className="text-[14px] mb-8" style={{ color: 'var(--ink)', opacity: 0.5 }}>
                Your proof is pending review. Keep going!
              </p>

              <Link
                href={`/c/${id}`}
                className="inline-block py-3 px-8 text-[11px] tracking-[0.15em]"
                style={{ background: 'var(--green)', color: '#fff' }}
              >
                BACK TO CHALLENGE
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
