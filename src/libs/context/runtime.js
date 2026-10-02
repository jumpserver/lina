export function getOverlayRuntimeContext(vm) {
  return vm?.$context?.getScope('overlay') || null
}

export function isOverlayRuntime(vm) {
  return !!getOverlayRuntimeContext(vm)?.isDrawer
}

export async function getRuntimeActionMeta(vm) {
  const overlayContext = getOverlayRuntimeContext(vm)
  if (overlayContext?.action) return overlayContext
  // Only legacy drawers without an explicit context may consult the stack.
  // Background pages must not inherit the foreground drawer's object/action.
  if (overlayContext?.isDrawer) return vm.$store.dispatch('common/getDrawerActionMeta')
  return {}
}

export function getRuntimeRoute(vm) {
  return getOverlayRuntimeContext(vm)?.route || vm.$route
}
