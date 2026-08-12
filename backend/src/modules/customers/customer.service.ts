import { prisma } from '../../config/prisma'
import { NotFoundError, ConflictError } from '../../shared/errors'
import { getPagination, getPaginationMeta } from '../../shared/utils/pagination'
import {
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerQuery,
  CreateCustomerContactInput,
  UpdateCustomerContactInput,
} from './customer.schema'

export async function listCustomers(query: CustomerQuery) {
  const { skip, take, page, limit } = getPagination(query)

  const where = {
    ...(query.status && { status: query.status }),
    ...(query.search && {
      name: { contains: query.search, mode: 'insensitive' as const },
    }),
  }

  const [data, total] = await Promise.all([
    prisma.customers.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' },
      include: {
        account_manager: {
          select: { id: true, full_name: true, email: true },
        },
        contacts: {
          orderBy: { is_primary: 'desc' },
        },
      },
    }),
    prisma.customers.count({ where }),
  ])

  return {
    data,
    meta: getPaginationMeta(total, page, limit),
  }
}

export async function getCustomerById(id: string) {
  const customer = await prisma.customers.findUnique({
    where: { id },
    include: {
      account_manager: {
        select: { id: true, full_name: true, email: true },
      },
      contacts: {
        orderBy: { is_primary: 'desc' },
      },
    },
  })

  if (!customer) throw new NotFoundError('Customer not found')
  return customer
}

export async function createCustomer(data: CreateCustomerInput) {
  return prisma.customers.create({ data })
}

export async function updateCustomer(id: string, data: UpdateCustomerInput) {
  await getCustomerById(id)
  return prisma.customers.update({ where: { id }, data })
}

export async function deleteCustomer(id: string) {
  await getCustomerById(id)
  const linkedRequirements = await prisma.requirements.count({ where: { customer_id: id } })
  if (linkedRequirements > 0) {
    throw new ConflictError('Cannot delete a customer that has linked requirements')
  }
  return prisma.customers.delete({ where: { id } })
}

// ─── Customer Contacts ──────────────────────────────────────

export async function listCustomerContacts(customerId: string) {
  await getCustomerById(customerId)
  return prisma.customer_contacts.findMany({
    where: { customer_id: customerId },
    orderBy: { is_primary: 'desc' },
  })
}

export async function createCustomerContact(
  customerId: string,
  data: CreateCustomerContactInput
) {
  await getCustomerById(customerId)

  return prisma.$transaction(async (tx) => {
    if (data.is_primary) {
      await tx.customer_contacts.updateMany({
        where: { customer_id: customerId, is_primary: true },
        data: { is_primary: false },
      })
    }

    return tx.customer_contacts.create({
      data: { ...data, customer_id: customerId },
    })
  })
}

export async function updateCustomerContact(
  customerId: string,
  contactId: string,
  data: UpdateCustomerContactInput
) {
  const contact = await prisma.customer_contacts.findFirst({
    where: { id: contactId, customer_id: customerId },
  })
  if (!contact) throw new NotFoundError('Contact not found')

  return prisma.$transaction(async (tx) => {
    if (data.is_primary) {
      await tx.customer_contacts.updateMany({
        where: { customer_id: customerId, is_primary: true, id: { not: contactId } },
        data: { is_primary: false },
      })
    }

    return tx.customer_contacts.update({
      where: { id: contactId },
      data,
    })
  })
}

export async function deleteCustomerContact(customerId: string, contactId: string) {
  const contact = await prisma.customer_contacts.findFirst({
    where: { id: contactId, customer_id: customerId },
  })
  if (!contact) throw new NotFoundError('Contact not found')

  await prisma.customer_contacts.delete({ where: { id: contactId } })
  return { id: contactId }
}
