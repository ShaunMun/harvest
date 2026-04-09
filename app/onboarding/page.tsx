'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const SLIDE_IMAGES = [
  '/images/young-farmer-woman-holding-wooden-box-with-fresh-v-2026-03-25-09-47-28-utc.jpg',
  '/images/african-farmers-carrying-vegetables-and-a-hoe-2026-03-18-06-42-11-utc.jpg',
  '/images/diverse-group-people-and-gardener-working-in-commu-2026-01-07-06-58-49-utc.jpg',
]

const SUBURBS = [
  'Fourways', 'Randburg',
]

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface FormState {
  name: string
  email: string
  whatsapp: string
  suburb: string
  password: string
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function ProgressDots({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
      {([1, 2, 3] as const).map(i => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: i <= current ? '#B8B68F' : 'transparent',
            border: `2px solid ${i <= current ? '#B8B68F' : 'rgba(184,182,143,0.4)'}`,
            transition: 'all 350ms ease',
          }}
        />
      ))}
    </div>
  )
}

function ProgressDotsHero({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
      {([1, 2, 3] as const).map(i => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: i === current ? '#fff' : 'transparent',
            border: '2px solid rgba(255,255,255,0.65)',
            transition: 'all 350ms ease',
          }}
        />
      ))}
    </div>
  )
}

const SOCIAL_PROOFS = [
  'Thandi from Fourways listed 3kg of tomatoes this morning.',
  'Sipho from Lonehill is looking to swap chillies for herbs.',
  'Anke from Broadacres just joined — sharp timing.',
]

function SocialProofCycler() {
  const [index, setIndex] = useState(0)
  const [proofVisible, setProofVisible] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setProofVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % SOCIAL_PROOFS.length)
        setProofVisible(true)
      }, 400)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ marginTop: 20, minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <p
        style={{
          fontSize: 12,
          color: '#9B9480',
          textAlign: 'center',
          fontFamily: 'var(--font-inter)',
          fontStyle: 'italic',
          opacity: proofVisible ? 1 : 0,
          transition: 'opacity 400ms ease',
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        {SOCIAL_PROOFS[index]}
      </p>
    </div>
  )
}

// ─── FLOATING INPUT ───────────────────────────────────────────────────────────

function FloatingInput({
  label,
  type = 'text',
  value,
  onChange,
  autoComplete,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
}) {
  const [focused, setFocused] = useState(false)
  const lifted = focused || value.length > 0

  return (
    <div style={{ position: 'relative', height: 56 }}>
      <label
        style={{
          position: 'absolute',
          left: 16,
          top: lifted ? 9 : '50%',
          transform: lifted ? 'none' : 'translateY(-50%)',
          fontSize: lifted ? 10 : 15,
          color: lifted ? (focused ? '#B8B68F' : '#6B6454') : '#B4B2A9',
          letterSpacing: lifted ? '0.1em' : 'normal',
          textTransform: lifted ? 'uppercase' : 'none',
          fontWeight: lifted ? 600 : 400,
          fontFamily: 'var(--font-inter)',
          pointerEvents: 'none',
          transition: 'all 180ms ease',
          zIndex: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        style={{
          width: '100%',
          height: 56,
          borderRadius: 12,
          backgroundColor: '#fff',
          border: 'none',
          outline: 'none',
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: lifted ? 18 : 0,
          fontSize: 15,
          color: '#2C2A1E',
          fontFamily: 'var(--font-inter)',
          boxSizing: 'border-box',
          boxShadow: focused
            ? 'inset 3px 0 0 #B8B68F, 0 2px 10px rgba(0,0,0,0.10)'
            : '0 1px 3px rgba(0,0,0,0.08)',
          transition: 'box-shadow 180ms ease, padding-top 180ms ease',
        }}
      />
    </div>
  )
}

// ─── FLOATING SELECT ──────────────────────────────────────────────────────────

function FloatingSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ position: 'relative', height: 56 }}>
      <label
        style={{
          position: 'absolute',
          left: 16,
          top: 9,
          fontSize: 10,
          color: focused ? '#B8B68F' : '#6B6454',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontWeight: 600,
          fontFamily: 'var(--font-inter)',
          pointerEvents: 'none',
          zIndex: 1,
          transition: 'color 180ms ease',
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          height: 56,
          borderRadius: 12,
          backgroundColor: '#fff',
          border: 'none',
          outline: 'none',
          paddingLeft: 16,
          paddingRight: 40,
          paddingTop: 18,
          fontSize: 15,
          color: '#2C2A1E',
          fontFamily: 'var(--font-inter)',
          boxSizing: 'border-box',
          boxShadow: focused
            ? 'inset 3px 0 0 #B8B68F, 0 2px 10px rgba(0,0,0,0.10)'
            : '0 1px 3px rgba(0,0,0,0.08)',
          appearance: 'none',
          cursor: 'pointer',
          transition: 'box-shadow 180ms ease',
        }}
      >
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <div
        style={{
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: '#6B6454',
          fontSize: 12,
        }}
      >
        ▾
      </div>
    </div>
  )
}

function DevSkip({ onSkip }: { onSkip: () => void }) {
  return (
    <button
      onClick={onSkip}
      style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        padding: '5px 12px',
        borderRadius: 20,
        border: '1px solid #6B6454',
        background: 'transparent',
        color: '#6B6454',
        fontSize: 11,
        cursor: 'pointer',
        opacity: 0.4,
        zIndex: 9999,
        fontFamily: 'var(--font-inter)',
        letterSpacing: '0.04em',
      }}
    >
      Skip to feed
    </button>
  )
}

// ─── INPUT STYLES ─────────────────────────────────────────────────────────────

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 12,
  backgroundColor: '#DBD3C6',
  border: '2px solid transparent',
  fontSize: 15,
  color: '#2C2A1E',
  fontFamily: 'var(--font-inter)',
  outline: 'none',
  boxSizing: 'border-box',
  display: 'block',
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()

  // Step state: 1=welcome, 2=signup, 3=how-it-works, 4=micro-delight
  const [displayedStep, setDisplayedStep] = useState<1 | 2 | 3 | 4>(1)
  const [isVisible, setIsVisible] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError]   = useState<string | null>(null)

  const [slideIndex, setSlideIndex] = useState(0)

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    whatsapp: '',
    suburb: 'Fourways',
    password: '',
  })

  // ── Preload slideshow images ─────────────────────────────────────────────────
  useEffect(() => {
    SLIDE_IMAGES.forEach(src => {
      const img = new window.Image()
      img.src = src
    })
  }, [])

  // ── Slideshow interval ───────────────────────────────────────────────────────
  useEffect(() => {
    if (displayedStep !== 1) return
    const id = setInterval(() => {
      setSlideIndex(i => (i + 1) % SLIDE_IMAGES.length)
    }, 5000)
    return () => clearInterval(id)
  }, [displayedStep])

  // ── Step transition helper ────────────────────────────────────────────────────
  const goToStep = useCallback((next: 1 | 2 | 3 | 4, afterShow?: () => void) => {
    setIsVisible(false)
    setTimeout(() => {
      setDisplayedStep(next)
      setIsVisible(true)
      if (afterShow) afterShow()
    }, 400)
  }, [])

  // ── Action handlers ──────────────────────────────────────────────────────────
  const handleJoin = () => goToStep(2)

  const handleSignUp = async () => {
    setAuthError(null)
    setAuthLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { name: form.name, suburb: form.suburb, phone: form.whatsapp },
        },
      })
      if (error) throw error
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          name: form.name,
          suburb: form.suburb,
        })
      }
      goToStep(3)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong — try again.'
      setAuthError(msg)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleGoToFeed = () => {
    goToStep(4, () => {
      setTimeout(() => router.push('/feed'), 1500)
    })
  }
  const skipToFeed = () => router.push('/feed')

  const firstName = form.name.trim().split(/\s+/)[0] || 'friend'

  // ── Shared transition wrapper style ─────────────────────────────────────────
  const fadeStyle: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(14px)',
    transition: 'opacity 400ms ease, transform 400ms ease',
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 4 — Micro-delight
  // ─────────────────────────────────────────────────────────────────────────────
  if (displayedStep === 4) {
    return (
      <div
        style={{
          ...fadeStyle,
          minHeight: '100vh',
          backgroundColor: '#B8B68F',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            color: '#fff',
            fontSize: 'clamp(22px, 5vw, 28px)',
            fontWeight: 700,
            marginBottom: 14,
            fontFamily: 'var(--font-lora)',
            lineHeight: 1.3,
          }}
        >
          Welcome to the harvest, {firstName}.
        </h2>
        <p
          style={{
            color: 'rgba(255,255,255,0.82)',
            fontSize: 16,
            fontFamily: 'var(--font-inter)',
            fontWeight: 300,
          }}
        >
          Your community is waiting.
        </p>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 1 — Welcome / Hero
  // ─────────────────────────────────────────────────────────────────────────────
  if (displayedStep === 1) {
    return (
      <div
        style={{
          ...fadeStyle,
          position: 'relative',
          minHeight: '100dvh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a14',
        }}
      >
        {/* Slideshow images */}
        {SLIDE_IMAGES.map((src, i) => (
          <div
            key={src}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: i === slideIndex ? 1 : 0,
              transition: 'opacity 1800ms ease',
              zIndex: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            />
          </div>
        ))}

        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.52)', zIndex: 1 }} />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 480,
            padding: '56px 28px 40px',
            textAlign: 'center',
          }}
        >
          {/* Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/harvestlogo.png"
            alt="Harvest"
            style={{
              width: 140,
              filter: 'brightness(0) invert(1)',
              marginBottom: 44,
            }}
          />

          {/* Progress dots (white version) */}
          <div style={{ marginBottom: 36 }}>
            <ProgressDotsHero current={1} />
          </div>

          {/* Location label */}
          <p
            style={{
              color: '#DECCA6',
              fontSize: 11,
              letterSpacing: '0.16em',
              fontWeight: 600,
              marginBottom: 18,
              fontFamily: 'var(--font-inter)',
              textTransform: 'uppercase',
            }}
          >
            Fourways · Johannesburg
          </p>

          {/* Headline */}
          <h1
            style={{
              color: '#fff',
              fontSize: 'clamp(38px, 9vw, 52px)',
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: 20,
              fontFamily: 'var(--font-lora)',
            }}
          >
            Where food finds family.
          </h1>

          {/* Subline */}
          <p
            style={{
              color: 'rgba(255,255,255,0.82)',
              fontSize: 16,
              fontWeight: 300,
              lineHeight: 1.8,
              marginBottom: 48,
              fontFamily: 'var(--font-inter)',
              maxWidth: 360,
            }}
          >
            Your neighbours are growing something good. Come and find it.
          </p>

          {/* Buttons */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              width: '100%',
              maxWidth: 320,
            }}
          >
            <button
              onClick={handleJoin}
              style={{
                padding: '16px 24px',
                borderRadius: 50,
                backgroundColor: '#B8B68F',
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-inter)',
                width: '100%',
                letterSpacing: '0.01em',
              }}
            >
              Join the community — it&apos;s free
            </button>
            <button
              onClick={handleJoin}
              style={{
                padding: '15px 24px',
                borderRadius: 50,
                backgroundColor: 'transparent',
                color: '#fff',
                fontSize: 15,
                fontWeight: 400,
                border: '2px solid rgba(255,255,255,0.6)',
                cursor: 'pointer',
                fontFamily: 'var(--font-inter)',
                width: '100%',
              }}
            >
              I already have an account
            </button>
          </div>

          {/* Tagline */}
          <p
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 12,
              marginTop: 52,
              fontFamily: 'var(--font-inter)',
              fontWeight: 300,
              letterSpacing: '0.02em',
            }}
          >
            Grown with hands. Shared with heart.
          </p>
        </div>

        <DevSkip onSkip={skipToFeed} />
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 2 — Sign up (Apple-quality: clean, generous, left-aligned)
  // ─────────────────────────────────────────────────────────────────────────────
  if (displayedStep === 2) {
    return (
      <div
        style={{
          ...fadeStyle,
          minHeight: '100dvh',
          backgroundColor: '#EBE6D2',
          position: 'relative',
        }}
      >
        {/* ── 8px sage accent bar ── */}
        <div style={{ width: '100%', height: 8, backgroundColor: '#B8B68F' }} />

        {/* ── Nav row: back + progress dots ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 32px 0',
            maxWidth: 480,
            margin: '0 auto',
          }}
        >
          <button
            onClick={() => goToStep(1)}
            aria-label="Back"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6B6454',
              fontSize: 20,
              padding: '4px 0',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'var(--font-inter)',
            }}
          >
            ←
          </button>
          <ProgressDots current={2} />
          <div style={{ width: 28 }} />
        </div>

        {/* ── Content ── */}
        <div
          style={{
            maxWidth: 480,
            margin: '0 auto',
            padding: '40px 32px 160px',
          }}
        >
          {/* Step label */}
          <p
            style={{
              fontSize: 11,
              letterSpacing: '0.14em',
              fontWeight: 600,
              color: '#B8B68F',
              fontFamily: 'var(--font-inter)',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Step 2 of 3
          </p>

          {/* Headline */}
          <h2
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: '#2C2A1E',
              fontFamily: 'var(--font-lora)',
              lineHeight: 1.2,
              marginBottom: 10,
            }}
          >
            Let&apos;s get you growing.
          </h2>

          {/* Subline */}
          <p
            style={{
              fontSize: 15,
              color: '#6B6454',
              fontFamily: 'var(--font-inter)',
              lineHeight: 1.65,
              marginBottom: 40,
            }}
          >
            Your neighbours are waiting — this takes less than a minute.
          </p>

          {/* ── Fields ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FloatingInput
              label="Full name"
              value={form.name}
              onChange={v => setForm(f => ({ ...f, name: v }))}
              autoComplete="name"
            />
            <FloatingInput
              label="Email"
              type="email"
              value={form.email}
              onChange={v => setForm(f => ({ ...f, email: v }))}
              autoComplete="email"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <FloatingInput
                label="WhatsApp number"
                type="tel"
                value={form.whatsapp}
                onChange={v => setForm(f => ({ ...f, whatsapp: v }))}
                autoComplete="tel"
              />
              <p
                style={{
                  fontSize: 12,
                  color: '#6B6454',
                  fontStyle: 'italic',
                  fontFamily: 'var(--font-inter)',
                  paddingLeft: 4,
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                We&apos;ll only use this to verify you&apos;re real. No spam, sharp.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <FloatingSelect
                label="Suburb"
                value={form.suburb}
                onChange={v => setForm(f => ({ ...f, suburb: v }))}
                options={SUBURBS}
              />
              <p
                style={{
                  fontSize: 12,
                  color: '#6B6454',
                  fontStyle: 'italic',
                  fontFamily: 'var(--font-inter)',
                  paddingLeft: 4,
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                You can always change your suburb later.
              </p>
            </div>
            <FloatingInput
              label="Password"
              type="password"
              value={form.password}
              onChange={v => setForm(f => ({ ...f, password: v }))}
              autoComplete="new-password"
            />
          </div>

          {/* ── Button ── */}
          <div style={{ marginTop: 32 }}>
            <button
              onClick={handleSignUp}
              disabled={authLoading}
              style={{
                width: '100%',
                height: 56,
                borderRadius: 16,
                backgroundColor: authLoading ? '#D4CFAA' : '#B8B68F',
                color: '#fff',
                fontSize: 16,
                fontWeight: 500,
                border: 'none',
                cursor: authLoading ? 'default' : 'pointer',
                fontFamily: 'var(--font-inter)',
                letterSpacing: '0.01em',
                transition: 'background-color 200ms ease',
              }}
            >
              {authLoading ? 'Joining the community...' : 'Welcome me to the community'}
            </button>
            {authError && (
              <p style={{ fontSize: 13, color: '#E24B4A', textAlign: 'center', marginTop: 10, fontFamily: 'var(--font-inter)', lineHeight: 1.5 }}>
                {authError}
              </p>
            )}
            <p
              style={{
                fontSize: 12,
                color: '#6B6454',
                textAlign: 'center',
                marginTop: 14,
                fontFamily: 'var(--font-inter)',
                lineHeight: 1.5,
              }}
            >
              By joining you agree to be a good neighbour.
            </p>
          </div>
        </div>

        {/* ── Bottom image peek — cinematic tease ── */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 120,
            zIndex: 5,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/diverse-group-people-and-gardener-working-in-commu-2026-01-07-06-58-49-utc.jpg"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
          />
          {/* Gradient: cream at top fades to transparent at bottom — image peeks up */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, #EBE6D2 0%, rgba(235,230,210,0.5) 45%, transparent 100%)',
            }}
          />
        </div>

        <DevSkip onSkip={skipToFeed} />
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 3 — Warm arrival (Apple-quality: cinematic image, generous space)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        ...fadeStyle,
        minHeight: '100dvh',
        backgroundColor: '#EBE6D2',
        paddingBottom: 80,
      }}
    >
      {/* ── Hero image — 50vh, full-bleed, rounded bottom corners ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '50vh',
          minHeight: 280,
          maxHeight: 460,
          borderRadius: '0 0 32px 32px',
          overflow: 'hidden',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/diverse-group-people-and-gardener-working-in-commu-2026-01-07-06-58-49-utc.jpg"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
        />

        {/* Back + dots — minimal, frosted, top of image */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 0',
            zIndex: 2,
          }}
        >
          <button
            onClick={() => goToStep(2)}
            aria-label="Back"
            style={{
              background: 'rgba(0,0,0,0.28)',
              border: 'none',
              borderRadius: 20,
              cursor: 'pointer',
              color: '#fff',
              fontSize: 17,
              padding: '7px 12px',
              lineHeight: 1,
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          >
            ←
          </button>
          <div
            style={{
              background: 'rgba(0,0,0,0.28)',
              borderRadius: 20,
              padding: '7px 14px',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          >
            <ProgressDotsHero current={3} />
          </div>
          <div style={{ width: 56 }} />
        </div>
      </div>

      {/* ── Content below image ── */}
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '32px 32px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Headline */}
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#2C2A1E',
            marginBottom: 12,
            fontFamily: 'var(--font-lora)',
            lineHeight: 1.2,
          }}
        >
          Howsit — we&apos;re glad you&apos;re here.
        </h2>

        {/* Dynamic subline */}
        <p
          style={{
            fontSize: 15,
            color: '#6B6454',
            lineHeight: 1.7,
            marginBottom: 32,
            fontFamily: 'var(--font-inter)',
            maxWidth: 400,
          }}
        >
          You&apos;ve just joined{' '}
          <strong style={{ color: '#2C2A1E', fontWeight: 600 }}>{firstName}&apos;s</strong>{' '}
          community.{' '}
          <strong style={{ color: '#2C2A1E', fontWeight: 600 }}>{form.suburb || 'Fourways'}</strong>{' '}
          is growing something good — and now you&apos;re part of it.
        </p>

        {/* ── Feature cards — white with left border ── */}
        <div style={{ width: '100%', textAlign: 'left', marginBottom: 20 }}>
          {[
            {
              title: "List what you're growing",
              body: "Got extra tomatoes? Herbs going crazy? Post them in minutes — free, swap, or a small price.",
            },
            {
              title: 'Find your neighbours',
              body: "See what's growing on your street. Filter by suburb, what's in season, or what your kitchen needs.",
            },
            {
              title: "Meet and swap — it's lekker",
              body: "Choose how you exchange — drop your surplus at a Harvest pick-up point near you (a local nursery, church, or community spot), or arrange a direct meetup in a public place. No strangers at your gate. Safe, simple, lekker.",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 20,
                borderLeft: '3px solid #B8B68F',
                marginBottom: i < 2 ? 12 : 0,
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#2C2A1E',
                  marginBottom: 5,
                  fontFamily: 'var(--font-inter)',
                  lineHeight: 1.3,
                }}
              >
                {item.title}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: '#6B6454',
                  lineHeight: 1.65,
                  fontFamily: 'var(--font-inter)',
                  margin: 0,
                }}
              >
                {item.body}
              </p>
            </div>
          ))}
        </div>

        {/* ── Suburb callout ── */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 20,
            width: '100%',
            marginBottom: 28,
            textAlign: 'left',
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: '#2C2A1E',
              lineHeight: 1.7,
              fontFamily: 'var(--font-inter)',
              margin: 0,
            }}
          >
            Your neighbours in{' '}
            <strong>{form.suburb || 'Fourways'}</strong>{' '}
            are already listing their surplus. Sharp — let&apos;s go find them.
          </p>
        </div>

        {/* ── Social proof cycler ── */}
        <SocialProofCycler />

        {/* ── CTAs ── */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginTop: 28 }}>
          <button
            onClick={handleGoToFeed}
            style={{
              width: '100%',
              height: 56,
              borderRadius: 16,
              backgroundColor: '#B8B68F',
              color: '#fff',
              fontSize: 16,
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-inter)',
              letterSpacing: '0.01em',
            }}
          >
            Show me what&apos;s growing nearby
          </button>
          <button
            onClick={() => router.push('/profile')}
            style={{
              background: 'none',
              border: 'none',
              color: '#6B6454',
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'var(--font-inter)',
              textDecoration: 'underline',
              textDecorationColor: 'rgba(107,100,84,0.35)',
              textUnderlineOffset: 3,
              padding: '4px 0',
            }}
          >
            Take me to my profile
          </button>
        </div>
      </div>

      <DevSkip onSkip={skipToFeed} />
    </div>
  )
}
