<template>
  <Teleport :to="appendTo || 'body'">
    <div ref="anchor" />
  </Teleport>
</template>

<script setup>
import {
  getCurrentInstance,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch
} from 'vue'
import { Translation, useI18n } from 'vue-i18n'
import { ElNotification } from 'element-plus'

const props = defineProps({
  appendTo: { type: Object, default: null },
  idleRemaining: { type: Number, default: null },
  expiryRemaining: { type: Number, default: null }
})
const { t } = useI18n()
const { appContext } = getCurrentInstance()
const anchor = ref(null)
const notices = new Map()
const dismissed = new Map()
const contents = new Map()
const displayed = reactive({ idle: null, expiry: null })
const titles = {
  idle: 'ScreenLock.IdleWarningTitle',
  expiry: 'ScreenLock.ExpiryWarningTitle',
  expired: 'ScreenLock.ExpiredTitle'
}

function getPhase(kind, remaining) {
  if (kind === 'idle') return 'idle'
  return remaining === 0 ? 'expired' : remaining <= 60 ? 'final' : 'early'
}

function syncNotices() {
  if (!anchor.value) return
  for (const kind of ['idle', 'expiry']) {
    const remaining = props[`${kind}Remaining`]
    const mode = kind === 'expiry' && remaining === 0 ? 'expired' : kind
    const current = notices.get(kind)
    const content = contents.get(kind)
    const selection = content?.ownerDocument.getSelection()
    // Pause only the displayed countdown while copying; real deadlines still apply.
    const selecting =
      selection?.rangeCount &&
      !selection.isCollapsed &&
      selection.getRangeAt(0).intersectsNode(content)
    if (remaining === null || remaining === 0 || !selecting) displayed[kind] = remaining
    if (remaining === null) dismissed.delete(kind)
    if (remaining === null || current?.mode !== mode) {
      notices.delete(kind)
      current?.handle.close()
    }
    if (
      remaining === null ||
      notices.has(kind) ||
      dismissed.get(kind)?.has(getPhase(kind, remaining))
    ) {
      continue
    }
    const handle = ElNotification(
      {
        title: t(titles[mode]),
        type: mode === 'expired' ? 'error' : 'warning',
        duration: 0,
        showClose: true,
        position: 'top-right',
        appendTo: anchor.value,
        customClass: `session-warning session-warning-${kind}`,
        onClose: () => {
          if (notices.get(kind)?.handle !== handle) return
          notices.delete(kind)
          if (!dismissed.has(kind)) dismissed.set(kind, new Set())
          dismissed.get(kind).add(getPhase(kind, props[`${kind}Remaining`]))
        },
        // Keep the translated text nodes stable while only the time slots change.
        message: () =>
          mode === 'expired'
            ? h('p', t('ScreenLock.ExpiredDescription'))
            : h('div', { ref: (element) => contents.set(kind, element) }, [
                h(
                  Translation,
                  {
                    keypath:
                      kind === 'idle'
                        ? 'ScreenLock.IdleWarningCountdown'
                        : displayed.expiry < 60
                          ? 'ScreenLock.ExpiryWarningCountdownSeconds'
                          : 'ScreenLock.ExpiryWarningCountdown',
                    scope: 'global',
                    tag: 'p',
                    class: 'session-warning-countdown',
                    role: 'timer',
                    'aria-live': 'off'
                  },
                  kind === 'idle'
                    ? { seconds: () => h('span', displayed.idle) }
                    : {
                        minutes: () => h('span', Math.floor(displayed.expiry / 60)),
                        seconds: () =>
                          h(
                            'span',
                            displayed.expiry < 60
                              ? displayed.expiry
                              : String(displayed.expiry % 60).padStart(2, '0')
                          )
                      }
                )
              ])
      },
      appContext
    )
    notices.set(kind, { mode, handle })
    nextTick(() => ElNotification.updateOffsets('top-right'))
  }
}

watch(() => [props.idleRemaining, props.expiryRemaining], syncNotices, { flush: 'post' })
onMounted(syncNotices)
onBeforeUnmount(() => {
  const active = [...notices.values()]
  notices.clear()
  for (const { handle } of active) handle.close()
  contents.clear()
  dismissed.clear()
})
</script>

<style>
.el-notification.session-warning {
  max-width: calc(100vw - 32px);
}
.session-warning-countdown {
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
</style>
