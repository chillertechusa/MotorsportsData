/**
 * Lossless MP4 "faststart" remux — moves the `moov` atom in front of `mdat`
 * so browsers can render the first frame after a few hundred KB instead of
 * downloading the entire file. This is a byte-level rearrangement: no
 * re-encode, no quality loss, identical video data.
 *
 * Equivalent to `ffmpeg -movflags +faststart -c copy`, implemented in pure
 * Node because ffmpeg isn't available in this environment.
 *
 * Usage: node scripts/mp4-faststart.mjs public/videos/md-hero.mp4
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs'

const CONTAINERS = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl', 'edts', 'dinf'])

/** Walk the top level of a buffer and return [{ type, start, size }]. */
function topLevelAtoms(buf) {
  const atoms = []
  let off = 0
  while (off + 8 <= buf.length) {
    let size = buf.readUInt32BE(off)
    const type = buf.toString('ascii', off + 4, off + 8)
    let headerSize = 8
    if (size === 1) {
      size = Number(buf.readBigUInt64BE(off + 8))
      headerSize = 16
    } else if (size === 0) {
      size = buf.length - off
    }
    if (size < headerSize) throw new Error(`Bad atom size ${size} for ${type} at ${off}`)
    atoms.push({ type, start: off, size, headerSize })
    off += size
  }
  return atoms
}

/**
 * Recursively shift every chunk-offset table inside `moov` by `delta`.
 * `stco` holds 32-bit offsets, `co64` holds 64-bit offsets. Both are absolute
 * file offsets, so moving mdat forward means every entry increases by delta.
 */
function shiftChunkOffsets(moov, delta) {
  let patched = { stco: 0, co64: 0, entries: 0 }

  function walk(start, end) {
    let off = start
    while (off + 8 <= end) {
      const size = moov.readUInt32BE(off)
      const type = moov.toString('ascii', off + 4, off + 8)
      if (size < 8) throw new Error(`Bad child atom ${type} size ${size}`)
      const bodyStart = off + 8
      const bodyEnd = off + size

      if (CONTAINERS.has(type)) {
        walk(bodyStart, bodyEnd)
      } else if (type === 'stco' || type === 'co64') {
        // full-box: 1 byte version + 3 bytes flags, then uint32 entry count
        const count = moov.readUInt32BE(bodyStart + 4)
        let p = bodyStart + 8
        for (let i = 0; i < count; i++) {
          if (type === 'stco') {
            const v = moov.readUInt32BE(p)
            const next = v + delta
            if (next > 0xffffffff) {
              throw new Error('stco offset would overflow 32 bits; needs co64 upgrade')
            }
            moov.writeUInt32BE(next, p)
            p += 4
          } else {
            moov.writeBigUInt64BE(moov.readBigUInt64BE(p) + BigInt(delta), p)
            p += 8
          }
        }
        patched[type]++
        patched.entries += count
      }
      off += size
    }
  }

  walk(8, moov.length)
  return patched
}

const target = process.argv[2]
if (!target) {
  console.error('usage: node scripts/mp4-faststart.mjs <file.mp4>')
  process.exit(1)
}

const original = readFileSync(target)
const atoms = topLevelAtoms(original)
const moovIdx = atoms.findIndex((a) => a.type === 'moov')
const mdatIdx = atoms.findIndex((a) => a.type === 'mdat')

if (moovIdx === -1 || mdatIdx === -1) {
  console.error('[faststart] file has no moov/mdat pair — nothing to do')
  process.exit(1)
}
if (moovIdx < mdatIdx) {
  console.log('[faststart] already optimized (moov precedes mdat) — no change')
  process.exit(0)
}

const moovAtom = atoms[moovIdx]
const moov = Buffer.from(
  original.subarray(moovAtom.start, moovAtom.start + moovAtom.size),
)

// Every byte of media shifts forward by exactly the size of the moov atom.
const patched = shiftChunkOffsets(moov, moovAtom.size)
console.log(
  `[faststart] patched ${patched.stco} stco + ${patched.co64} co64 tables (${patched.entries} chunk offsets) by +${moovAtom.size} bytes`,
)

// Rebuild: everything before mdat, then moov, then mdat and anything after,
// skipping the moov in its original trailing position.
const out = []
for (const a of atoms) {
  if (a.type === 'moov') continue
  if (a.type === 'mdat') out.push(moov)
  out.push(original.subarray(a.start, a.start + a.size))
}
const result = Buffer.concat(out)

if (result.length !== original.length) {
  throw new Error(
    `size mismatch: ${result.length} vs ${original.length} — refusing to write`,
  )
}

writeFileSync(target, result)

// Verify the rewritten file parses and moov now leads.
const check = topLevelAtoms(readFileSync(target))
const order = check.map((a) => a.type).join(' → ')
const ok =
  check.findIndex((a) => a.type === 'moov') < check.findIndex((a) => a.type === 'mdat')
console.log(`[faststart] new atom order: ${order}`)
console.log(
  `[faststart] ${ok ? 'OK' : 'FAILED'} — ${(statSync(target).size / 1048576).toFixed(2)} MB, byte-identical media`,
)
process.exit(ok ? 0 : 1)
