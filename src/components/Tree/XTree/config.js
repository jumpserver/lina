export const X_TREE_LOAD_MODES = Object.freeze({
  STATIC: 'static',
  EAGER: 'eager',
  LAZY: 'lazy'
})

export const X_TREE_SEARCH_PLACEMENTS = Object.freeze({
  PANEL: 'panel',
  HEADER: 'header'
})

const LOAD_MODE_VALUES = new Set(Object.values(X_TREE_LOAD_MODES))
const SEARCH_PLACEMENT_VALUES = new Set(Object.values(X_TREE_SEARCH_PLACEMENTS))
const DATA_SOURCE_OPERATIONS = Object.freeze([
  'root',
  'children',
  'search',
  'metrics',
  'create',
  'update',
  'remove',
  'move'
])

function resolveValue(value, payload) {
  return typeof value === 'function' ? value(payload) : value
}

function normalizeOperation(definition) {
  if (typeof definition === 'string') {
    return { url: definition }
  }
  return definition || {}
}

async function executeOperation(request, name, definition, payload) {
  if (typeof definition === 'function') {
    return definition(payload)
  }

  const operation = normalizeOperation(definition)
  if (typeof operation.load === 'function') {
    return operation.load(payload)
  }

  const enabled = await resolveValue(operation.when, payload)
  if (enabled === false) {
    return resolveValue(operation.empty, payload) ?? []
  }

  const url = await resolveValue(operation.url, payload)
  if (!url) {
    return resolveValue(operation.empty, payload) ?? []
  }

  const method = String((await resolveValue(operation.method, payload)) || 'get').toLowerCase()
  const params = await resolveValue(operation.params, payload)
  const data = await resolveValue(operation.data, payload)
  const options = (await resolveValue(operation.options, payload)) || {}
  const requestConfig = {
    ...options,
    method,
    url,
    signal: payload.signal
  }
  if (params !== undefined) {
    requestConfig.params = params
  }
  if (data !== undefined) {
    requestConfig.data = data
  }

  const execute = request?.request?.bind(request) || request
  if (typeof execute !== 'function') {
    throw new TypeError(`XTree data source operation "${name}" requires a request client`)
  }
  const response = await execute(requestConfig)
  return typeof operation.transform === 'function'
    ? operation.transform(response, payload)
    : response
}

/**
 * Normalize XTree's loading strategy while preserving the legacy lazyLoad flag.
 *
 * static: render initialData only
 * eager: fetch the complete tree with root
 * lazy: fetch root first and children on expansion
 */
export function createXTreeSetting(setting = {}) {
  const configuredMode = LOAD_MODE_VALUES.has(setting.loadMode) ? setting.loadMode : null
  const loadMode =
    configuredMode ||
    (setting.lazyLoad === false ? X_TREE_LOAD_MODES.EAGER : X_TREE_LOAD_MODES.LAZY)
  const searchPlacement = SEARCH_PLACEMENT_VALUES.has(setting.searchPlacement)
    ? setting.searchPlacement
    : X_TREE_SEARCH_PLACEMENTS.PANEL
  return {
    ...setting,
    loadMode,
    lazyLoad: loadMode === X_TREE_LOAD_MODES.LAZY,
    searchPlacement
  }
}

/**
 * Build XTree's dataSource from declarative API operations. Every operation
 * may be a URL, a request descriptor, or a synchronous/asynchronous loader.
 */
export function createXTreeDataSource(request, definitions = {}) {
  return Object.fromEntries(
    DATA_SOURCE_OPERATIONS.filter((name) => definitions[name] != null).map((name) => [
      name,
      (payload = {}) => executeOperation(request, name, definitions[name], payload)
    ])
  )
}
