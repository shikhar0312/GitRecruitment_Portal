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
        const marginPct = totalBilledMonthly !== 0 ? (totalMargin / totalBilledMonthly) * 100 : 0

        return {
          billing_entity: entity,
          currency,
          total_demand_monthly: totalDemand,
          total_billed_monthly: totalBilledMonthly,
          total_billed_yearly: totalBilledYearly,
          total_margin_monthly: totalMargin,
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
