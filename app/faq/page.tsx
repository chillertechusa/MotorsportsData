'use client'

import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function FAQPage() {
  const [search, setSearch] = useState('')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      category: 'Bike Diagnostics',
      items: [
        {
          q: 'How accurate is the Bike Doctor diagnosis?',
          a: 'The Bike Doctor uses AI trained on thousands of real motocross diagnostic cases. It narrows down likely causes based on your symptom description, severity, and bike model. Always confirm with a shop before major repairs.',
        },
        {
          q: 'What bikes does Bike Doctor support?',
          a: 'Bike Doctor works with any motocross bike: 2-stroke (YZ, CR, RM, KX) and 4-stroke (CRF, WR, DR, KLX, KX450). We have setup specs for all current models.',
        },
        {
          q: 'Can I get help with jetting?',
          a: 'Yes! Tell the Bike Doctor your altitude, weather, and how the bike feels on the track. It will recommend pilot, needle, and main jet changes with reasons for each.',
        },
        {
          q: 'Is there a severity rating?',
          a: 'Yes. Diagnoses include: "Ride it, monitor" (minor, safe to race) | "Fix before next session" (medium, affects performance) | "Do not ride" (critical, safety risk).',
        },
      ],
    },
    {
      category: 'Coaching',
      items: [
        {
          q: 'How do I invite a coach?',
          a: 'Go to Household tab → "Invite Coach" → Enter their email. They receive a link to accept and get read-only access to your bikes and ride log.',
        },
        {
          q: 'What can coaches see?',
          a: 'Coaches see your bike maintenance notes, setup notebooks, ride log, and readiness status. They cannot export data or download files.',
        },
        {
          q: 'How much does Coach Connect cost?',
          a: 'Coach Connect is $49/month for unlimited rider connections. Coaches can monitor up to 50 athletes simultaneously.',
        },
        {
          q: 'Can multiple coaches access my data?',
          a: 'Yes. You can invite as many coaches as you want. Each sees the same read-only data and cannot see each other.',
        },
      ],
    },
    {
      category: 'Shops & Work Orders',
      items: [
        {
          q: 'How do I send my diagnosis to a shop?',
          a: 'After the Bike Doctor generates a diagnosis, click "Send diagnosis to my shop". Enter the shop name/email and it creates a pre-filled work order they can use.',
        },
        {
          q: 'What shops does Bike Doctor connect to?',
          a: 'We connect to any shop using Clutch DMS. If your shop uses Clutch, work orders arrive automatically. Otherwise, they get an email link.',
        },
        {
          q: 'Is sending a work order free?',
          a: 'Yes. Sending work orders is free forever. Shops may charge for the service itself.',
        },
      ],
    },
    {
      category: 'Guardian & Family',
      items: [
        {
          q: 'Can I track my kids\' bikes?',
          a: 'Yes. Parents create one account, then add rider profiles for each child. Parent sees all bikes, readiness, and race schedule. Kids get their own login too.',
        },
        {
          q: 'What age can kids have their own account?',
          a: 'Riders 18+ create their own account. Riders 13-17 need parental consent (COPPA-compliant). Under 13 requires full guardian setup.',
        },
        {
          q: 'Can I see my kid\' ride metrics?',
          a: 'Yes. Parents see lap times, bike readiness, maintenance schedule, and injury/soreness tracking. Full transparency into their racing program.',
        },
      ],
    },
    {
      category: 'Account & Privacy',
      items: [
        {
          q: 'Is my data private?',
          a: 'Yes. All rider data is encrypted at rest and in transit. Coaches and shops get only the data you explicitly share. See Privacy Policy for details.',
        },
        {
          q: 'Can I delete my account?',
          a: 'Yes. Go to Settings → Account → Delete Account. All your data is permanently removed within 30 days.',
        },
        {
          q: 'How do I change my password?',
          a: 'Go to Settings → Security → Change Password. You\'ll need your current password and email verification.',
        },
      ],
    },
  ]

  const filtered = search
    ? faqs.map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.q.toLowerCase().includes(search.toLowerCase()) ||
            item.a.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((cat) => cat.items.length > 0)
    : faqs

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-zinc-100 mb-4">Frequently Asked Questions</h1>
          <p className="text-zinc-400 mb-6">Everything you need to know about Bike Doctor</p>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-100"
            />
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-8">
          {filtered.map((category, catIdx) => (
            <div key={catIdx}>
              <h2 className="text-xl font-bold text-lime-400 mb-4">{category.category}</h2>
              <div className="space-y-3">
                {category.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setOpenIndex(openIndex === `${catIdx}-${itemIdx}` ? null : `${catIdx}-${itemIdx}`)
                      }
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-700/30 transition-colors text-left"
                    >
                      <p className="font-medium text-zinc-100">{item.q}</p>
                      <ChevronDown
                        className={`h-5 w-5 text-lime-400 transition-transform ${
                          openIndex === `${catIdx}-${itemIdx}` ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openIndex === `${catIdx}-${itemIdx}` && (
                      <div className="px-6 py-4 bg-zinc-700/20 border-t border-zinc-700 text-zinc-300">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-zinc-400 mb-4">Can't find what you're looking for?</p>
          <a href="/help" className="text-lime-400 hover:text-lime-300 font-medium">
            Visit Help Center → or email support@bikedoctor.io
          </a>
        </div>
      </div>
    </main>
  )
}
