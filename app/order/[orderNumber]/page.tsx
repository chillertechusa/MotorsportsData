import MdNav from '@/components/md-nav'
import Footer from '@/components/footer'
import { getOrderByNumber } from '@/app/actions/store'
import { formatCents } from '@/lib/money'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Confirmed — Moto D',
  robots: { index: false },
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const { orderNumber } = await params
  const data = await getOrderByNumber(orderNumber)
  if (!data) notFound()
  const { order, items } = data

  return (
    <>
      <MdNav />
      <main className="pt-16 min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <svg className="h-8 w-8 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-primary text-xs font-bold uppercase tracking-[0.3em]">
              {order.status === 'paid' ? 'Payment Confirmed' : 'Order Received'}
            </p>
            <h1
              className="mt-2 text-foreground text-4xl font-black uppercase md:text-5xl"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              You&apos;re Sending It
            </h1>
            <p className="mt-3 text-muted-foreground">
              Thanks, {order.customerName.split(' ')[0]}. We emailed a receipt to {order.email}.
            </p>
            <p className="mt-1 text-sm uppercase tracking-widest text-muted-foreground">
              Order <span className="text-foreground font-bold">{order.orderNumber}</span>
            </p>
          </div>

          <div className="mt-10 border border-border bg-card p-6">
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-white">
                    {item.image && <Image src={item.image} alt={item.productName} fill className="object-contain" sizes="64px" />}
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-foreground text-sm font-bold uppercase" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
                      {item.productName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {item.color} · {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="self-center text-foreground text-sm font-semibold">
                    {formatCents(item.unitPriceCents * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground uppercase tracking-widest text-xs">Subtotal</span>
                <span className="text-foreground">{formatCents(order.subtotalCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground uppercase tracking-widest text-xs">Shipping</span>
                <span className="text-foreground">{order.shippingCents === 0 ? 'FREE' : formatCents(order.shippingCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground uppercase tracking-widest text-xs">Tax</span>
                <span className="text-foreground">{formatCents(order.taxCents)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-foreground text-sm font-bold uppercase tracking-widest">Total</span>
                <span className="text-primary text-xl font-black" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
                  {formatCents(order.totalCents)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 border border-border bg-card p-6">
            <h2 className="text-foreground text-sm font-bold uppercase tracking-widest" style={{ fontFamily: 'var(--font-barlow-condensed)' }}>
              Shipping To
            </h2>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
              {order.customerName}
              <br />
              {order.shipAddress1}
              {order.shipAddress2 ? `, ${order.shipAddress2}` : ''}
              <br />
              {order.shipCity}, {order.shipState} {order.shipZip}
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/data/sign-in"
              className="w-full bg-primary px-8 py-3 text-center text-sm font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90 sm:w-auto"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Track Your Order
            </Link>
            <Link
              href="/shop"
              className="w-full border border-border px-8 py-3 text-center text-sm font-black uppercase tracking-widest text-foreground hover:border-primary sm:w-auto"
              style={{ fontFamily: 'var(--font-barlow-condensed)' }}
            >
              Keep Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
