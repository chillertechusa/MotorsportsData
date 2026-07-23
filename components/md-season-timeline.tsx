import Link from 'next/link'

const SMX_2027_ROUNDS = [
  { round: 1,  venue: 'Angel Stadium',            city: 'Anaheim, CA',        date: 'Jan 10',  sx: true  },
  { round: 2,  venue: 'Snapdragon Stadium',        city: 'San Diego, CA',      date: 'Jan 17',  sx: true  },
  { round: 3,  venue: 'State Farm Stadium',        city: 'Glendale, AZ',       date: 'Jan 24',  sx: true  },
  { round: 4,  venue: 'Oakland Coliseum',          city: 'Oakland, CA',        date: 'Feb 7',   sx: true  },
  { round: 5,  venue: 'Ford Field',                city: 'Detroit, MI',        date: 'Feb 14',  sx: true  },
  { round: 6,  venue: 'Lucas Oil Stadium',         city: 'Indianapolis, IN',   date: 'Feb 21',  sx: true  },
  { round: 7,  venue: 'AT&T Stadium',              city: 'Arlington, TX',      date: 'Feb 28',  sx: true  },
  { round: 8,  venue: 'Daytona Int\'l Speedway',   city: 'Daytona Beach, FL',  date: 'Mar 8',   sx: true  },
  { round: 9,  venue: 'Mercedes-Benz Stadium',     city: 'Atlanta, GA',        date: 'Mar 15',  sx: true  },
  { round: 10, venue: 'Lumen Field',               city: 'Seattle, WA',        date: 'Mar 22',  sx: true  },
  { round: 11, venue: 'Nissan Stadium',            city: 'Nashville, TN',      date: 'Apr 5',   sx: true  },
  { round: 12, venue: 'Empower Field',             city: 'Denver, CO',         date: 'Apr 12',  sx: true  },
  { round: 13, venue: 'Rice-Eccles Stadium',       city: 'Salt Lake City, UT', date: 'Apr 19',  sx: true  },
  { round: 14, venue: 'Arrowhead Stadium',         city: 'Kansas City, MO',    date: 'Apr 26',  sx: true  },
  { round: 15, venue: 'Gillette Stadium',          city: 'Foxborough, MA',     date: 'May 10',  sx: true  },
  { round: 16, venue: 'Allegiant Stadium',         city: 'Las Vegas, NV',      date: 'May 17',  sx: false },
  { round: 17, venue: 'Allegiant Stadium',         city: 'Las Vegas, NV — FINAL', date: 'May 24', sx: false },
] as const

export default function MdSeasonTimeline() {
  return (
    <section
      id="season"
      className="bg-zinc-950 border-t border-zinc-800/60 py-16 sm:py-20 overflow-hidden"
      aria-label="SMX 2027 Season Calendar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-0.5 w-6 bg-lime-400" aria-hidden="true" />
              <span className="font-mono text-[10px] text-lime-400 uppercase tracking-[0.25em]">
                Full Season Coverage
              </span>
            </div>
            <h2
              className="text-zinc-100 uppercase leading-none"
              style={{
                fontFamily: 'var(--font-barlow-condensed)',
                fontWeight: 900,
                fontSize: 'clamp(2rem, 6vw, 3.75rem)',
              }}
            >
              SMX 2027{' '}
              <span className="text-lime-400">Championship</span>
              <br />
              17 Rounds. Every Gate Drop.
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-lime-400 animate-pulse" aria-hidden="true" />
            <span className="font-mono text-xs text-lime-400 uppercase tracking-widest">
              AI Live on every round
            </span>
          </div>
        </div>

        {/* Timeline scroll container */}
        <div
          className="overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6"
          role="list"
          aria-label="SMX 2027 rounds"
        >
          <div className="flex gap-3 w-max">
            {SMX_2027_ROUNDS.map((r, i) => {
              const isFinal = r.round === 17
              const isLV = r.round === 16
              return (
                <div
                  key={r.round}
                  role="listitem"
                  className={[
                    'relative flex flex-col gap-2 p-4 border w-44 shrink-0 transition-colors',
                    isFinal
                      ? 'border-lime-400/60 bg-lime-400/5'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-600',
                  ].join(' ')}
                  style={{ animation: `mdFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 0.035}s both` }}
                >
                  {/* Round number */}
                  <div className="flex items-center justify-between">
                    <span
                      className={[
                        'font-mono text-[10px] uppercase tracking-widest',
                        isFinal ? 'text-lime-400' : 'text-zinc-600',
                      ].join(' ')}
                    >
                      RD {String(r.round).padStart(2, '0')}
                    </span>

                    {/* AI LIVE badge */}
                    <div
                      className="flex items-center gap-1 bg-lime-400/10 border border-lime-400/30 px-1.5 py-0.5 rounded"
                      aria-label="AI Live support active"
                    >
                      <span className="inline-block w-1 h-1 rounded-full bg-lime-400 animate-pulse" aria-hidden="true" />
                      <span className="font-mono text-[8px] text-lime-400 uppercase tracking-wider">
                        {isFinal ? 'Final' : 'AI Live'}
                      </span>
                    </div>
                  </div>

                  {/* Venue */}
                  <div>
                    <p
                      className="text-zinc-100 font-semibold leading-tight text-sm"
                      style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                    >
                      {r.venue}
                    </p>
                    <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5 leading-tight">
                      {r.city}
                    </p>
                  </div>

                  {/* Date */}
                  <p className="font-mono text-xs text-zinc-400 mt-auto">
                    {r.date}, 2027
                  </p>

                  {/* Championship final accent */}
                  {isFinal && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-400" aria-hidden="true" />
                  )}
                </div>
              )
            })}

            {/* End card — CTA */}
            <div className="flex flex-col items-center justify-center gap-3 p-5 border border-zinc-700 border-dashed bg-zinc-900/30 w-44 shrink-0">
              <p
                className="text-zinc-300 text-center text-sm font-semibold leading-snug"
                style={{ fontFamily: 'var(--font-barlow-condensed)' }}
              >
                Your team gets AI support for every one of these.
              </p>
              <Link
                href="#team-partner"
                className="inline-flex items-center gap-1.5 bg-lime-400 text-zinc-950 font-bold text-xs px-3 py-2 rounded hover:bg-lime-300 transition-colors whitespace-nowrap"
              >
                Apply Now &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom footnote */}
        <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mt-5">
          * 2027 schedule estimated based on 2026 SMX calendar. Dates subject to official announcement.
        </p>
      </div>
    </section>
  )
}
