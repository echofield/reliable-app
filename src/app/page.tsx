'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Preset challenge configurations
const PRESETS = {
  'no-alcohol-30': {
    id: 'no-alcohol-30',
    title: '30 Days No Alcohol',
    shortTitle: '30 DAYS\nNO ALCOHOL',
    description: 'Post a daily photo proving you stayed sober.',
    duration: 30,
    proofType: 'image',
    proofDescription: 'Daily selfie or photo of your day',
    glyph: '\u25CB',
    defaultFee: 50,
  },
  'run-50km-14': {
    id: 'run-50km-14',
    title: 'Run 50km in 14 Days',
    shortTitle: 'RUN 50KM\nIN 14 DAYS',
    description: 'Track your runs. Hit 50km total.',
    duration: 14,
    proofType: 'screenshot',
    proofDescription: 'Screenshot from Strava/Nike Run Club',
    glyph: '\u25B3',
    defaultFee: 50,
  },
  'wake-7am-21': {
    id: 'wake-7am-21',
    title: 'Wake Up Before 7AM',
    shortTitle: 'WAKE UP\nBEFORE 7AM',
    description: '21 days of early mornings.',
    duration: 21,
    proofType: 'screenshot',
    proofDescription: 'Screenshot of phone time before 7AM',
    glyph: '\u25A1',
    defaultFee: 25,
  },
  'no-sugar-21': {
    id: 'no-sugar-21',
    title: 'No Sugar for 21 Days',
    shortTitle: 'NO SUGAR\n21 DAYS',
    description: 'Cut out added sugar completely.',
    duration: 21,
    proofType: 'image',
    proofDescription: 'Daily food photo or receipt',
    glyph: '\u25C7',
    defaultFee: 50,
  },
}

type PresetKey = keyof typeof PRESETS

// Mock stats for social proof (will come from API)
const PLATFORM_STATS = {
  totalPoolAllTime: 142500,
  lastWinAmount: 8200,
  lastChallengeCompleted: 27,
  lastChallengeFailed: 103,
}

type PageState = 'select' | 'configure' | 'creating' | 'success'

export default function ReliableLauncherPage() {
  const [mounted, setMounted] = useState(false)
  const [state, setState] = useState<PageState>('select')
  const [selectedPreset, setSelectedPreset] = useState<PresetKey | null>(null)
  const [entryFee, setEntryFee] = useState(50)
  const [creatorFee, setCreatorFee] = useState(5)
  const [error, setError] = useState('')
  const [challengeUrl, setChallengeUrl] = useState('')

  useEffect(() => { setMounted(true) }, [])

  const selectPreset = (key: PresetKey) => {
    setSelectedPreset(key)
    setEntryFee(PRESETS[key].defaultFee)
    setState('configure')
  }

  const handleCreate = async () => {
    if (!selectedPreset) return
    setState('creating')
    setError('')

    try {
      // TODO: Call API to create challenge
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock slug generation
      const slug = `${selectedPreset}-${Date.now().toString(36)}`
      setChallengeUrl(`${window.location.origin}/c/${slug}`)
      setState('success')
    } catch {
      setError('Failed to create challenge. Please try again.')
      setState('configure')
    }
  }

  const reset = () => {
    setState('select')
    setSelectedPreset(null)
    setChallengeUrl('')
    setError('')
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap');
    .reliable-page { --paper: #FAF8F2; --ink: #1A1A1A; --green: #1B4332; --warmgrey: #C9C5BC; --faint: #E8E5DE; font-family: 'Inter', system-ui, sans-serif; }
    .reliable-page::before { content: ""; position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.025; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
    .font-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    .animate-fade-up { animation: fadeUp 0.5s ease-out forwards; }
    .animate-pulse-slow { animation: pulse 2s ease-in-out infinite; }
    .preset-card { position: relative; transition: all 0.2s ease; cursor: pointer; }
    .preset-card::before { content: ""; position: absolute; top: -4px; left: -4px; right: 4px; bottom: 4px; border: 1px solid var(--green); opacity: 0; transition: opacity 0.2s ease; }
    .preset-card:hover::before { opacity: 1; }
    .preset-card:hover { transform: translate(-2px, -2px); }
    .glyph { font-size: 28px; line-height: 1; opacity: 0.2; transition: opacity 0.2s ease; }
    .preset-card:hover .glyph { opacity: 0.5; }
    .preset-title { white-space: pre-line; }
    .big-number { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 48px; font-weight: 300; letter-spacing: -0.02em; }
    .cta-box { background: var(--green); color: #fff; padding: 24px; text-align: center; }
    .cta-text { font-size: 14px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; }
    .input-range { -webkit-appearance: none; width: 100%; height: 2px; background: var(--faint); outline: none; }
    .input-range::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; background: var(--green); cursor: pointer; }
    .input-range::-moz-range-thumb { width: 16px; height: 16px; background: var(--green); cursor: pointer; border: none; }
  `

  return (
    <>
      <style jsx global>{styles}</style>
      <div className="reliable-page min-h-screen flex flex-col" style={{ background: 'var(--paper)' }}>
        {/* Header */}
        <header style={{ borderBottom: '0.5px solid var(--faint)' }}>
          <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
            <button onClick={reset} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <span className="text-[16px]" style={{ color: 'var(--green)' }}>&#x25A0;</span>
              <span className="text-[10px] font-medium tracking-[0.25em]" style={{ color: 'var(--ink)' }}>RELIABLE</span>
            </button>
            <Link href="/how-it-works" className="text-[10px] font-medium tracking-[0.15em] transition-opacity hover:opacity-70" style={{ color: 'var(--warmgrey)' }}>
              HOW IT WORKS
            </Link>
          </div>
        </header>

        <main className="flex-1 px-6 py-12 relative z-10">
          <div className="max-w-3xl mx-auto">

            {/* SELECT STATE - Preset Launcher */}
            {mounted && state === 'select' && (
              <div className="animate-fade-up">
                {/* Hero Copy */}
                <div className="text-center mb-12">
                  <h1 className="font-serif text-[36px] md:text-[42px] leading-[1.15] tracking-[-0.02em] mb-6" style={{ color: 'var(--ink)' }}>
                    Host a challenge.<br />
                    Your audience commits real money.<br />
                    <span style={{ color: 'var(--green)' }}>Quitters fund the winners.</span>
                  </h1>
                  <p className="text-[14px] max-w-md mx-auto" style={{ color: 'var(--ink)', opacity: 0.5 }}>
                    Pick a preset. Set your entry fee. Get a shareable link. It takes 60 seconds.
                  </p>
                </div>

                {/* Preset Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {(Object.keys(PRESETS) as PresetKey[]).map((key) => {
                    const preset = PRESETS[key]
                    return (
                      <button
                        key={key}
                        onClick={() => selectPreset(key)}
                        className="preset-card text-left p-6"
                        style={{ background: 'var(--paper)', border: '1px solid var(--faint)' }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <span className="glyph" style={{ color: 'var(--green)' }}>{preset.glyph}</span>
                          <span className="text-[10px] font-medium tracking-[0.1em]" style={{ color: 'var(--green)', opacity: 0.6 }}>
                            {preset.duration} DAYS
                          </span>
                        </div>
                        <h3 className="preset-title font-serif text-[20px] leading-[1.2] mb-2" style={{ color: 'var(--ink)' }}>
                          {preset.shortTitle}
                        </h3>
                        <p className="text-[12px]" style={{ color: 'var(--ink)', opacity: 0.4 }}>
                          {preset.description}
                        </p>
                      </button>
                    )
                  })}
                </div>

                {/* Custom Challenge Link */}
                <div className="text-center mb-12">
                  <Link href="/create-custom" className="text-[12px] tracking-[0.05em] transition-opacity hover:opacity-60" style={{ color: 'var(--ink)', opacity: 0.4, textDecoration: 'underline', textUnderlineOffset: '4px' }}>
                    Or create a custom challenge
                  </Link>
                </div>

                {/* Social Proof Stats */}
                <div className="p-6" style={{ background: 'var(--faint)', opacity: 0.7 }}>
                  <p className="text-[9px] font-medium tracking-[0.2em] text-center mb-4" style={{ color: 'var(--ink)', opacity: 0.4 }}>
                    PROOF OF WINS
                  </p>
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <p className="font-serif text-[24px]" style={{ color: 'var(--green)' }}>
                        {formatMoney(PLATFORM_STATS.lastWinAmount)}
                      </p>
                      <p className="text-[10px] tracking-[0.1em]" style={{ color: 'var(--ink)', opacity: 0.4 }}>
                        last pool won
                      </p>
                    </div>
                    <div style={{ width: '1px', height: '40px', background: 'var(--warmgrey)' }} />
                    <div className="text-center">
                      <p className="font-serif text-[24px]" style={{ color: 'var(--ink)' }}>
                        {PLATFORM_STATS.lastChallengeCompleted} / {PLATFORM_STATS.lastChallengeCompleted + PLATFORM_STATS.lastChallengeFailed}
                      </p>
                      <p className="text-[10px] tracking-[0.1em]" style={{ color: 'var(--ink)', opacity: 0.4 }}>
                        finished last challenge
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONFIGURE STATE - Set Fee & Create */}
            {mounted && state === 'configure' && selectedPreset && (
              <div className="animate-fade-up max-w-lg mx-auto">
                <button
                  onClick={() => setState('select')}
                  className="flex items-center gap-2 mb-8 text-[11px] tracking-[0.1em] transition-opacity hover:opacity-60"
                  style={{ color: 'var(--ink)', opacity: 0.4 }}
                >
                  &larr; BACK
                </button>

                {/* Selected Preset Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[24px]" style={{ color: 'var(--green)', opacity: 0.3 }}>
                      {PRESETS[selectedPreset].glyph}
                    </span>
                    <span className="text-[9px] font-medium tracking-[0.2em]" style={{ color: 'var(--green)' }}>
                      {PRESETS[selectedPreset].duration} DAY CHALLENGE
                    </span>
                  </div>
                  <h2 className="font-serif text-[32px] leading-[1.1] tracking-[-0.02em] mb-2" style={{ color: 'var(--ink)' }}>
                    {PRESETS[selectedPreset].title}
                  </h2>
                  <p className="text-[14px]" style={{ color: 'var(--ink)', opacity: 0.5 }}>
                    {PRESETS[selectedPreset].description}
                  </p>
                </div>

                {/* Fee Configuration */}
                <div className="space-y-8 mb-8">
                  {/* Entry Fee */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[10px] font-medium tracking-[0.15em]" style={{ color: 'var(--ink)', opacity: 0.5 }}>
                        ENTRY FEE
                      </label>
                      <span className="font-serif text-[28px]" style={{ color: 'var(--green)' }}>
                        {formatMoney(entryFee)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="500"
                      step="10"
                      value={entryFee}
                      onChange={(e) => setEntryFee(Number(e.target.value))}
                      className="input-range"
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-[10px]" style={{ color: 'var(--ink)', opacity: 0.3 }}>€10</span>
                      <span className="text-[10px]" style={{ color: 'var(--ink)', opacity: 0.3 }}>€500</span>
                    </div>
                  </div>

                  {/* Creator Fee */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[10px] font-medium tracking-[0.15em]" style={{ color: 'var(--ink)', opacity: 0.5 }}>
                        YOUR CUT
                      </label>
                      <span className="font-serif text-[28px]" style={{ color: 'var(--ink)' }}>
                        {creatorFee}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={creatorFee}
                      onChange={(e) => setCreatorFee(Number(e.target.value))}
                      className="input-range"
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-[10px]" style={{ color: 'var(--ink)', opacity: 0.3 }}>0%</span>
                      <span className="text-[10px]" style={{ color: 'var(--ink)', opacity: 0.3 }}>10%</span>
                    </div>
                  </div>
                </div>

                {/* Pool Preview */}
                <div className="p-6 mb-8" style={{ border: '1px solid var(--faint)' }}>
                  <p className="text-[9px] font-medium tracking-[0.2em] mb-4" style={{ color: 'var(--ink)', opacity: 0.4 }}>
                    IF 100 PEOPLE JOIN
                  </p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="big-number" style={{ color: 'var(--green)' }}>
                      {formatMoney(entryFee * 100)}
                    </span>
                    <span className="text-[14px]" style={{ color: 'var(--ink)', opacity: 0.4 }}>
                      pool
                    </span>
                  </div>
                  <p className="text-[12px]" style={{ color: 'var(--ink)', opacity: 0.4 }}>
                    You earn {formatMoney(entryFee * 100 * (creatorFee / 100))} &middot; Platform takes 15% &middot; Winners split the rest
                  </p>
                </div>

                {/* CTA Box */}
                <div className="cta-box mb-4">
                  <p className="cta-text mb-2">
                    PUT {formatMoney(entryFee)} ON YOURSELF.
                  </p>
                  <p className="text-[24px] font-serif tracking-[-0.01em]">
                    FINISH OR LOSE IT.
                  </p>
                </div>

                {error && (
                  <p className="text-[12px] text-center mb-4" style={{ color: '#c53030' }}>{error}</p>
                )}

                {/* Create Button */}
                <button
                  onClick={handleCreate}
                  className="w-full py-4 text-[12px] font-medium tracking-[0.15em] hover:opacity-90 transition-opacity"
                  style={{ background: 'var(--green)', color: '#fff' }}
                >
                  CREATE CHALLENGE
                </button>

                <p className="text-[11px] text-center mt-4" style={{ color: 'var(--ink)', opacity: 0.3 }}>
                  You&apos;ll need to connect Stripe to receive payouts
                </p>
              </div>
            )}

            {/* CREATING STATE */}
            {mounted && state === 'creating' && (
              <div className="animate-fade-up text-center py-20">
                <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center animate-pulse-slow" style={{ border: '1px solid var(--faint)' }}>
                  <span style={{ color: 'var(--green)', fontSize: '20px' }}>&#x25A0;</span>
                </div>
                <p className="text-[11px] tracking-[0.2em]" style={{ color: 'var(--ink)', opacity: 0.4 }}>
                  CREATING YOUR CHALLENGE...
                </p>
              </div>
            )}

            {/* SUCCESS STATE */}
            {mounted && state === 'success' && (
              <div className="animate-fade-up max-w-lg mx-auto text-center">
                <div className="w-16 h-16 mx-auto mb-8 flex items-center justify-center" style={{ border: '2px solid var(--green)' }}>
                  <span style={{ color: 'var(--green)', fontSize: '28px' }}>&#x2713;</span>
                </div>

                <p className="text-[9px] font-medium tracking-[0.2em] mb-4" style={{ color: 'var(--green)' }}>
                  CHALLENGE CREATED
                </p>

                <h2 className="font-serif text-[32px] leading-[1.1] tracking-[-0.02em] mb-8" style={{ color: 'var(--ink)' }}>
                  Your challenge room is live
                </h2>

                {/* Share URL */}
                <div className="mb-8">
                  <label className="text-[10px] font-medium tracking-[0.15em] mb-3 block" style={{ color: 'var(--ink)', opacity: 0.4 }}>
                    SHARE THIS LINK
                  </label>
                  <div className="p-4 flex items-center gap-4" style={{ background: 'var(--faint)' }}>
                    <span className="text-[13px] truncate flex-1 text-left" style={{ color: 'var(--ink)', fontFamily: 'monospace' }}>
                      {challengeUrl}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(challengeUrl)}
                      className="text-[10px] tracking-[0.1em] px-4 py-2 hover:opacity-70"
                      style={{ background: 'var(--green)', color: '#fff' }}
                    >
                      COPY
                    </button>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="p-6 text-left mb-8" style={{ border: '1px solid var(--faint)' }}>
                  <p className="text-[9px] font-medium tracking-[0.2em] mb-4" style={{ color: 'var(--ink)', opacity: 0.4 }}>
                    NEXT STEPS
                  </p>
                  <ol className="space-y-3 text-[13px]" style={{ color: 'var(--ink)', opacity: 0.6 }}>
                    <li className="flex items-start gap-3">
                      <span className="font-serif text-[16px]" style={{ opacity: 0.3 }}>1</span>
                      <span>Share the link with your audience</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-serif text-[16px]" style={{ opacity: 0.3 }}>2</span>
                      <span>They join by paying the entry fee</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-serif text-[16px]" style={{ opacity: 0.3 }}>3</span>
                      <span>Validate their daily proofs</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="font-serif text-[16px]" style={{ opacity: 0.3 }}>4</span>
                      <span>Quitters fund the winners. You get your cut.</span>
                    </li>
                  </ol>
                </div>

                <div className="flex gap-4">
                  <Link
                    href={challengeUrl}
                    className="flex-1 py-3 text-[11px] tracking-[0.15em] text-center hover:opacity-90"
                    style={{ background: 'var(--green)', color: '#fff' }}
                  >
                    VIEW CHALLENGE
                  </Link>
                  <button
                    onClick={reset}
                    className="flex-1 py-3 text-[11px] tracking-[0.15em] hover:opacity-70"
                    style={{ background: 'transparent', color: 'var(--ink)', border: '1px solid var(--faint)' }}
                  >
                    CREATE ANOTHER
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>

        {/* Footer */}
        <footer style={{ borderTop: '0.5px solid var(--faint)' }}>
          <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
            <span className="text-[9px] tracking-[0.2em]" style={{ color: 'var(--ink)', opacity: 0.2 }}>
              RELIABLE
            </span>
            <div className="flex items-center gap-4">
              <Link href="/legal" className="text-[9px] tracking-[0.1em] hover:opacity-60" style={{ color: 'var(--ink)', opacity: 0.25 }}>
                Legal
              </Link>
              <span style={{ color: 'var(--faint)' }}>&middot;</span>
              <Link href="/privacy" className="text-[9px] tracking-[0.1em] hover:opacity-60" style={{ color: 'var(--ink)', opacity: 0.25 }}>
                Privacy
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
