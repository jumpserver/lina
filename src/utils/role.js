import _ from 'lodash'

const PERM_USE = 0b00000001
const PERM_AUDIT = 0b00000010
const PERM_ADMIN = 0b00010000
const PERM_SUPER = 0b10000000
const PERM_NONE = 0b00000000

const SUPER_ADMIN = PERM_SUPER | PERM_ADMIN | PERM_AUDIT
const SUPER_AUDITOR = PERM_SUPER | PERM_AUDIT
const ORG_ADMIN = PERM_ADMIN | PERM_AUDIT
const ORG_AUDITOR = PERM_AUDIT
const USER = PERM_USE
const ANON = PERM_NONE

const ROLE_NAME_MAPPER = {
  SuperAdmin: SUPER_ADMIN,
  SuperAuditor: SUPER_AUDITOR,
  OrgAdmin: ORG_ADMIN,
  OrgAuditor: ORG_AUDITOR,
  User: USER,
  Anon: ANON
}

const ROLE_NAME_MAPPER_REVERSED = _.invert(ROLE_NAME_MAPPER)

export function getPermsToRolesDisplay(perms) {
  const display = []
  for (const [name, role] of Object.entries(ROLE_NAME_MAPPER)) {
    if ((role & perms) === role) {
      display.push(name)
    }
  }
  return display
}

export function getRolesDisplay(roles) {
  const display = []
  for (const role of roles) {
    if (ROLE_NAME_MAPPER_REVERSED[role]) {
      display.push(ROLE_NAME_MAPPER_REVERSED[role])
    }
  }
  return display
}

export function parseUserRoles(currentOrgRoles, role) {
  if (role === 'Admin') {
    return [SUPER_ADMIN, USER]
  }
  if (currentOrgRoles.includes('Admin')) {
    return [ORG_ADMIN, USER]
  }
  if (role === 'Auditor' || currentOrgRoles.includes('Auditor')) {
    return [ORG_AUDITOR]
  }
  return [USER]
}

export function getAdminOrUserPageRole(allRoles, page) {
  // 切换到管理员页面的时候应该的最高权限
  if (allRoles.length === 1) {
    return allRoles[0]
  }
  if (!page) {
    page = 'admin'
  }
  // 优先admin
  if (page === 'admin') {
    // 第一个是管理员或超级管理员，第二个肯定是用户
    return allRoles[0]
  }
  return allRoles[1]
}

export function hasPerm(source, target) {
  if (typeof source !== 'object') {
    source = [source]
  }
  if (typeof target !== 'object') {
    target = [target]
  }
  const totalSource = sumPerms(source)
  const totalTarget = sumPerms(target)
  return (totalTarget & totalSource) === totalTarget
}

export function sumPerms(perms) {
  let sum = 0
  for (const perm of perms) {
    sum |= perm
  }
  return sum
}

export default {
  PERM_USE, PERM_AUDIT, PERM_ADMIN, PERM_SUPER,
  SUPER_ADMIN, SUPER_AUDITOR, ORG_ADMIN, ORG_AUDITOR,
  USER, ANON,
  getRolesDisplay, getPermsToRolesDisplay, getAdminOrUserPageRole,
  parseUserRoles, sumPerms, hasPerm
}
