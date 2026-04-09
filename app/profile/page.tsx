'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { DevToolbar } from '../components/DevToolbar'

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = {
  Home: ({ s = 24, c = '#2C2A1E' }: { s?: number; c?: string }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke={c} strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M9 21V12h6v9" stroke={c} strokeWidth={1.8} strokeLinejoin="round" />
    </svg>
  ),
  Compass: ({ s = 24, c = '#2C2A1E' }: { s?: number; c?: string }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth={1.8} />
      <path d="M16.5 7.5l-3 6-3 1.5 1.5-3 3-6 1.5 1.5z" stroke={c} strokeWidth={1.8} strokeLinejoin="round" />
    </svg>
  ),
  Plus: ({ s = 24, c = '#2C2A1E' }: { s?: number; c?: string }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke={c} strokeWidth={2} strokeLinecap="round" />
    </svg>
  ),
  Chat: ({ s = 24, c = '#2C2A1E' }: { s?: number; c?: string }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke={c} strokeWidth={1.8} strokeLinejoin="round" />
    </svg>
  ),
  Person: ({ s = 24, c = '#2C2A1E' }: { s?: number; c?: string }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={c} strokeWidth={1.8} />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={c} strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  ),
  Eye: ({ s = 16, c = '#6B6454' }: { s?: number; c?: string }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke={c} strokeWidth={1.8} />
      <circle cx="12" cy="12" r="3" stroke={c} strokeWidth={1.8} />
    </svg>
  ),
  Camera: ({ s = 14, c = '#fff' }: { s?: number; c?: string }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke={c} strokeWidth={1.8} strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" stroke={c} strokeWidth={1.8} />
    </svg>
  ),
  Star: ({ filled = true, s = 14 }: { filled?: boolean; s?: number }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? '#DECCA6' : 'none'}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#DECCA6" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  ),
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const BADGES = [
  { id: 'first-seed', name: 'First Seed', desc: 'Published your first listing', how: 'Share your first harvest on Harvest to earn this badge.', icon: '🌱' },
  { id: 'first-harvest', name: 'First Harvest', desc: 'Completed your first trade', how: 'Complete your first GIVE, SWAP, or SELL trade with a neighbour.', icon: '🌾' },
  { id: 'ubuntu-grower', name: 'Ubuntu Grower', desc: 'Shared your first Give listing', how: 'List something as GIVE — give it away to a neighbour for free.', icon: '🤝' },
  { id: 'garden-gold', name: 'Garden Gold', desc: 'Received a 5-star rating', how: 'Complete a trade and receive a 5-star review from your neighbour.', icon: '⭐' },
  { id: 'green-thumb', name: 'Green Thumb', desc: '10 completed trades', how: 'Complete 10 trades — GIVE, SWAP, or SELL — with your neighbours.', icon: '👍' },
  { id: 'box-of-plenty', name: 'Box of Plenty', desc: 'Listed your first Harvest Box', how: 'Create a Harvest Box listing with mixed produce from your garden.', icon: '📦' },
  { id: 'full-garden', name: 'Full Garden', desc: 'Listed 3 items in one session', how: 'List 3 or more harvests in a single listing session.', icon: '🌿' },
  { id: 'founding-grower', name: 'Founding Grower', desc: 'Joined in the first season', how: 'You were one of the first growers to join Harvest. This badge is no longer earnable.', icon: '🏡' },
  { id: 'keeper', name: 'Keeper of the Garden', desc: 'Nominated as Village Elder', how: 'Be nominated by 5 neighbours as a trusted community grower.', icon: '👑' },
]

const PLOT_SIZES = ['Window sill', 'Small patch', 'Medium garden', 'Large garden', 'Smallholding']
const GROWING_METHODS = ['Organic', 'No pesticides', 'Permaculture', 'Raised beds', 'Container garden', 'Hydroponic', 'Traditional', 'Mixed methods']
const YEARS_OPTIONS = ['Just started', '1–2 years', '3–5 years', '5–10 years', '10+ years']
const GROW_TAGS = [
  'Tomatoes','Chillies','Basil','Spinach','Courgettes','Carrots','Garlic','Onions',
  'Lemons','Avocado','Cucumber','Beans','Peppers','Sweet potatoes','Pumpkin',
  'Butternut','Kale','Lettuce','Herbs (mixed)','Eggs','Seedlings','Jam / preserves',
  'Honey','Microgreens','Mushrooms',
]
const COMING_SOON_TIMES = ['This week', '2 weeks', '3 weeks', '1 month', 'Next season']
const COMPLETION_LABELS = [
  'Profile photo','Garden photo','Plot size','Growing method',
  'What I grow','My story','Coming soon','First listing','First trade',
]
const SECTION_REF_MAP: Record<number, string> = {
  0: 'hero', 1: 'hero', 2: 'plotSize', 3: 'growingMethod',
  4: 'whatIGrow', 5: 'myStory', 6: 'comingSoon', 7: 'listings', 8: 'listings',
}

// ─── GARDEN SVG ───────────────────────────────────────────────────────────────
function GardenSVG({ completion }: { completion: boolean[] }) {
  const el = (i: number): React.CSSProperties => ({
    opacity: completion[i] ? 1 : 0,
    transform: `scale(${completion[i] ? 1 : 0.5})`,
    transition: 'opacity 500ms ease, transform 500ms ease',
    transformOrigin: 'center bottom',
  })

  return (
    <svg width="320" height="190" viewBox="0 0 320 190" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '100%' }}>
      {/* Background */}
      <rect width="320" height="190" fill="#F5F0E8" rx="12" />
      {/* Soil bed — always visible */}
      <rect x="16" y="148" width="288" height="36" rx="10" fill="#D0C0A7" />
      <rect x="16" y="148" width="288" height="11" rx="6" fill="#C4B09A" />

      {/* 0 — Seed */}
      <g style={el(0)}>
        <ellipse cx="160" cy="150" rx="7" ry="5" fill="#5D4E37" />
      </g>

      {/* 1 — Seedling */}
      <g style={el(1)}>
        <line x1="160" y1="148" x2="160" y2="124" stroke="#6B8F5E" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="150" cy="130" rx="10" ry="6" fill="#4A7C59" transform="rotate(-30 150 130)" />
        <ellipse cx="170" cy="127" rx="10" ry="6" fill="#4A7C59" transform="rotate(30 170 127)" />
      </g>

      {/* 2 — Small plant */}
      <g style={el(2)}>
        <line x1="160" y1="148" x2="160" y2="108" stroke="#6B8F5E" strokeWidth="2.5" strokeLinecap="round" />
        <ellipse cx="147" cy="122" rx="11" ry="6" fill="#4A7C59" transform="rotate(-35 147 122)" />
        <ellipse cx="173" cy="118" rx="11" ry="6" fill="#4A7C59" transform="rotate(35 173 118)" />
        <ellipse cx="160" cy="111" rx="9" ry="5" fill="#5C9470" />
      </g>

      {/* 3 — Medium plant */}
      <g style={el(3)}>
        <line x1="160" y1="148" x2="160" y2="90" stroke="#6B8F5E" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="142" cy="112" rx="13" ry="7" fill="#4A7C59" transform="rotate(-40 142 112)" />
        <ellipse cx="178" cy="108" rx="13" ry="7" fill="#4A7C59" transform="rotate(40 178 108)" />
        <ellipse cx="149" cy="99" rx="12" ry="6" fill="#5C9470" transform="rotate(-20 149 99)" />
        <ellipse cx="171" cy="97" rx="12" ry="6" fill="#5C9470" transform="rotate(20 171 97)" />
        <ellipse cx="160" cy="92" rx="10" ry="5" fill="#6BA882" />
      </g>

      {/* 4 — Flowering plant */}
      <g style={el(4)}>
        <line x1="160" y1="148" x2="160" y2="76" stroke="#6B8F5E" strokeWidth="3" strokeLinecap="round" />
        <ellipse cx="138" cy="102" rx="14" ry="7" fill="#4A7C59" transform="rotate(-40 138 102)" />
        <ellipse cx="182" cy="98" rx="14" ry="7" fill="#4A7C59" transform="rotate(40 182 98)" />
        <ellipse cx="146" cy="88" rx="12" ry="6" fill="#5C9470" transform="rotate(-20 146 88)" />
        <ellipse cx="174" cy="86" rx="12" ry="6" fill="#5C9470" transform="rotate(20 174 86)" />
        <circle cx="160" cy="77" r="11" fill="#DECCA6" opacity="0.9" />
        <circle cx="160" cy="77" r="5" fill="#E8C97A" />
      </g>

      {/* 5 — Garden sign */}
      <g style={el(5)}>
        <line x1="70" y1="148" x2="70" y2="114" stroke="#8B6914" strokeWidth="3" strokeLinecap="round" />
        <rect x="48" y="104" width="56" height="22" rx="4" fill="#C4952A" />
        <text x="76" y="119" textAnchor="middle" fontSize="8" fill="white" fontFamily="sans-serif" fontWeight="bold">MY GARDEN</text>
      </g>

      {/* 6 — Flower buds */}
      <g style={el(6)}>
        <line x1="104" y1="148" x2="98" y2="124" stroke="#6B8F5E" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="98" cy="120" rx="6" ry="8" fill="#B8B68F" />
        <line x1="118" y1="148" x2="124" y2="122" stroke="#6B8F5E" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="124" cy="118" rx="6" ry="8" fill="#B8B68F" />
      </g>

      {/* 7 — Full bloom */}
      <g style={el(7)}>
        <line x1="232" y1="148" x2="232" y2="84" stroke="#6B8F5E" strokeWidth="3" strokeLinecap="round" />
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <ellipse key={i}
            cx={232 + Math.cos((angle * Math.PI) / 180) * 15}
            cy={84 + Math.sin((angle * Math.PI) / 180) * 15}
            rx="9" ry="5"
            fill="#B8B68F"
            transform={`rotate(${angle} ${232 + Math.cos((angle * Math.PI) / 180) * 15} ${84 + Math.sin((angle * Math.PI) / 180) * 15})`}
          />
        ))}
        <circle cx="232" cy="84" r="9" fill="#DECCA6" />
      </g>

      {/* 8 — Fruit */}
      <g style={el(8)}>
        <line x1="262" y1="96" x2="256" y2="114" stroke="#6B8F5E" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="262" y1="96" x2="266" y2="116" stroke="#6B8F5E" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="262" y1="96" x2="278" y2="112" stroke="#6B8F5E" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="256" cy="118" r="6" fill="#DECCA6" />
        <circle cx="266" cy="120" r="6" fill="#DECCA6" />
        <circle cx="278" cy="116" r="6" fill="#DECCA6" />
      </g>

      {/* Grass tufts */}
      <path d="M26 150 Q29 143 32 150" stroke="#4A7C59" strokeWidth="1.5" fill="none" />
      <path d="M282 150 Q286 142 290 150" stroke="#4A7C59" strokeWidth="1.5" fill="none" />
      <path d="M300 150 Q304 142 308 150" stroke="#4A7C59" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter()

  // Completion — 9 booleans, all false in prototype
  const [completion, setCompletion] = useState<boolean[]>(Array(9).fill(false))

  // Garden state
  const [plotSize, setPlotSize] = useState<string | null>(null)
  const [growingMethods, setGrowingMethods] = useState<string[]>([])
  const [yearsGrowing, setYearsGrowing] = useState<string | null>(null)
  const [bio, setBio] = useState('')
  const [growingTags, setGrowingTags] = useState<string[]>([])
  const [customGrow, setCustomGrow] = useState('')

  // Coming soon
  const [comingSoon, setComingSoon] = useState<{ produce: string; time: string }[]>([])
  const [showComingSoonForm, setShowComingSoonForm] = useState(false)
  const [csoProduce, setCsoProduce] = useState('')
  const [csoTime, setCsoTime] = useState('This week')

  // UI
  const [toast, setToast] = useState<string | null>(null)
  const [selectedBadge, setSelectedBadge] = useState<typeof BADGES[0] | null>(null)
  const [showPrivacySheet, setShowPrivacySheet] = useState(false)
  const [showMicroDelight, setShowMicroDelight] = useState(false)
  const [pulsingSection, setPulsingSection] = useState<string | null>(null)

  // Refs
  const heroRef = useRef<HTMLDivElement>(null)
  const plotSizeRef = useRef<HTMLDivElement>(null)
  const growingMethodRef = useRef<HTMLDivElement>(null)
  const whatIGrowRef = useRef<HTMLDivElement>(null)
  const myStoryRef = useRef<HTMLDivElement>(null)
  const comingSoonRef = useRef<HTMLDivElement>(null)
  const listingsRef = useRef<HTMLDivElement>(null)

  const SECTION_REFS: Record<string, React.RefObject<HTMLDivElement | null>> = {
    hero: heroRef, plotSize: plotSizeRef, growingMethod: growingMethodRef,
    whatIGrow: whatIGrowRef, myStory: myStoryRef, comingSoon: comingSoonRef, listings: listingsRef,
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const updateCompletion = (index: number, value: boolean) => {
    setCompletion(prev => {
      const next = [...prev]
      next[index] = value
      const pct = Math.round(next.filter(Boolean).length / 9 * 100)
      if (pct === 100) {
        setShowMicroDelight(true)
        setTimeout(() => setShowMicroDelight(false), 2000)
      }
      return next
    })
  }

  const completionPercent = Math.round(completion.filter(Boolean).length / 9 * 100)

  const scrollToSection = (key: string) => {
    const ref = SECTION_REFS[key]
    ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setPulsingSection(key)
    setTimeout(() => setPulsingSection(null), 900)
  }

  const handlePillTap = (index: number) => {
    if (completion[index]) return
    scrollToSection(SECTION_REF_MAP[index])
  }

  const handleGrowItTap = () => {
    const first = completion.findIndex(v => !v)
    if (first >= 0) scrollToSection(SECTION_REF_MAP[first])
  }

  // ── Field handlers ────────────────────────────────────────────────────────
  const handlePlotSize = (size: string) => { setPlotSize(size); updateCompletion(2, true) }

  const toggleGrowingMethod = (method: string) => {
    setGrowingMethods(prev => {
      const next = prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
      updateCompletion(3, next.length > 0)
      return next
    })
  }

  const handleBio = (val: string) => {
    if (val.length > 150) return
    setBio(val)
    updateCompletion(5, val.length > 0)
  }

  const toggleGrowTag = (tag: string) => {
    setGrowingTags(prev => {
      const next = prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
      updateCompletion(4, next.length > 0)
      return next
    })
  }

  const handleAddCustomGrow = () => {
    const tag = customGrow.trim()
    if (!tag) return
    setGrowingTags(prev => {
      if (prev.includes(tag)) return prev
      const next = [...prev, tag]
      updateCompletion(4, true)
      return next
    })
    setCustomGrow('')
  }

  const handleSaveComingSoon = () => {
    if (!csoProduce.trim()) return
    setComingSoon(prev => {
      const next = [...prev, { produce: csoProduce.trim(), time: csoTime }]
      updateCompletion(6, true)
      return next
    })
    setCsoProduce('')
    setCsoTime('This week')
    setShowComingSoonForm(false)
  }

  // ── Shared styles ─────────────────────────────────────────────────────────
  const cardStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: 12, margin: '0 16px', padding: 20 }
  const sectionLabelStyle: React.CSSProperties = { fontSize: 12, color: '#6B6454', fontFamily: 'var(--font-inter)', marginBottom: 12, display: 'block' }
  const nudgeStyle: React.CSSProperties = { fontSize: 11, color: '#6B6454', fontStyle: 'italic', fontFamily: 'var(--font-inter)', marginTop: 6 }

  const PrivacyToggle = () => (
    <button onClick={() => setShowPrivacySheet(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
      <Icon.Eye />
      <span style={{ fontSize: 10, color: '#6B6454', fontFamily: 'var(--font-inter)' }}>Visible to all growers</span>
    </button>
  )

  const pulseStyle = (key: string): React.CSSProperties => ({
    outline: pulsingSection === key ? '2px solid #B8B68F' : 'none',
    transition: 'outline 300ms ease',
  })

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <main style={{ backgroundColor: '#EBE6D2', minHeight: '100vh', paddingBottom: 140, fontFamily: 'var(--font-inter)' }}>

      {/* ══ 1. HERO BANNER ══ */}
      <div ref={heroRef} style={{ position: 'relative', height: 220, overflow: 'visible' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/images/woman-with-garden-tool-working-at-raised-garden-be-2026-01-08-23-48-35-utc.jpg)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          borderRadius: '0 0 24px 24px',
        }} />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.30)', borderRadius: '0 0 24px 24px' }} />

        {/* Edit garden */}
        <button
          onClick={() => showToast('Profile editing coming soon.')}
          style={{
            position: 'absolute', top: 16, right: 16, zIndex: 10,
            background: 'transparent', border: '1.5px solid rgba(255,255,255,0.8)',
            color: '#fff', fontSize: 12, fontFamily: 'var(--font-inter)',
            fontWeight: 600, padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
          }}
        >
          Edit garden
        </button>

        {/* Avatar */}
        <div style={{ position: 'absolute', left: 24, bottom: -40, zIndex: 20 }}>
          <div style={{ position: 'relative', width: 80, height: 80 }}>
            <img
              src="/images/harvestlogo.png"
              alt="Thandi M."
              style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid #fff', objectFit: 'cover', display: 'block', backgroundColor: '#DBD3C6' }}
            />
            <div style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 24, height: 24, borderRadius: '50%',
              backgroundColor: '#B8B68F', border: '2px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon.Camera />
            </div>
          </div>
        </div>
      </div>

      {/* Name / info */}
      <div style={{ padding: '52px 24px 16px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2C2A1E', margin: '0 0 6px', fontFamily: 'var(--font-lora)', letterSpacing: '-0.02em' }}>
          Thandi M.
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13, color: '#6B6454' }}>Fourways</span>
          <span style={{ backgroundColor: '#DECCA6', color: '#2C2A1E', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>Seedling</span>
        </div>
        <p style={{ fontSize: 11, color: '#6B6454', margin: '0 0 4px' }}>Member since April 2025</p>
        <p style={{ fontSize: 11, color: '#6B6454', fontStyle: 'italic', margin: 0 }}>
          New Grower — complete your profile to earn your first rating
        </p>
      </div>

      {/* ══ NUDGE BANNER ══ */}
      {completionPercent < 60 && (
        <div style={{
          backgroundColor: '#DECCA6', borderRadius: 12, margin: '0 16px 16px',
          padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
          transition: 'opacity 300ms ease',
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#2C2A1E', whiteSpace: 'nowrap' }}>{completionPercent}% complete</span>
          <p style={{ fontSize: 12, color: '#2C2A1E', margin: 0, flex: 1, lineHeight: 1.4 }}>
            Your garden is looking a bit bare, Thandi — neighbours trust growers who share their story.
          </p>
          <button
            onClick={handleGrowItTap}
            style={{
              backgroundColor: '#B8B68F', color: '#fff', fontSize: 11, fontWeight: 700,
              padding: '6px 12px', borderRadius: 16, border: 'none', cursor: 'pointer',
              whiteSpace: 'nowrap', letterSpacing: '-0.01em',
            }}
          >
            Grow it
          </button>
        </div>
      )}

      {/* ══ 2. STATS ROW ══ */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {[
            { value: '0', label: 'Harvests shared' },
            { value: '0', label: 'Swaps done' },
            { value: '0', label: 'Neighbours helped' },
            { value: '0', label: 'XP earned' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#B8B68F', fontFamily: 'var(--font-lora)', letterSpacing: '-0.02em' }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: '#6B6454', marginTop: 2, lineHeight: 1.3 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ 3. GARDEN SVG ══ */}
      <div style={{ margin: '0 16px 16px', backgroundColor: '#fff', borderRadius: 12, padding: '20px 0 16px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0 12px' }}>
          <GardenSVG completion={completion} />
        </div>
        <p style={{ fontSize: 13, color: '#6B6454', margin: '12px 24px 0', lineHeight: 1.5 }}>
          Your garden is just getting started — keep growing!
        </p>
        {/* Completion pills */}
        <div style={{ display: 'flex', overflowX: 'auto', gap: 8, padding: '14px 16px 0', scrollbarWidth: 'none' }}>
          {COMPLETION_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => handlePillTap(i)}
              style={{
                flexShrink: 0,
                backgroundColor: completion[i] ? '#B8B68F' : '#DBD3C6',
                color: completion[i] ? '#fff' : '#6B6454',
                fontSize: 11, fontWeight: 600,
                padding: '5px 12px', borderRadius: 20,
                border: 'none', cursor: completion[i] ? 'default' : 'pointer',
                transition: 'background-color 300ms ease, color 300ms ease',
              }}
            >
              {completion[i] ? '✓ ' : ''}{label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ 4. MY GARDEN ══ */}
      <div style={{ ...cardStyle, marginBottom: 16, ...pulseStyle('plotSize') }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#2C2A1E', margin: 0, fontFamily: 'var(--font-lora)' }}>My garden</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PrivacyToggle />
            <button style={{ background: 'none', border: 'none', color: '#B8B68F', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}>Add details</button>
          </div>
        </div>

        {/* Plot size */}
        <div ref={plotSizeRef} style={{ marginBottom: 20 }}>
          <span style={sectionLabelStyle}>How big is your patch?</span>
          <div style={{ display: 'flex', overflowX: 'auto', gap: 10, paddingBottom: 4, scrollbarWidth: 'none' }}>
            {PLOT_SIZES.map((size, i) => {
              const w = 16 + i * 6
              return (
                <button
                  key={size}
                  onClick={() => handlePlotSize(size)}
                  style={{
                    flexShrink: 0, width: 90, height: 80,
                    backgroundColor: '#fff',
                    border: `1.5px solid ${plotSize === size ? '#B8B68F' : '#E8E4DA'}`,
                    borderRadius: 8, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'border-color 200ms ease',
                    boxShadow: plotSize === size ? '0 0 0 3px rgba(184,182,143,0.15)' : 'none',
                  }}
                >
                  <div style={{
                    width: w, height: w * 0.55,
                    backgroundColor: plotSize === size ? '#B8B68F' : '#DBD3C6',
                    borderRadius: 4,
                    transition: 'background-color 200ms ease',
                  }} />
                  <span style={{ fontSize: 10, color: plotSize === size ? '#2C2A1E' : '#6B6454', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{size}</span>
                </button>
              )
            })}
          </div>
          {!plotSize && <p style={nudgeStyle}>Add this to grow your garden profile.</p>}
        </div>

        {/* Growing method */}
        <div ref={growingMethodRef} style={{ marginBottom: 20 }}>
          <span style={sectionLabelStyle}>How do you grow?</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {GROWING_METHODS.map(method => (
              <button
                key={method}
                onClick={() => toggleGrowingMethod(method)}
                style={{
                  backgroundColor: growingMethods.includes(method) ? '#B8B68F' : '#DBD3C6',
                  color: growingMethods.includes(method) ? '#fff' : '#6B6454',
                  fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 20,
                  border: 'none', cursor: 'pointer',
                  transition: 'background-color 200ms ease, color 200ms ease',
                }}
              >
                {method}
              </button>
            ))}
          </div>
          {growingMethods.length === 0 && <p style={nudgeStyle}>Add this to grow your garden profile.</p>}
        </div>

        {/* Years growing */}
        <div style={{ marginBottom: 20 }}>
          <span style={sectionLabelStyle}>How long have you been growing?</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {YEARS_OPTIONS.map(y => (
              <button
                key={y}
                onClick={() => setYearsGrowing(y)}
                style={{
                  backgroundColor: yearsGrowing === y ? '#B8B68F' : '#DBD3C6',
                  color: yearsGrowing === y ? '#fff' : '#6B6454',
                  fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 20,
                  border: 'none', cursor: 'pointer',
                  transition: 'background-color 200ms ease, color 200ms ease',
                }}
              >
                {y}
              </button>
            ))}
          </div>
          {!yearsGrowing && <p style={nudgeStyle}>Add this to grow your garden profile.</p>}
        </div>

        {/* Bio */}
        <div ref={myStoryRef}>
          <span style={sectionLabelStyle}>Tell your neighbours about your patch</span>
          <div style={{ position: 'relative' }}>
            <textarea
              value={bio}
              onChange={e => handleBio(e.target.value)}
              placeholder="What do you love growing? What's your garden story? Eish, tell us everything."
              rows={3}
              style={{
                width: '100%', boxSizing: 'border-box',
                borderRadius: 12, border: 'none', outline: 'none',
                padding: '14px 16px', fontSize: 14, color: '#2C2A1E',
                fontFamily: 'var(--font-inter)', lineHeight: 1.5,
                backgroundColor: '#F8F6F2', resize: 'none',
                boxShadow: bio.length > 0 ? 'inset 3px 0 0 #B8B68F' : '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'box-shadow 200ms ease',
              }}
            />
            <span style={{
              position: 'absolute', bottom: 10, right: 12,
              fontSize: 11, color: (150 - bio.length) <= 20 ? '#B8B68F' : '#6B6454',
              transition: 'color 200ms ease',
            }}>{150 - bio.length}</span>
          </div>
          {!bio && <p style={nudgeStyle}>Add this to grow your garden profile.</p>}
        </div>
      </div>

      {/* ══ 5. WHAT I'M GROWING NOW ══ */}
      <div ref={whatIGrowRef} style={{ ...cardStyle, marginBottom: 16, ...pulseStyle('whatIGrow') }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#2C2A1E', margin: 0, fontFamily: 'var(--font-lora)' }}>What I'm growing now</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PrivacyToggle />
            <button style={{ background: 'none', border: 'none', color: '#B8B68F', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}>Edit</button>
          </div>
        </div>
        <p style={{ fontSize: 12, color: '#6B6454', margin: '0 0 14px', lineHeight: 1.4 }}>
          Tap what you grow — neighbours are looking for exactly this.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {GROW_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleGrowTag(tag)}
              style={{
                backgroundColor: growingTags.includes(tag) ? '#B8B68F' : '#DBD3C6',
                color: growingTags.includes(tag) ? '#fff' : '#6B6454',
                fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 20,
                border: 'none', cursor: 'pointer',
                transition: 'background-color 200ms ease, color 200ms ease',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={customGrow}
            onChange={e => setCustomGrow(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCustomGrow()}
            placeholder="Growing something else? Add it."
            style={{
              flex: 1, height: 40, borderRadius: 10, border: 'none',
              padding: '0 12px', fontSize: 13, color: '#2C2A1E',
              fontFamily: 'var(--font-inter)', backgroundColor: '#F8F6F2',
              outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          />
          <button
            onClick={handleAddCustomGrow}
            style={{
              backgroundColor: '#B8B68F', color: '#fff', border: 'none',
              borderRadius: 10, padding: '0 16px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Add
          </button>
        </div>
        {growingTags.length === 0 && <p style={nudgeStyle}>Tap what you're growing — neighbours are looking for exactly this.</p>}
      </div>

      {/* ══ 6. COMING SOON ══ */}
      <div ref={comingSoonRef} style={{ ...cardStyle, marginBottom: 16, ...pulseStyle('comingSoon') }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#2C2A1E', margin: 0, fontFamily: 'var(--font-lora)' }}>Coming soon from my garden</h2>
          <PrivacyToggle />
        </div>
        <p style={{ fontSize: 12, color: '#6B6454', margin: '0 0 16px', lineHeight: 1.4 }}>
          Build anticipation — neighbours can follow to get notified when you list.
        </p>

        {comingSoon.map((item, i) => (
          <div key={i} style={{
            backgroundColor: '#F8F6F2', borderRadius: 10, padding: '12px 14px',
            marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#2C2A1E' }}>{item.produce}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B6454' }}>{item.time}</p>
            </div>
            <button
              onClick={() => showToast("You'll be notified when this is listed. Sharp.")}
              style={{
                backgroundColor: '#DBD3C6', color: '#6B6454', fontSize: 11,
                fontWeight: 600, padding: '5px 12px', borderRadius: 16,
                border: 'none', cursor: 'pointer',
              }}
            >
              Notify me
            </button>
          </div>
        ))}

        {comingSoon.length === 0 && !showComingSoonForm && (
          <div style={{ border: '1.5px dashed #B8B68F', borderRadius: 10, padding: '28px 20px', textAlign: 'center' }}>
            <div style={{
              width: 40, height: 40, margin: '0 auto 12px',
              backgroundColor: '#B8B68F', opacity: 0.4,
              borderRadius: '80% 20% 80% 20%', transform: 'rotate(-45deg)',
            }} />
            <p style={{ fontSize: 13, color: '#6B6454', margin: '0 0 14px' }}>Nothing coming soon yet</p>
            <button
              onClick={() => setShowComingSoonForm(true)}
              style={{
                backgroundColor: 'transparent', color: '#B8B68F',
                border: '1.5px solid #B8B68F', fontSize: 13, fontWeight: 600,
                padding: '8px 20px', borderRadius: 20, cursor: 'pointer',
              }}
            >
              Add something
            </button>
          </div>
        )}

        {showComingSoonForm && (
          <div style={{ backgroundColor: '#F8F6F2', borderRadius: 10, padding: 14 }}>
            <input
              value={csoProduce}
              onChange={e => setCsoProduce(e.target.value)}
              placeholder="What's almost ready? e.g. My tomatoes are about 3 weeks away"
              style={{
                width: '100%', boxSizing: 'border-box', height: 44, borderRadius: 10,
                border: 'none', padding: '0 12px', fontSize: 13, color: '#2C2A1E',
                fontFamily: 'var(--font-inter)', backgroundColor: '#fff',
                outline: 'none', marginBottom: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            />
            <select
              value={csoTime}
              onChange={e => setCsoTime(e.target.value)}
              style={{
                width: '100%', height: 44, borderRadius: 10, border: 'none',
                padding: '0 12px', fontSize: 13, color: '#2C2A1E',
                fontFamily: 'var(--font-inter)', backgroundColor: '#fff',
                outline: 'none', marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              {COMING_SOON_TIMES.map(t => <option key={t}>{t}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowComingSoonForm(false)}
                style={{ flex: 1, height: 40, borderRadius: 10, backgroundColor: 'transparent', border: '1.5px solid #DBD3C6', color: '#6B6454', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveComingSoon}
                style={{ flex: 2, height: 40, borderRadius: 10, backgroundColor: '#B8B68F', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Save
              </button>
            </div>
          </div>
        )}

        {comingSoon.length > 0 && !showComingSoonForm && (
          <button onClick={() => setShowComingSoonForm(true)} style={{ marginTop: 10, background: 'none', border: 'none', color: '#B8B68F', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
            + Add another
          </button>
        )}
      </div>

      {/* ══ 7. MY ACTIVE LISTINGS ══ */}
      <div ref={listingsRef} style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#2C2A1E', margin: 0, fontFamily: 'var(--font-lora)' }}>My active listings</h2>
          <button onClick={() => router.push('/create-listing')} style={{ background: 'none', border: 'none', color: '#B8B68F', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
            List my harvest
          </button>
        </div>

        <div style={{ display: 'flex', overflowX: 'auto', gap: 12, paddingBottom: 4, scrollbarWidth: 'none' }}>
          {[
            { badge: 'GIVE', badgeColor: '#4A7C59', produce: 'Cherry tomatoes', sub: 'Fourways', expiry: 'Expires in 2 days', img: '/images/feed/a-crate-of-health-and-happiness-2026-03-25-02-46-51-utc.jpg' },
            { badge: 'SELL', badgeColor: '#2C2A1E', produce: 'Fresh basil', sub: 'R15 / bunch', expiry: 'Expires in 4 days', img: '/images/feed/woman-wearing-gardening-gloves-transplanting-flowe-2026-03-24-07-37-21-utc.jpg' },
          ].map(listing => (
            <div key={listing.produce} style={{ flexShrink: 0, width: 200, backgroundColor: '#F8F6F2', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ height: 120, backgroundImage: `url(${listing.img})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                <span style={{ position: 'absolute', top: 8, left: 8, backgroundColor: listing.badgeColor, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 8 }}>{listing.badge}</span>
              </div>
              <div style={{ padding: '10px 12px' }}>
                <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#2C2A1E' }}>{listing.produce}</p>
                <p style={{ margin: '0 0 6px', fontSize: 11, color: '#6B6454' }}>{listing.sub}</p>
                <p style={{ margin: '0 0 8px', fontSize: 11, color: '#B8B68F' }}>{listing.expiry}</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button style={{ background: 'none', border: 'none', color: '#B8B68F', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}>Manage</button>
                  <button style={{ background: 'none', border: 'none', color: '#6B6454', fontSize: 12, cursor: 'pointer', padding: 0 }}>Close listing</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push('/create-listing')}
          style={{
            marginTop: 14, width: '100%', height: 44, borderRadius: 10,
            backgroundColor: '#B8B68F', border: 'none', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.01em',
          }}
        >
          Share your harvest
        </button>
      </div>

      {/* ══ 8. BADGES ══ */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#2C2A1E', margin: '0 0 16px', fontFamily: 'var(--font-lora)' }}>Badges and achievements</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {BADGES.map(badge => (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '8px 4px' }}
            >
              <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#DBD3C6', opacity: 0.55, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                {badge.icon}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#2C2A1E', textAlign: 'center', lineHeight: 1.3 }}>{badge.name}</span>
              <span style={{ fontSize: 10, color: '#6B6454', textAlign: 'center', lineHeight: 1.3 }}>{badge.desc}</span>
            </button>
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#6B6454', textAlign: 'center', margin: '12px 0 0', fontStyle: 'italic' }}>
          Complete your first listing to start earning badges — your garden is waiting.
        </p>
      </div>

      {/* ══ 9. REVIEWS ══ */}
      <div style={{ ...cardStyle, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#2C2A1E', margin: 0, fontFamily: 'var(--font-lora)' }}>What my neighbours say</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PrivacyToggle />
            <span style={{ fontSize: 14, color: '#6B6454' }}>—</span>
          </div>
        </div>
        {[
          { name: 'Thabo', suburb: 'Fourways', review: 'Lekker grower — tomatoes were fresh and exactly as described. Will definitely swap again. Sharp!', date: 'April 2025', initial: 'T' },
          { name: 'Priya', suburb: 'Lonehill', review: 'Generous with her harvest. Basil was beautiful. Easy Harvest Point collection at Lonehill Nursery. Highly recommend.', date: 'April 2025', initial: 'P' },
        ].map((review, i) => (
          <div key={review.name} style={{ marginBottom: i === 0 ? 16 : 0, paddingBottom: i === 0 ? 16 : 0, borderBottom: i === 0 ? '0.5px solid #F0ECE4' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#DECCA6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#2C2A1E', fontFamily: 'var(--font-lora)', flexShrink: 0 }}>
                {review.initial}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#2C2A1E' }}>{review.name} · {review.suburb}</p>
                <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                  {Array(5).fill(0).map((_, j) => <Icon.Star key={j} filled s={12} />)}
                </div>
              </div>
            </div>
            <p style={{ margin: '0 0 4px', fontSize: 13, color: '#6B6454', lineHeight: 1.5 }}>"{review.review}"</p>
            <span style={{ fontSize: 11, color: '#B8B68F' }}>{review.date}</span>
          </div>
        ))}
      </div>

      {/* ══ BADGE BOTTOM SHEET ══ */}
      {selectedBadge && (
        <>
          <div onClick={() => setSelectedBadge(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 300 }} />
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 400, backgroundColor: '#fff', borderRadius: '20px 20px 0 0', padding: '20px 24px 48px', animation: 'slideUp 300ms ease' }}>
            <div style={{ width: 36, height: 4, backgroundColor: '#DBD3C6', borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>{selectedBadge.icon}</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#2C2A1E', margin: '0 0 6px', fontFamily: 'var(--font-lora)', textAlign: 'center', letterSpacing: '-0.02em' }}>{selectedBadge.name}</h3>
            <p style={{ fontSize: 14, color: '#6B6454', textAlign: 'center', margin: '0 0 12px', lineHeight: 1.5 }}>{selectedBadge.desc}</p>
            <div style={{ backgroundColor: '#F8F6F2', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: '#B8B68F', fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>HOW TO EARN</p>
              <p style={{ fontSize: 13, color: '#6B6454', margin: 0, lineHeight: 1.5 }}>{selectedBadge.how}</p>
            </div>
            <button onClick={() => setSelectedBadge(null)} style={{ width: '100%', height: 52, borderRadius: 14, backgroundColor: '#B8B68F', border: 'none', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.02em' }}>
              Got it — sharp
            </button>
          </div>
        </>
      )}

      {/* ══ PRIVACY BOTTOM SHEET ══ */}
      {showPrivacySheet && (
        <>
          <div onClick={() => setShowPrivacySheet(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 300 }} />
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 400, backgroundColor: '#fff', borderRadius: '20px 20px 0 0', padding: '20px 24px 48px', animation: 'slideUp 300ms ease' }}>
            <div style={{ width: 36, height: 4, backgroundColor: '#DBD3C6', borderRadius: 2, margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2C2A1E', margin: '0 0 16px', fontFamily: 'var(--font-lora)', letterSpacing: '-0.02em' }}>Who can see this?</h3>
            {[
              { label: 'Your full garden profile', desc: 'Visible to verified Harvest growers.' },
              { label: 'Your suburb and active listings', desc: 'Visible to everyone on Harvest.' },
              { label: 'Your personal details', desc: 'Never shared with anyone.' },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 14 }}>
                <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#2C2A1E' }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#6B6454', lineHeight: 1.4 }}>{item.desc}</p>
              </div>
            ))}
            <button onClick={() => setShowPrivacySheet(false)} style={{ width: '100%', height: 52, borderRadius: 14, marginTop: 8, backgroundColor: '#B8B68F', border: 'none', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.02em' }}>
              Got it — sharp
            </button>
          </div>
        </>
      )}

      {/* ══ MICRO DELIGHT ══ */}
      {showMicroDelight && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, backgroundColor: '#B8B68F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 0 12px', fontFamily: 'var(--font-lora)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Your garden is in full bloom!
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: 0 }}>Eish, look at that.</p>
        </div>
      )}

      {/* ══ TOAST ══ */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#1C1C1E', color: '#fff', fontSize: 12,
          padding: '12px 20px', borderRadius: 14, zIndex: 400,
          maxWidth: 'calc(100vw - 48px)', textAlign: 'center',
          boxShadow: '0 8px 28px rgba(0,0,0,0.22)', whiteSpace: 'nowrap',
          animation: 'fadeInUp 200ms ease', letterSpacing: '-0.01em',
        }}>
          {toast}
        </div>
      )}

      {/* ══ BOTTOM TAB NAV ══ */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 64,
        backgroundColor: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderTop: '0.5px solid rgba(0,0,0,0.08)',
        zIndex: 100, display: 'flex', alignItems: 'center',
        justifyContent: 'space-around', padding: '0 8px',
      }}>
        <button onClick={() => router.push('/feed')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 10px' }}>
          <Icon.Home s={22} c="#8E8E93" />
          <span style={{ fontSize: 10, color: '#8E8E93', fontFamily: 'var(--font-inter)', letterSpacing: '-0.01em' }}>Home</span>
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 10px' }}>
          <Icon.Compass s={22} c="#8E8E93" />
          <span style={{ fontSize: 10, color: '#8E8E93', fontFamily: 'var(--font-inter)', letterSpacing: '-0.01em' }}>Discover</span>
        </button>
        <div style={{ position: 'relative', marginTop: -22 }}>
          <button onClick={() => router.push('/create-listing')} style={{
            width: 46, height: 46, borderRadius: '50%',
            backgroundColor: '#B8B68F', border: '3px solid #fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(184,182,143,0.5)', lineHeight: 0,
          }}>
            <Icon.Plus s={20} c="#fff" />
          </button>
        </div>
        <button onClick={() => router.push('/messages')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 10px' }}>
          <Icon.Chat s={22} c="#8E8E93" />
          <span style={{ fontSize: 10, color: '#8E8E93', fontFamily: 'var(--font-inter)', letterSpacing: '-0.01em' }}>Messages</span>
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 10px' }}>
          <Icon.Person s={22} c="#B8B68F" />
          <span style={{ fontSize: 10, color: '#B8B68F', fontFamily: 'var(--font-inter)', fontWeight: 600, letterSpacing: '-0.01em' }}>Profile</span>
        </button>
      </nav>

      <DevToolbar />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </main>
  )
}
