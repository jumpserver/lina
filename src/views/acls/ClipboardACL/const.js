export function getClipboardOperationOptions(vm) {
  return [
    { label: vm.$t('Copy'), value: 'copy' },
    { label: vm.$t('Paste'), value: 'paste' }
  ]
}

export function normalizeClipboardOperationValues(operations = []) {
  if (typeof operations === 'number') {
    const values = []
    if (operations & 8) {
      values.push('copy')
    }
    if (operations & 16) {
      values.push('paste')
    }
    return values
  }

  if (!Array.isArray(operations)) {
    return []
  }

  return operations
    .map((item) => {
      if (typeof item === 'string') {
        return item
      }
      return item?.value
    })
    .filter((value) => ['copy', 'paste'].includes(value))
}

export function filterClipboardOperations(operations = [], vm = null) {
  const labels = vm
    ? Object.fromEntries(getClipboardOperationOptions(vm).map((i) => [i.value, i.label]))
    : {}
  return normalizeClipboardOperationValues(operations).map((value) => ({
    value,
    label: labels[value] || value
  }))
}
