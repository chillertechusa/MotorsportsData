/**
 * MD Discipline Configuration
 *
 * Canonical list of motorsport disciplines the platform supports.
 * A team selects ONE primary discipline; this config:
 *  - drives the UI picker labels and descriptions
 *  - injects discipline-specific context into all AI system prompts
 *  - governs which schedule event types, terminology, and protocols are used
 *
 * Rules:
 *  - Discipline IDs are stable DB values — never rename them.
 *  - Add new disciplines below; no code changes needed elsewhere.
 *  - `aiProtocolText` is injected verbatim into AI system prompts.
 */

export type DisciplineId =
  | 'mx_sx'
  | 'enduro'
  | 'fmx'
  | 'flat_track'
  | 'trail'
  | 'pit_bike'
  | 'nascar'
  | 'drag'
  | 'rally'
  | 'karting'

export interface Discipline {
  id: DisciplineId
  /** Short label shown in nav and UI */
  label: string
  /** One-line marketing description */
  description: string
  /** Multi-line text injected into AI system prompts — discipline-specific coaching language */
  aiProtocolText: string
  /** Representative session types for this discipline */
  sessionTypes: string[]
  /** Representative event types for this discipline */
  eventTypes: string[]
  /** Icon name (lucide) */
  iconName: string
  /** Tailwind color class for accents */
  accentColor: string
}

export const DISCIPLINES: Discipline[] = [
  {
    id: 'mx_sx',
    label: 'Motocross / Supercross',
    description: 'Outdoor MX tracks, stadium SX, amateur to professional',
    aiProtocolText: `DISCIPLINE: Motocross / Supercross (MX/SX)
Coaching language and framing rules:
- Talk about lap times, corner speed, block passing, gate picks, and moto fitness.
- Supercross = tight rhythms, stadium dirt, blue-groove conditions. Motocross = outdoor ruts, elevation, loam vs. hardpack.
- Suspension setup advice: use SX-specific spring rates / compression / rebound when the next event is indoor; swap to outdoor settings for MX.
- Fitness protocols: motos are short (20–35 min) and extremely high-intensity. Interval training > long endurance base. Grip strength is critical.
- Nutrition: emphasize glycogen loading the day before + fast-digesting carbs race morning; no heavy protein 3h before moto.
- Mental: gate drops are a high-anxiety moment — visualization, pre-race routine, and first-corner strategy are high-leverage.
- Race strategy: typically 2 motos (amateur) or 2 main events (pro). Points strategy matters: a consistent 3rd > a DNF from leading.`,
    sessionTypes: ['Practice Moto', 'Timed Qualifying', 'Race Moto', 'Track Walk', 'Gate Practice'],
    eventTypes: ['National', 'Supercross', 'Regional', 'Amateur', 'State Championship'],
    iconName: 'Zap',
    accentColor: 'text-lime-400',
  },
  {
    id: 'enduro',
    label: 'Enduro / GNCC',
    description: 'Off-road enduro, GNCC, ISDE, woods racing',
    aiProtocolText: `DISCIPLINE: Enduro / GNCC
Coaching language and framing rules:
- Talk about special tests, cross-country laps, navigation, and fuel/water management over long durations.
- Races can be 2–8 hours. Aerobic base and bonk prevention are as important as peak power.
- Suspension setup: prioritize compliance over outright speed. Linkage leverage, slow-speed compression, handlebar rise for standing ergonomics.
- Fitness: long Zone 2 base blocks + hiking/mountain biking for low-impact cardio. Grip endurance is the limiter, not VO2.
- Nutrition: fueling strategy is critical — 60–90g carbs/hr during race; schedule pit stops around fueling windows.
- Tires: tube vs. mousse decision matters. Terrain-specific tread compound.
- Navigation: if GPS/roadbook is used, factor in navigational errors as a coaching point.
- Mental: it's a long day — managing energy, frustration, and mechanical issues is a skill set.`,
    sessionTypes: ['Trail Ride', 'Special Test', 'Race Lap', 'Enduro Training', 'Navigation Practice'],
    eventTypes: ['GNCC', 'ISDE', 'National Enduro', 'Hare Scramble', 'Local Enduro'],
    iconName: 'Trees',
    accentColor: 'text-green-400',
  },
  {
    id: 'fmx',
    label: 'Freestyle MX',
    description: 'Big-air, tricks, competition FMX and exhibition',
    aiProtocolText: `DISCIPLINE: Freestyle Motocross (FMX)
Coaching language and framing rules:
- This is trick-progression and big-air sport. Lap times are irrelevant. Scoring is based on trick difficulty, execution, flow, and amplitude.
- Talk about trick tiers: basic grabs → combo tricks → no-handers → inverted → super-technical. Progression must be sequential and safe.
- Ramp setup: lip height and angle determine arc and amplitude. Bag landing vs. dirt landing vs. foam pit = different risk levels for progression.
- Suspension: FMX-specific setup differs from MX. Stiffer springs for big landing impacts; fork oil viscosity matters for landing loads.
- Fitness: explosive power, shoulder stability, and core strength are primary. Flexibility and fall-training are injury prevention tools.
- Injury risk is HIGH. Document all crash events; factor active injuries heavily into trick progression recommendations.
- Mental: fear management and progressive overload (not rushing progression) are the most important coaching domains.
- Never recommend attempting a new trick without spotter, proper safety gear, and a safe landing zone.`,
    sessionTypes: ['Bag Session', 'Dirt Jump Session', 'Foam Pit', 'Photo/Video Shoot', 'Competition'],
    eventTypes: ['FMX Competition', 'Exhibition', 'Nitro Circus', 'X Games', 'Demo'],
    iconName: 'Star',
    accentColor: 'text-orange-400',
  },
  {
    id: 'flat_track',
    label: 'Flat Track',
    description: 'Oval dirt track racing — TT, short track, mile, half-mile',
    aiProtocolText: `DISCIPLINE: Flat Track / Oval Racing
Coaching language and framing rules:
- This is a sliding, momentum-based discipline. Entry speed, slide angle, throttle timing, and late-apex lines are the primary coaching domains.
- Track types: short track (1/4 mi oval), TT (jump + oval), half-mile, mile. Each has different gearing, tire, and slide-angle requirements.
- Chassis: flat track geometry is radically different from MX. Discuss chassis balance, rear weight bias, and rake/trail.
- Tires: no tread (grooved asphalt oval) or full knob (dirt oval). Tire pressure and compound are critical session-to-session.
- Fitness: flat track is less physically demanding than MX but requires elite clutch and throttle hand sensitivity; forearm endurance matters.
- Starts: unlike MX, flat track starts are from a rolling slow-roll — focus on hole shot from a rolling start position.
- Sessions are short and fast (5–10 min heats). Setup changes between sessions matter more than fitness on race day.`,
    sessionTypes: ['Practice', 'Time Trial', 'Heat Race', 'Semi', 'Main Event'],
    eventTypes: ['AMA Flat Track', 'AFT', 'Regional TT', 'Short Track', 'Half-Mile', 'Mile'],
    iconName: 'Circle',
    accentColor: 'text-yellow-400',
  },
  {
    id: 'trail',
    label: 'Trail / Recreational',
    description: 'Single-track trail riding, adventure, recreational offroad',
    aiProtocolText: `DISCIPLINE: Trail / Recreational Offroad
Coaching language and framing rules:
- The goal is enjoyment, skill progression, and safe riding — NOT competitive results.
- Focus on technical skill: body position, clutch control on steep terrain, rock gardens, river crossings, log hops, switchbacks.
- Gear and safety are high priority: appropriate protection, navigation, hydration packs, group riding etiquette.
- Bike maintenance: trail riding is hard on bikes. Emphasize consistent service intervals, air filter, cooling system, and chain management.
- Fitness: trail riding can be surprisingly demanding. Core stability, leg endurance, and relaxed upper-body tension matter.
- Mental: getting stuck or dabbing is normal — build confidence progressively. Remove pressure of "performance".
- Fuel and range: plan rides around fuel capacity. Long-range adventure riders need tankbag awareness.`,
    sessionTypes: ['Trail Ride', 'Skills Practice', 'Group Ride', 'Adventure Route', 'Technical Section Practice'],
    eventTypes: ['Fun Ride', 'Trail Day', 'Adventure Ride', 'Club Ride'],
    iconName: 'Map',
    accentColor: 'text-blue-400',
  },
  {
    id: 'pit_bike',
    label: 'Pit Bike / Youth',
    description: '50cc–110cc youth and pit bike racing',
    aiProtocolText: `DISCIPLINE: Pit Bike / Youth Racing
Coaching language and framing rules:
- This is entry-level racing for children or pit bike enthusiasts. Safety and enjoyment are paramount.
- Coaching must be age-appropriate. For youth riders: focus on body position basics, no-brake turns, smooth throttle. Avoid adult-racing intensity framing.
- For pit bike racing: bikes are 50–150cc. Mini-moto tracks. Lap times are tight. Focus on smooth technique over brute speed.
- Parent involvement: parents are part of the program. Communication style should be accessible to a non-technical parent.
- Gear: full protective gear is mandatory — helmet, neck brace, chest protector, boots, gloves — even at slow speeds.
- Suspension: youth bikes often have poor stock suspension. Upgrades to sag and spring rates appropriate for the rider's weight make a huge difference.
- Fun first: the biggest coaching mistake at youth level is creating anxiety. Celebrate small wins loudly.`,
    sessionTypes: ['Practice', 'Race', 'Skills Session', 'Fun Ride'],
    eventTypes: ['Youth Race', 'Pit Bike Race', 'Amateur', 'Mini Moto'],
    iconName: 'Baby',
    accentColor: 'text-pink-400',
  },
  {
    id: 'nascar',
    label: 'Stock Car / NASCAR',
    description: 'Oval and road course stock car racing — NASCAR, ARCA, Late Model',
    aiProtocolText: `DISCIPLINE: Stock Car / NASCAR
Coaching language and framing rules:
- Talk about aero balance, track position, stage strategy, pit road execution, and drafting.
- Oval tracks: superspeedway (plate racing / drafting packs), intermediate (1.5-mile, aero-dominant), short track (mechanical grip, bump drafting), road course (braking, trail-braking, bus-stop chicanes).
- Setup language: wedge, trackbar, spring rubbers, sway bar, splitter height, spoiler angle, camber/caster. Never use MX/offroad terminology.
- Strategy: fuel windows, tire falloff, stage points, green-flag pit cycles vs. caution timing. Always frame decisions in laps-remaining.
- Fitness: stock car drivers face sustained G-forces (especially left turns), heat (cockpit 120°F+), and neck load. Neck strength training, heat acclimatization, and cardiovascular base are the primary fitness domains.
- Mental: restarts are high-stakes moments. Drafting and traffic management require split-second decisions. Visualization of pit road execution, restart lanes, and fuel strategy is key.
- Communication: spotter/crew chief radio communication is a competitive tool. Clear, concise in-race communication matters.`,
    sessionTypes: ['Practice', 'Qualifying', 'Heat Race', 'Feature Race', 'Road Course Practice'],
    eventTypes: ['NASCAR Cup', 'NASCAR Xfinity', 'NASCAR Truck', 'ARCA', 'Late Model', 'Super Late Model'],
    iconName: 'Gauge',
    accentColor: 'text-red-400',
  },
  {
    id: 'drag',
    label: 'Drag Racing',
    description: 'Quarter-mile and eighth-mile drag racing — Top Fuel, Pro Stock, bracket',
    aiProtocolText: `DISCIPLINE: Drag Racing
Coaching language and framing rules:
- Talk about reaction time, 60-foot, 330-foot, eighth-mile split, and quarter-mile ET / MPH.
- Categories: Top Fuel (nitromethane, <3.7s), Funny Car, Pro Stock, Pro Modified, Super Stock, bracket racing, index racing. Language and setup differ drastically by category.
- Reaction time: tree timing (0.400s full tree for bracket, 0.500s for Pro), reaction time goal <0.020s for competition. Foul (red light) is the #1 unforced error — coaching should address pre-stage routine.
- Chassis tuning: 60-foot time is the primary diagnostic. Soft suspension launches for traction; wheelstand control; transbrake use. Chassis tune language: shock valving, front strut, leaf spring, four-link preload.
- Tire prep: burnout technique, tire temperature, compound selection by track temperature.
- Bracket racing: dial-in strategy, breaking out vs. giving away stripe, handicap starts.
- Fitness: drag racing is short-burst (<10 seconds) high-attention. Mental readiness, pre-run routine, and staging focus are the primary coaching domains.
- Data: data logging for serious competitors — clutch management, fuel curve, RPM trace, driveshaft speed.`,
    sessionTypes: ['Test Hit', 'Time Trial', 'Qualifying Pass', 'Eliminations Round', 'Burnout Practice'],
    eventTypes: ['NHRA National', 'PDRA', 'Local Bracket Race', 'Test-and-Tune', 'Points Race', 'No-Prep Kings'],
    iconName: 'Flame',
    accentColor: 'text-orange-500',
  },
  {
    id: 'rally',
    label: 'Rally / Stage Rally',
    description: 'Point-to-point stage rally — WRC, ARA, club rally, rallycross',
    aiProtocolText: `DISCIPLINE: Rally / Stage Rally
Coaching language and framing rules:
- Talk about pacenote calls, stage pace, service park strategy, recce runs, and road book.
- Co-driver relationship is unique — pacenotes are the backbone of performance. Coaching should address note quality, call timing, and driver–co-driver communication rhythm.
- Surface types: tarmac (sprint speed, tire conservation), gravel (corner entry technique, jump landings, rock damage risk), snow/ice (momentum and slip angle management), mixed (tire choice, service strategy).
- Stages are timed on public roads (closed). Fastest cumulative time wins — no head-to-head. Reliability and no-mistake runs beat maximum-attack all day.
- Setup changes at service: tire selection, suspension geometry, brake bias, differential settings. Time-pressure matters — a 30-minute service is tight.
- Fitness: co-driver posture, endurance for multi-day events, in-car communication under fatigue.
- Safety: pace notes, roll cage, fire suppression, HANS device, medical card. Rally safety culture is non-negotiable — always factor safety into pace recommendations.
- Mental: a missed note or late call costs time; recovering composure immediately is a trainable skill.`,
    sessionTypes: ['Recce Run', 'Shakedown', 'Stage Run', 'Service Park', 'Road Section', 'Super Special Stage'],
    eventTypes: ['WRC', 'WRC2', 'ARA National', 'RallyCross', 'Club Rally', 'Endurance Rally'],
    iconName: 'Mountain',
    accentColor: 'text-sky-400',
  },
  {
    id: 'karting',
    label: 'Karting',
    description: 'Sprint karts, endurance karts, shifter karts — all engine classes',
    aiProtocolText: `DISCIPLINE: Karting
Coaching language and framing rules:
- Talk about chassis tuning (caster, camber, toe, corner weight, axle stiffness), tire management, and line consistency.
- Karting is the development foundation for car racing. Technical precision is paramount — fractions of a second matter at the level where drivers are developing.
- Classes: Rotax, IAME X30, TaG, 125cc Shifter (KZ), LO206 (arrive-and-drive spec), cadet classes (Mini ROK, Micro ROK). Each has drastically different power and tuning latitude.
- Chassis tuning is the primary performance lever: wide rear width = grip but oversteer; narrow = loose but low drag. Caster changes alter front-end feel through the corner. Never guess — log every change and its lap-time delta.
- Tire management: kart tires are extremely sensitive to temperature. Grain, blistering, and glazing are common — coach should address driving style's impact on tire life.
- Driving technique: karting develops car-control fundamentals — trail braking, weight transfer, smooth inputs. Frame coaching around precision and repeatability, not raw speed.
- Driver development: karting is often where young drivers (ages 6–18) build fundamentals. Age-appropriate coaching tone is important — challenge without discouraging.
- Data: AiM Solo, Mychron data loggers are common. Overlay laps, braking points, corner speed.`,
    sessionTypes: ['Practice Session', 'Qualifying', 'Pre-Final Heat', 'Final', 'Endurance Stint', 'Data Review'],
    eventTypes: ['ROK Cup', 'Rotax Grand Finals', 'SKUSA ProKart', 'Club Race', 'Endurance Race', 'Regional Championship'],
    iconName: 'Trophy',
    accentColor: 'text-purple-400',
  },
]

/** Map for O(1) lookup */
export const DISCIPLINE_MAP: Record<DisciplineId, Discipline> = Object.fromEntries(
  DISCIPLINES.map((d) => [d.id, d]),
) as Record<DisciplineId, Discipline>

/** Default discipline — used when a team hasn't configured one */
export const DEFAULT_DISCIPLINE_ID: DisciplineId = 'mx_sx'

/**
 * Returns the AI protocol text for a discipline ID.
 * Falls back to MX/SX default if unrecognized.
 */
export function getDisciplineProtocol(disciplineId: string | null | undefined): string {
  const d = DISCIPLINE_MAP[(disciplineId ?? DEFAULT_DISCIPLINE_ID) as DisciplineId]
  return d?.aiProtocolText ?? DISCIPLINE_MAP[DEFAULT_DISCIPLINE_ID].aiProtocolText
}

/**
 * Returns the Discipline object for a given ID.
 * Falls back to MX/SX default.
 */
export function getDiscipline(disciplineId: string | null | undefined): Discipline {
  return DISCIPLINE_MAP[(disciplineId ?? DEFAULT_DISCIPLINE_ID) as DisciplineId] ?? DISCIPLINE_MAP[DEFAULT_DISCIPLINE_ID]
}
