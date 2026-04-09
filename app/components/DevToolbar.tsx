'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

// ─── DEVELOPER TOOLBAR ────────────────────────────────────────────────────────
// Floating dev nav panel. Remove the single line in layout.tsx to hide before launch.
// ──────────────────────────────────────────────────────────────────────────────

const TEST_EMAIL = 'test@harvest.app'
const TEST_PASSWORD = 'harvest123'

const NAV_LINKS = [
  { label: 'Onboarding', href: '/onboarding' },
  { label: 'Landing', href: '/' },
  { label: 'Feed', href: '/feed' },
  { label: 'Create Listing', href: '/create-listing' },
  { label: 'Profile', href: '/profile' },
  { label: 'Messages', href: '/messages' },
]

export function DevToolbar() {
  const [open, setOpen] = useState(false)
  const [loginState, setLoginState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const router = useRouter()

  // Ensure the test account exists on first load (no-op if already created)
  useEffect(() => {
    supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      options: { data: { full_name: 'Test Grower', suburb: 'Sandton' } },
    }).catch(() => {/* already exists — ignore */})
  }, [])

  const handleTestLogin = async () => {
    setLoginState('loading')
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      })
      if (error) throw error
      setLoginState('done')
      setTimeout(() => {
        router.push('/feed')
        setLoginState('idle')
      }, 600)
    } catch {
      setLoginState('error')
      setTimeout(() => setLoginState('idle'), 2000)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'stretch',
        fontFamily: 'monospace',
        pointerEvents: 'all',
      }}
    >
      {/* Expanded nav panel */}
      <div
        style={{
          backgroundColor: '#2C2A1E',
          borderRadius: '0 10px 10px 0',
          overflow: 'hidden',
          maxWidth: open ? 170 : 0,
          opacity: open ? 1 : 0,
          transition: 'max-width 250ms ease, opacity 250ms ease',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: open ? 10 : 0,
          paddingBottom: open ? 10 : 0,
          whiteSpace: 'nowrap',
        }}
      >
        <p
          style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: 9,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '0 14px 8px',
            margin: 0,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            marginBottom: 6,
          }}
        >
          Dev nav
        </p>

        {NAV_LINKS.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            style={{
              display: 'block',
              padding: '7px 14px',
              color: 'rgba(255,255,255,0.75)',
              fontSize: 12,
              textDecoration: 'none',
              transition: 'color 150ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#DECCA6')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
          >
            {label}
          </a>
        ))}

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', margin: '8px 0' }} />

        {/* Test login button */}
        <button
          onClick={handleTestLogin}
          disabled={loginState === 'loading' || loginState === 'done'}
          style={{
            margin: '2px 10px',
            padding: '8px 10px',
            borderRadius: 7,
            border: 'none',
            cursor: loginState === 'loading' ? 'wait' : 'pointer',
            fontSize: 11,
            fontFamily: 'monospace',
            fontWeight: 600,
            letterSpacing: '0.04em',
            transition: 'background 200ms, color 200ms',
            backgroundColor:
              loginState === 'done' ? '#4A7C59' :
              loginState === 'error' ? '#E24B4A' :
              '#B8B68F',
            color: '#fff',
            whiteSpace: 'nowrap',
          }}
        >
          {loginState === 'loading' ? 'Signing in…' :
           loginState === 'done'    ? '✓ Signed in' :
           loginState === 'error'   ? '✗ Failed' :
           '→ Login as test user'}
        </button>

        <p style={{
          color: 'rgba(255,255,255,0.25)',
          fontSize: 9,
          margin: '4px 14px 0',
          lineHeight: 1.4,
        }}>
          test@harvest.app
        </p>
      </div>

      {/* Collapsed DEV tab */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Dev navigation"
        style={{
          backgroundColor: '#2C2A1E',
          color: open ? '#DECCA6' : 'rgba(255,255,255,0.55)',
          border: 'none',
          cursor: 'pointer',
          padding: '12px 7px',
          fontSize: 10,
          letterSpacing: '0.12em',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          transform: 'rotate(180deg)',
          borderRadius: open ? '10px 0 0 10px' : '0 6px 6px 0',
          transition: 'color 200ms',
          userSelect: 'none',
        }}
      >
        DEV
      </button>
    </div>
  )
}
