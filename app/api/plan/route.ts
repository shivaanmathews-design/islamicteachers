import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { firstOfNextMonth, PLAN_LABELS, type PlanTier } from '@/lib/pricing'

const VALID: PlanTier[] = ['free', 'standard', 'premium']
const todayISO = () => new Date().toISOString().slice(0, 10)

/** Apply any scheduled plan changes whose effective date has arrived.
 *  Runs automatically (called on dashboard/admin load) so switches take
 *  effect on the 1st without manual action. */
async function applyDue(db: ReturnType<typeof createServiceClient>) {
  const { data: due } = await db
    .from('teachers')
    .select('id, pending_tier')
    .not('pending_tier', 'is', null)
    .lte('pending_tier_effective_date', todayISO())

  for (const t of due || []) {
    await db.from('teachers').update({
      listing_tier: t.pending_tier,
      pending_tier: null,
      pending_tier_effective_date: null,
    }).eq('id', t.id)
  }
  return (due || []).length
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const db = createServiceClient()

  // action: 'apply-due' — flip any changes that are now due
  if (body.action === 'apply-due') {
    const applied = await applyDue(db)
    return NextResponse.json({ success: true, applied })
  }

  // action: 'request' — schedule a plan change for the 1st of next month
  const { teacher_id, new_tier } = body
  if (!teacher_id || !VALID.includes(new_tier)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { data: teacher, error: te } = await db
    .from('teachers')
    .select('id, listing_tier, pending_tier')
    .eq('id', teacher_id)
    .single()
  if (te || !teacher) return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })

  // Requesting the current plan cancels any pending change.
  if (new_tier === teacher.listing_tier) {
    await db.from('teachers').update({ pending_tier: null, pending_tier_effective_date: null }).eq('id', teacher_id)
    return NextResponse.json({ success: true, cleared: true })
  }

  const effective = firstOfNextMonth().toISOString().slice(0, 10)
  const { error } = await db.from('teachers').update({
    pending_tier: new_tier,
    pending_tier_effective_date: effective,
  }).eq('id', teacher_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    success: true,
    pending_tier: new_tier,
    effective_date: effective,
    label: PLAN_LABELS[new_tier as PlanTier],
  })
}
