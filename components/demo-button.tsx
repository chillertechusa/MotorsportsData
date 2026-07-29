'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DemoButtonProps {
  variant?: 'primary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

export default function DemoButton({
  variant = 'primary',
  size = 'md',
  className,
  label = 'Try it live',
}: DemoButtonProps) {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  async function handleClick() {
    if (status === 'loading') return
    setStatus('loading')
    try {
      const res = await fetch('/api/demo/provision', {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setStatus('error')
        // reset after 3s so they can retry
        setTimeout(() => setStatus('idle'), 3000)
        return
      }
      router.push(data.redirectTo ?? '/data/coach/roster')
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const isLoading = status === 'loading'
  const isError   = status === 'error'

  const sizeClasses = {
    sm: 'text-xs px-4 py-2 gap-1.5',
    md: 'text-sm px-6 py-2.5 gap-2',
    lg: 'text-base px-8 py-4 gap-2',
  }[size]

  const variantClasses = {
    primary: isError
      ? 'bg-red-500/20 border border-red-500/40 text-red-400 cursor-not-allowed'
      : 'bg-lime-400 text-zinc-950 hover:bg-lime-300 active:scale-[0.98]',
    ghost: isError
      ? 'border border-red-500/40 text-red-400 cursor-not-allowed'
      : 'border border-zinc-700 text-zinc-300 hover:border-lime-400/50 hover:text-zinc-100',
  }[variant]

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || isError}
      aria-label={isLoading ? 'Provisioning your demo account…' : label}
      className={cn(
        'inline-flex items-center justify-center font-black uppercase tracking-widest transition-all',
        sizeClasses,
        variantClasses,
        isLoading && 'opacity-80 cursor-wait',
        className,
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" aria-hidden="true" />
          Setting up your demo…
        </>
      ) : isError ? (
        'Try again'
      ) : (
        <>
          {label}
          <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </>
      )}
    </button>
  )
}
