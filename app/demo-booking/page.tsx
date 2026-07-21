import { Button } from '@/components/ui/button'
import { CheckCircle2, Users, TrendingUp, Shield, Zap } from 'lucide-react'

export const metadata = {
  title: 'Coach Demo — Motorsports Data',
  description: 'Book a 30-min demo of the elite coach platform.',
  alternates: { canonical: 'https://motorsportsdata.io/demo-booking' },
}

export default function DemoBookingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Hero */}
      <div className="border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            Coach Platform Demo
          </h1>
          <p className="text-lg text-zinc-400 mb-8">
            See how elite motocross riders use data to predict peak performance and accountability.
          </p>

          {/* CTA */}
          <div className="flex gap-4 flex-wrap">
            <a
              href="https://calendly.com/motorsportsdata/demo"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-lime-500 text-zinc-950 font-bold rounded-lg hover:bg-lime-400 transition"
            >
              Book 30-Min Demo
            </a>
            <button className="px-6 py-3 border border-zinc-700 rounded-lg hover:border-zinc-500 transition">
              Watch 5-Min Walkthrough
            </button>
          </div>
        </div>
      </div>

      {/* What You'll See */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-black uppercase mb-12">What You'll See</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: 'Readiness Score',
              desc: 'Sleep + HRV + volume → race-day peak prediction with taper protocol.',
              icon: TrendingUp,
            },
            {
              title: 'IP Vault',
              desc: 'Encrypted coach templates. Your proprietary periodization stays locked.',
              icon: Shield,
            },
            {
              title: 'Accountability Audit',
              desc: 'Every assignment tracked. Compliance flagged. Immutable records.',
              icon: CheckCircle2,
            },
            {
              title: 'Multi-Rider Telemetry',
              desc: 'Team comparison. Lap analysis. See where each rider peaks.',
              icon: Users,
            },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="border border-zinc-800 bg-zinc-900 p-6 rounded-lg">
                <Icon className="h-6 w-6 text-lime-500 mb-3" />
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-400">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Why Now */}
      <div className="border-t border-zinc-800 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-black uppercase mb-12">For Elite Coaches</h2>
          <div className="space-y-4">
            {[
              'Know when your riders peak — sleep + HRV science, not guesses',
              'Protect your edge — encrypted templates, zero customer visibility',
              'Prove compliance — audit trail every assignment, every acknowledgment',
              'Compare your team — head-to-head telemetry, find the gaps',
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <Zap className="h-5 w-5 text-lime-500 mt-1 flex-shrink-0" />
                <p className="text-zinc-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-black uppercase mb-12">FAQ</h2>
        <div className="space-y-6">
          {[
            {
              q: 'How much does it cost?',
              a: 'Pricing starts at $49/mo for Race Team tier (full platform access). Factory Rig tier is $199/mo.',
            },
            {
              q: 'Do you integrate with my current devices?',
              a: 'Yes. We support 20+ devices: MYLAPSTR2, Westhold G3, Garmin, Polar, Apple Watch, and more.',
            },
            {
              q: 'Is my data encrypted?',
              a: 'Coach templates are AES-256 encrypted. All data is encrypted in transit and at rest.',
            },
            {
              q: 'Can I import historical data?',
              a: 'Yes. Upload CSV, XML, or native device files. We auto-detect format and backfill your account.',
            },
          ].map((item, idx) => (
            <div key={idx} className="border-b border-zinc-800 pb-4">
              <h3 className="font-bold mb-2">{item.q}</h3>
              <p className="text-zinc-400 text-sm">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-zinc-800 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-zinc-400 mb-4">Questions before booking?</p>
          <a href="mailto:hello@motorsportsdata.io" className="text-lime-500 font-bold hover:underline">
            hello@motorsportsdata.io
          </a>
        </div>
      </div>
    </div>
  )
}
