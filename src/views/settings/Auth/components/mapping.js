export const LDAP_ATTRIBUTE_PATTERN = /^(?:[A-Za-z][A-Za-z0-9-]*|[0-9]+(?:\.[0-9]+)+)$/

export const MappingError = Object.freeze({
  required: 'required',
  attribute: 'attribute',
  duplicate: 'duplicate',
  fallback: 'fallback'
})

const asRows = (value) => (Array.isArray(value) ? value : [])
const asString = (value) => (typeof value === 'string' ? value : '')
const cleanString = (value, trim) => (trim ? asString(value).trim() : asString(value))

export const isValidLDAPAttribute = (value) =>
  typeof value === 'string' && LDAP_ATTRIBUTE_PATTERN.test(value.trim())

export function normalizeAttributeMapping(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value).flatMap(([field, attribute]) => {
      if (typeof attribute !== 'string') return [[field, attribute]]
      const normalized = attribute.trim()
      return normalized ? [[field, normalized]] : []
    })
  )
}

export const isFallbackMapping = (row) => asString(row?.value).trim() === '*'

export function normalizeGroupMappings(value, { trim = true } = {}) {
  return asRows(value).map((row) => ({
    ...(row && typeof row === 'object' ? row : {}),
    value: cleanString(row?.value, trim),
    user_group_id: cleanString(row?.user_group_id, trim)
  }))
}

export function normalizeRoleMappings(value, { trim = true } = {}) {
  const rows = asRows(value).map((row) => {
    const normalized = {
      ...(row && typeof row === 'object' ? row : {}),
      attribute: cleanString(row?.attribute, trim),
      value: cleanString(row?.value, trim),
      scope: cleanString(row?.scope, trim) || 'system',
      role_id: cleanString(row?.role_id, trim),
      org_id: cleanString(row?.org_id, trim) || null
    }
    if (isFallbackMapping(normalized)) {
      normalized.attribute = ''
    }
    if (normalized.scope === 'system') {
      normalized.org_id = null
    }
    return normalized
  })
  return rows
}

function addFallbackErrors(rows, errors) {
  const fallbackIndexes = rows
    .map((row, index) => (isFallbackMapping(row) ? index : -1))
    .filter((index) => index !== -1)

  if (fallbackIndexes.length > 1) {
    fallbackIndexes.forEach((index) => errors[index].push(MappingError.fallback))
  }
}

export function getGroupMappingErrors(value) {
  if (!Array.isArray(value)) {
    return [[MappingError.required]]
  }
  const rows = value
  const errors = rows.map(() => [])
  const seen = new Set()

  rows.forEach((row, index) => {
    const groupValue = asString(row?.value).trim()
    const userGroupId = asString(row?.user_group_id).trim()
    if (!groupValue || !userGroupId) {
      errors[index].push(MappingError.required)
    }

    const key = `${groupValue.toLowerCase()}\u0000${userGroupId.toLowerCase()}`
    if (groupValue && userGroupId) {
      if (seen.has(key)) {
        errors[index].push(MappingError.duplicate)
      }
      seen.add(key)
    }
  })

  addFallbackErrors(rows, errors)
  return errors
}

export function getRoleMappingErrors(value) {
  if (!Array.isArray(value)) {
    return [[MappingError.required]]
  }
  const rows = value
  const errors = rows.map(() => [])
  const seen = new Set()

  rows.forEach((row, index) => {
    const fallback = isFallbackMapping(row)
    const attribute = asString(row?.attribute).trim()
    const matchValue = asString(row?.value).trim()
    const scope = asString(row?.scope).trim()
    const roleId = asString(row?.role_id).trim()
    const orgId = asString(row?.org_id).trim()

    if (!matchValue || !roleId || !['system', 'org'].includes(scope)) {
      errors[index].push(MappingError.required)
    }
    if (!fallback && !attribute) {
      errors[index].push(MappingError.required)
    } else if (!fallback && !isValidLDAPAttribute(attribute)) {
      errors[index].push(MappingError.attribute)
    }
    if (fallback && attribute) {
      errors[index].push(MappingError.fallback)
    }
    if (scope === 'org' && !orgId) {
      errors[index].push(MappingError.required)
    }
    if (scope === 'system' && orgId) {
      errors[index].push(MappingError.required)
    }

    const key = [attribute, matchValue, scope, orgId, roleId]
      .map((item) => item.toLowerCase())
      .join('\u0000')
    if (matchValue && roleId) {
      if (seen.has(key)) {
        errors[index].push(MappingError.duplicate)
      }
      seen.add(key)
    }
  })

  addFallbackErrors(rows, errors)
  return errors
}

export const hasMappingErrors = (errors) => errors.some((rowErrors) => rowErrors.length > 0)
