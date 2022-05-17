export function cleanActions(actions, canDefaults, { selectedRows, reloadTable }) {
  // debug('Start clean actions: ', selectedRows.length, reloadTable)
  const cleanedActions = []
  const cloneActions = _.cloneDeep(actions)
  cloneActions.forEach((action) => {
    action.has = cleanBoolean(action, 'has', true, { selectedRows, reloadTable })
    action.can = cleanBoolean(action, 'can', true, { selectedRows, reloadTable })
    if (!action.dropdown) {
      action.callback = cleanCallback(action, { selectedRows, reloadTable })
    }
    cleanedActions.push(action)
  })
  return cleanedActions
}

export function cleanBoolean(action, attr, defaults, { selectedRows, reloadTable }) {
  // this.$log.debug('Clean boolean', action, attr)
  let valueOrCallback = action[attr]

  if (defaults === undefined) {
    defaults = true
  }
  if (valueOrCallback === undefined) {
    valueOrCallback = defaults
  }
  if (typeof valueOrCallback !== 'function') {
    return valueOrCallback
  }
  function wrapperCallback() {
    return valueOrCallback({ selectedRows, reloadTable })
  }
  return wrapperCallback
}

export function cleanCallback(action, { selectedRows, reloadTable }) {
  const v = action.callback
  if (!v && typeof callback !== 'function') {
    return null
  }
  return () => v({ selectedRows, reloadTable })
}

