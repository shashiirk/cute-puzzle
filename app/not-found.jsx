import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center',
      padding: 24, background: 'linear-gradient(135deg,#fff0f3,#f5eeff)',
    }}>
      <div style={{ fontSize: '3rem' }}>💔</div>
      <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.8rem', color: '#2d1b2e' }}>
        Puzzle not found
      </h1>
      <p style={{ color: '#7a5c7e', fontSize: '0.95rem' }}>
        This puzzle link may have expired or doesn't exist.
      </p>
      <Link href="/" style={{
        background: 'linear-gradient(135deg,#e8547a,#c23b61)',
        color: 'white', textDecoration: 'none',
        borderRadius: 12, padding: '12px 24px',
        fontSize: '0.95rem', fontWeight: 600,
      }}>
        Create a new puzzle
      </Link>
    </div>
  )
}
