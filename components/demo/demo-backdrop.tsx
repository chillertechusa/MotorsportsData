'use client'

/**
 * DemoBackdrop — Oscilloscope-style telemetry visualization.
 *
 * A living, breathing tech background with:
 *  1. SVG-drawn animated waveforms (sine, square, saw patterns)
 *  2. CRT-style grid overlay with persistence glow
 *  3. Horizontal sweep lines scanning top-to-bottom
 *  4. Color-coded signal traces (accent + secondary channels)
 *  5. Screen flicker + bloom for that analog tube feel
 *
 * Deterministic on `t` for smooth scrubbing.
 */

function sine(x: number, freq: number = 1, amp: number = 1): number {
  return Math.sin(x * freq * Math.PI * 2) * amp
}

function rand(seed: number): number {
  const x = Math.sin(seed * 127.1) * 43758.5453
  return x - Math.floor(x)
}

export function DemoBackdrop({ t, accent }: { t: number; accent: string }) {
  const width = 1200
  const height = 800
  const centerY = height / 2

  // === WAVEFORM GENERATION ===
  // Generate oscilloscope traces with different frequencies and phases
  const generateTrace = (startX: number, freqMult: number) => {
    const points: [number, number][] = []
    for (let x = 0; x <= width; x += 3) {
      const normalizedX = (x + startX + t * 100) / 200 // Drift the signal left
      const y1 = sine(normalizedX, freqMult, 70)
      const y2 = sine(normalizedX * 0.5, 0.7, 20)
      const y = centerY - (y1 + y2 + sine(normalizedX, 0.3, 15))
      points.push([x, y])
    }
    return points
      .map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`))
      .join(' ')
  }

  const trace1Path = generateTrace(0, 1.2)
  const trace2Path = generateTrace(t * 5, 0.8)
  const trace3Path = generateTrace(-t * 3, 1.5)

  // === SCAN LINE ANIMATION ===
  // Horizontal sweep that moves top to bottom, repeating every 3s
  const scanProgress = (t % 3) / 3
  const scanY = scanProgress * height

  // === GRID & FLICKER ===
  // CRT screen flicker (very subtle, 60Hz refresh simulation)
  const flicker = 0.95 + Math.sin(t * 120) * 0.03
  // Grid glow intensity (breathing)
  const gridGlow = 0.4 + Math.sin(t * 0.8) * 0.2

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-zinc-950">
      {/* Background base — CRT phosphor glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, rgb(20 25 30 / 0.8), rgb(9 9 11))`,
          opacity: flicker,
        }}
      />

      {/* SVG oscilloscope traces */}
      <svg
        className="absolute inset-0"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ opacity: flicker }}
      >
        {/* Grid background — CRT tube appearance */}
        <defs>
          <pattern id="smallGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d={`M 40 0 L 0 0 0 40`} fill="none" stroke={`rgb(${accent} / 0.1)`} strokeWidth="0.5" />
          </pattern>
          <pattern id="largeGrid" width="200" height="200" patternUnits="userSpaceOnUse">
            <rect width="200" height="200" fill="url(#smallGrid)" />
            <path d={`M 200 0 L 0 0 0 200`} fill="none" stroke={`rgb(${accent} / 0.2)`} strokeWidth="1" />
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Draw grid */}
        <rect width={width} height={height} fill="url(#largeGrid)" />

        {/* Center line (horizon) */}
        <line
          x1={0}
          y1={centerY}
          x2={width}
          y2={centerY}
          stroke={`rgb(${accent} / 0.3)`}
          strokeWidth="1"
          opacity={gridGlow}
        />

        {/* Waveform traces with glow */}
        <path
          d={trace1Path}
          fill="none"
          stroke={`rgb(${accent})`}
          strokeWidth="2.5"
          opacity="0.9"
          filter="url(#glow)"
        />
        <path
          d={trace2Path}
          fill="none"
          stroke={`rgb(100 200 255)`}
          strokeWidth="2"
          opacity="0.6"
          filter="url(#glow)"
        />
        <path
          d={trace3Path}
          fill="none"
          stroke={`rgb(255 150 100)`}
          strokeWidth="1.5"
          opacity="0.5"
          filter="url(#glow)"
        />

        {/* Horizontal sweep line (CRT scan) */}
        <line
          x1={0}
          y1={scanY}
          x2={width}
          y2={scanY}
          stroke={`rgb(${accent})`}
          strokeWidth="2"
          opacity="0.6"
        />
        {/* Glow behind the sweep */}
        <line
          x1={0}
          y1={scanY}
          x2={width}
          y2={scanY}
          stroke={`rgb(${accent})`}
          strokeWidth="8"
          opacity="0.15"
        />
      </svg>

      {/* Vignette + CRT edge darkening */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 95% 90% at 50% 50%, transparent 40%, rgb(9 9 11 / 0.6) 100%)',
        }}
      />

      {/* Subtle scanlines overlay (analog CRT effect) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgb(0 0 0 / 0.03) 2px,
            rgb(0 0 0 / 0.03) 4px
          )`,
          opacity: 0.5,
        }}
      />
    </div>
  )
}
