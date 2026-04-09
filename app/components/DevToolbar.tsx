'use client'

import { useState } from 'react'

// ─── DEVELOPER TOOLBAR ────────────────────────────────────────────────────────
// Floating dev nav panel. Remove the single line in layout.tsx to hide before launch.
// ──────────────────────────────────────────────────────────────────────────────

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
          maxWidth: open ? 160 : 0,
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
