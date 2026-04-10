'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

// ─── TYPES ────────────────────────────────────────────────────────────────────

type ListingType = 'GIVE' | 'SWAP' | 'SELL'
type QuantityType = 'estimate' | 'measure'
type AiState = 'idle' | 'identifying' | 'prompted' | 'done'

interface FormState {
  photos: (string | null)[]
  produceName: string
  quantityType: QuantityType
  quantityValue: string
  quantityUnit: string
  estimateOption: string
  description: string
  condition: 'Fresh' | 'Preserved'
  listingType: ListingType | null
  isHarvestBox: boolean
  boxContents: string
  swapFlexible: boolean
  swapWants: string
  price: string
  negotiable: boolean
  harvestPoints: string[]
  meetupEnabled: boolean
  meetupLocation: string
  expiry: string
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const ESTIMATE_OPTIONS = [
  'A small bag', 'A medium bag', 'A large bag', 'A generous handful',
  'A good bunch', 'Half a dozen', 'A full dozen', 'A small box',
  'A large box', 'A single jar', 'A pack', 'See my photos',
]

const MEASURE_UNITS = ['kg', 'g', 'litre', 'ml', 'dozen', 'bunch', 'jar', 'pack', 'item']
const CONDITION_UNITS = ['jar', 'litre', 'ml', 'pack']

const HARVEST_POINTS = [
  { name: 'Lonehill Nursery',                  type: 'Nursery',  suburb: 'Lonehill'       },
  { name: 'Fourways Garden Centre',             type: 'Nursery',  suburb: 'Fourways'       },
  { name: 'Broadacres Pharmacy',                type: 'Pharmacy', suburb: 'Broadacres'     },
  { name: 'Dainfern Nursery',                   type: 'Nursery',  suburb: 'Dainfern'       },
  { name: 'Douglasdale Community Church',       type: 'Church',   suburb: 'Douglasdale'    },
  { name: 'Paulshof Methodist Church',          type: 'Church',   suburb: 'Paulshof'       },
  { name: 'Kyalami Corner Café',                type: 'Café',     suburb: 'Kyalami'        },
  { name: 'Winfield Wellness Pharmacy',         type: 'Pharmacy', suburb: 'Winfield'       },
  { name: 'Randburg Nursery and Garden',        type: 'Nursery',  suburb: 'Randburg'       },
  { name: 'Northcliff Community Church',        type: 'Church',   suburb: 'Northcliff'     },
  { name: 'Ferndale Methodist Church',          type: 'Church',   suburb: 'Ferndale'       },
  { name: 'Bloubosrand Garden Centre',          type: 'Nursery',  suburb: 'Bloubosrand'    },
  { name: 'Randpark Ridge Community Church',    type: 'Church',   suburb: 'Randpark Ridge' },
  { name: 'Robindale Pharmacy',                 type: 'Pharmacy', suburb: 'Robindale'      },
  { name: 'Bordeaux Garden Nursery',            type: 'Nursery',  suburb: 'Bordeaux'       },
]

const HP_BADGE: Record<string, { bg: string; color: string }> = {
  Nursery:  { bg: '#E8F4E8', color: '#4A7C59' },
  Church:   { bg: '#EEECFB', color: '#7F77DD' },
  Pharmacy: { bg: '#E6F0FA', color: '#378ADD' },
  Café:     { bg: '#FDF3E0', color: '#BA7517' },
}

const EXPIRY_FRESH     = ['24hrs', '48hrs', '72hrs', '1 week', '10 days']
const EXPIRY_PRESERVED = ['24hrs', '48hrs', '72hrs', '1 week', '10 days', '2 weeks']
const EXPIRY_BOX       = ['24hrs', '48hrs', '72hrs']

const BLOCKED_ADDRESS = [
  /complex/i, /estate/i, /\bunit\b/i, /\bflat\b/i,
  /\bnumber\b/i, /\bplot\b/i, /\bstand\b/i, /\bhouse\b/i,
  /\d+\s+\w+\s+(street|road|avenue|drive|lane|crescent|close|place|str\b|rd\b|ave\b)/i,
]

const STEP_TITLES = [
  'Show your harvest',
  'Your harvest details',
  'How are you sharing?',
  'How will they collect?',
  'Review your listing',
]

const CARD_BADGE: Record<ListingType, { bg: string; color: string }> = {
  GIVE: { bg: '#4A7C59', color: '#fff' },
  SWAP: { bg: '#DECCA6', color: '#2C2A1E' },
  SELL: { bg: '#2C2A1E', color: '#fff' },
}

const INITIAL_FORM: FormState = {
  photos: [null, null, null, null, null],
  produceName: '',
  quantityType: 'estimate',
  quantityValue: '',
  quantityUnit: 'kg',
  estimateOption: 'A small bag',
  description: '',
  condition: 'Fresh',
  listingType: null,
  isHarvestBox: false,
  boxContents: '',
  swapFlexible: true,
  swapWants: '',
  price: '',
  negotiable: false,
  harvestPoints: [],
  meetupEnabled: false,
  meetupLocation: '',
  expiry: '48hrs',
}

// ─── ICONS ────────────────────────────────────────────────────────────────────

const ChevronLeft = ({ s = 20 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)
const CameraIcon = ({ dim = 32 }: { dim?: number }) => (
  <svg width={dim} height={dim} viewBox="0 0 24 24" fill="none" stroke="#B8B68F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)
const PlusIcon = ({ s = 20, c = '#B8B68F' }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const XIcon = ({ s = 13 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const HomeIcon = ({ s = 22, c = 'currentColor' }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)
const CompassIcon = ({ s = 22, c = 'currentColor' }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
)
const AddTabIcon = ({ s = 20, c = 'currentColor' }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const ChatIcon = ({ s = 22, c = 'currentColor' }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)
const PersonIcon = ({ s = 22, c = 'currentColor' }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)
const MapPinTiny = ({ s = 9, c = '#B8B68F' }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
)

// ─── AVATAR ────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#8FA882', '#B8A08F', '#8F9EB8', '#B8988F', '#8FB8A0']
const avatarBg = (n: string) => AVATAR_COLORS[n.charCodeAt(0) % AVATAR_COLORS.length]

// ─── FLOATING INPUT ────────────────────────────────────────────────────────────

function FInput({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  const [focused, setFocused] = useState(false)
  const lifted = focused || value.length > 0
  return (
    <div style={{ position: 'relative' }}>
      <label style={{ position: 'absolute', left: 16, top: lifted ? 9 : '50%', transform: lifted ? 'none' : 'translateY(-50%)', fontSize: lifted ? 10 : 15, color: focused ? '#B8B68F' : '#8E8E93', pointerEvents: 'none', transition: 'all 180ms ease', fontWeight: 500, letterSpacing: lifted ? '0.04em' : 0, zIndex: 1, fontFamily: 'var(--font-inter)' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder={lifted ? placeholder : ''}
        style={{ width: '100%', height: 56, borderRadius: 12, border: 'none', backgroundColor: '#fff', boxShadow: focused ? 'inset 3px 0 0 #B8B68F, 0 0 0 1px rgba(184,182,143,0.35), 0 2px 10px rgba(0,0,0,0.07)' : '0 0 0 1px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.04)', padding: lifted ? '22px 16px 8px' : '0 16px', fontSize: 15, color: '#2C2A1E', outline: 'none', boxSizing: 'border-box', transition: 'box-shadow 180ms ease', fontFamily: 'var(--font-inter)' }} />
    </div>
  )
}

function FTextarea({ label, value, onChange, maxLen = 120 }: {
  label: string; value: string; onChange: (v: string) => void; maxLen?: number
}) {
  const [focused, setFocused] = useState(false)
  const lifted = focused || value.length > 0
  const rem = maxLen - value.length
  return (
    <div style={{ position: 'relative' }}>
      <label style={{ position: 'absolute', left: 16, top: lifted ? 10 : 18, fontSize: lifted ? 10 : 15, color: focused ? '#B8B68F' : '#8E8E93', pointerEvents: 'none', transition: 'all 180ms ease', fontWeight: 500, letterSpacing: lifted ? '0.04em' : 0, zIndex: 1, fontFamily: 'var(--font-inter)' }}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} maxLength={maxLen} rows={3}
        placeholder={lifted ? 'Grown organically? Picked this morning? No pesticides? Tell your neighbour.' : ''}
        style={{ width: '100%', minHeight: 96, borderRadius: 12, border: 'none', backgroundColor: '#fff', boxShadow: focused ? 'inset 3px 0 0 #B8B68F, 0 0 0 1px rgba(184,182,143,0.35), 0 2px 10px rgba(0,0,0,0.07)' : '0 0 0 1px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.04)', padding: lifted ? '24px 16px 12px' : '16px', fontSize: 15, color: '#2C2A1E', outline: 'none', boxSizing: 'border-box', resize: 'none', transition: 'box-shadow 180ms ease', lineHeight: 1.5, fontFamily: 'var(--font-inter)' }} />
      <p style={{ position: 'absolute', right: 12, bottom: 10, fontSize: 11, margin: 0, pointerEvents: 'none', color: rem < 20 ? '#B8B68F' : '#8E8E93', transition: 'color 200ms ease', fontFamily: 'var(--font-inter)' }}>{rem}</p>
    </div>
  )
}

// ─── PILL TOGGLE ──────────────────────────────────────────────────────────────

function PillToggle<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          style={{ flex: 1, height: 44, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-inter)', backgroundColor: value === opt.value ? '#B8B68F' : '#F2F2F7', color: value === opt.value ? '#fff' : '#6B6454', boxShadow: value === opt.value ? '0 2px 8px rgba(184,182,143,0.35)' : 'none', transition: 'all 160ms ease' }}>
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function CreateListingPage() {
  const router = useRouter()
  const fileRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null])

  const [step, setStep] = useState(1)
  const [isTrans, setIsTrans] = useState(false)
  const [transDir, setTransDir] = useState<'fwd' | 'back'>('fwd')
  const [devOpen, setDevOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [showDelight, setShowDelight] = useState(false)
  const [publishing, setPublishing]   = useState(false)
  const [showSheet, setShowSheet] = useState(false)

  const [aiState, setAiState] = useState<AiState>('idle')
  const [aiGuess, setAiGuess] = useState('Tomatoes')

  const [form, setForm] = useState<FormState>({ ...INITIAL_FORM })
  const upd = <K extends keyof FormState>(key: K, val: FormState[K]) => setForm(f => ({ ...f, [key]: val }))

  const photoCount = form.photos.filter(Boolean).length
  const firstPhoto = form.photos.find(Boolean) ?? null

  // Expiry options based on state
  const expiryOptions = form.isHarvestBox ? EXPIRY_BOX : form.condition === 'Preserved' ? EXPIRY_PRESERVED : EXPIRY_FRESH

  const showConditionToggle = form.quantityType === 'measure' && CONDITION_UNITS.includes(form.quantityUnit)

  const meetupError = form.meetupLocation.length > 2 && BLOCKED_ADDRESS.some(p => p.test(form.meetupLocation))
    ? 'Please choose a public place only — a café, nursery, or petrol station. No home or complex addresses.'
    : ''

  const btnEnabled = [
    photoCount >= 2,
    form.produceName.length > 0 && (form.quantityType === 'estimate' || form.quantityValue.length > 0),
    form.listingType !== null,
    form.harvestPoints.length > 0 && !meetupError,
    true,
  ][step - 1]

  const stepPct = (step / 5) * 100

  // Quantity display for preview/summary
  const quantityDisplay = form.quantityType === 'estimate' ? form.estimateOption : `${form.quantityValue} ${form.quantityUnit}`

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const goTo = (next: number, dir: 'fwd' | 'back' = 'fwd') => {
    setTransDir(dir); setIsTrans(true)
    setTimeout(() => { setStep(next); setIsTrans(false) }, 280)
  }

  const handleBack = () => { if (step > 1) goTo(step - 1, 'back'); else router.push('/feed') }

  const handleContinue = async () => {
    if (step < 5) { goTo(step + 1); return }

    // Step 5 — publish listing
    setPublishing(true)
    try {
      // Upload real photo files to Supabase storage
      const uploadPhotos = async (): Promise<string[]> => {
        const urls: string[] = []
        for (const photo of form.photos) {
          if (!photo || photo.startsWith('data:')) {
            // data: URL — skip real upload in prototype, store as-is
            if (photo) urls.push(photo)
            continue
          }
          const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
          const { data } = await supabase.storage.from('harvest-images').upload(fileName, photo)
          if (data) {
            const { data: urlData } = supabase.storage.from('harvest-images').getPublicUrl(fileName)
            urls.push(urlData.publicUrl)
          }
        }
        return urls
      }

      const imageUrls = await uploadPhotos()
      const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }))
      const sessionId = typeof window !== 'undefined' ? localStorage.getItem('harvest_session_id') : null
      const expiresAt = new Date()
      const expiryHours = parseInt(form.expiry?.replace(/\D/g, '') || '48') || 48
      expiresAt.setHours(expiresAt.getHours() + expiryHours)

      await supabase.from('listings').insert({
        grower_id: user?.id ?? null,
        session_id: sessionId,
        produce_name: form.produceName,
        quantity_type: form.quantityType,
        quantity_value: form.quantityType === 'estimate' ? form.estimateOption : `${form.quantityValue} ${form.quantityUnit}`,
        description: form.description,
        listing_type: form.listingType,
        is_harvest_box: form.isHarvestBox,
        box_contents: form.boxContents,
        swap_flexible: form.swapFlexible,
        swap_wants: form.swapWants,
        price: form.price ? parseFloat(form.price) : null,
        negotiable: form.negotiable,
        harvest_points: form.harvestPoints,
        meetup_enabled: form.meetupEnabled,
        meetup_location: form.meetupLocation,
        expiry_hours: expiryHours,
        expires_at: expiresAt.toISOString(),
        status: 'active',
        suburb: user?.user_metadata?.suburb ?? '',
        image_urls: imageUrls,
      })
    } catch {
      // Supabase not configured yet or user not signed in — continue in prototype mode
    } finally {
      setPublishing(false)
    }

    setShowDelight(true)
    setTimeout(() => { setShowDelight(false); setShowSheet(true) }, 2000)
  }

  const handleFileChange = (idx: number, file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const url = e.target?.result as string
      setForm(f => { const p = [...f.photos]; p[idx] = url; return { ...f, photos: p } })
      if (idx === 0 && aiState === 'idle') {
        setAiState('identifying')
        const n = file.name.toLowerCase()
        let guess = 'Fresh produce'
        if (n.includes('tomato')) guess = 'Tomatoes'
        else if (n.includes('apple')) guess = 'Apples'
        else if (n.includes('basil')) guess = 'Fresh basil'
        else if (n.includes('lemon')) guess = 'Lemons'
        else if (n.includes('spinach')) guess = 'Baby spinach'
        else if (n.includes('carrot') || n.includes('harvest')) guess = 'Carrots'
        else if (n.includes('chilli') || n.includes('pepper')) guess = 'Chillies'
        setAiGuess(guess)
        setTimeout(() => setAiState('prompted'), 2000)
      }
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = (idx: number) => {
    setForm(f => { const p = [...f.photos]; p[idx] = null; return { ...f, photos: p } })
    if (idx === 0) { setAiState('idle'); upd('produceName', '') }
  }

  const handleListingTypeSelect = (t: ListingType) => {
    if (form.isHarvestBox && t === 'SWAP') return
    upd('listingType', t)
  }

  const handleHarvestBoxToggle = (on: boolean) => {
    upd('isHarvestBox', on)
    if (on) {
      if (form.listingType === 'SWAP') upd('listingType', null)
      if (!EXPIRY_BOX.includes(form.expiry)) upd('expiry', '48hrs')
    }
  }

  const handleConditionChange = (c: 'Fresh' | 'Preserved') => {
    upd('condition', c)
    const newOptions = c === 'Preserved' ? EXPIRY_PRESERVED : EXPIRY_FRESH
    if (!newOptions.includes(form.expiry)) upd('expiry', c === 'Preserved' ? '1 week' : '48hrs')
  }

  const handleListAnother = () => {
    const saved = { harvestPoints: form.harvestPoints, listingType: form.listingType }
    setForm({ ...INITIAL_FORM, harvestPoints: saved.harvestPoints, listingType: saved.listingType })
    setAiState('idle')
    setShowSheet(false)
    goTo(1)
  }

  // ── Micro-delight ──────────────────────────────────────────────────────────
  if (showDelight) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: '#B8B68F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px', textAlign: 'center', fontFamily: 'var(--font-inter)' }}>
        <p style={{ fontSize: 32, fontWeight: 700, color: '#fff', margin: '0 0 12px', fontFamily: 'var(--font-lora)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>Sharp — you&apos;re live!</p>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.88)', margin: 0, lineHeight: 1.6 }}>Your neighbours can see your harvest now.<br />Eish, that was quick.</p>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100dvh', fontFamily: 'var(--font-inter)' }}>

      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes slideUp  { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
        @keyframes pulse    { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.45; transform:scale(0.7); } }
        .cr-card   { transition: border-color 200ms ease, background-color 200ms ease; }
        .cr-hp     { transition: border-color 160ms ease; }
        .cr-reveal { overflow:hidden; transition: max-height 300ms ease, opacity 300ms ease; }
        .cr-pill button { transition: background-color 160ms ease, color 160ms ease, box-shadow 160ms ease; }
        .cr-seg  button { transition: background-color 150ms ease, color 150ms ease, box-shadow 150ms ease; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }
      `}</style>

      {/* ════ TOP BAR ════ */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, backgroundColor: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
          <button onClick={handleBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', color: '#B8B68F', lineHeight: 0 }}><ChevronLeft /></button>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#2C2A1E', margin: 0, letterSpacing: '-0.02em' }}>{STEP_TITLES[step - 1]}</p>
          <p style={{ fontSize: 12, color: '#8E8E93', margin: 0, minWidth: 52, textAlign: 'right', letterSpacing: '-0.01em' }}>Step {step} of 5</p>
        </div>
        <div style={{ height: 4, backgroundColor: '#DBD3C6' }}>
          <div style={{ height: '100%', backgroundColor: '#B8B68F', width: `${stepPct}%`, transition: 'width 400ms ease' }} />
        </div>
      </header>

      {/* ════ STEP CONTENT ════ */}
      <main style={{ paddingTop: 60, paddingBottom: 148 }}>
        <div style={{ opacity: isTrans ? 0 : 1, transform: isTrans ? (transDir === 'fwd' ? 'translateY(14px)' : 'translateY(-14px)') : 'translateY(0)', transition: 'opacity 280ms ease, transform 280ms ease' }}>

          {/* ─── STEP 1 — Photos ─────────────────────────────────────────── */}
          {step === 1 && (
            <div style={{ padding: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2C2A1E', margin: '0 0 6px', fontFamily: 'var(--font-lora)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>Show us what you&apos;re sharing.</h1>
              <p style={{ fontSize: 14, color: '#6B6454', margin: '0 0 24px', lineHeight: 1.55 }}>Good photos get more neighbours interested. Add at least 2 — natural light, clear shot.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {/* Primary slot */}
                <div style={{ gridColumn: '1 / -1', position: 'relative', cursor: 'pointer' }} onClick={() => !form.photos[0] && fileRefs.current[0]?.click()}>
                  {form.photos[0] ? (
                    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', height: 200 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.photos[0]} alt="p1" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <button onClick={e => { e.stopPropagation(); removePhoto(0) }} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 0 }}><XIcon /></button>
                    </div>
                  ) : (
                    <div style={{ height: 200, borderRadius: 16, border: '1.5px dashed #DBD3C6', backgroundColor: '#FAFAFA', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <CameraIcon />
                      <span style={{ fontSize: 12, color: '#6B6454' }}>Tap to add photo</span>
                    </div>
                  )}
                  <input ref={el => { fileRefs.current[0] = el }} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFileChange(0, f) }} />
                </div>

                {/* Slots 2–5 */}
                {([1, 2, 3, 4] as const).map(idx => (
                  <div key={idx} style={{ position: 'relative', cursor: 'pointer', opacity: idx > 1 && !form.photos[1] ? 0.5 : 1, transition: 'opacity 200ms ease' }} onClick={() => fileRefs.current[idx]?.click()}>
                    {form.photos[idx] ? (
                      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', height: 120 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.photos[idx]!} alt={`p${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <button onClick={e => { e.stopPropagation(); removePhoto(idx) }} style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 0 }}><XIcon s={11} /></button>
                      </div>
                    ) : (
                      <div style={{ height: 120, borderRadius: 12, border: '1.5px dashed #DBD3C6', backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PlusIcon s={22} />
                      </div>
                    )}
                    <input ref={el => { fileRefs.current[idx] = el }} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFileChange(idx, f) }} />
                  </div>
                ))}
              </div>

              {/* AI bar */}
              {aiState !== 'idle' && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: '14px 16px' }}>
                  {aiState === 'identifying' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#B8B68F', animation: 'pulse 1.2s ease infinite', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#6B6454' }}>Identifying your harvest...</span>
                    </div>
                  )}
                  {(aiState === 'prompted' || aiState === 'done') && (
                    <div>
                      <p style={{ fontSize: 13, color: '#2C2A1E', margin: '0 0 10px', fontWeight: 500 }}>Looks like <strong>{aiGuess}</strong> — is that right?</p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { upd('produceName', aiGuess); setAiState('done'); goTo(2) }} style={{ padding: '7px 14px', borderRadius: 20, backgroundColor: '#B8B68F', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-inter)' }}>Yes, sharp</button>
                        <button onClick={() => { setAiState('done'); goTo(2) }} style={{ padding: '7px 14px', borderRadius: 20, backgroundColor: 'transparent', color: '#6B6454', border: '1.5px solid rgba(0,0,0,0.15)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-inter)' }}>Let me type it</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 2 — Details ────────────────────────────────────────── */}
          {step === 2 && (
            <div style={{ padding: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2C2A1E', margin: '0 0 24px', fontFamily: 'var(--font-lora)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>Tell your neighbours what you&apos;ve got.</h1>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <FInput label="Produce name" value={form.produceName} onChange={v => upd('produceName', v)} placeholder="e.g. Cherry tomatoes, Fresh basil, Free range eggs" />

                {/* Quantity mode toggle */}
                <div>
                  <p style={{ fontSize: 11, letterSpacing: '0.08em', color: '#B8B68F', fontWeight: 600, margin: '0 0 10px' }}>HOW MUCH DO YOU HAVE?</p>
                  <div className="cr-pill" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    {([{ value: 'estimate', label: 'Estimate by size' }, { value: 'measure', label: "I'll measure it" }] as { value: QuantityType; label: string }[]).map(opt => (
                      <button key={opt.value} onClick={() => upd('quantityType', opt.value)}
                        style={{ flex: 1, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-inter)', backgroundColor: form.quantityType === opt.value ? '#B8B68F' : '#F2F2F7', color: form.quantityType === opt.value ? '#fff' : '#6B6454', boxShadow: form.quantityType === opt.value ? '0 2px 8px rgba(184,182,143,0.35)' : 'none', transition: 'all 160ms ease' }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Estimate dropdown */}
                  {form.quantityType === 'estimate' && (
                    <div style={{ position: 'relative' }}>
                      <label style={{ position: 'absolute', left: 14, top: 9, fontSize: 10, color: '#8E8E93', fontWeight: 500, letterSpacing: '0.04em', zIndex: 1, pointerEvents: 'none' }}>SIZE</label>
                      <select value={form.estimateOption} onChange={e => upd('estimateOption', e.target.value)}
                        style={{ width: '100%', height: 56, borderRadius: 12, border: 'none', appearance: 'none', backgroundColor: '#fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.04)', padding: '22px 36px 8px 14px', fontSize: 15, color: '#2C2A1E', outline: 'none', cursor: 'pointer', boxSizing: 'border-box', fontFamily: 'var(--font-inter)' }}>
                        {ESTIMATE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
                      </div>
                    </div>
                  )}

                  {/* Measure: number + unit */}
                  {form.quantityType === 'measure' && (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ flex: '0 0 40%' }}>
                        <FInput label="Amount" value={form.quantityValue} onChange={v => upd('quantityValue', v)} type="number" placeholder="e.g. 1" />
                      </div>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <label style={{ position: 'absolute', left: 14, top: 9, fontSize: 10, color: '#8E8E93', fontWeight: 500, letterSpacing: '0.04em', zIndex: 1, pointerEvents: 'none' }}>UNIT</label>
                        <select value={form.quantityUnit} onChange={e => upd('quantityUnit', e.target.value)}
                          style={{ width: '100%', height: 56, borderRadius: 12, border: 'none', appearance: 'none', backgroundColor: '#fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.04)', padding: '22px 32px 8px 14px', fontSize: 15, color: '#2C2A1E', outline: 'none', cursor: 'pointer', boxSizing: 'border-box', fontFamily: 'var(--font-inter)' }}>
                          {MEASURE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <FTextarea label="Description (optional)" value={form.description} onChange={v => upd('description', v)} />

                {/* Condition toggle */}
                <div className="cr-reveal" style={{ maxHeight: showConditionToggle ? 100 : 0, opacity: showConditionToggle ? 1 : 0 }}>
                  <div style={{ paddingTop: 4 }}>
                    <p style={{ fontSize: 11, letterSpacing: '0.08em', color: '#B8B68F', fontWeight: 600, margin: '0 0 10px' }}>FRESH OR PRESERVED?</p>
                    <PillToggle
                      options={[{ value: 'Fresh', label: 'Fresh produce' }, { value: 'Preserved', label: 'Preserved or processed' }]}
                      value={form.condition}
                      onChange={handleConditionChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 3 — Sharing type ───────────────────────────────────── */}
          {step === 3 && (
            <div style={{ padding: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2C2A1E', margin: '0 0 6px', fontFamily: 'var(--font-lora)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>You decide how to share your harvest.</h1>
              <p style={{ fontSize: 14, color: '#6B6454', margin: '0 0 24px', lineHeight: 1.55 }}>Give it away, swap it, or sell it for a fair price.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* GIVE */}
                <div className="cr-card" onClick={() => handleListingTypeSelect('GIVE')}
                  style={{ borderRadius: 16, padding: '18px 20px', cursor: 'pointer', backgroundColor: form.listingType === 'GIVE' ? 'rgba(184,182,143,0.06)' : '#fff', border: form.listingType === 'GIVE' ? '2px solid #B8B68F' : '2px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: '#4A7C59', letterSpacing: '-0.02em', fontFamily: 'var(--font-inter)' }}>GIVE</span>
                    <span style={{ fontSize: 12, color: '#8E8E93' }}>Give it away</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#6B6454', margin: 0, lineHeight: 1.5 }}>Lekker — giving earns you the most community XP and keeps Harvest alive.</p>
                  {form.listingType === 'GIVE' && (
                    <div style={{ marginTop: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: '#4A7C59', color: '#fff', padding: '4px 10px', borderRadius: 20, letterSpacing: '0.04em' }}>GIVE</span>
                    </div>
                  )}
                </div>

                {/* SWAP */}
                <div className="cr-card" onClick={() => handleListingTypeSelect('SWAP')}
                  style={{ borderRadius: 16, padding: '18px 20px', cursor: form.isHarvestBox ? 'default' : 'pointer', opacity: form.isHarvestBox ? 0.45 : 1, backgroundColor: form.listingType === 'SWAP' ? 'rgba(184,182,143,0.06)' : '#fff', border: form.listingType === 'SWAP' ? '2px solid #B8B68F' : '2px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', transition: 'border-color 200ms ease, background-color 200ms ease, opacity 200ms ease' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: '#8A7A2A', letterSpacing: '-0.02em', fontFamily: 'var(--font-inter)' }}>SWAP</span>
                    <span style={{ fontSize: 12, color: '#8E8E93' }}>Trade for something</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#6B6454', margin: 0, lineHeight: 1.5 }}>Tell your neighbours what you&apos;re looking for and we&apos;ll help match you.</p>
                  {form.isHarvestBox && (
                    <p style={{ fontSize: 12, color: '#B8B68F', margin: '8px 0 0', fontStyle: 'italic' }}>Harvest Box is available for Give or Sell only.</p>
                  )}
                  <div className="cr-reveal" style={{ maxHeight: form.listingType === 'SWAP' ? 180 : 0, opacity: form.listingType === 'SWAP' ? 1 : 0 }}>
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div className="cr-pill" style={{ display: 'flex', gap: 8 }}>
                        {([{ value: true, label: 'Flexible — open to offers' }, { value: false, label: 'Specific' }] as { value: boolean; label: string }[]).map(opt => (
                          <button key={String(opt.value)} onClick={e => { e.stopPropagation(); upd('swapFlexible', opt.value) }}
                            style={{ flex: 1, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-inter)', backgroundColor: form.swapFlexible === opt.value ? '#B8B68F' : '#F2F2F7', color: form.swapFlexible === opt.value ? '#fff' : '#6B6454', transition: 'all 160ms ease' }}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      {!form.swapFlexible ? (
                        <input type="text" value={form.swapWants} onClick={e => e.stopPropagation()} onChange={e => upd('swapWants', e.target.value)}
                          placeholder="What are you looking for? e.g. chillies, herbs, eggs"
                          style={{ height: 44, borderRadius: 10, border: 'none', backgroundColor: '#F9F9F9', padding: '0 14px', fontSize: 13, color: '#2C2A1E', outline: 'none', boxShadow: '0 0 0 1px rgba(0,0,0,0.08)', boxSizing: 'border-box', width: '100%', fontFamily: 'var(--font-inter)' }} />
                      ) : (
                        <span style={{ fontSize: 12, backgroundColor: '#DECCA6', color: '#2C2A1E', padding: '5px 12px', borderRadius: 20, fontWeight: 600, letterSpacing: '0.03em', alignSelf: 'flex-start', fontFamily: 'var(--font-inter)' }}>Open to offers</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* SELL */}
                <div className="cr-card" onClick={() => handleListingTypeSelect('SELL')}
                  style={{ borderRadius: 16, padding: '18px 20px', cursor: 'pointer', backgroundColor: form.listingType === 'SELL' ? 'rgba(184,182,143,0.06)' : '#fff', border: form.listingType === 'SELL' ? '2px solid #B8B68F' : '2px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: '#2C2A1E', letterSpacing: '-0.02em', fontFamily: 'var(--font-inter)' }}>SELL</span>
                    <span style={{ fontSize: 12, color: '#8E8E93' }}>Earn a little</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#6B6454', margin: 0, lineHeight: 1.5 }}>Set a fair price. Every rand helps your household and your neighbour eats well.</p>
                  <div className="cr-reveal" style={{ maxHeight: form.listingType === 'SELL' ? 210 : 0, opacity: form.listingType === 'SELL' ? 1 : 0 }}>
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, fontWeight: 600, color: '#2C2A1E', zIndex: 1, fontFamily: 'var(--font-inter)' }}>R</span>
                        <input type="number" value={form.price} onClick={e => e.stopPropagation()} onChange={e => upd('price', e.target.value)} placeholder="e.g. 25"
                          style={{ width: '100%', height: 48, borderRadius: 10, border: 'none', backgroundColor: '#F9F9F9', padding: '0 14px 0 32px', fontSize: 15, color: '#2C2A1E', outline: 'none', boxShadow: '0 0 0 1px rgba(0,0,0,0.08)', boxSizing: 'border-box', fontFamily: 'var(--font-inter)' }} />
                      </div>
                      <div className="cr-pill" style={{ display: 'flex', gap: 8 }}>
                        {([{ value: false, label: 'Fixed price' }, { value: true, label: 'Negotiable — accept offers' }] as { value: boolean; label: string }[]).map(opt => (
                          <button key={String(opt.value)} onClick={e => { e.stopPropagation(); upd('negotiable', opt.value) }}
                            style={{ flex: 1, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-inter)', backgroundColor: form.negotiable === opt.value ? '#B8B68F' : '#F2F2F7', color: form.negotiable === opt.value ? '#fff' : '#6B6454', transition: 'all 160ms ease' }}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      {form.negotiable && (
                        <p style={{ fontSize: 12, color: '#6B6454', margin: 0, fontStyle: 'italic', lineHeight: 1.4, fontFamily: 'var(--font-inter)' }}>Neighbours will see a &apos;Make an offer&apos; button on your listing.</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Harvest Box modifier */}
              <div className="cr-reveal" style={{ maxHeight: form.listingType ? 260 : 0, opacity: form.listingType ? 1 : 0 }}>
                <div style={{ marginTop: 24 }}>
                  <div style={{ height: '0.5px', backgroundColor: 'rgba(0,0,0,0.08)', marginBottom: 20 }} />
                  <p style={{ fontSize: 11, letterSpacing: '0.08em', color: '#B8B68F', fontWeight: 600, margin: '0 0 12px' }}>LISTING TYPE</p>
                  <div className="cr-pill" style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    {[{ value: false, label: 'Single listing' }, { value: true, label: 'Harvest Box — mixed items' }].map(opt => (
                      <button key={String(opt.value)} onClick={() => handleHarvestBoxToggle(opt.value)}
                        style={{ flex: 1, height: 44, borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-inter)', backgroundColor: form.isHarvestBox === opt.value ? '#B8B68F' : '#F2F2F7', color: form.isHarvestBox === opt.value ? '#fff' : '#6B6454', boxShadow: form.isHarvestBox === opt.value ? '0 2px 8px rgba(184,182,143,0.35)' : 'none', transition: 'all 160ms ease' }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: '#8E8E93', margin: '0 0 0', lineHeight: 1.5, fontFamily: 'var(--font-inter)' }}>Got a mix of things? List them together as one Harvest Box.</p>
                  <div className="cr-reveal" style={{ maxHeight: form.isHarvestBox ? 160 : 0, opacity: form.isHarvestBox ? 1 : 0 }}>
                    <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <input type="text" value={form.boxContents} onChange={e => upd('boxContents', e.target.value)}
                        placeholder="What's in the box? e.g. tomatoes, herbs, a lemon, courgettes"
                        style={{ height: 52, borderRadius: 12, border: 'none', backgroundColor: '#fff', padding: '0 16px', fontSize: 14, color: '#2C2A1E', outline: 'none', boxShadow: '0 0 0 1px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.04)', boxSizing: 'border-box', width: '100%', fontFamily: 'var(--font-inter)' }} />
                      <p style={{ fontSize: 12, color: '#B8B68F', margin: 0, lineHeight: 1.5, fontFamily: 'var(--font-inter)' }}>
                        Expiry will be set to 48hrs max — fresh boxes move fast.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 4 — Collection ─────────────────────────────────────── */}
          {step === 4 && (
            <div style={{ padding: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2C2A1E', margin: '0 0 6px', fontFamily: 'var(--font-lora)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>Choose your Harvest Points.</h1>
              <p style={{ fontSize: 14, color: '#6B6454', margin: '0 0 24px', lineHeight: 1.55 }}>Harvest Points are safe, trusted spots — local nurseries and churches near you. No strangers at your gate.</p>

              <p style={{ fontSize: 11, letterSpacing: '0.08em', color: '#B8B68F', fontWeight: 600, margin: '0 0 12px' }}>YOUR HARVEST POINTS</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                {HARVEST_POINTS.map(pt => {
                  const active = form.harvestPoints.includes(pt.name)
                  const badge = HP_BADGE[pt.type]
                  return (
                    <div key={pt.name} className="cr-hp"
                      onClick={() => upd('harvestPoints', active ? form.harvestPoints.filter(n => n !== pt.name) : [...form.harvestPoints, pt.name])}
                      style={{ borderRadius: 12, padding: '13px 16px', cursor: 'pointer', backgroundColor: '#fff', border: active ? '1.5px solid #B8B68F' : '1.5px solid rgba(0,0,0,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#2C2A1E', margin: '0 0 2px', letterSpacing: '-0.01em', fontFamily: 'var(--font-inter)' }}>{pt.name}</p>
                        <p style={{ fontSize: 11, color: '#8E8E93', margin: 0, fontFamily: 'var(--font-inter)' }}>{pt.suburb}</p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, backgroundColor: badge.bg, color: badge.color, padding: '4px 9px', borderRadius: 20, flexShrink: 0, fontFamily: 'var(--font-inter)' }}>{pt.type}</span>
                    </div>
                  )
                })}
              </div>
              <button onClick={() => showToast('Sharp — we\'ll review your suggestion and add it soon.')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#B8B68F', padding: '4px 0', marginBottom: 24, fontFamily: 'var(--font-inter)' }}>
                + Suggest a Harvest Point
              </button>

              <div style={{ height: '0.5px', backgroundColor: 'rgba(0,0,0,0.08)', marginBottom: 24 }} />

              {/* Meetup */}
              <p style={{ fontSize: 11, letterSpacing: '0.08em', color: '#B8B68F', fontWeight: 600, margin: '0 0 14px' }}>DIRECT MEETUP (OPTIONAL)</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#2C2A1E', margin: '0 0 2px', fontFamily: 'var(--font-inter)' }}>I&apos;m also open to a public meetup</p>
                  <p style={{ fontSize: 12, color: '#8E8E93', margin: 0, fontFamily: 'var(--font-inter)', lineHeight: 1.4 }}>Your neighbour can request a meetup — you can accept or decline. Public places only.</p>
                </div>
                <div onClick={() => upd('meetupEnabled', !form.meetupEnabled)}
                  style={{ width: 48, height: 28, borderRadius: 14, cursor: 'pointer', flexShrink: 0, marginLeft: 16, backgroundColor: form.meetupEnabled ? '#B8B68F' : '#E0E0E0', position: 'relative', transition: 'background-color 200ms ease' }}>
                  <div style={{ position: 'absolute', top: 3, left: form.meetupEnabled ? 23 : 3, width: 22, height: 22, borderRadius: '50%', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.18)', transition: 'left 200ms ease' }} />
                </div>
              </div>
              <div className="cr-reveal" style={{ maxHeight: form.meetupEnabled ? 130 : 0, opacity: form.meetupEnabled ? 1 : 0 }}>
                <div style={{ paddingTop: 14 }}>
                  <input type="text" value={form.meetupLocation} onChange={e => upd('meetupLocation', e.target.value)}
                    placeholder="e.g. Fourways Pick n Pay, Lonehill Engen"
                    style={{ width: '100%', height: 52, borderRadius: 12, border: 'none', boxSizing: 'border-box', backgroundColor: '#fff', padding: '0 16px', fontSize: 14, color: '#2C2A1E', outline: 'none', boxShadow: meetupError ? '0 0 0 2px #E24B4A' : '0 0 0 1px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 180ms ease', fontFamily: 'var(--font-inter)' }} />
                  {meetupError && <p style={{ fontSize: 12, color: '#E24B4A', margin: '8px 0 0', lineHeight: 1.5, fontFamily: 'var(--font-inter)' }}>{meetupError}</p>}
                </div>
              </div>

              <div style={{ height: '0.5px', backgroundColor: 'rgba(0,0,0,0.08)', margin: '24px 0' }} />

              {/* Expiry */}
              <p style={{ fontSize: 11, letterSpacing: '0.08em', color: '#B8B68F', fontWeight: 600, margin: '0 0 6px' }}>HOW LONG SHOULD THIS LISTING STAY LIVE?</p>
              <p style={{ fontSize: 13, color: '#6B6454', margin: '0 0 14px', lineHeight: 1.5, fontFamily: 'var(--font-inter)' }}>Fresh produce moves fast — don&apos;t leave it too long.</p>
              {form.isHarvestBox && (
                <p style={{ fontSize: 12, color: '#B8B68F', margin: '0 0 12px', fontStyle: 'italic', fontFamily: 'var(--font-inter)' }}>Harvest Boxes expire sooner to keep things fresh.</p>
              )}
              <div className="cr-seg" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {expiryOptions.map(opt => (
                  <button key={opt} onClick={() => upd('expiry', opt)}
                    style={{ height: 36, padding: '0 14px', borderRadius: 18, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-inter)', backgroundColor: form.expiry === opt ? '#B8B68F' : '#DBD3C6', color: form.expiry === opt ? '#fff' : '#6B6454', boxShadow: form.expiry === opt ? '0 2px 8px rgba(184,182,143,0.4)' : 'none', transition: 'all 150ms ease' }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── STEP 5 — Review ─────────────────────────────────────────── */}
          {step === 5 && (
            <div style={{ padding: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#2C2A1E', margin: '0 0 6px', fontFamily: 'var(--font-lora)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>Looking good — ready to go live?</h1>
              <p style={{ fontSize: 14, color: '#6B6454', margin: '0 0 24px', lineHeight: 1.55 }}>This is exactly how your neighbours will see it.</p>

              {/* Live preview card */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
                <div style={{ width: '100%', maxWidth: 320, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ position: 'relative', height: 180, backgroundColor: '#F5F5F7' }}>
                    {firstPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={firstPhoto} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CameraIcon dim={36} />
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: 10, left: 10, width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.9)', backgroundColor: avatarBg('You'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.18)', fontFamily: 'var(--font-inter)' }}>Y</div>
                    {form.listingType && (() => {
                      const badge = CARD_BADGE[form.listingType]
                      const label = form.isHarvestBox ? `${form.listingType} BOX` : form.listingType
                      return <div style={{ position: 'absolute', top: 10, right: 10, backgroundColor: badge.bg, color: badge.color, borderRadius: 6, padding: '4px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', boxShadow: '0 1px 4px rgba(0,0,0,0.14)', fontFamily: 'var(--font-inter)' }}>{label}</div>
                    })()}
                  </div>
                  <div style={{ padding: '12px 14px 14px' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1C1C1E', margin: '0 0 3px', letterSpacing: '-0.01em', fontFamily: 'var(--font-inter)' }}>{form.produceName || 'Your produce'}</p>
                    <p style={{ fontSize: 12, color: '#6B6454', margin: '0 0 3px', fontFamily: 'var(--font-inter)' }}>{quantityDisplay} · Fourways</p>
                    <p style={{ fontSize: 11, color: '#8E8E93', margin: '0 0 4px', fontFamily: 'var(--font-inter)' }}>You · <span style={{ color: '#B8B68F' }}>★</span> New Grower · —</p>
                    {form.listingType === 'SELL' && form.price && (
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#1C1C1E', margin: '0 0 4px', fontFamily: 'var(--font-inter)' }}>R{form.price}</p>
                    )}
                    {form.listingType === 'SWAP' && (
                      <p style={{ fontSize: 11, color: '#6B6454', fontStyle: 'italic', margin: '0 0 4px', fontFamily: 'var(--font-inter)' }}>
                        {form.swapFlexible ? 'Open to offers' : form.swapWants ? `Looking for: ${form.swapWants}` : 'Open to offers'}
                      </p>
                    )}
                    {form.harvestPoints[0] && (
                      <p style={{ fontSize: 11, color: '#8E8E93', fontStyle: 'italic', margin: 0, display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-inter)' }}>
                        <MapPinTiny /> {form.harvestPoints[0]}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div style={{ backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', marginBottom: 16 }}>
                {[
                  { label: 'Photos',         value: `${photoCount} photo${photoCount !== 1 ? 's' : ''}`,  editStep: 1 },
                  { label: 'Produce',         value: form.produceName || '—',                               editStep: 2 },
                  { label: 'Quantity',         value: quantityDisplay,                                       editStep: 2 },
                  { label: 'Sharing type',     value: form.listingType ? (form.isHarvestBox ? `${form.listingType} BOX` : form.listingType) : '—', editStep: 3 },
                  {
                    label: form.listingType === 'SELL' ? 'Price' : form.listingType === 'SWAP' ? 'Swap for' : 'Details',
                    value: form.listingType === 'SELL'
                      ? (form.price ? `R${form.price}${form.negotiable ? ' (negotiable)' : ''}` : '—')
                      : form.listingType === 'SWAP'
                        ? (form.swapFlexible ? 'Open to offers' : form.swapWants || '—')
                        : 'Free',
                    editStep: 3,
                  },
                  { label: 'Harvest Points',  value: form.harvestPoints.length > 0 ? form.harvestPoints[0] + (form.harvestPoints.length > 1 ? ` +${form.harvestPoints.length - 1}` : '') : '—', editStep: 4 },
                  { label: 'Meetup',           value: form.meetupEnabled ? (form.meetupLocation || 'Yes') : 'No',  editStep: 4 },
                  { label: 'Expires',          value: form.expiry,                                                  editStep: 4 },
                ].map((row, i, arr) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: i < arr.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none' }}>
                    <span style={{ fontSize: 12, color: '#8E8E93', fontFamily: 'var(--font-inter)' }}>{row.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontSize: 13, color: '#2C2A1E', fontWeight: 500, maxWidth: 180, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-inter)' }}>{row.value}</span>
                      <button onClick={() => goTo(row.editStep, 'back')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#B8B68F', fontWeight: 600, padding: 0, flexShrink: 0, fontFamily: 'var(--font-inter)' }}>Edit</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Community promise */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 8 }}>
                <p style={{ fontSize: 13, color: '#6B6454', margin: 0, lineHeight: 1.6, fontFamily: 'var(--font-inter)' }}>
                  By sharing you confirm this is homegrown or homemade. No reselling of shop-bought goods. Be a good neighbour — honest photos and accurate descriptions only.
                </p>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ════ CTA BUTTON ════ */}
      <div style={{ position: 'fixed', bottom: 76, left: 0, right: 0, padding: '0 16px', zIndex: 90 }}>
        <button onClick={handleContinue} disabled={!btnEnabled || publishing}
          style={{ width: '100%', height: 56, borderRadius: 16, backgroundColor: btnEnabled && !publishing ? '#B8B68F' : '#DBD3C6', color: '#fff', border: 'none', cursor: btnEnabled && !publishing ? 'pointer' : 'default', fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', transition: 'background-color 200ms ease', boxShadow: btnEnabled && !publishing ? '0 4px 16px rgba(184,182,143,0.45)' : 'none', fontFamily: 'var(--font-inter)' }}>
          {publishing ? 'Going live...' : step === 4 ? 'Preview my listing' : step === 5 ? 'Go live — sharp' : 'Continue'}
        </button>
      </div>

      {/* ════ BOTTOM TAB BAR ════ */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 68, backgroundColor: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '0.5px solid rgba(0,0,0,0.08)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 8px' }}>
        <button onClick={() => router.push('/feed')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 10px' }}>
          <HomeIcon c="#8E8E93" /><span style={{ fontSize: 10, color: '#8E8E93', fontFamily: 'var(--font-inter)' }}>Home</span>
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 10px' }}>
          <CompassIcon c="#8E8E93" /><span style={{ fontSize: 10, color: '#8E8E93', fontFamily: 'var(--font-inter)' }}>Discover</span>
        </button>
        <div style={{ position: 'relative', marginTop: -22 }}>
          <button style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#2C2A1E', border: '3px solid #FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 18px rgba(44,42,30,0.35)', lineHeight: 0 }}>
            <AddTabIcon c="#fff" />
          </button>
        </div>
        <button onClick={() => router.push('/messages')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 10px' }}>
          <ChatIcon c="#8E8E93" /><span style={{ fontSize: 10, color: '#8E8E93', fontFamily: 'var(--font-inter)' }}>Messages</span>
        </button>
        <button onClick={() => router.push('/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 10px' }}>
          <PersonIcon c="#8E8E93" /><span style={{ fontSize: 10, color: '#8E8E93', fontFamily: 'var(--font-inter)' }}>Profile</span>
        </button>
      </nav>

      {/* ════ TOAST ════ */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#1C1C1E', color: '#fff', fontSize: 12, padding: '12px 20px', borderRadius: 14, zIndex: 400, maxWidth: 'calc(100vw - 48px)', textAlign: 'center', boxShadow: '0 8px 28px rgba(0,0,0,0.22)', whiteSpace: 'nowrap', animation: 'fadeInUp 200ms ease', letterSpacing: '-0.01em', fontFamily: 'var(--font-inter)' }}>
          {toast}
        </div>
      )}

      {/* ════ POST-PUBLISH BOTTOM SHEET ════ */}
      {showSheet && (
        <>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 300 }} onClick={() => { setShowSheet(false); router.push('/feed') }} />
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 400, backgroundColor: '#fff', borderRadius: '20px 20px 0 0', padding: '28px 24px 48px', animation: 'slideUp 300ms ease' }}>
            <div style={{ width: 36, height: 4, backgroundColor: '#DBD3C6', borderRadius: 2, margin: '0 auto 24px' }} />
            <p style={{ fontSize: 20, fontWeight: 700, color: '#2C2A1E', margin: '0 0 6px', fontFamily: 'var(--font-lora)', letterSpacing: '-0.02em', textAlign: 'center' }}>Got more to share from your garden?</p>
            <p style={{ fontSize: 14, color: '#6B6454', margin: '0 0 24px', textAlign: 'center', lineHeight: 1.5, fontFamily: 'var(--font-inter)' }}>Your listing is live. What would you like to do next?</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleListAnother}
                style={{ flex: 1, height: 52, borderRadius: 14, backgroundColor: 'transparent', color: '#B8B68F', border: '2px solid #B8B68F', cursor: 'pointer', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-inter)', letterSpacing: '-0.02em', transition: 'background-color 180ms ease' }}>
                List another
              </button>
              <button onClick={() => router.push('/feed')}
                style={{ flex: 1, height: 52, borderRadius: 14, backgroundColor: '#B8B68F', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-inter)', letterSpacing: '-0.02em', boxShadow: '0 4px 16px rgba(184,182,143,0.45)' }}>
                I&apos;m done — show my feed
              </button>
            </div>
          </div>
        </>
      )}

      {/* ════ DEV TOOLBAR ════ */}
      <div style={{ position: 'fixed', left: devOpen ? 0 : -180, top: '40%', zIndex: 500, transition: 'left 280ms ease' }}>
        <div style={{ backgroundColor: '#1C1C1E', borderRadius: '0 12px 12px 0', padding: '12px 14px', minWidth: 180 }}>
          <p style={{ fontSize: 10, color: '#8E8E93', margin: '0 0 10px', letterSpacing: '0.08em', fontWeight: 600, fontFamily: 'var(--font-inter)' }}>DEV LINKS</p>
          {[['/', 'Landing'], ['/onboarding', 'Onboarding'], ['/feed', 'Feed'], ['/create-listing', 'Create listing']].map(([href, label]) => (
            <button key={href} onClick={() => router.push(href)}
              style={{ display: 'block', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#fff', padding: '5px 0', textAlign: 'left', width: '100%', fontWeight: href === '/create-listing' ? 700 : 400, fontFamily: 'var(--font-inter)' }}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={() => setDevOpen(o => !o)}
          style={{ position: 'absolute', right: -28, top: '50%', transform: 'translateY(-50%)', backgroundColor: '#1C1C1E', color: '#8E8E93', border: 'none', cursor: 'pointer', borderRadius: '0 8px 8px 0', padding: '10px 6px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', writingMode: 'vertical-lr', fontFamily: 'var(--font-inter)' }}>
          DEV
        </button>
      </div>

    </div>
  )
}
