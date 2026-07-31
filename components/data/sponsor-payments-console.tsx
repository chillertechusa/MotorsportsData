'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { toast } from 'sonner'
import { ArrowUpRight, Building2, CheckCircle2, CreditCard, FileText, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const fetcher = (url: string) => fetch(url).then(async (response) => {
  const data = await response.json()
  if (!response.ok) throw new Error(data.error ?? 'Request failed')
  return data
})

type Connection = {
  connected: boolean
  connection: null | {
    merchantId: string
    merchantName: string | null
    status: string
    connectedAt: string | null
  }
}

type Sponsor = {
  id: string
  sponsorName: string
  contactEmail: string | null
  valueCents: number
  status: string
}

type Invoice = {
  id: string
  invoiceNumber: string
  title: string
  amountCents: number
  status: string
  publicUrl: string | null
  dueDate: string | null
  createdAt: string | null
}

type InvoiceData = { invoices: Invoice[]; sponsors: Sponsor[] }

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function statusVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  if (status === 'paid') return 'default'
  if (status === 'failed' || status === 'canceled') return 'destructive'
  if (status === 'sent') return 'secondary'
  return 'outline'
}

export function SponsorPaymentsConsole() {
  const { data: connection, mutate: mutateConnection, isLoading: loadingConnection } = useSWR<Connection>(
    '/api/square/connection',
    fetcher,
  )
  const { data, mutate, isLoading } = useSWR<InvoiceData>('/api/md-invoices', fetcher)
  const [sponsorId, setSponsorId] = useState('')
  const [title, setTitle] = useState('Racing program sponsorship')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [sending, setSending] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const selectedSponsor = useMemo(
    () => data?.sponsors.find((sponsor) => sponsor.id === sponsorId),
    [data?.sponsors, sponsorId],
  )

  async function sendInvoice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const amountCents = Math.round(Number(amount) * 100)
    if (!sponsorId || !Number.isInteger(amountCents) || amountCents < 100) {
      toast.error('Choose a sponsor and enter an amount of at least $1.')
      return
    }
    if (!selectedSponsor?.contactEmail) {
      toast.error('Add a billing email to this sponsor before invoicing.')
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/md-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sponsorId, title, amountCents, dueDate: dueDate || undefined }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Unable to send invoice')
      toast.success(`Invoice ${result.invoiceNumber} sent to ${selectedSponsor.contactEmail}.`)
      setAmount('')
      setDueDate('')
      await mutate()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send invoice'
      toast.error(message === 'square_account_not_connected' ? 'Connect your family Square account first.' : message)
    } finally {
      setSending(false)
    }
  }

  async function disconnect() {
    setDisconnecting(true)
    try {
      const response = await fetch('/api/square/connection', { method: 'DELETE' })
      if (!response.ok) throw new Error('Unable to disconnect Square')
      toast.success('Square account disconnected.')
      await mutateConnection()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to disconnect Square')
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <section aria-labelledby="family-payments-title" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-yamaha)]">Money rail</p>
        <h2 id="family-payments-title" className="text-xl font-black uppercase tracking-tight text-zinc-100">
          Get the family paid
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
          Send real sponsor invoices. Card or ACH payments settle directly into your family&apos;s connected Square account.
        </p>
      </div>

      <Card className="rounded-none border-zinc-800 bg-zinc-900 text-zinc-100">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard aria-hidden="true" />
              Family Square account
            </CardTitle>
            <CardDescription className="text-zinc-500">
              MD never receives your sponsor money. Square deposits it directly to you.
            </CardDescription>
          </div>
          {connection?.connected ? <Badge>Connected</Badge> : <Badge variant="outline">Not connected</Badge>}
        </CardHeader>
        <CardContent>
          {loadingConnection ? (
            <p className="text-sm text-zinc-500">Checking Square connection…</p>
          ) : connection?.connected ? (
            <div className="flex items-center gap-3 border border-zinc-800 bg-zinc-950 p-4">
              <span className="flex size-10 items-center justify-center bg-[var(--color-yamaha)] text-zinc-950">
                <CheckCircle2 aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-zinc-100">
                  {connection.connection?.merchantName ?? 'Square seller account'}
                </p>
                <p className="font-mono text-xs text-zinc-600">Merchant {connection.connection?.merchantId}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 border border-zinc-800 bg-zinc-950 p-4">
              <Building2 className="mt-0.5 text-[var(--color-yamaha)]" aria-hidden="true" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-zinc-100">Connect the account where your family gets paid</p>
                <p className="text-xs leading-relaxed text-zinc-500">
                  You&apos;ll securely approve MD inside Square. Bank details and card data never touch MD.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end gap-2">
          {connection?.connected ? (
            <Button variant="outline" onClick={disconnect} disabled={disconnecting}>
              {disconnecting && <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden="true" />}
              Disconnect
            </Button>
          ) : (
            <Button render={<a href="/api/square/connect" />}>
              Connect Square
              <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          )}
        </CardFooter>
      </Card>

      {connection?.connected && (
        <Card className="rounded-none border-zinc-800 bg-zinc-900 text-zinc-100">
          <CardHeader>
            <CardTitle className="text-base">Send sponsor invoice</CardTitle>
            <CardDescription className="text-zinc-500">
              Square emails a hosted invoice with card and ACH payment options.
            </CardDescription>
          </CardHeader>
          <form onSubmit={sendInvoice}>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="invoice-sponsor">Sponsor</Label>
                <Select value={sponsorId} onValueChange={(value) => setSponsorId(value ?? '')}>
                  <SelectTrigger id="invoice-sponsor" className="border-zinc-700 bg-zinc-950">
                    <SelectValue placeholder="Choose sponsor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(data?.sponsors ?? []).map((sponsor) => (
                        <SelectItem key={sponsor.id} value={sponsor.id}>
                          {sponsor.sponsorName}{sponsor.contactEmail ? ` — ${sponsor.contactEmail}` : ' — billing email needed'}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="invoice-title">What is this payment for?</Label>
                <Input id="invoice-title" value={title} onChange={(event) => setTitle(event.target.value)} minLength={3} required className="border-zinc-700 bg-zinc-950" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="invoice-amount">Amount</Label>
                <Input id="invoice-amount" inputMode="decimal" type="number" min="1" step="0.01" placeholder="1500.00" value={amount} onChange={(event) => setAmount(event.target.value)} required className="border-zinc-700 bg-zinc-950" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="invoice-due">Due date</Label>
                <Input id="invoice-due" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="border-zinc-700 bg-zinc-950" />
              </div>
              {selectedSponsor && !selectedSponsor.contactEmail && (
                <p className="text-xs text-destructive md:col-span-2">Add a billing email to {selectedSponsor.sponsorName} before sending.</p>
              )}
            </CardContent>
            <CardFooter className="justify-end">
              <Button type="submit" disabled={sending || isLoading || !selectedSponsor?.contactEmail}>
                {sending ? <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden="true" /> : <Send data-icon="inline-start" aria-hidden="true" />}
                Send invoice
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <Card className="rounded-none border-zinc-800 bg-zinc-900 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-base">Invoice ledger</CardTitle>
          <CardDescription className="text-zinc-500">The family&apos;s sponsor receivables, reconciled by Square webhooks.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {isLoading ? (
            <p className="text-sm text-zinc-500">Loading invoices…</p>
          ) : (data?.invoices.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center gap-2 border border-dashed border-zinc-800 px-6 py-10 text-center">
              <FileText className="text-zinc-700" aria-hidden="true" />
              <p className="text-sm font-semibold text-zinc-400">No invoices sent yet.</p>
              <p className="text-xs text-zinc-600">Your first paid sponsor invoice will appear here.</p>
            </div>
          ) : (
            data?.invoices.map((invoice) => (
              <article key={invoice.id} className="flex flex-col justify-between gap-3 border border-zinc-800 bg-zinc-950 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-zinc-100">{invoice.title}</p>
                  <p className="font-mono text-xs text-zinc-600">{invoice.invoiceNumber}{invoice.dueDate ? ` · Due ${invoice.dueDate}` : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-zinc-100">{money(invoice.amountCents)}</span>
                  <Badge variant={statusVariant(invoice.status)}>{invoice.status}</Badge>
                  {invoice.publicUrl && (
                    <Button
                      render={<a href={invoice.publicUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open invoice ${invoice.invoiceNumber}`} />}
                      variant="ghost"
                      size="icon"
                    >
                      <ArrowUpRight aria-hidden="true" />
                    </Button>
                  )}
                </div>
              </article>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  )
}
