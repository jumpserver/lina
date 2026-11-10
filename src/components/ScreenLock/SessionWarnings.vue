<template>
  <span ref="anchor" hidden />
</template>

<script setup>
import { getCurrentInstance, h, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElNotification } from 'element-plus'

const props = defineProps({
  idleRemaining: { type: Number, default: null },
  expiryRemaining: { type: Number, default: null }
})
const { t } = useI18n()
const { appContext } = getCurrentInstance()
const anchor = ref(null)
const notices = new Map()
const titles = {
  idle: 'ScreenLock.IdleWarningTitle',
  expiry: 'ScreenLock.ExpiryWarningTitle',
  expired: 'ScreenLock.ExpiredTitle'
}

function syncNotices() {
  if (!anchor.value) return
  for (const kind of ['idle', 'expiry']) {
    const remaining = props[`${kind}Remaining`]
    const mode = kind === 'expiry' && remaining === 0 ? 'expired' : kind
    const current = notices.get(kind)
    if (remaining === null || current?.mode !== mode) {
      current?.handle.close()
      notices.delete(kind)
    }
    if (remaining === null || notices.has(kind)) continue
    const handle = ElNotification(
      {
        title: t(titles[mode]),
        type: mode === 'expired' ? 'error' : 'warning',
        duration: 0,
        showClose: false,
        position: 'top-right',
        appendTo: anchor.value.closest('dialog') || document.body,
        customClass: `session-warning session-warning-${kind}`,
        // The slot reads reactive props, so countdown changes keep the same notification.
        message: () =>
          h(
            'p',
            { class: 'session-warning-countdown', role: 'timer', 'aria-live': 'off' },
            mode === 'expired'
              ? t('ScreenLock.ExpiredDescription')
              : kind === 'idle'
                ? t('ScreenLock.IdleWarningCountdown', { seconds: props.idleRemaining })
                : t('ScreenLock.ExpiryWarningCountdown', {
                    minutes: Math.floor(props.expiryRemaining / 60),
                    seconds: String(props.expiryRemaining % 60).padStart(2, '0')
                  })
          )
      },
      appContext
    )
    notices.set(kind, { mode, handle })
  }
}

watch(() => [props.idleRemaining, props.expiryRemaining], syncNotices, { flush: 'post' })
onMounted(syncNotices)
onBeforeUnmount(() => {
  for (const { handle } of notices.values()) handle.close()
  notices.clear()
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
