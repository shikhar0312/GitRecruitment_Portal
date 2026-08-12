import { prisma } from '../../config/prisma'
import { NotFoundError } from '../../shared/errors'
import { getPagination, getPaginationMeta } from '../../shared/utils/pagination'
import { CreateRoleInput, UpdateRoleInput, RoleQuery } from './role.schema'

export async function listRoles(query: RoleQuery) {
  const { skip, take, page, limit } = getPagination(query)

  const where = {
    ...(query.category && { category: query.category }),
    ...(query.search && {
      title: { contains: query.search, mode: 'insensitive' as const },
    }),
  }

  const [data, total] = await Promise.all([
    prisma.roles.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' },
    }),
    prisma.roles.count({ where }),
  ])

  return {
    data,
    meta: getPaginationMeta(total, page, limit),
  }
}

export async function getRoleById(id: string) {
  const role = await prisma.roles.findUnique({ where: { id } })
  if (!role) throw new NotFoundError('Role not found')
  return role
}

export async function createRole(data: CreateRoleInput) {
  return prisma.roles.create({ data })
}

export async function updateRole(id: string, data: UpdateRoleInput) {
  await getRoleById(id)
  return prisma.roles.update({ where: { id }, data })
}

export async function deleteRole(id: string) {
  await getRoleById(id)
  return prisma.roles.delete({ where: { id } })
}