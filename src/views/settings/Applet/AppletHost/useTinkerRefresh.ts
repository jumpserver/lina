import { onActivated, onBeforeUnmount, onDeactivated, onMounted } from 'vue'

// Refresh while the view is visible, for at most ten minutes after each visit/focus.
export function useTinkerRefresh(load: (signal: AbortSignal) => Promise<void>) {
  let active = false
  let deadline = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let controller: AbortController | undefined

  async function refresh() {
    if (!active || document.hidden || controller) return
    clearTimeout(timer)
    const request = new AbortController()
    controller = request
    try {
      await load(request.signal)
    } catch {
      // The request client handles errors; keep the last known state on failure.
    } finally {
      controller = undefined
      if (active && Date.now() < deadline) timer = setTimeout(refresh, 30000)
    }
  }

  function wake() {
    if (!active || document.hidden) return
    deadline = Date.now() + 10 * 60 * 1000
    void refresh()
  }

  function start() {
    if (active) return
    active = true
    wake()
  }

  function stop() {
    active = false
    clearTimeout(timer)
    controller?.abort()
  }

  onMounted(() => {
    start()
    window.addEventListener('focus', wake)
    document.addEventListener('visibilitychange', wake)
  })
  onActivated(start)
  onDeactivated(stop)
  onBeforeUnmount(() => {
    stop()
    window.removeEventListener('focus', wake)
    document.removeEventListener('visibilitychange', wake)
  })
  return wake
}
