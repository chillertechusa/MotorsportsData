import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Motorsport Data — From First Throttle to Factory Ride'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(163,230,53,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Accent corner lines */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: 2, height: 260, background: 'linear-gradient(to bottom, rgba(163,230,53,0.8), transparent)' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, height: 2, width: 260, background: 'linear-gradient(to left, rgba(163,230,53,0.8), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 2, height: 160, background: 'linear-gradient(to top, rgba(163,230,53,0.4), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, height: 2, width: 160, background: 'linear-gradient(to right, rgba(163,230,53,0.4), transparent)' }} />

        {/* MD monogram badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            border: '2px solid rgba(163,230,53,0.5)',
            marginBottom: 36,
          }}
        >
          <span style={{ color: '#a3e635', fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em' }}>MD</span>
        </div>

        {/* Eyebrow */}
        <p
          style={{
            color: '#a3e635',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            margin: '0 0 18px 0',
          }}
        >
          Motorsport Data · motorsportsdata.io
        </p>

        {/* Main headline — 2 lines */}
        <h1
          style={{
            color: '#f4f4f5',
            fontSize: 72,
            fontWeight: 900,
            lineHeight: 1.05,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            margin: '0 0 28px 0',
            maxWidth: 840,
          }}
        >
          From First Throttle to Factory Ride.
        </h1>

        {/* Sub */}
        <p
          style={{
            color: '#a1a1aa',
            fontSize: 20,
            lineHeight: 1.5,
            margin: '0 0 52px 0',
            maxWidth: 620,
          }}
        >
          The operating system for a racing career. Bike, setup, body, mind, and three AI co-pilots — from the mini-bike to the factory rig.
        </p>

        {/* Tier pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {[
            { label: 'Rookie', color: '#38bdf8' },
            { label: 'Privateer', color: '#a3e635' },
            { label: 'Race Team', color: '#fb923c' },
            { label: 'Factory Rig', color: '#f43f5e' },
          ].map((t) => (
            <span
              key={t.label}
              style={{
                color: t.color,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                border: `1px solid ${t.color}44`,
                padding: '6px 14px',
                background: `${t.color}11`,
              }}
            >
              {t.label}
            </span>
          ))}
          <span
            style={{
              color: '#3f3f46',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginLeft: 8,
            }}
          >
            from $9/mo
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}
