// Plan pricing + pro-rata / billing-date helpers (calendar-month billing)

export type PlanTier = 'free' | 'standard' | 'premium'

export const PLAN_PRICES: Record<PlanTier, number> = {
  free: 0,
  standard: 99,
  premium: 179,
}

export const PLAN_LABELS: Record<PlanTier, string> = {
  free: 'Free',
  standard: 'Standard',
  premium: 'Premium',
}

export const PLAN_FEATURES: Record<PlanTier, string> = {
  free: 'Basic listing in search',
  standard: 'Photo, bio & contact button',
  premium: 'Featured placement & video intro',
}

/** First day of the month after `from` — when a scheduled plan change takes effect
 *  and when full monthly billing begins. */
export function firstOfNextMonth(from: Date = new Date()): Date {
  return new Date(from.getFullYear(), from.getMonth() + 1, 1)
}

/** Pro-rata charge for the partial period from `from` to the end of that calendar month.
 *  Includes the signup day itself. */
export function proRata(monthly: number, from: Date = new Date()) {
  const year = from.getFullYear()
  const month = from.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const day = from.getDate()
  const daysRemaining = daysInMonth - day + 1 // include today
  const amount = Math.round(((monthly * daysRemaining) / daysInMonth) * 100) / 100
  return {
    amount,
    daysRemaining,
    daysInMonth,
    nextBillingDate: firstOfNextMonth(from),
    monthly,
  }
}

export function formatZAR(amount: number): string {
  return `R${amount.toFixed(2)}`
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
}
