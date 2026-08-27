import { prisma } from '../../config/prisma'
import { REPORTING_CURRENCY_BY_ENTITY } from '../margin-records/margin-record.service'

const TRACKER_VIEWER_ROLES = ['admin', 'recruiter', 'account_manager', 'finance']

export async function getDashboardAggregates(userRole: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const canViewMargin = TRACKER_VIEWER_ROLES.includes(userRole)

  const [
    totalActiveRequirements,
    totalCandidates,
    allocationsThisMonth,
    totalPlaced,
    requirementsByPriority,
    allocationsByStatus,
    recentAllocations,
    totalCustomers,
    marginByEntity,
    marginByClientRows,
    recentTracker,
  ] = await Promise.all([
    // Total active requirements
    prisma.requirements.count({
      where: { status: 'open' },
    }),

    // Total active candidates
    prisma.candidates.count({
      where: { status: 'active' },
    }),

    // Allocations created this month
    prisma.allocations.count({
      where: { applied_at: { gte: startOfMonth } },
    }),

    // Total placed
    prisma.allocations.count({
      where: { status: 'placed' },
    }),

    // Requirements grouped by priority
    prisma.requirements.groupBy({
      by: ['priority'],
      where: { status: 'open' },
      _count: { id: true },
    }),

    // Allocations grouped by status
    prisma.allocations.groupBy({
      by: ['status'],
      _count: { id: true },
    }),

    // Recent 5 allocations
    prisma.allocations.findMany({
      take: 5,
      orderBy: { applied_at: 'desc' },
      select: {
        id: true,
        status: true,
        match_score: true,
        applied_at: true,
        candidate: {
          select: { id: true, full_name: true, current_role: true },
        },
        requirement: {
          select: {
            id: true,
            role: { select: { title: true } },
            customer: { select: { name: true } },
          },
        },
      },
    }),

    // Total customers count
    prisma.customers.count(),

    // Margin totals grouped by billing entity — each entity bills in its
    // own currency (GBP / INR / AED), so these are deliberately kept as
    // separate subtotals rather than blended into one converted figure.
    // See the "currency consolidation" discussion: a single blended total
    // would require applying a live/current FX rate to historical deals,
    // which would make the number silently drift over time. Three
    // per-entity totals stay accurate indefinitely.
    // Skipped entirely (not just filtered from the response) for viewer,
    // who has no Tracker access.
    canViewMargin
      ? prisma.margin_records.groupBy({
          by: ['billing_entity'],
          _sum: {
            demand_converted: true,
            billed_converted: true,
            billed_converted_yearly: true,
            margin_amount: true,
          },
          _count: { id: true },
        })
      : Promise.resolve([]),

    // Per-client margin rollup, for the "Margin by Client" table on the
    // dashboard. Grouped by customer AND billing_entity (not customer
    // alone) so every row stays in a single reporting currency — the same
    // no-blend-across-currencies rule the entity totals follow. A client
    // billed through two entities therefore shows two rows, each accurate
    // in its own currency, rather than one silently-mixed figure.
    // Aggregated in SQL via a raw grouped query because the customer lives
    // two relations away from margin_records (via allocation → requirement),
    // which Prisma's groupBy can't reach directly.
    canViewMargin
      ? prisma.$queryRaw<
          {
            customer_id: string
            customer_name: string
            billing_entity: string
            placements: bigint
            total_billed_monthly: unknown
            total_margin_monthly: unknown
          }[]
        >`
          SELECT
            c.id                          AS customer_id,
            c.name                        AS customer_name,
            m.billing_entity              AS billing_entity,
            COUNT(*)                      AS placements,
            SUM(m.billed_converted)       AS total_billed_monthly,
            SUM(m.margin_amount)          AS total_margin_monthly
          FROM margin_records m
          JOIN allocations   a ON a.id = m.allocation_id
          JOIN requirements  r ON r.id = a.requirement_id
          JOIN customers     c ON c.id = r.customer_id
          GROUP BY c.id, c.name, m.billing_entity
          ORDER BY SUM(m.margin_amount) DESC
          LIMIT 10
        `
      : Promise.resolve([]),

    // Latest tracker rows, embedded on the dashboard so leadership sees
    // real placements without opening the full Tracker page. Same shape
    // the Tracker table already consumes, just capped at the newest 10.
    canViewMargin
      ? prisma.margin_records.findMany({
          take: 10,
          orderBy: { created_at: 'desc' },
          include: {
            allocation: {
              select: {
                id: true,
                status: true,
                candidate: { select: { id: true, full_name: true, email: true } },
                requirement: {
                  select: {
                    id: true,
                    billing_entity: true,
                    customer: { select: { id: true, name: true } },
                    role: { select: { id: true, title: true } },
                  },
                },
              },
            },
          },
        })
      : Promise.resolve([]),
  ])

  // margin_pct isn't summed directly (averaging percentages is misleading);
  // it's recomputed per entity from the summed amounts: total margin /
  // total billed. Entities with no margin records yet are included at
  // zero so the dashboard always shows all three, not just the ones with
  // data so far.
  const entityMarginSummary = canViewMargin
    ? Object.entries(REPORTING_CURRENCY_BY_ENTITY).map(([entity, currency]) => {
        const group = marginByEntity.find((g) => g.billing_entity === entity)
        const totalDemand = Number(group?._sum.demand_converted ?? 0)
        const totalBilledMonthly = Number(group?._sum.billed_converted ?? 0)
        const totalBilledYearly = Number(group?._sum.billed_converted_yearly ?? 0)
        const totalMargin = Number(group?._sum.margin_amount ?? 0)
        const placements = Number(group?._count.id ?? 0)
        const marginPct = totalBilledMonthly !== 0 ? (totalMargin / totalBilledMonthly) * 100 : 0

        return {
          billing_entity: entity,
          currency,
          placements,
          total_demand_monthly: totalDemand,
          total_billed_monthly: totalBilledMonthly,
          total_billed_yearly: totalBilledYearly,
          total_margin_monthly: totalMargin,
          margin_pct: marginPct,
        }
      })
    : null

  // Shape the raw per-client rows: coerce the SQL bigint/decimal outputs to
  // numbers, recompute margin % from the summed amounts (never averaged),
  // and tag each row with the reporting currency for its entity.
  const marginByClient = canViewMargin
    ? marginByClientRows.map((row) => {
        const totalBilledMonthly = Number(row.total_billed_monthly ?? 0)
        const totalMarginMonthly = Number(row.total_margin_monthly ?? 0)
        const marginPct =
          totalBilledMonthly !== 0 ? (totalMarginMonthly / totalBilledMonthly) * 100 : 0

        return {
          customer_id: row.customer_id,
          customer_name: row.customer_name,
          billing_entity: row.billing_entity,
          currency: REPORTING_CURRENCY_BY_ENTITY[row.billing_entity] ?? '',
          placements: Number(row.placements),
          total_billed_monthly: totalBilledMonthly,
          total_margin_monthly: totalMarginMonthly,
          margin_pct: marginPct,
        }
      })
    : null

  return {
    summary: {
      total_active_requirements: totalActiveRequirements,
      total_candidates: totalCandidates,
      allocations_this_month: allocationsThisMonth,
      total_placed: totalPlaced,
      total_customers: totalCustomers,
    },
    margin_by_entity: entityMarginSummary,
    margin_by_client: marginByClient,
    recent_tracker: canViewMargin ? recentTracker : null,
    requirements_by_priority: requirementsByPriority.reduce(
      (acc, item) => {
        acc[item.priority] = item._count.id
        return acc
      },
      {} as Record<string, number>
    ),
    allocations_by_status: allocationsByStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count.id
        return acc
      },
      {} as Record<string, number>
    ),
    recent_allocations: recentAllocations,
  }
}
