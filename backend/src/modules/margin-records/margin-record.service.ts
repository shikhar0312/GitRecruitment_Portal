import { prisma } from '../../config/prisma'
import { NotFoundError, ConflictError, ValidationError } from '../../shared/errors'
import { getPagination, getPaginationMeta } from '../../shared/utils/pagination'
import {
  CreateMarginRecordInput,
  UpdateMarginRecordInput,
  MarginRecordQuery,
} from './margin-record.schema'
import { logger } from '../../config/logger'

export const REPORTING_CURRENCY_BY_ENTITY: Record<string, string> = {
  git_uk_ltd: 'GBP',
  git_india_llp: 'INR',
  git_uae_fze: 'AED',
}

const marginRecordInclude = {
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
}

export async function listMarginRecords(query: MarginRecordQuery) {
  const { skip, take, page, limit } = getPagination(query)

  const where = {
    ...(query.payment_status && { payment_status: query.payment_status }),
    ...(query.billing_entity && { billing_entity: query.billing_entity }),
    ...(query.customer_id && {
      allocation: { requirement: { customer_id: query.customer_id } },
    }),
  }

  const [data, total] = await Promise.all([
    prisma.margin_records.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' },
      include: marginRecordInclude,
    }),
    prisma.margin_records.count({ where }),
  ])

  return {
    data,
    meta: getPaginationMeta(total, page, limit),
  }
}

export async function getMarginRecordById(id: string) {
  const record = await prisma.margin_records.findUnique({
    where: { id },
    include: marginRecordInclude,
  })

  if (!record) throw new NotFoundError('Margin record not found')
  return record
}

function computeConversion({
  demandAmount,
  demandFxRate,
  billedAmount,
  billedFxRate,
}: {
  demandAmount: number
  demandFxRate: number
  billedAmount: number
  billedFxRate: number
}) {
  const demand_converted = demandAmount * demandFxRate
  const billed_converted = billedAmount * billedFxRate
  const billed_converted_yearly = billed_converted * 12
  const margin_amount = billed_converted - demand_converted
  const margin_pct = billed_converted !== 0 ? (margin_amount / billed_converted) * 100 : 0

  return { demand_converted, billed_converted, billed_converted_yearly, margin_amount, margin_pct }
}

export async function createMarginRecord(data: CreateMarginRecordInput) {
  const allocation = await prisma.allocations.findUnique({
    where: { id: data.allocation_id },
    include: { requirement: { select: { billing_entity: true } } },
  })
  if (!allocation) throw new NotFoundError('Allocation not found')

  if (allocation.status !== 'placed') {
    throw new ValidationError('Margin records can only be created for placed allocations')
  }

  const existing = await prisma.margin_records.findUnique({
    where: { allocation_id: data.allocation_id },
  })
  if (existing) throw new ConflictError('A margin record already exists for this allocation')

  const billing_entity = allocation.requirement.billing_entity
  const reporting_currency = REPORTING_CURRENCY_BY_ENTITY[billing_entity]

  // If a currency already matches the entity's reporting currency, the
  // conversion is a no-op — force the rate to 1 rather than trusting
  // whatever the user typed, so a data-entry slip can't quietly distort
  // a same-currency deal.
  const demand_fx_rate =
    data.demand_currency.toUpperCase() === reporting_currency ? 1 : data.demand_fx_rate
  const billed_fx_rate =
    data.billed_currency.toUpperCase() === reporting_currency ? 1 : data.billed_fx_rate

  const conversion = computeConversion({
    demandAmount: data.demand_amount,
    demandFxRate: demand_fx_rate,
    billedAmount: data.billed_amount,
    billedFxRate: billed_fx_rate,
  })

  const record = await prisma.margin_records.create({
    data: {
      allocation_id: data.allocation_id,
      billing_entity,
      reporting_currency,

      demand_amount: data.demand_amount,
      demand_currency: data.demand_currency.toUpperCase(),
      demand_fx_rate,
      demand_converted: conversion.demand_converted,

      billed_amount: data.billed_amount,
      billed_currency: data.billed_currency.toUpperCase(),
      billed_fx_rate,
      billed_converted: conversion.billed_converted,
      billed_converted_yearly: conversion.billed_converted_yearly,

      margin_amount: conversion.margin_amount,
      margin_pct: conversion.margin_pct,
      fx_rate_locked_at: new Date(),

      invoice_ref: data.invoice_ref,
      billing_period_start: data.billing_period_start
        ? new Date(data.billing_period_start)
        : undefined,
      billing_period_end: data.billing_period_end
        ? new Date(data.billing_period_end)
        : undefined,
      payment_status: data.payment_status,
      notes: data.notes,
    },
    include: marginRecordInclude,
  })

  logger.info(
    {
      allocationId: data.allocation_id,
      billingEntity: billing_entity,
      demandFxRate: demand_fx_rate,
      billedFxRate: billed_fx_rate,
      marginPct: conversion.margin_pct,
    },
    'Margin record created with locked FX rate'
  )

  return record
}

export async function updateMarginRecord(id: string, data: UpdateMarginRecordInput) {
  const existing = await getMarginRecordById(id)

  const demand_amount = data.demand_amount ?? Number(existing.demand_amount)
  const billed_amount = data.billed_amount ?? Number(existing.billed_amount)

  // The FX rates are never re-derived here — they stay exactly as locked
  // at creation, even if the amounts they're applied to are corrected.
  const conversion = computeConversion({
    demandAmount: demand_amount,
    demandFxRate: Number(existing.demand_fx_rate),
    billedAmount: billed_amount,
    billedFxRate: Number(existing.billed_fx_rate),
  })

  return prisma.margin_records.update({
    where: { id },
    data: {
      demand_amount,
      billed_amount,
      demand_converted: conversion.demand_converted,
      billed_converted: conversion.billed_converted,
      billed_converted_yearly: conversion.billed_converted_yearly,
      margin_amount: conversion.margin_amount,
      margin_pct: conversion.margin_pct,
      invoice_ref: data.invoice_ref,
      billing_period_start: data.billing_period_start
        ? new Date(data.billing_period_start)
        : undefined,
      billing_period_end: data.billing_period_end
        ? new Date(data.billing_period_end)
        : undefined,
      payment_status: data.payment_status,
      notes: data.notes,
    },
    include: marginRecordInclude,
  })
}
