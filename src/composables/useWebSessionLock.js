import { reactive, watch } from 'vue'
import { createWebSessionLock } from '@/utils/webSessionLock'
import request, { logout, deferAuthFailureUntil } from '@/utils/request'
import { LOGIN_PATH } from '@/utils/env'
import { notifyWebSessionClose } from '@/utils/jms/auth'

export const webSessionLockState = reactive({
  ready: false,
  locked: true,
  pending: false,
  logoutAt: 0,
  attemptsRemaining: null,
  error: false,
  session: null
})
let creating

function login(authPath) {
  const origin = window.location.origin
  let url = new URL(LOGIN_PATH, origin)
  if (typeof authPath === 'string') {
    const target = new URL(authPath, origin)
    if (target.origin === origin && target.pathname.startsWith(url.pathname)) url = target
  }
  url.searchParams.set('next', location.pathname + location.search + location.hash)
  window.location.assign(url.href)
}

export async function startWebSessionLock() {
  if (!creating) {
    creating = (async () => {
      const controller = createWebSessionLock({
        notifyClose: notifyWebSessionClose,
        request: (method, path, body, headers) =>
          request({
            url: path,
            method: method.toLowerCase(),
            data: body,
            headers,
            disableFlashErrorMsg: true,
            timeout: 10000
          }),
        onChange: (state) => {
          if (state.logoutAt) deferAuthFailureUntil(state.logoutAt)
          if (state.error) {
            console.error(
              'Web session lock status check failed:',
              state.error.message || 'Unknown error'
            )
          }
          Object.assign(webSessionLockState, state, { error: Boolean(state.error) })
        },
        onSessionChanged: () => window.location.reload(),
        onUnauthenticated: login
      })
      await controller.start()
      return controller
    })().catch((error) => {
      console.error('Web session lock initialization failed:', error.message || 'Unknown error')
      creating = null
      Object.assign(webSessionLockState, { ready: true, locked: true, error: true })
      throw error
    })
  }
  return creating
}

// Route bootstrap must not consume protected API failures while the session is locked.
export async function waitForWebSessionUnlock() {
  await startWebSessionLock()
  if (webSessionLockState.ready && !webSessionLockState.locked) return
  await new Promise((resolve) => {
    const stop = watch(
      () => webSessionLockState.ready && !webSessionLockState.locked,
      (unlocked) => {
        if (!unlocked) return
        stop()
        resolve()
      }
    )
  })
}

export const lockWebSession = async () => (await startWebSessionLock()).lock()
export const unlockWebSession = async (password) => (await startWebSessionLock()).unlock(password)
export const refreshWebSessionLock = async () => {
  if (!creating && webSessionLockState.error) {
    window.location.reload()
    return
  }
  await (await startWebSessionLock()).sync()
}
export const logoutLockedSession = logout
export { login as returnToWebLogin }

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    void creating?.then(
      (controller) => controller.stop(),
      () => {}
    )
  })
}
