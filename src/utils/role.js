import _ from 'lodash'

const PERM_USE = 0b00000001
const PERM_AUDIT = 0b00000010
const PERM_ADMIN = 0b00010000
const PERM_SUPER = 0b10000000
const PERM_NONE = 0b00000000

const SUPER_ADMIN = PERM_SUPER | PERM_ADMIN | PERM_AUDIT
const SUPER_AUDITOR = PERM_SUPER | PERM_AUDIT | PERM_USE
const ORG_ADMIN = PERM_ADMIN | PERM_AUDIT
const ORG_AUDITOR = PERM_AUDIT | PERM_USE
const USER = PERM_USE
const ANON = PERM_NONE

const ADMIN_PAGE_REQUIRE_PERM_MIN = PERM_SUPER | PERM_ADMIN | PERM_AUDIT
const USER_PAGE_REQUIRE_PERM_MIN = PERM_USE

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
  if (typeof roles !== 'object') {
    roles = [roles]
  }
  const display = []
  for (const role of roles) {
    if (ROLE_NAME_MAPPER_REVERSED[role]) {
      display.push(ROLE_NAME_MAPPER_REVERSED[role])
    }
  }
  return display
}

export function parseUserRoles(currentOrgRoles, clusterRole) {
  if (clusterRole === 'Admin') {
    return [SUPER_ADMIN, USER]
  }
  if (currentOrgRoles.includes('Admin')) {
    return [ORG_ADMIN, USER]
  }
  if (clusterRole === 'Auditor' || currentOrgRoles.includes('Auditor')) {
    return [ORG_AUDITOR]
  }
  return [USER]
}

export function getUserInAdminPagePerm(userPerm) {
  return (ADMIN_PAGE_REQUIRE_PERM_MIN & userPerm)
}

export function getUserInUserPagePerm(userPerm) {
  return (USER_PAGE_REQUIRE_PERM_MIN & userPerm)
}

export function hasAdminPagePerm(userPerm) {
  return getUserInAdminPagePerm(userPerm) !== 0
}

export function hasUserPagePerm(userPerm) {
  return getUserInUserPagePerm(userPerm) !== 0
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
  ADMIN_PAGE_REQUIRE_PERM_MIN, USER_PAGE_REQUIRE_PERM_MIN,
  getRolesDisplay, getPermsToRolesDisplay,
  parseUserRoles, sumPerms, hasPerm,
  getUserInAdminPagePerm, getUserInUserPagePerm,
  hasAdminPagePerm, hasUserPagePerm
}
