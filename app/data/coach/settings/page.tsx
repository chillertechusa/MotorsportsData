export default function CoachSettingsPage() {
  return (
    <div className="p-6 max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-100"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
          Coach Settings
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Business profile, notifications, and integrations.</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Business Profile</h2>
        <div className="bg-zinc-900 border border-zinc-800 p-5 space-y-4">
          {[
            { label: 'Business Name', placeholder: 'Aldon Baker Training' },
            { label: 'Primary Discipline', placeholder: 'Motocross / Supercross' },
            { label: 'Location', placeholder: 'Clermont, FL' },
            { label: 'Contact Email', placeholder: 'coach@yourteam.com' },
          ].map(({ label, placeholder }) => (
            <div key={label}>
              <label className="block font-mono text-[9px] uppercase tracking-widest text-zinc-500 mb-1.5">{label}</label>
              <input
                type="text"
                placeholder={placeholder}
                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 text-sm px-3 py-2 placeholder:text-zinc-700 focus:outline-none focus:border-lime-400/50"
              />
            </div>
          ))}
          <button className="bg-lime-400 text-zinc-950 text-sm font-bold px-5 py-2 hover:bg-lime-300 transition-colors">
            Save Profile
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Square Payments</h2>
        <div className="bg-zinc-900 border border-zinc-800 p-5">
          <p className="text-sm text-zinc-400 mb-3">
            Connect your Square account to send invoices and collect payments directly from the platform.
          </p>
          <button
            disabled
            className="bg-zinc-800 border border-zinc-700 text-zinc-500 text-sm font-bold px-5 py-2 cursor-not-allowed"
          >
            Connect Square — Coming Soon
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Notifications</h2>
        <div className="bg-zinc-900 border border-zinc-800 divide-y divide-zinc-800">
          {[
            { label: 'Session reminders', sub: '24h before each scheduled session' },
            { label: 'Invoice viewed', sub: 'When an athlete opens an invoice' },
            { label: 'Training plan due', sub: 'When a plan week expires without completion' },
          ].map(({ label, sub }) => (
            <div key={label} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm text-zinc-200">{label}</p>
                <p className="text-xs text-zinc-600">{sub}</p>
              </div>
              <div className="h-5 w-10 bg-lime-400/20 border border-lime-400/30 rounded-full relative cursor-pointer">
                <div className="h-4 w-4 bg-lime-400 rounded-full absolute right-0.5 top-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
