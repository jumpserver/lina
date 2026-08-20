const defaultDisplayKeys = ['name', 'label', 'title', 'username', 'value', 'address', 'id']

function getByPath(object, path) {
  return String(path)
    .split('.')
    .reduce((value, key) => value?.[key], object)
}

function isDisplayValue(value) {
  return value !== undefined && value !== null && value !== ''
}

export function getDisplayValue(value, options = {}) {
  const { displayKey, delimiter = ', ' } = options

  if (!isDisplayValue(value)) {
    return ''
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => getDisplayValue(item, options))
      .filter(isDisplayValue)
      .join(delimiter)
  }

  if (typeof value !== 'object') {
    return String(value)
  }

  const displayKeys = displayKey
    ? [displayKey, ...defaultDisplayKeys.filter((key) => key !== displayKey)]
    : defaultDisplayKeys

  for (const key of displayKeys) {
    const displayValue = getByPath(value, key)
    if (isDisplayValue(displayValue)) {
      return getDisplayValue(displayValue, { delimiter })
    }
  }

  const primitiveValue = Object.values(value).find(
    (item) => isDisplayValue(item) && typeof item !== 'object'
  )
  if (primitiveValue !== undefined) {
    return String(primitiveValue)
  }

  try {
    return JSON.stringify(value)
  } catch {
    return ''
  }
}
