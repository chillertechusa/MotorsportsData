import { NextResponse } from 'next/server'
import { getSessionTeamId } from '@/lib/md-auth'

// USDA FoodData Central — free, no API key required for basic search
const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1'
const USDA_API_KEY = 'DEMO_KEY' // free demo key, 30 req/hr per IP — sufficient for this use case

export interface UsdaFood {
  fdcId: number
  description: string
  brandName?: string
  foodCategory?: string
  nutrients: { name: string; amount: number; unitName: string }[]
}

function extractMacros(nutrients: { nutrientName?: string; name?: string; amount?: number; value?: number; unitName?: string }[]) {
  const find = (name: string) => {
    const hit = nutrients.find(n => (n.nutrientName ?? n.name ?? '').toLowerCase().includes(name.toLowerCase()))
    return hit ? (hit.amount ?? hit.value ?? 0) : 0
  }
  return {
    calories: find('energy'),
    proteinG: find('protein'),
    carbsG: find('carbohydrate'),
    fatG: find('total lipid'),
  }
}

export async function GET(req: Request) {
  const auth = await getSessionTeamId()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  if (!q) return NextResponse.json({ foods: [] })

  try {
    const res = await fetch(
      `${USDA_BASE}/foods/search?query=${encodeURIComponent(q)}&pageSize=10&api_key=${USDA_API_KEY}&dataType=Survey%20%28FNDDS%29,SR%20Legacy`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error(`USDA ${res.status}`)
    const data = await res.json()

    const foods = (data.foods ?? []).slice(0, 8).map((f: Record<string, unknown>) => {
      const nutrients = (f.foodNutrients as Record<string, unknown>[]) ?? []
      const macros = extractMacros(nutrients as Parameters<typeof extractMacros>[0])
      return {
        fdcId: String(f.fdcId),
        name: f.description,
        brand: f.brandName ?? null,
        category: f.foodCategory ?? null,
        per100g: macros,
      }
    })

    return NextResponse.json({ foods })
  } catch (err) {
    return NextResponse.json({ foods: [] })
  }
}
