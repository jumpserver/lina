import { onBeforeUnmount, onMounted, onUpdated, ref } from 'vue'

export function useTableContentHeight(isEnabled) {
  const tableSurface = ref(null)
  const contentHeights = ref({ header: 0, body: 0, pagination: 0 })
  let observer
  let observedElements = []

  function measure() {
    const [header, body, pagination] = observedElements.map((element) =>
      Math.ceil(element?.getBoundingClientRect().height || 0)
    )
    // Keep the last measurement while a cached tab is hidden.
    if (!header && !body && !pagination) return
    const previous = contentHeights.value
    if (
      header !== previous.header ||
      body !== previous.body ||
      pagination !== previous.pagination
    ) {
      contentHeights.value = { header, body, pagination }
    }
  }

  function refresh() {
    const surface = isEnabled() ? tableSurface.value : null
    // Observe intrinsic content, never the constrained viewport: measuring the
    // viewport would preserve clipped rows and feed layout changes back into itself.
    const elements = [
      surface?.querySelector('.el-table__header-wrapper .el-table__header'),
      surface?.querySelector('.el-table__body-wrapper .el-table__body'),
      surface?.querySelector('.el-pagination')
    ]
    if (elements.some((element, index) => element !== observedElements[index])) {
      observer?.disconnect()
      observedElements = elements
      if (typeof ResizeObserver !== 'undefined') {
        observer ||= new ResizeObserver(measure)
        elements.forEach((element) => element && observer.observe(element))
      }
    }
    measure()
  }

  onMounted(refresh)
  // Rebind after Element Plus replaces its table when columns/mode change.
  onUpdated(refresh)
  onBeforeUnmount(() => observer?.disconnect())

  return { tableSurface, contentHeights }
}
