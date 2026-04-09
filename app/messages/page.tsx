'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DevToolbar } from '../components/DevToolbar'

// ─── TYPES ────────────────────────────────────────────────────────────────────
type ListingType = 'GIVE' | 'SWAP' | 'SELL'
type ThreadState = 'PENDING' | 'ACCEPTED' | 'CODE_SHARED' | 'COLLECTED' | 'COMPLETED' | 'MEETUP_REQUESTED'
type MsgKind = 'buyer' | 'lister' | 'system' | 'code' | 'rating'

interface Msg {
  id: string
  kind: MsgKind
  text?: string
  sender?: string
  senderInitial?: string
}

interface Thread {
  id: number
  grower: string
  initial: string
  suburb: string
  avatarColor: string
  listingType: ListingType
  produce: string
  price?: string
  harvestPoint: string
  expiry: string
  image: string
  lastMsg: string
  time: string
  unread: boolean
  tab: 'growing' | 'harvested'
  state: ThreadState
  rating?: number
  reviewText?: string
  messages: Msg[]
}

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
const INITIAL_THREADS: Thread[] = [
  {
    id: 1,
    grower: 'Sipho M.', initial: 'S', suburb: 'Lonehill',
    avatarColor: '#DECCA6',
    listingType: 'SWAP', produce: 'Bramley apples', price: undefined,
    harvestPoint: 'Fourways Garden Centre', expiry: 'Expires in 2 days',
    image: '/images/feed/pink-with-stripes-fresh-apples-from-branches-in-wo-2026-01-05-23-23-48-utc.jpg',
    lastMsg: 'Waiting for Sipho to respond...', time: '2m ago', unread: true,
    tab: 'growing', state: 'PENDING',
    messages: [
      { id: 'm1', kind: 'system', text: 'You requested Sipho\'s Bramley apples — waiting for response.' },
    ],
  },
  {
    id: 2,
    grower: 'Thabo M.', initial: 'T', suburb: 'Fourways',
    avatarColor: '#B8B68F',
    listingType: 'SELL', produce: 'Homemade chutney', price: 'R35/jar',
    harvestPoint: 'Lonehill Nursery', expiry: 'Expires in 2 days',
    image: '/images/feed/whats-your-cup-of-tea-2026-01-09-11-02-53-utc.jpg',
    lastMsg: 'Sharp — your collection code is ready.', time: '1h ago', unread: true,
    tab: 'growing', state: 'CODE_SHARED',
    messages: [
      { id: 'm1', kind: 'system', text: 'You requested Thabo\'s homemade chutney — waiting for response.' },
      { id: 'm2', kind: 'system', text: 'Thabo accepted your request — sharp!' },
      { id: 'm3', kind: 'lister', text: 'Lekker! I\'ll drop it at Lonehill Nursery tomorrow morning before 9.', sender: 'Thabo M.', senderInitial: 'T' },
      { id: 'm4', kind: 'buyer', text: 'Perfect — I\'ll collect after work. Sharp.' },
      { id: 'm5', kind: 'lister', text: 'Sharp — your collection code is ready.', sender: 'Thabo M.', senderInitial: 'T' },
      { id: 'm6', kind: 'code' },
      { id: 'm7', kind: 'system', text: 'Waiting for you to confirm collection.' },
    ],
  },
  {
    id: 3,
    grower: 'Kagiso N.', initial: 'K', suburb: 'Paulshof',
    avatarColor: '#4A7C59',
    listingType: 'GIVE', produce: 'Baby spinach', price: undefined,
    harvestPoint: 'Paulshof Community Church', expiry: 'Expires today',
    image: '/images/feed/organic-produce-2026-01-09-11-03-55-utc.jpg',
    lastMsg: 'Lekker! Code is 4829 — collect anytime today.', time: '3h ago', unread: false,
    tab: 'growing', state: 'CODE_SHARED',
    messages: [
      { id: 'm1', kind: 'system', text: 'You requested Kagiso\'s baby spinach — waiting for response.' },
      { id: 'm2', kind: 'system', text: 'Kagiso accepted your request — sharp!' },
      { id: 'm3', kind: 'lister', text: 'Lekker! Code is 4829 — collect anytime today.', sender: 'Kagiso N.', senderInitial: 'K' },
      { id: 'm4', kind: 'code' },
    ],
  },
  {
    id: 4,
    grower: 'Anke V.', initial: 'A', suburb: 'Broadacres',
    avatarColor: '#8A7A2A',
    listingType: 'SELL', produce: 'Fresh basil', price: 'R15/bunch',
    harvestPoint: 'Broadacres Pharmacy', expiry: 'Completed · April 2025',
    image: '/images/feed/woman-wearing-gardening-gloves-transplanting-flowe-2026-03-24-07-37-21-utc.jpg',
    lastMsg: 'Collected — lekker! Thanks Anke.', time: 'Apr 2025', unread: false,
    tab: 'harvested', state: 'COMPLETED',
    rating: 5, reviewText: 'Collected — lekker! Thanks Anke.',
    messages: [
      { id: 'm1', kind: 'system', text: 'You purchased Anke\'s fresh basil — R15/bunch.' },
      { id: 'm2', kind: 'system', text: 'Anke accepted — sharp!' },
      { id: 'm3', kind: 'lister', text: 'Hi! Your basil is ready at Broadacres Pharmacy. Just show your code.', sender: 'Anke V.', senderInitial: 'A' },
      { id: 'm4', kind: 'code' },
      { id: 'm5', kind: 'system', text: 'Collected — lekker! Rating time.' },
      { id: 'm6', kind: 'system', text: 'You rated Anke ★★★★★. 50 XP earned.' },
    ],
  },
  {
    id: 5,
    grower: 'Mpho D.', initial: 'M', suburb: 'Douglasdale',
    avatarColor: '#4A7C59',
    listingType: 'SWAP', produce: 'Unwaxed lemons', price: undefined,
    harvestPoint: 'Douglasdale Engen', expiry: 'Completed · April 2025',
    image: '/images/feed/the-first-batch-of-lemons-2026-03-25-04-08-17-utc.jpg',
    lastMsg: 'Great swap — my chillies for her lemons. Sharp.', time: 'Apr 2025', unread: false,
    tab: 'harvested', state: 'COMPLETED',
    rating: 5, reviewText: 'Great swap — my chillies for her lemons. Sharp.',
    messages: [
      { id: 'm1', kind: 'system', text: 'You offered to swap with Mpho — waiting for response.' },
      { id: 'm2', kind: 'system', text: 'Mpho accepted your swap — sharp!' },
      { id: 'm3', kind: 'lister', text: 'Lekker — I\'ll bring the lemons to Douglasdale Engen Saturday morning.', sender: 'Mpho D.', senderInitial: 'M' },
      { id: 'm4', kind: 'buyer', text: 'Perfect, I\'ll bring the chillies. See you there!' },
      { id: 'm5', kind: 'system', text: 'Both parties confirmed collection — swap complete!' },
      { id: 'm6', kind: 'system', text: 'You rated Mpho ★★★★★. 50 XP earned.' },
    ],
  },
]

const BADGE_STYLE: Record<ListingType, React.CSSProperties> = {
  GIVE: { backgroundColor: '#4A7C59', color: '#fff' },
  SWAP: { backgroundColor: '#DECCA6', color: '#2C2A1E' },
  SELL: { backgroundColor: '#2C2A1E', color: '#fff' },
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = {
  Back: ({ c = '#2C2A1E' }: { c?: string }) => (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Search: ({ c = '#6B6454' }: { c?: string }) => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke={c} strokeWidth={1.8} />
      <path d="M20 20l-3-3" stroke={c} strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  ),
  More: ({ c = '#6B6454' }: { c?: string }) => (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5" r="1.5" fill={c} /><circle cx="12" cy="12" r="1.5" fill={c} /><circle cx="12" cy="19" r="1.5" fill={c} />
    </svg>
  ),
  Chevron: ({ c = '#B8B68F', d = 'down' }: { c?: string; d?: 'down' | 'up' }) => (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <path d={d === 'down' ? 'M6 9l6 6 6-6' : 'M6 15l6-6 6 6'} stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Send: ({ c = '#fff' }: { c?: string }) => (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Star: ({ filled = true }: { filled?: boolean }) => (
    <svg width={28} height={28} viewBox="0 0 24 24" fill={filled ? '#DECCA6' : 'none'} stroke="#DECCA6" strokeWidth={1.5}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  Home: ({ c = '#8E8E93' }: { c?: string }) => (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke={c} strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M9 21V12h6v9" stroke={c} strokeWidth={1.8} strokeLinejoin="round" />
    </svg>
  ),
  Compass: ({ c = '#8E8E93' }: { c?: string }) => (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth={1.8} />
      <path d="M16.5 7.5l-3 6-3 1.5 1.5-3 3-6 1.5 1.5z" stroke={c} strokeWidth={1.8} strokeLinejoin="round" />
    </svg>
  ),
  Plus: ({ c = '#fff' }: { c?: string }) => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke={c} strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  ),
  Chat: ({ c = '#8E8E93' }: { c?: string }) => (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke={c} strokeWidth={1.8} strokeLinejoin="round" />
    </svg>
  ),
  Person: ({ c = '#8E8E93' }: { c?: string }) => (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={c} strokeWidth={1.8} />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={c} strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  ),
}

// ─── RATING CARD ──────────────────────────────────────────────────────────────
function RatingCard({ grower, onSubmit }: { grower: string; onSubmit: () => void }) {
  const [stars, setStars]   = useState(0)
  const [tags, setTags]     = useState<string[]>([])
  const TAGS = ['Accurate listing', 'Great quality', 'Friendly grower']
  const toggleTag = (t: string) => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
      <div style={{ backgroundColor: '#fff', border: '1.5px solid #DECCA6', borderRadius: 12, padding: 20, maxWidth: 280, width: '100%', textAlign: 'center' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#2C2A1E', margin: '0 0 4px', fontFamily: 'var(--font-lora)' }}>Rate this swap</p>
        <p style={{ fontSize: 12, color: '#6B6454', margin: '0 0 14px', lineHeight: 1.4 }}>How was your experience with {grower}?</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 14 }}>
          {[1,2,3,4,5].map(i => (
            <button key={i} onClick={() => setStars(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
              <Icon.Star filled={i <= stars} />
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 14 }}>
          {TAGS.map(t => (
            <button key={t} onClick={() => toggleTag(t)} style={{
              fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 16,
              border: 'none', cursor: 'pointer',
              backgroundColor: tags.includes(t) ? '#B8B68F' : '#DBD3C6',
              color: tags.includes(t) ? '#fff' : '#6B6454',
              transition: 'all 200ms ease', fontFamily: 'var(--font-inter)',
            }}>{t}</button>
          ))}
        </div>
        <button onClick={onSubmit} disabled={stars === 0} style={{
          width: '100%', height: 40, borderRadius: 10,
          backgroundColor: stars > 0 ? '#B8B68F' : '#DBD3C6',
          color: '#fff', border: 'none', fontSize: 13, fontWeight: 600,
          cursor: stars > 0 ? 'pointer' : 'default', transition: 'all 200ms ease',
          fontFamily: 'var(--font-inter)',
        }}>Submit rating</button>
      </div>
    </div>
  )
}

// ─── CODE CARD ────────────────────────────────────────────────────────────────
function CodeCard({ harvestPoint, onCopy }: { harvestPoint: string; onCopy: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
      <div style={{ backgroundColor: '#fff', border: '1.5px solid #B8B68F', borderRadius: 12, padding: '20px 24px', maxWidth: 240, width: '100%', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: '#6B6454', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-inter)' }}>Your collection code</p>
        <p style={{ fontSize: 36, fontWeight: 700, color: '#B8B68F', margin: '0 0 6px', fontFamily: 'var(--font-lora)', letterSpacing: '0.08em' }}>4829</p>
        <p style={{ fontSize: 12, color: '#6B6454', margin: '0 0 12px', lineHeight: 1.4, fontFamily: 'var(--font-inter)' }}>Show this at {harvestPoint}</p>
        <button onClick={onCopy} style={{ background: 'none', border: 'none', color: '#B8B68F', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-inter)' }}>Copy code</button>
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const router = useRouter()

  const [view,          setView]          = useState<'inbox' | 'thread'>('inbox')
  const [activeTab,     setActiveTab]     = useState<'growing' | 'harvested'>('growing')
  const [activeThread,  setActiveThread]  = useState<Thread | null>(null)
  const [threads,       setThreads]       = useState<Thread[]>(INITIAL_THREADS)
  const [threadState,   setThreadState]   = useState<ThreadState>('PENDING')
  const [messages,      setMessages]      = useState<Msg[]>([])
  const [inputValue,    setInputValue]    = useState('')
  const [bannerOpen,    setBannerOpen]    = useState(false)
  const [ratingDone,    setRatingDone]    = useState(false)
  const [toast,         setToast]         = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef    = useRef<HTMLTextAreaElement>(null)

  // auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const openThread = (thread: Thread) => {
    setActiveThread(thread)
    setThreadState(thread.state)
    setMessages(thread.messages)
    setRatingDone(thread.state === 'COMPLETED')
    // pre-fill input for pending threads
    if (thread.state === 'PENDING') {
      setInputValue(`Hi ${thread.grower.split(' ')[0]} — I'd love your ${thread.produce}. Can I collect from ${thread.harvestPoint}? Sharp.`)
    } else {
      setInputValue('')
    }
    setView('thread')
    setBannerOpen(false)
  }

  const addMsg = (msg: Msg) => setMessages(prev => [...prev, msg])

  const sendMessage = () => {
    if (!inputValue.trim()) return
    addMsg({ id: `u${Date.now()}`, kind: 'buyer', text: inputValue.trim() })
    setInputValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleQuickAction = (action: string) => {
    if (!activeThread) return
    switch (action) {
      case 'accept':
        addMsg({ id: `s${Date.now()}`, kind: 'system', text: 'You accepted — sharp!' })
        setThreadState('ACCEPTED')
        break
      case 'decline':
        addMsg({ id: `s${Date.now()}`, kind: 'system', text: 'You declined. The listing is still available to others.' })
        setTimeout(() => setView('inbox'), 800)
        break
      case 'dropped':
        addMsg({ id: `s${Date.now()}`, kind: 'system', text: `You've dropped your harvest at ${activeThread.harvestPoint} — your neighbour has been notified.` })
        addMsg({ id: `c${Date.now()}`, kind: 'code' })
        setThreadState('CODE_SHARED')
        break
      case 'collected':
        addMsg({ id: `s${Date.now()}`, kind: 'system', text: 'Collected — lekker! Rating time.' })
        if (!ratingDone) addMsg({ id: `r${Date.now()}`, kind: 'rating' })
        setThreadState('COLLECTED')
        break
      case 'rate':
        setThreadState('COMPLETED')
        setRatingDone(true)
        break
      default:
        showToast('Coming soon — sharp.')
    }
  }

  const handleRatingSubmit = () => {
    showToast('Lekker — rating submitted! You earned 50 XP.')
    setRatingDone(true)
    addMsg({ id: `s${Date.now()}`, kind: 'system', text: 'Rating submitted — you earned 50 XP.' })
    setThreadState('COMPLETED')
    // update thread in list
    if (activeThread) {
      setThreads(prev => prev.map(t => t.id === activeThread.id ? { ...t, state: 'COMPLETED', tab: 'harvested' } : t))
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'
  }

  const growingThreads   = threads.filter(t => t.tab === 'growing')
  const harvestedThreads = threads.filter(t => t.tab === 'harvested')
  const displayedThreads = activeTab === 'growing' ? growingThreads : harvestedThreads

  // ─── INBOX ──────────────────────────────────────────────────────────────────
  if (view === 'inbox') return (
    <div style={{ backgroundColor: '#EBE6D2', minHeight: '100dvh', fontFamily: 'var(--font-inter)', paddingBottom: 80 }}>

      {/* Top bar */}
      <header style={{ position: 'sticky', top: 0, backgroundColor: '#EBE6D2', zIndex: 90, borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#2C2A1E', margin: 0, fontFamily: 'var(--font-lora)', letterSpacing: '-0.02em' }}>Messages</h1>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}>
            <Icon.Search />
          </button>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', padding: '0 20px', gap: 24 }}>
          {(['growing', 'harvested'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 0', fontSize: 14,
              fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? '#2C2A1E' : '#6B6454',
              borderBottom: `2px solid ${activeTab === tab ? '#B8B68F' : 'transparent'}`,
              transition: 'all 200ms ease', fontFamily: 'var(--font-inter)',
              textTransform: 'capitalize', letterSpacing: '-0.01em',
            }}>{tab === 'growing' ? 'Growing' : 'Harvested'}</button>
          ))}
        </div>
      </header>

      {/* Thread list */}
      <div style={{ padding: '12px 0' }}>
        {displayedThreads.length === 0 ? (
          <div style={{ margin: '32px 16px', border: '1.5px dashed #B8B68F', borderRadius: 12, padding: '36px 24px', textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, backgroundColor: '#B8B68F', opacity: 0.35, borderRadius: '80% 20% 80% 20%', transform: 'rotate(-45deg)', margin: '0 auto 14px' }} />
            <p style={{ fontSize: 14, color: '#6B6454', margin: '0 0 6px', fontWeight: 600 }}>No conversations yet</p>
            <p style={{ fontSize: 13, color: '#6B6454', margin: '0 0 16px', lineHeight: 1.5 }}>Start by requesting something from the feed</p>
            <button onClick={() => router.push('/feed')} style={{ backgroundColor: '#B8B68F', color: '#fff', border: 'none', borderRadius: 20, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Browse the feed</button>
          </div>
        ) : displayedThreads.map(thread => (
          <div
            key={thread.id}
            onClick={() => openThread(thread)}
            style={{
              backgroundColor: '#fff', borderRadius: 12, margin: '0 16px 10px',
              padding: 16, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              transition: 'transform 200ms ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {/* Avatar */}
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: thread.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 17, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-lora)' }}>
              {thread.initial}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#2C2A1E' }}>{thread.grower}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 8, ...BADGE_STYLE[thread.listingType] }}>{thread.listingType}</span>
                </div>
                <span style={{ fontSize: 11, color: '#6B6454', flexShrink: 0 }}>{thread.time}</span>
              </div>
              <p style={{ fontSize: 13, color: '#6B6454', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {thread.produce}{thread.price ? ` · ${thread.price}` : ''}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 12, color: thread.state === 'PENDING' ? '#6B6454' : '#2C2A1E', margin: 0, fontStyle: thread.state === 'PENDING' ? 'italic' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {thread.lastMsg}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                  {thread.rating && (
                    <div style={{ display: 'flex', gap: 1 }}>
                      {Array(thread.rating).fill(0).map((_, i) => (
                        <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill="#DECCA6"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      ))}
                    </div>
                  )}
                  {thread.unread && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#378ADD' }} />}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom tab nav */}
      <BottomNav active="messages" router={router} />
      <DevToolbar />

      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        ::-webkit-scrollbar { display:none; }
      `}</style>
    </div>
  )

  // ─── THREAD VIEW ────────────────────────────────────────────────────────────
  if (!activeThread) return null

  const isSwap = activeThread.listingType === 'SWAP'

  return (
    <div style={{ backgroundColor: '#EBE6D2', minHeight: '100dvh', fontFamily: 'var(--font-inter)', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 56, backgroundColor: '#EBE6D2', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
        <button onClick={() => setView('inbox')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}>
          <Icon.Back />
        </button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#2C2A1E', margin: 0, fontFamily: 'var(--font-lora)', letterSpacing: '-0.02em' }}>{activeThread.grower}</p>
          <p style={{ fontSize: 11, color: '#6B6454', margin: 0 }}>{activeThread.suburb}</p>
        </div>
        <button onClick={() => showToast('Options coming soon.')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}>
          <Icon.More />
        </button>
      </header>

      {/* Listing banner */}
      <div style={{ position: 'fixed', top: 56, left: 0, right: 0, zIndex: 90, backgroundColor: '#fff', borderBottom: '0.5px solid #DBD3C6' }}>
        <div
          onClick={() => setBannerOpen(true)}
          style={{ height: 72, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', cursor: 'pointer' }}
        >
          {/* Thumbnail */}
          <div style={{ width: 48, height: 48, borderRadius: 8, backgroundImage: `url(${activeThread.image})`, backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0 }} />
          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#2C2A1E' }}>{activeThread.produce}</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 8, ...BADGE_STYLE[activeThread.listingType] }}>{activeThread.listingType}</span>
            </div>
            <p style={{ fontSize: 11, color: '#6B6454', margin: 0 }}>{activeThread.harvestPoint}</p>
          </div>
          {/* Expiry + chevron */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ fontSize: 11, color: '#6B6454', margin: '0 0 2px' }}>{activeThread.expiry}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Icon.Chevron /></div>
          </div>
        </div>

        {/* SWAP status bar */}
        {isSwap && (
          <div style={{ display: 'flex', padding: '8px 16px', gap: 16, borderTop: '0.5px solid #F0ECE4' }}>
            {[`Your drop: ${threadState === 'CODE_SHARED' || threadState === 'COLLECTED' || threadState === 'COMPLETED' ? '✓ Dropped' : 'Pending ○'}`,
              `${activeThread.grower.split(' ')[0]}'s drop: ${threadState === 'COMPLETED' ? '✓ Dropped' : 'Pending ○'}`
            ].map((label, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: label.includes('✓') ? '#4A7C59' : '#DBD3C6' }} />
                <span style={{ fontSize: 11, color: '#6B6454' }}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messages scroll area */}
      <div style={{
        flex: 1,
        paddingTop: isSwap ? 144 : 128,
        paddingBottom: threadState === 'COMPLETED' ? 140 : 160,
        overflowY: 'auto',
      }}>
        <div style={{ padding: '16px 16px 0' }}>

          {/* Date pill */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <span style={{ backgroundColor: '#DBD3C6', color: '#6B6454', fontSize: 11, padding: '4px 14px', borderRadius: 20 }}>Today</span>
          </div>

          {messages.map((msg, idx) => {
            if (msg.kind === 'system') return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                <span style={{ backgroundColor: '#DBD3C6', color: '#6B6454', fontSize: 11, padding: '5px 14px', borderRadius: 20, textAlign: 'center', maxWidth: '80%', lineHeight: 1.4 }}>
                  {msg.text}
                </span>
              </div>
            )

            if (msg.kind === 'code') return (
              <CodeCard key={msg.id} harvestPoint={activeThread.harvestPoint} onCopy={() => showToast('Code copied — sharp!')} />
            )

            if (msg.kind === 'rating') return (
              !ratingDone ? <RatingCard key={msg.id} grower={activeThread.grower.split(' ')[0]} onSubmit={handleRatingSubmit} /> : null
            )

            if (msg.kind === 'buyer') return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end', margin: '4px 0' }}>
                <div style={{ backgroundColor: '#B8B68F', color: '#fff', fontSize: 14, padding: '10px 14px', borderRadius: '12px 12px 4px 12px', maxWidth: '75%', lineHeight: 1.5 }}>
                  {msg.text}
                </div>
              </div>
            )

            if (msg.kind === 'lister') return (
              <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, margin: '4px 0' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: activeThread.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0, fontFamily: 'var(--font-lora)' }}>
                  {msg.senderInitial}
                </div>
                <div style={{ backgroundColor: '#fff', color: '#2C2A1E', fontSize: 14, padding: '10px 14px', borderRadius: '12px 12px 12px 4px', maxWidth: '75%', lineHeight: 1.5, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  {msg.text}
                </div>
              </div>
            )

            return null
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick actions bar */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 124, backgroundColor: '#fff', borderTop: '0.5px solid #DBD3C6', height: 52, display: 'flex', alignItems: 'center', zIndex: 90 }}>
        {threadState === 'COMPLETED' ? (
          <p style={{ fontSize: 12, color: '#6B6454', textAlign: 'center', width: '100%', fontStyle: 'italic' }}>This harvest is complete — lekker!</p>
        ) : (
          <div style={{ display: 'flex', overflowX: 'auto', gap: 8, padding: '0 16px', scrollbarWidth: 'none', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
            {threadState === 'PENDING' && <>
              <QuickPill label="Accept request" primary onClick={() => handleQuickAction('accept')} />
              <QuickPill label="Decline" onClick={() => handleQuickAction('decline')} />
            </>}
            {threadState === 'ACCEPTED' && <>
              <QuickPill label="I've dropped it" primary onClick={() => handleQuickAction('dropped')} />
              <QuickPill label="Share code" onClick={() => showToast('Share code coming soon.')} />
              <QuickPill label="Prefer Harvest Point" onClick={() => showToast('Coming soon — sharp.')} />
            </>}
            {threadState === 'CODE_SHARED' && (
              <QuickPill label="Collected — lekker!" primary onClick={() => handleQuickAction('collected')} />
            )}
            {threadState === 'COLLECTED' && !ratingDone && (
              <QuickPill label="Rate this swap" primary onClick={() => handleQuickAction('rate')} />
            )}
            {threadState === 'MEETUP_REQUESTED' && <>
              <QuickPill label="Accept meetup" onClick={() => showToast('Meetup accepted — sharp!')} />
              <QuickPill label="Prefer Harvest Point" primary onClick={() => showToast('Coming soon.')} />
            </>}
          </div>
        )}
      </div>

      {/* Input bar */}
      <div style={{ position: 'fixed', bottom: 64, left: 0, right: 0, backgroundColor: '#fff', borderTop: '0.5px solid #DBD3C6', padding: '8px 16px', display: 'flex', alignItems: 'flex-end', gap: 10, zIndex: 90 }}>
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleTextareaChange}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
          placeholder={`Message ${activeThread.grower.split(' ')[0]}...`}
          rows={1}
          style={{
            flex: 1, borderRadius: 20, border: 'none', outline: 'none',
            padding: '10px 14px', fontSize: 14, color: '#2C2A1E',
            backgroundColor: '#EBE6D2', resize: 'none', lineHeight: 1.4,
            boxShadow: inputValue ? 'inset 0 0 0 1.5px #B8B68F' : 'none',
            transition: 'box-shadow 200ms ease', fontFamily: 'var(--font-inter)',
            overflowY: 'hidden', maxHeight: 80,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!inputValue.trim()}
          style={{
            width: 36, height: 36, borderRadius: '50%', backgroundColor: '#B8B68F',
            border: 'none', cursor: inputValue.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: inputValue.trim() ? 1 : 0.4, transition: 'opacity 200ms ease',
            flexShrink: 0, lineHeight: 0,
          }}
        >
          <Icon.Send />
        </button>
      </div>

      {/* Bottom tab nav */}
      <BottomNav active="messages" router={router} />
      <DevToolbar />

      {/* Banner bottom sheet */}
      {bannerOpen && (
        <>
          <div onClick={() => setBannerOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 300 }} />
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 400, backgroundColor: '#fff', borderRadius: '20px 20px 0 0', padding: '20px 24px 52px', animation: 'slideUp 300ms ease' }}>
            <div style={{ width: 36, height: 4, backgroundColor: '#DBD3C6', borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ width: '100%', height: 180, borderRadius: 12, backgroundImage: `url(${activeThread.image})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#2C2A1E', margin: '0 0 6px', fontFamily: 'var(--font-lora)', letterSpacing: '-0.02em' }}>{activeThread.produce}</h3>
            {[
              ['Type', activeThread.listingType],
              ['Harvest Point', activeThread.harvestPoint],
              ['Expires', activeThread.expiry],
              activeThread.price ? ['Price', activeThread.price] : null,
            ].filter(Boolean).map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid #F0ECE4' }}>
                <span style={{ fontSize: 12, color: '#6B6454' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#2C2A1E' }}>{val}</span>
              </div>
            ))}
            <button onClick={() => setBannerOpen(false)} style={{ width: '100%', height: 50, borderRadius: 14, marginTop: 20, backgroundColor: '#B8B68F', border: 'none', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-inter)', letterSpacing: '-0.02em' }}>Got it</button>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#1C1C1E', color: '#fff', fontSize: 12, padding: '12px 20px', borderRadius: 14, zIndex: 500, maxWidth: 'calc(100vw - 48px)', textAlign: 'center', boxShadow: '0 8px 28px rgba(0,0,0,0.22)', whiteSpace: 'nowrap', animation: 'fadeInUp 200ms ease', letterSpacing: '-0.01em', fontFamily: 'var(--font-inter)' }}>
          {toast}
        </div>
      )}

      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes slideUp  { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
        ::-webkit-scrollbar { display:none; }
      `}</style>
    </div>
  )
}

// ─── QUICK PILL ───────────────────────────────────────────────────────────────
function QuickPill({ label, primary = false, onClick }: { label: string; primary?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0, backgroundColor: primary ? '#B8B68F' : '#DBD3C6',
      color: primary ? '#fff' : '#6B6454', fontSize: 12, fontWeight: 600,
      padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
      fontFamily: 'var(--font-inter)', transition: 'all 150ms ease', whiteSpace: 'nowrap',
    }}>{label}</button>
  )
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function BottomNav({ active, router }: { active: string; router: ReturnType<typeof useRouter> }) {
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 64, backgroundColor: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '0.5px solid rgba(0,0,0,0.08)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 8px' }}>
      <button onClick={() => router.push('/feed')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 10px' }}>
        <Icon.Home c={active === 'home' ? '#B8B68F' : '#8E8E93'} />
        <span style={{ fontSize: 10, color: active === 'home' ? '#B8B68F' : '#8E8E93', fontWeight: active === 'home' ? 600 : 400, letterSpacing: '-0.01em', fontFamily: 'var(--font-inter)' }}>Home</span>
      </button>
      <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 10px' }}>
        <Icon.Compass c="#8E8E93" />
        <span style={{ fontSize: 10, color: '#8E8E93', letterSpacing: '-0.01em', fontFamily: 'var(--font-inter)' }}>Discover</span>
      </button>
      <div style={{ position: 'relative', marginTop: -22 }}>
        <button onClick={() => router.push('/create-listing')} style={{ width: 46, height: 46, borderRadius: '50%', backgroundColor: '#B8B68F', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 16px rgba(184,182,143,0.5)', lineHeight: 0 }}>
          <Icon.Plus />
        </button>
      </div>
      <button onClick={() => router.push('/messages')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 10px' }}>
        <Icon.Chat c={active === 'messages' ? '#B8B68F' : '#8E8E93'} />
        <span style={{ fontSize: 10, color: active === 'messages' ? '#B8B68F' : '#8E8E93', fontWeight: active === 'messages' ? 600 : 400, letterSpacing: '-0.01em', fontFamily: 'var(--font-inter)' }}>Messages</span>
      </button>
      <button onClick={() => router.push('/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 10px' }}>
        <Icon.Person c={active === 'profile' ? '#B8B68F' : '#8E8E93'} />
        <span style={{ fontSize: 10, color: active === 'profile' ? '#B8B68F' : '#8E8E93', fontWeight: active === 'profile' ? 600 : 400, letterSpacing: '-0.01em', fontFamily: 'var(--font-inter)' }}>Profile</span>
      </button>
    </nav>
  )
}
