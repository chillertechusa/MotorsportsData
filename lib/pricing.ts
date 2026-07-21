// Moto D Print Shop — Pricing Engine
// Modeled on the real Logotherapy invoice #6670 (Motorsports Dirt Fall '23):
//   - Garment blank wholesale cost (e.g. District DM130 @ $10.57, Independent SS4500 @ $20.54)
//   - Screen setup: $20 per unique color, per design/location
//   - Color change fee: $15 per color swap on press
//   - Size tag printing: $1.00 each (single color)
//   - Per-piece print cost decreases as quantity climbs (volume tiers)
//
// The point: quote jobs accurately, see margin BEFORE committing, and never
// overpay a vendor again — because you ARE the vendor now.

export type ShopRates = {
  screenSetupFee: number // per unique color
  colorChangeFee: number // per color swap
  sizeTagFee: number // per piece, single color
  defaultMarkup: number // multiplier applied to total blended cost
}

export const DEFAULT_RATES: ShopRates = {
  screenSetupFee: 20,
  colorChangeFee: 15,
  sizeTagFee: 1,
  defaultMarkup: 2,
}

// Per-impression print labor cost by quantity tier (cost to YOU to run the press).
// Higher volume = lower per-piece cost. These are typical contract-print economics.
export function printRunRatePerColor(quantity: number): number {
  if (quantity >= 250) return 0.35
  if (quantity >= 100) return 0.5
  if (quantity >= 50) return 0.7
  if (quantity >= 24) return 0.95
  if (quantity >= 12) return 1.35
  return 2.0 // tiny runs are expensive per piece
}

export type QuoteInput = {
  quantity: number
  garmentCost: number // wholesale blank cost per piece
  numColors: number // unique ink colors in the design
  printLocations: number // e.g. left chest + back = 2
  colorChanges?: number // press color swaps (defaults to 0)
  sizeTags?: boolean // printed size tags instead of sewn label
  markup?: number // override the default markup multiplier
  rates?: ShopRates
}

export type QuoteBreakdown = {
  quantity: number
  // Per-piece economics
  garmentCostPerPiece: number
  printCostPerPiece: number
  tagCostPerPiece: number
  variableCostPerPiece: number // garment + print + tags
  // One-time setup
  screenSetupTotal: number
  colorChangeTotal: number
  setupTotal: number
  // Totals (your cost)
  variableTotal: number
  totalCost: number
  // Customer-facing
  markup: number
  suggestedUnitPrice: number
  suggestedTotal: number
  grossProfit: number
  marginPercent: number
}

export function calculateQuote(input: QuoteInput): QuoteBreakdown {
  const rates = input.rates ?? DEFAULT_RATES
  const quantity = Math.max(1, Math.floor(input.quantity || 0))
  const numColors = Math.max(1, input.numColors || 1)
  const printLocations = Math.max(1, input.printLocations || 1)
  const colorChanges = Math.max(0, input.colorChanges ?? 0)
  const markup = input.markup ?? rates.defaultMarkup

  // Per-piece print cost: each location runs `numColors` impressions
  const ratePerColor = printRunRatePerColor(quantity)
  const printCostPerPiece = ratePerColor * numColors * printLocations
  const tagCostPerPiece = input.sizeTags ? rates.sizeTagFee : 0
  const garmentCostPerPiece = input.garmentCost || 0

  const variableCostPerPiece =
    garmentCostPerPiece + printCostPerPiece + tagCostPerPiece
  const variableTotal = variableCostPerPiece * quantity

  // One-time setup: a screen per color per location
  const screenSetupTotal =
    rates.screenSetupFee * numColors * printLocations
  const colorChangeTotal = rates.colorChangeFee * colorChanges
  const setupTotal = screenSetupTotal + colorChangeTotal

  const totalCost = variableTotal + setupTotal

  // Customer price: mark up variable cost, pass setup through at cost,
  // then amortize setup across the run.
  const markedUpVariable = variableCostPerPiece * markup
  const setupPerPiece = setupTotal / quantity
  const suggestedUnitPrice = markedUpVariable + setupPerPiece
  const suggestedTotal = suggestedUnitPrice * quantity

  const grossProfit = suggestedTotal - totalCost
  const marginPercent =
    suggestedTotal > 0 ? (grossProfit / suggestedTotal) * 100 : 0

  return {
    quantity,
    garmentCostPerPiece,
    printCostPerPiece,
    tagCostPerPiece,
    variableCostPerPiece,
    screenSetupTotal,
    colorChangeTotal,
    setupTotal,
    variableTotal,
    totalCost,
    markup,
    suggestedUnitPrice,
    suggestedTotal,
    grossProfit,
    marginPercent,
  }
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number.isFinite(n) ? n : 0)
}
