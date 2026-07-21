'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Mic,
  MessageSquare,
  Users,
  Star,
  Video,
  Radio,
  ChevronRight,
  RefreshCw,
  Trophy,
  Clock,
  Target,
  ArrowLeft,
  Send,
  Loader2,
  CheckCircle2,
  History,
} from 'lucide-react'
import { isFactoryTier } from '@/lib/md-tiers'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Dimension {
  name: string
  score: number
  feedback: string
}

interface AiFeedback {
  overall: string
  dimensions: Dimension[]
  tip: string
}

interface SessionRecord {
  id: string
  scenarioType: string
  questionText: string
  riderAnswerText: string
  aiFeedback: AiFeedback | null
  score: number | null
  createdAt: string
}

// ── Scenario definitions ───────────────────────────────────────────────────────

type ScenarioId = 'post_moto' | 'sponsor_pitch' | 'scout_meeting' | 'social_reel' | 'media_appearance'

interface Scenario {
  id: ScenarioId
  label: string
  sub: string
  icon: typeof Mic
  context: string
  factoryNote?: string
  questions: { standard: string[]; factory: string[] }
}

const SCENARIOS: Scenario[] = [
  {
    id: 'post_moto',
    label: 'Post-Moto Interview',
    sub: 'Podium / broadcast mic',
    icon: Mic,
    context:
      "You just crossed the finish line. Heart rate at 170bpm. A reporter sticks a mic in your face. This is mandatory media at the pro level — riders get fined for skipping it. A one-line answer gets you cut from the broadcast highlight reel and pisses off your sponsors who paid for that airtime.",
    factoryNote: 'Factory standard: name your sponsors once, tell a story, look forward. No "it was good."',
    questions: {
      standard: [
        "Walk us through that last lap — what was going through your head?",
        "You had a tough start. How did you work your way through the pack?",
        "Talk about your bike setup today — what was working?",
        "You made a big pass in the second half. What did you see there?",
        "It looked like the track conditions changed late in the race. How'd you adjust?",
      ],
      factory: [
        "You gave up the lead on lap 14. Take us inside that moment and what your game plan was for the finish.",
        "Your lap times were dropping toward the end. Talk us through your physical conditioning and how that played out today.",
        "How does today's result fit into your championship picture — and what does your team need to see from you at the next round?",
      ],
    },
  },
  {
    id: 'sponsor_pitch',
    label: 'Sponsor Pitch',
    sub: 'Asking someone for money',
    icon: Star,
    context:
      "A team manager or brand rep has agreed to a 10-minute call. This is the hardest interview in the sport — you're asking someone to write a check. Team managers say they pass on genuinely fast kids every year because the kid can't answer one simple question: what do I get? Know your numbers, your deliverables, and your ask before you open your mouth.",
    factoryNote: 'Have your follower count, race schedule, past results, and a specific dollar ask ready.',
    questions: {
      standard: [
        "Why should we back you over the other 50 riders in your class who are also asking us?",
        "Walk me through what we get for a $5,000 sponsorship.",
        "What's your social media reach right now? What kind of content do you post?",
        "What's your race schedule this season and what results are you targeting?",
        "You've never won a championship. Why are you worth betting on?",
      ],
      factory: [
        "We can support one privateer this year at the $15,000 level. Make the case right now — why you?",
        "Walk me through the ROI we can expect. Be specific about deliverables, reach, and how you'll report back to us.",
        "If your results disappoint halfway through the season, what's your plan to still deliver value for our investment?",
      ],
    },
  },
  {
    id: 'scout_meeting',
    label: 'Factory Scout Meeting',
    sub: 'Team manager evaluation',
    icon: Users,
    context:
      "A factory team manager reached out after watching you at Loretta's or Ponca City. This is semi-formal — they're evaluating your attitude, process awareness, and coachability as much as your lap times. One wrong answer about money, parent dynamics, or bad-mouthing a previous team ends it. They have fast riders who are also easy to work with. You need to be both.",
    factoryNote: 'Never bad-mouth past teams. Never talk about money first. Show process, not just results.',
    questions: {
      standard: [
        "Tell me about a race where everything went wrong. How did you handle it?",
        "Describe your relationship with your mechanic and how you communicate about the bike.",
        "What does a typical training week look like for you?",
        "Where do you see yourself in three years?",
        "What's the hardest thing about competing at this level right now?",
      ],
      factory: [
        "We've watched your data. Your pace is elite on the first half of motos but drops significantly late. What's your honest assessment of that, and what are you doing about it?",
        "We'd be investing six figures in your program. What does working with our team look like day-to-day, and how do you handle disagreements with our engineers?",
        "Tell me about the worst thing someone could say about you as a teammate or athlete. Be honest.",
      ],
    },
  },
  {
    id: 'social_reel',
    label: 'Social Media Reel',
    sub: '30-60 second on-camera piece',
    icon: Video,
    context:
      "A sponsor wants a 60-second Instagram reel. You're on camera, no script, one take. Riders freeze. They stare at the lens like a deer. Social content is a contractual obligation at the pro level — sponsors are paying for your face and your audience. A boring reel gets buried by the algorithm and the sponsor doesn't renew. Energy, authenticity, and a natural brand mention. That's all it takes.",
    factoryNote: "Lead with something visual or a hook. Drop the brand name once naturally. End with a CTA.",
    questions: {
      standard: [
        "Introduce yourself and your racing program in under 60 seconds. Go.",
        "Tell the camera why you run [Brand X] and what it means for your program.",
        "Walk us through your race day morning routine — what do you do to prepare?",
        "Break down your bike setup in a way a non-racer would understand.",
        "You just got a top-5. Reaction video — 60 seconds, raw and real.",
      ],
      factory: [
        "You're filming a brand activation reel for your title sponsor at the race venue. Walk the camera through your pit setup and weave in three natural brand mentions without it feeling like a commercial.",
        "You had a bad day — DNF, fell in the first turn. Sponsors want content anyway. Film a 60-second honest take that's authentic and still on-brand.",
      ],
    },
  },
  {
    id: 'media_appearance',
    label: 'Media / Brand Appearance',
    sub: 'Dealer shows, fan events, activations',
    icon: Radio,
    context:
      "A dealer show, fan meet-and-greet, or brand activation. You're not just a racer — you're a brand ambassador. Contractually required at every pro level. The brand is paying for your likeness and the energy you bring to their customers. A flat, quiet rider is a liability. Learn to be relatable, enthusiastic, and to casually drop product knowledge without sounding like a brochure.",
    factoryNote: 'Know 2-3 product facts. Stay non-technical. High energy. Make people feel like they matter.',
    questions: {
      standard: [
        "Explain to a fan who has never watched motocross why they should care about this sport.",
        "A customer asks you what your favorite thing about your bike is. Answer without jargon.",
        "A kid who's 10 years old walks up to you at a dealer show. What do you say to them?",
        "Someone asks you why they should buy Brand X over a competitor. How do you answer without being too salesy?",
        "A YouTube channel wants a 2-minute walkthrough of your competition bike for their non-racing audience.",
      ],
      factory: [
        "You're the featured rider at a national dealer show. The MC asks you to give a 3-minute stage talk about your season and the brand. No notes. Go.",
        "A journalist from a mainstream sports outlet (not moto-specific) asks you to explain the physical demands of your sport and why it deserves more mainstream coverage. Sell the sport.",
      ],
    },
  },
]

// ── Score color helper ────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return 'text-lime-400'
  if (score >= 60) return 'text-yellow-400'
  if (score >= 40) return 'text-orange-400'
  return 'text-red-400'
}

function scoreBg(score: number): string {
  if (score >= 80) return 'bg-lime-400/10 border-lime-400/30'
  if (score >= 60) return 'bg-yellow-400/10 border-yellow-400/30'
  if (score >= 40) return 'bg-orange-400/10 border-orange-400/30'
  return 'bg-red-400/10 border-red-400/30'
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Broadcast Ready'
  if (score >= 60) return 'Solid — Polish It'
  if (score >= 40) return 'Needs Work'
  return 'Back to Basics'
}

// ── Streaming text parser ─────────────────────────────────────────────────────

function parseStreamedFeedback(raw: string): AiFeedback | null {
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  tier?: string
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ViewInterview({ tier }: Props) {
  const factory = isFactoryTier(tier)

  // Navigation state
  const [view, setView] = useState<'picker' | 'session' | 'history'>('picker')
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null)
  const [activeQuestion, setActiveQuestion] = useState<string>('')

  // Session state
  const [answer, setAnswer] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [parsedFeedback, setParsedFeedback] = useState<AiFeedback | null>(null)
  const [answered, setAnswered] = useState(false)

  // History
  const [history, setHistory] = useState<SessionRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const feedbackRef = useRef<HTMLDivElement>(null)

  function pickRandomQuestion(scenario: Scenario): string {
    const pool = factory && scenario.questions.factory.length
      ? [...scenario.questions.standard, ...scenario.questions.factory]
      : scenario.questions.standard
    return pool[Math.floor(Math.random() * pool.length)]
  }

  function startSession(scenario: Scenario) {
    setActiveScenario(scenario)
    setActiveQuestion(pickRandomQuestion(scenario))
    setAnswer('')
    setParsedFeedback(null)
    setAnswered(false)
    setView('session')
  }

  function newQuestion() {
    if (!activeScenario) return
    setActiveQuestion(pickRandomQuestion(activeScenario))
    setAnswer('')
    setParsedFeedback(null)
    setAnswered(false)
  }

  async function submitAnswer() {
    if (!answer.trim() || !activeScenario || streaming) return

    setStreaming(true)
    setParsedFeedback(null)

    try {
      const res = await fetch('/api/md-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioType: activeScenario.id,
          questionText: activeQuestion,
          riderAnswerText: answer,
          tier: tier ?? 'privateer',
        }),
      })

      if (!res.ok) {
        setStreaming(false)
        return
      }

      const data = await res.json()
      if (data.feedback) setParsedFeedback(data.feedback)
      setAnswered(true)
    } finally {
      setStreaming(false)
      setTimeout(() => feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200)
    }
  }

  async function loadHistory() {
    setHistoryLoading(true)
    try {
      const res = await fetch('/api/md-interview')
      if (res.ok) setHistory(await res.json())
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    if (view === 'history') loadHistory()
  }, [view])

  // ── Scenario Picker ──────────────────────────────────────────────────────────

  if (view === 'picker') {
    return (
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wide text-zinc-50">
                Interview Simulator
              </h2>
              <p className="text-sm text-zinc-400 mt-0.5">
                Train the skill that wins sponsors and keeps factory scouts interested. Pick a scenario.
              </p>
            </div>
            <button
              onClick={() => setView('history')}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <History className="h-4 w-4" />
              History
            </button>
          </div>
        </div>

        {/* Stats strip if user has history */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: MessageSquare, label: 'Sessions', value: '—' },
            { icon: Target, label: 'Avg Score', value: '—' },
            { icon: Trophy, label: 'Best Scenario', value: '—' },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <stat.icon className="h-4 w-4 text-zinc-600 mx-auto mb-1" />
              <p className="text-lg font-black text-zinc-300">{stat.value}</p>
              <p className="text-xs text-zinc-600 uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Scenario cards */}
        <div className="space-y-3">
          {SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => startSession(scenario)}
              className="w-full text-left bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 rounded-2xl p-5 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-zinc-800 group-hover:bg-lime-400/10 border border-zinc-700 group-hover:border-lime-400/30 flex items-center justify-center shrink-0 transition-all">
                  <scenario.icon className="h-5 w-5 text-zinc-400 group-hover:text-lime-400 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-zinc-100 group-hover:text-white">{scenario.label}</p>
                    <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-lime-400 transition-colors shrink-0" />
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5 uppercase tracking-wide">{scenario.sub}</p>
                  <p className="text-sm text-zinc-400 mt-2 leading-relaxed line-clamp-2">{scenario.context}</p>
                  {factory && scenario.factoryNote && (
                    <p className="text-xs text-lime-400/70 mt-2 font-medium">
                      Factory Rig: {scenario.factoryNote}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── History view ─────────────────────────────────────────────────────────────

  if (view === 'history') {
    return (
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('picker')}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-black uppercase tracking-wide text-zinc-50">Session History</h2>
            <p className="text-xs text-zinc-500">Your last 50 interview practice sessions</p>
          </div>
        </div>

        {historyLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        )}

        {!historyLoading && history.length === 0 && (
          <div className="text-center py-16">
            <MessageSquare className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium">No sessions yet</p>
            <p className="text-sm text-zinc-600 mt-1">Complete your first interview to see history</p>
          </div>
        )}

        <div className="space-y-3">
          {history.map((session) => {
            const scenario = SCENARIOS.find(s => s.id === session.scenarioType)
            return (
              <div key={session.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                        {scenario?.label ?? session.scenarioType}
                      </span>
                      <span className="text-zinc-700">·</span>
                      <span className="text-xs text-zinc-600">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 font-medium line-clamp-1">{session.questionText}</p>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{session.riderAnswerText}</p>
                  </div>
                  {session.score != null && (
                    <div className={`shrink-0 rounded-lg px-3 py-1.5 border text-center min-w-[60px] ${scoreBg(session.score)}`}>
                      <p className={`text-lg font-black ${scoreColor(session.score)}`}>{session.score}</p>
                      <p className={`text-[10px] font-bold uppercase ${scoreColor(session.score)} opacity-80`}>
                        {scoreLabel(session.score)}
                      </p>
                    </div>
                  )}
                </div>
                {session.aiFeedback?.overall && (
                  <p className="text-xs text-zinc-500 mt-2 border-t border-zinc-800 pt-2 line-clamp-2">
                    {session.aiFeedback.overall}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Active session view ───────────────────────────────────────────────────────

  if (!activeScenario) return null

  return (
    <div className="p-6 space-y-5 max-w-3xl mx-auto">
      {/* Back + scenario label */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setView('picker')}
          className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <activeScenario.icon className="h-4 w-4 text-lime-400" />
          <span className="text-sm font-bold text-zinc-300 uppercase tracking-wide">
            {activeScenario.label}
          </span>
          {factory && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-lime-400/10 text-lime-400 border border-lime-400/30 rounded-full px-2 py-0.5">
              Factory Rig
            </span>
          )}
        </div>
      </div>

      {/* Context card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-600 mb-1">The Situation</p>
        <p className="text-sm text-zinc-400 leading-relaxed">{activeScenario.context}</p>
      </div>

      {/* Question */}
      <div className="bg-zinc-950 border-2 border-zinc-700 rounded-xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-600 mb-2">They ask you:</p>
            <p className="text-lg font-bold text-zinc-100 leading-snug">&ldquo;{activeQuestion}&rdquo;</p>
          </div>
          {!answered && (
            <button
              onClick={newQuestion}
              title="Different question"
              className="shrink-0 p-2 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Answer area — only show before submit */}
      {!answered && (
        <div className="space-y-3">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer exactly as you would say it. Don't over-think it — that's the point."
              rows={5}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 text-sm resize-none focus:outline-none focus:border-zinc-500 leading-relaxed"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className={`text-xs font-mono ${answer.length < 20 ? 'text-zinc-700' : answer.length < 100 ? 'text-yellow-500' : 'text-zinc-500'}`}>
                {answer.length} chars
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={submitAnswer}
              disabled={answer.trim().length < 10 || streaming}
              className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {streaming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scoring...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit for Coaching
                </>
              )}
            </button>
            <p className="text-xs text-zinc-600">
              {answer.trim().length < 10 ? 'Write at least 10 characters' : 'Reviewed by MD Coach AI'}
            </p>
          </div>
        </div>
      )}

      {/* Loading state while waiting for AI feedback */}
      {streaming && !parsedFeedback && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-lime-400 shrink-0" />
          <p className="text-sm font-medium text-zinc-400">MD Coach is reviewing your answer...</p>
        </div>
      )}

      {/* Your answer recap (after submit) */}
      {answered && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-600 mb-2">Your Answer</p>
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{answer}</p>
        </div>
      )}

      {/* Feedback panel */}
      {parsedFeedback && (
        <div ref={feedbackRef} className="space-y-4">
          {/* Overall score */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className={`rounded-2xl border px-4 py-3 text-center min-w-[80px] shrink-0 ${
                scoreBg(
                  Math.round(parsedFeedback.dimensions.reduce((s, d) => s + d.score, 0) / parsedFeedback.dimensions.length)
                )
              }`}>
                {(() => {
                  const avg = Math.round(parsedFeedback.dimensions.reduce((s, d) => s + d.score, 0) / parsedFeedback.dimensions.length)
                  return (
                    <>
                      <p className={`text-3xl font-black ${scoreColor(avg)}`}>{avg}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-wide ${scoreColor(avg)} mt-0.5`}>
                        {scoreLabel(avg)}
                      </p>
                    </>
                  )
                })()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-lime-400" />
                  <p className="text-sm font-bold text-zinc-300 uppercase tracking-wide">MD Coach Feedback</p>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{parsedFeedback.overall}</p>
              </div>
            </div>

            {/* Dimension scores */}
            <div className="space-y-3 border-t border-zinc-800 pt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-600">Breakdown</p>
              {parsedFeedback.dimensions.map((dim) => (
                <div key={dim.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-zinc-400">{dim.name}</p>
                    <p className={`text-xs font-black ${scoreColor(dim.score)}`}>{dim.score}/100</p>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        dim.score >= 80 ? 'bg-lime-400' : dim.score >= 60 ? 'bg-yellow-400' : dim.score >= 40 ? 'bg-orange-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{dim.feedback}</p>
                </div>
              ))}
            </div>

            {/* Drill tip */}
            <div className="bg-lime-400/5 border border-lime-400/20 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-lime-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-lime-400 uppercase tracking-wide mb-1">Practice Drill</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">{parsedFeedback.tip}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={newQuestion}
              className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              New Question
            </button>
            <button
              onClick={() => setView('picker')}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Change Scenario
            </button>
            <button
              onClick={() => setView('history')}
              className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 font-medium px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              <History className="h-4 w-4" />
              History
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
