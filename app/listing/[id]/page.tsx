'use client'

import { useRouter } from 'next/navigation'

export default function ListingPage() {
  const router = useRouter()
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#EBE6D2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-inter)', padding: '40px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: 11, letterSpacing: '0.16em', color: '#B8B68F', fontWeight: 600, marginBottom: 16, textTransform: 'uppercase' }}>Coming soon</p>
      <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, color: '#2C2A1E', fontFamily: 'var(--font-lora)', marginBottom: 16, lineHeight: 1.2 }}>
        Full listing view
      </h1>
      <p style={{ fontSize: 15, color: '#6B6454', lineHeight: 1.75, maxWidth: 360, marginBottom: 40 }}>
        This is where the full listing detail, photos, grower profile, and request flow will live.
      </p>
      <button onClick={() => router.push('/feed')} style={{ padding: '14px 28px', borderRadius: 50, backgroundColor: '#B8B68F', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
        ← Back to feed
      </button>
    </main>
  )
}
