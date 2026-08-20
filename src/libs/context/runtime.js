export function getOverlayRuntimeContext(vm) {
  return vm?.$context?.getScope('overlay') || null
}

export function isOverlayRuntime(vm) {
  return !!getOverlayRuntimeContext(vm)?.isDrawer
}

export async function getRuntimeActionMeta(vm) {
  const overlayContext = getOverlayRuntimeContext(vm)
  if (overlayContext?.isDrawer) {
    return overlayContext
  }
  return vm.$store.dispatch('common/getDrawerActionMeta')
}
