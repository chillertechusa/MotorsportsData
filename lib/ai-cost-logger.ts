/**
 * AI Cost Logger
 * Logs every AI call (tokens + estimated USD cost) to md_ai_cost_log.
 * Uses micro-dollars (÷ 1,000,000 = USD) to keep integer math clean.
 *
 * Pricing per 1M tokens (input / output) as of July 2026:
 *   gemini-2.5-flash  $0.30 / $1.00
 *   gemini-2.5-pro    $7.00 / $21.00
 *   claude-opus-4-1   $75.00 / $225.00  (was claude-opus-4-8 in some routes)
 *   gpt-4-turbo       $10.00 / $30.00
 *   gpt-4o            $5.00  / $15.00
 *   gpt-4o-mini       $0.15  / $0.60
 */

import { createServiceClient } from '@/lib/supabase/service'

// Prices in micro-USD per token  (price_per_million / 1_000_000 * 1_000_000 = price_per_million)
// We store cost_usd_micro = tokens * price_per_million / 1_000_000
// which simplifies to: cost_usd_micro = Math.round(tokens * pricePerMillion)  (already micro)
const MODEL_PRICING: Record<string, { inputPerM: number; outputPerM: number }> = {
  'google/gemini-2.5-flash':       { inputPerM: 0.30,   outputPerM: 1.00   },
  'google/gemini-2.5-pro':         { inputPerM: 7.00,   outputPerM: 21.00  },
  'anthropic/claude-opus-4-1':     { inputPerM: 75.00,  outputPerM: 225.00 },
  'anthropic/claude-opus-4-8':     { inputPerM: 75.00,  outputPerM: 225.00 },
  'openai/gpt-4-turbo':            { inputPerM: 10.00,  outputPerM: 30.00  },
  'openai/gpt-4o':                 { inputPerM: 5.00,   outputPerM: 15.00  },
  'openai/gpt-4o-mini':            { inputPerM: 0.15,   outputPerM: 0.60   },
}

function estimateCostMicro(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const pricing = MODEL_PRICING[model] ?? { inputPerM: 5.00, outputPerM: 15.00 } // default gpt-4o pricing
  // micro-USD = (tokens / 1_000_000) * pricePerMillion * 1_000_000  =>  tokens * price
  const inputCost  = (inputTokens  / 1_000_000) * pricing.inputPerM  * 1_000_000
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPerM * 1_000_000
  return Math.round(inputCost + outputCost)
}

export interface LogAICallParams {
  route: string          // e.g. 'md-mechanic/setup-coach'
  model: string          // e.g. 'google/gemini-2.5-flash'
  inputTokens: number
  outputTokens: number
  latencyMs?: number
  finishReason?: string
  teamId?: string
}

/** Fire-and-forget — never throws, never blocks the response. */
export async function logAICall(params: LogAICallParams): Promise<void> {
  try {
    const costMicro = estimateCostMicro(params.model, params.inputTokens, params.outputTokens)
    const supabase = createServiceClient()
    await supabase.from('md_ai_cost_log').insert({
      route:          params.route,
      model:          params.model,
      input_tokens:   params.inputTokens,
      output_tokens:  params.outputTokens,
      cost_usd_micro: costMicro,
      latency_ms:     params.latencyMs ?? null,
      finish_reason:  params.finishReason ?? null,
      team_id:        params.teamId ?? null,
    })
  } catch (err) {
    // Never let logging crash the AI response
    console.error('[ai-cost-logger] failed to log:', err)
  }
}

/** Convenience: compute cost in USD (for display) */
export function microToUSD(microDollars: number): string {
  return `$${(microDollars / 1_000_000).toFixed(4)}`
}
