'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

// ─── TYPES ────────────────────────────────────────────────────────────────────

type FilterType = 'All' | 'FREE' | 'SWAP' | 'SELL' | 'Nearby' | 'Verified'
type SortType = 'Most engaging' | 'Nearest first' | 'Most recent' | 'FREE first'
type ListingType = 'FREE' | 'SWAP' | 'SELL'

interface Listing {
  id: number
  type: ListingType
  produce: string
  quantity: string
  suburb: string
  growerName: string
  rating: number
  distance: number
  image: string
  pickupPoint?: string
  meetLocation?: string
  lookingFor?: string
  price?: string
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const FALLBACK = '/images/feed/a-crate-of-health-and-happiness-2026-03-25-02-46-51-utc.jpg'

const ALL_LISTINGS: Listing[] = [
  {
    id: 1, type: 'FREE', produce: 'Cherry tomatoes', quantity: '1kg', suburb: 'Fourways',
    growerName: 'Thandi', rating: 4.9, distance: 1.2,
    image: '/images/feed/a-crate-of-health-and-happiness-2026-03-25-02-46-51-utc.jpg',
    pickupPoint: 'Lonehill Nursery',
  },
  {
    id: 2, type: 'SWAP', produce: 'Bramley apples', quantity: '2kg', suburb: 'Lonehill',
    growerName: 'Sipho', rating: 4.7, distance: 2.1,
    image: '/images/feed/pink-with-stripes-fresh-apples-from-branches-in-wo-2026-01-05-23-23-48-utc.jpg',
    lookingFor: 'fresh herbs or chillies', pickupPoint: 'Fourways Garden Centre',
  },
  {
    id: 3, type: 'SELL', produce: 'Fresh basil bunches', quantity: 'Per bunch', suburb: 'Broadacres',
    growerName: 'Anke', rating: 5.0, distance: 3.4,
    image: '/images/feed/woman-wearing-gardening-gloves-transplanting-flowe-2026-03-24-07-37-21-utc.jpg',
    price: 'R15/bunch', pickupPoint: 'Broadacres Pharmacy',
  },
  {
    id: 4, type: 'FREE', produce: 'Baby spinach', quantity: '500g bags', suburb: 'Paulshof',
    growerName: 'Kagiso', rating: 4.8, distance: 1.8,
    image: '/images/feed/organic-produce-2026-01-09-11-03-55-utc.jpg',
    pickupPoint: 'Paulshof Community Church',
  },
  {
    id: 5, type: 'SWAP', produce: 'Unwaxed lemons', quantity: '6 pack', suburb: 'Douglasdale',
    growerName: 'Mpho', rating: 4.6, distance: 4.2,
    image: '/images/feed/the-first-batch-of-lemons-2026-03-25-04-08-17-utc.jpg',
    lookingFor: 'tomatoes or eggs', meetLocation: 'Douglasdale Engen',
  },
  {
    id: 6, type: 'SELL', produce: 'Free range eggs', quantity: 'Dozen', suburb: 'Dainfern',
    growerName: 'Johan', rating: 4.9, distance: 5.1,
    image: '/images/feed/pickled-to-perfection-2026-03-25-04-01-07-utc.jpg',
    price: 'R45/dozen', pickupPoint: 'Dainfern Nursery',
  },
  {
    id: 7, type: 'FREE', produce: 'Courgettes', quantity: '4 large', suburb: 'Kyalami',
    growerName: 'Fatima', rating: 4.5, distance: 2.9,
    image: '/images/feed/hands-vegetables-and-peppers-agriculture-and-sus-2026-03-25-06-29-15-utc.jpg',
    pickupPoint: 'Kyalami Corner Café',
  },
  {
    id: 8, type: 'SWAP', produce: 'Chillies (mixed)', quantity: '250g', suburb: 'Winfield',
    growerName: 'Priya', rating: 4.8, distance: 3.7,
    image: '/images/feed/farming-hands-and-beetroot-harvest-with-box-leav-2026-01-09-10-24-37-utc.jpg',
    lookingFor: 'garlic or ginger', pickupPoint: 'Winfield Wellness Pharmacy',
  },
  {
    id: 9, type: 'SELL', produce: 'Homemade tomato chutney', quantity: '300ml jar', suburb: 'Fourways',
    growerName: 'Thabo', rating: 5.0, distance: 1.5,
    image: '/images/feed/whats-your-cup-of-tea-2026-01-09-11-02-53-utc.jpg',
    price: 'R35/jar', pickupPoint: 'Lonehill Nursery',
  },
  {
    id: 10, type: 'FREE', produce: 'Runner beans', quantity: 'Large handful', suburb: 'Randburg',
    growerName: 'Lerato', rating: 4.7, distance: 6.2,
    image: '/images/feed/daytime-carrot-harvesting-in-garden-2026-03-14-22-14-20-utc.JPG',
    pickupPoint: 'Randburg Community Garden',
  },
  {
    id: 11, type: 'SWAP', produce: 'Butternut squash', quantity: '2 medium', suburb: 'Northcliff',
    growerName: 'Deon', rating: 4.4, distance: 7.8,
    image: '/images/feed/hands-potato-or-farmer-outdoor-on-a-farm-or-veget-2026-01-09-09-17-18-utc.jpg',
    lookingFor: 'potatoes or onions', meetLocation: 'Northcliff Pick n Pay parking',
  },
  {
    id: 12, type: 'SELL', produce: 'Herb seedlings (mixed)', quantity: '6 pack', suburb: 'Lonehill',
    growerName: 'Anele', rating: 4.9, distance: 2.3,
    image: '/images/feed/a-crate-of-health-and-happiness-2026-03-25-02-46-51-utc.jpg',
    price: 'R20/pack', pickupPoint: 'Lonehill Nursery',
  },
]

const SUBURBS = [
  'Fourways', 'Lonehill', 'Broadacres', 'Paulshof', 'Douglasdale',
  'Dainfern', 'Kyalami', 'Winfield', 'Randburg', 'Northcliff', 'Roodepoort',
]

const FILTERS: FilterType[] = ['All', 'FREE', 'SWAP', 'SELL', 'Nearby', 'Verified']
const SORT_OPTIONS: SortType[] = ['Most engaging', 'Nearest first', 'Most recent', 'FREE first']

// ─── AVATAR ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#8FA882', '#B8A08F', '#8F9EB8', '#B8988F', '#8FB8A0',
  '#A88FB8', '#B8B08F', '#8FA8B8', '#B88F9E', '#9EB88F',
]
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

// ─── ICONS ────────────────────────────────────────────────────────────────────

const Icon = {
  MapPin: ({ s = 18, c = 'currentColor' }: { s?: number; c?: string }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Bell: ({ s = 18, c = 'currentColor' }: { s?: number; c?: string }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Home: ({ s = 22, c = 'currentColor' }: { s?: number; c?: string }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Compass: ({ s = 22, c = 'currentColor' }: { s?: number; c?: string }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
  Plus: ({ s = 20, c = 'currentColor' }: { s?: number; c?: string }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Chat: ({ s = 22, c = 'currentColor' }: { s?: number; c?: string }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Person: ({ s = 22, c = 'currentColor' }: { s?: number; c?: string }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Chevron: ({ s = 11, c = 'currentColor' }: { s?: number; c?: string }) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
}

// ─── BADGE ────────────────────────────────────────────────────────────────────

const BADGE: Record<ListingType, React.CSSProperties> = {
  FREE:  { backgroundColor: '#4A7C59', color: '#fff' },
  SWAP:  { backgroundColor: '#DECCA6', color: '#2C2A1E' },
  SELL:  { backgroundColor: '#2C2A1E', color: '#fff' },
}

// ─── LISTING CARD ─────────────────────────────────────────────────────────────

function ListingCard({ listing, featured, onAction, onTap }: {
  listing: Listing
  featured?: boolean
  onAction: (msg: string) => void
  onTap?: () => void
}) {
  const loc = listing.pickupPoint ?? listing.meetLocation ?? `Direct collection · ${listing.suburb}`

  return (
    <div className={`h-card${featured ? ' h-card-featured' : ''}`} onClick={onTap} style={{ cursor: onTap ? 'pointer' : undefined }}>
      {/* ── Photo ── */}
      <div style={{ position: 'relative' }} className="h-card-img-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={listing.image}
          alt={listing.produce}
          className="h-card-img"
          style={{ width: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
        />
        {/* Avatar */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          width: 30, height: 30, borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.9)',
          backgroundColor: avatarColor(listing.growerName),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#fff',
          fontFamily: 'var(--font-inter)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        }}>
          {listing.growerName[0]}
        </div>
        {/* Type badge */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          ...BADGE[listing.type],
          borderRadius: 6, padding: '4px 7px',
          fontSize: 10, fontWeight: 700,
          fontFamily: 'var(--font-inter)', letterSpacing: '0.06em',
          boxShadow: '0 1px 4px rgba(0,0,0,0.14)',
        }}>
          {listing.type}
        </div>
      </div>

      {/* ── Core info ── */}
      <div style={{ padding: '11px 13px 0' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E', fontFamily: 'var(--font-inter)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
          {listing.produce}
        </p>
        <p style={{ fontSize: 11, color: '#6B6454', fontFamily: 'var(--font-inter)', margin: '0 0 2px' }}>
          {listing.quantity} · {listing.suburb}
        </p>
        <p style={{ fontSize: 11, color: '#8E8E93', fontFamily: 'var(--font-inter)', margin: 0 }}>
          {listing.growerName} · <span style={{ color: '#B8B68F' }}>★</span> {listing.rating} · <span style={{ color: '#B8B68F', fontWeight: 600 }}>{listing.distance}km</span>
        </p>
      </div>

      {/* ── Exchange info ── */}
      <div style={{ padding: '7px 13px' }}>
        {listing.type === 'FREE' && (
          <p style={{ fontSize: 10, color: '#8E8E93', fontStyle: 'italic', fontFamily: 'var(--font-inter)', margin: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Icon.MapPin s={9} c="#B8B68F" /> {loc}
          </p>
        )}
        {listing.type === 'SWAP' && (<>
          <p style={{ fontSize: 10, color: '#6B6454', fontStyle: 'italic', fontFamily: 'var(--font-inter)', margin: '0 0 2px' }}>
            Looking for: {listing.lookingFor}
          </p>
          <p style={{ fontSize: 10, color: '#8E8E93', fontStyle: 'italic', fontFamily: 'var(--font-inter)', margin: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Icon.MapPin s={9} c="#B8B68F" /> {loc}
          </p>
        </>)}
        {listing.type === 'SELL' && (<>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E', fontFamily: 'var(--font-inter)', margin: '0 0 2px', letterSpacing: '-0.01em' }}>
            {listing.price}
          </p>
          <p style={{ fontSize: 10, color: '#8E8E93', fontStyle: 'italic', fontFamily: 'var(--font-inter)', margin: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Icon.MapPin s={9} c="#B8B68F" /> {listing.pickupPoint}
          </p>
        </>)}
      </div>

      {/* ── Action row ── */}
      <div style={{
        padding: '8px 13px 11px', marginTop: 4,
        borderTop: '0.5px solid #F2F2F7',
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14,
      }}>
        {listing.type === 'FREE' && (
          <button onClick={e => { e.stopPropagation(); onAction(`Request sent to ${listing.growerName} — they'll be in touch. Sharp.`) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#B8B68F', fontFamily: 'var(--font-inter)', padding: 0, letterSpacing: '-0.01em' }}>
            Request
          </button>
        )}
        {listing.type === 'SWAP' && (
          <button onClick={e => { e.stopPropagation(); onAction(`Swap offer sent — ${listing.growerName} will review your offer.`) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#B8B68F', fontFamily: 'var(--font-inter)', padding: 0, letterSpacing: '-0.01em' }}>
            Offer swap
          </button>
        )}
        {listing.type === 'SELL' && (<>
          <button onClick={e => { e.stopPropagation(); onAction(`Offer sent to ${listing.growerName} — they'll review and respond.`) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#8E8E93', fontFamily: 'var(--font-inter)', padding: 0 }}>
            Make offer
          </button>
          <button onClick={e => { e.stopPropagation(); onAction(`Booking sent for ${listing.produce} — ${listing.growerName} will confirm. Sharp.`) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#B8B68F', fontFamily: 'var(--font-inter)', padding: 0, letterSpacing: '-0.01em' }}>
            Buy — {listing.price}
          </button>
        </>)}
      </div>
    </div>
  )
}

// ─── FEED PAGE ────────────────────────────────────────────────────────────────

export default function FeedPage() {
  const router = useRouter()

  const [activeFilter, setActiveFilter] = useState<FilterType>('All')
  const [sortBy, setSortBy]             = useState<SortType>('Most engaging')
  const [suburb, setSuburb]             = useState('Fourways')
  const [mapView, setMapView]           = useState(false)
  const [suburbOpen, setSuburbOpen]     = useState(false)
  const [sortOpen, setSortOpen]         = useState(false)
  const [toast, setToast]               = useState<string | null>(null)
  const [liveListings, setLiveListings] = useState<Listing[]>([])

  // Load real listings from Supabase for the current session only — merge with dummies
  useEffect(() => {
    const loadListings = async () => {
      try {
        // Only show listings created in this session (tagged with session_id in localStorage)
        const sessionId = typeof window !== 'undefined' ? localStorage.getItem('harvest_session_id') : null
        if (!sessionId) return // no session yet — just show dummies

        const { data, error } = await supabase
          .from('listings')
          .select('*, profiles(name, suburb, xp)')
          .eq('status', 'active')
          .eq('session_id', sessionId)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
        if (error || !data || data.length === 0) return

        // Map Supabase shape → local Listing shape
        const mapped: Listing[] = data.map((r: Record<string, unknown>) => ({
          id: (r.id as number) + 1000, // offset to avoid collisions with dummy ids
          type: ((r.listing_type as string) || 'FREE').toUpperCase() as ListingType,
          produce: r.produce_name as string,
          quantity: (r.quantity_value as string) || '',
          suburb: (r.suburb as string) || ((r.profiles as Record<string, unknown>)?.suburb as string) || 'Joburg',
          growerName: ((r.profiles as Record<string, unknown>)?.name as string) || 'You',
          rating: 5.0,
          distance: 0.5,
          image: Array.isArray(r.image_urls) && (r.image_urls as string[]).length > 0 ? (r.image_urls as string[])[0] : FALLBACK,
          price: r.price ? `R${r.price}` : undefined,
          pickupPoint: Array.isArray(r.harvest_points) ? (r.harvest_points as string[])[0] : undefined,
        }))
        setLiveListings(mapped)
      } catch {
        // Supabase not configured yet — dummies stay
      }
    }
    loadListings()
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  // Always show 12 dummies; real listings from this session appear first
  const sourceListings = [...liveListings, ...ALL_LISTINGS]

  const listings = useMemo(() => {
    let list = [...sourceListings]
    if      (activeFilter === 'FREE')     list = list.filter(l => l.type === 'FREE')
    else if (activeFilter === 'SWAP')     list = list.filter(l => l.type === 'SWAP')
    else if (activeFilter === 'SELL')     list = list.filter(l => l.type === 'SELL')
    else if (activeFilter === 'Nearby')   list = list.filter(l => l.distance <= 3)
    else if (activeFilter === 'Verified') list = list.filter(l => l.rating >= 4.8)
    if      (sortBy === 'Nearest first')  list = [...list].sort((a, b) => a.distance - b.distance)
    else if (sortBy === 'FREE first')     list = [...list].sort((a, b) => (a.type === 'FREE' ? -1 : b.type === 'FREE' ? 1 : 0))
    return list
  }, [activeFilter, sortBy, sourceListings])

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100dvh', fontFamily: 'var(--font-inter)' }}>

      {/* ── Global styles ── */}
      <style>{`
        /* Card grid */
        .h-feed {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          padding: 16px;
        }
        @media (min-width: 768px) {
          .h-feed { grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 20px; }
          .h-card-featured { grid-column: auto !important; }
          .h-card-featured .h-card-img { height: 140px !important; }
        }
        /* Card */
        .h-card {
          background: #ffffff;
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 200ms ease, box-shadow 200ms ease;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04);
        }
        .h-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.10), 0 0 0 0.5px rgba(0,0,0,0.04);
        }
        .h-card-featured { grid-column: 1 / -1; }
        /* Images */
        .h-card-img { height: 140px; }
        .h-card-featured .h-card-img { height: 240px; }
        /* Filter row scrollbar hide */
        .h-filters::-webkit-scrollbar { display: none; }
        .h-filters { -ms-overflow-style: none; scrollbar-width: none; }
        /* Filter pills */
        .h-pill { transition: background-color 180ms ease, color 180ms ease; white-space: nowrap; flex-shrink: 0; }
      `}</style>

      {/* ══════════════ TOP NAV ══════════════ */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 56,
        backgroundColor: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '0.5px solid rgba(0,0,0,0.08)',
        zIndex: 100, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 16px',
      }}>
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/harvestlogo.png" alt="Harvest" style={{ height: 28 }} />

        {/* Suburb pill */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <button
            onClick={() => { setSuburbOpen(o => !o); setSortOpen(false) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              backgroundColor: '#F2F2F7', border: 'none', borderRadius: 20,
              padding: '6px 12px', fontSize: 12, fontWeight: 600,
              color: '#1C1C1E', cursor: 'pointer', fontFamily: 'var(--font-inter)',
              letterSpacing: '-0.01em',
            }}
          >
            {suburb} <Icon.Chevron s={11} c="#8E8E93" />
          </button>
          {suburbOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: '50%',
              transform: 'translateX(-50%)', backgroundColor: '#fff',
              borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.06)',
              minWidth: 164, zIndex: 200, overflow: 'hidden',
            }}>
              {SUBURBS.map(s => (
                <button key={s} onClick={() => { setSuburb(s); setSuburbOpen(false) }}
                  style={{
                    display: 'block', width: '100%', padding: '10px 16px',
                    textAlign: 'left', border: 'none', cursor: 'pointer',
                    fontSize: 13, color: '#1C1C1E', fontFamily: 'var(--font-inter)',
                    backgroundColor: s === suburb ? '#F2F2F7' : 'transparent',
                    fontWeight: s === suburb ? 600 : 400,
                    letterSpacing: '-0.01em',
                  }}
                >{s}</button>
              ))}
            </div>
          )}
        </div>

        {/* Icons */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <button onClick={() => setMapView(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, lineHeight: 0 }}>
            <Icon.MapPin s={20} c={mapView ? '#B8B68F' : '#8E8E93'} />
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, lineHeight: 0 }}>
            <Icon.Bell s={20} c="#8E8E93" />
          </button>
        </div>
      </header>

      {/* ══════════════ FILTER PILLS ══════════════ */}
      <div className="h-filters" style={{
        position: 'sticky', top: 56, zIndex: 90,
        backgroundColor: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '0.5px solid rgba(0,0,0,0.06)',
        height: 48, display: 'flex', alignItems: 'center',
        overflowX: 'auto', paddingLeft: 16, paddingRight: 16, gap: 7,
      }}>
        {FILTERS.map(pill => (
          <button key={pill} className="h-pill"
            onClick={() => setActiveFilter(pill)}
            style={{
              padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontSize: 12, fontFamily: 'var(--font-inter)', letterSpacing: '-0.01em',
              fontWeight: activeFilter === pill ? 700 : 500,
              backgroundColor: activeFilter === pill ? '#B8B68F' : '#F2F2F7',
              color: activeFilter === pill ? '#fff' : '#3C3C43',
            }}
          >{pill}</button>
        ))}
      </div>

      {/* ══════════════ SORT ROW ══════════════ */}
      <div style={{
        position: 'sticky', top: 104, zIndex: 80,
        backgroundColor: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        height: 36,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 16px',
        borderBottom: '0.5px solid rgba(0,0,0,0.04)',
      }}>
        <p style={{ fontSize: 12, color: '#8E8E93', margin: 0, letterSpacing: '-0.01em' }}>
          {listings.length} listings in <span style={{ color: '#6B6454', fontWeight: 600 }}>{suburb}</span>
        </p>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <button onClick={() => { setSortOpen(o => !o); setSuburbOpen(false) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: '#6B6454', fontFamily: 'var(--font-inter)',
              fontWeight: 500, letterSpacing: '-0.01em',
            }}
          >
            {sortBy} <Icon.Chevron s={10} c="#8E8E93" />
          </button>
          {sortOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              backgroundColor: '#fff', borderRadius: 12,
              boxShadow: '0 8px 28px rgba(0,0,0,0.10), 0 0 0 0.5px rgba(0,0,0,0.05)',
              minWidth: 164, zIndex: 200, overflow: 'hidden',
            }}>
              {SORT_OPTIONS.map(opt => (
                <button key={opt} onClick={() => { setSortBy(opt); setSortOpen(false) }}
                  style={{
                    display: 'block', width: '100%', padding: '10px 16px',
                    textAlign: 'left', border: 'none', cursor: 'pointer',
                    fontSize: 13, color: '#1C1C1E', fontFamily: 'var(--font-inter)',
                    backgroundColor: opt === sortBy ? '#F2F2F7' : 'transparent',
                    fontWeight: opt === sortBy ? 600 : 400,
                    letterSpacing: '-0.01em',
                  }}
                >{opt}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════ CONTENT ══════════════ */}
      <main style={{ paddingTop: 140, paddingBottom: 88 }}>

        {/* Map view */}
        {mapView && (
          <div style={{ padding: '16px' }}>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              height: '45vh', minHeight: 260,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: 32, textAlign: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}>
              <Icon.MapPin s={36} c="#B8B68F" />
              <p style={{ fontSize: 15, fontWeight: 600, color: '#1C1C1E', margin: '14px 0 8px', fontFamily: 'var(--font-lora)', lineHeight: 1.4, maxWidth: 280, letterSpacing: '-0.01em' }}>
                Map view coming soon — listings will appear as pins near you.
              </p>
              <p style={{ fontSize: 12, color: '#8E8E93', margin: 0, fontFamily: 'var(--font-inter)' }}>
                Showing pick-up points and growers in {suburb}.
              </p>
            </div>
          </div>
        )}

        {/* Feed grid */}
        {!mapView && (
          <div className="h-feed">
            {listings.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} featured={i === 0} onAction={showToast} onTap={() => router.push(`/listing/${listing.id}`)} />
            ))}
            {listings.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '64px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#1C1C1E', marginBottom: 8, fontFamily: 'var(--font-lora)' }}>Nothing here yet.</p>
                <p style={{ fontSize: 14, color: '#8E8E93', fontFamily: 'var(--font-inter)', lineHeight: 1.65 }}>
                  Try a different filter — your neighbours are always growing something.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ══════════════ BOTTOM TAB BAR ══════════════ */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: 64,
        backgroundColor: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '0.5px solid rgba(0,0,0,0.08)',
        zIndex: 100, display: 'flex', alignItems: 'center',
        justifyContent: 'space-around', padding: '0 8px',
      }}>
        {/* Home — active */}
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 10px' }}>
          <Icon.Home s={22} c="#B8B68F" />
          <span style={{ fontSize: 10, color: '#B8B68F', fontFamily: 'var(--font-inter)', fontWeight: 600, letterSpacing: '-0.01em' }}>Home</span>
        </button>
        {/* Discover */}
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 10px' }}>
          <Icon.Compass s={22} c="#8E8E93" />
          <span style={{ fontSize: 10, color: '#8E8E93', fontFamily: 'var(--font-inter)', letterSpacing: '-0.01em' }}>Discover</span>
        </button>
        {/* Add — elevated */}
        <div style={{ position: 'relative', marginTop: -22 }}>
          <button onClick={() => router.push('/create-listing')} style={{
            width: 46, height: 46, borderRadius: '50%',
            backgroundColor: '#B8B68F', border: '3px solid #FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(184,182,143,0.5)', lineHeight: 0,
          }}>
            <Icon.Plus s={20} c="#fff" />
          </button>
        </div>
        {/* Messages */}
        <button onClick={() => router.push('/messages')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 10px' }}>
          <Icon.Chat s={22} c="#8E8E93" />
          <span style={{ fontSize: 10, color: '#8E8E93', fontFamily: 'var(--font-inter)', letterSpacing: '-0.01em' }}>Messages</span>
        </button>
        {/* Profile */}
        <button onClick={() => router.push('/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 10px' }}>
          <Icon.Person s={22} c="#8E8E93" />
          <span style={{ fontSize: 10, color: '#8E8E93', fontFamily: 'var(--font-inter)', letterSpacing: '-0.01em' }}>Profile</span>
        </button>
      </nav>

      {/* ══════════════ TOAST ══════════════ */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1C1C1E', color: '#fff',
          fontSize: 12, fontFamily: 'var(--font-inter)',
          padding: '12px 20px', borderRadius: 14, zIndex: 400,
          maxWidth: 'calc(100vw - 48px)', textAlign: 'center',
          boxShadow: '0 8px 28px rgba(0,0,0,0.22)',
          whiteSpace: 'nowrap',
          animation: 'fadeInUp 200ms ease',
          letterSpacing: '-0.01em',
        }}>
          {toast}
        </div>
      )}
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>

      {/* Overlay to close dropdowns */}
      {(suburbOpen || sortOpen) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150 }}
          onClick={() => { setSuburbOpen(false); setSortOpen(false) }} />
      )}
    </div>
  )
}
