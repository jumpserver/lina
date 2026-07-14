/*
 * 会话过期监听器
 *
 * 当 publicSettings.AUTO_RELOGIN_AT_SESSION_EXPIRE 开启时，
 * 周期性调用 profile 接口检测 session 状态。
 * 如果返回 401，由 request 拦截器统一处理跳转登录页。
 */
import store from '@/store'

let timer = null

export function start() {
  stop()
  checkSession()
  timer = setInterval(checkSession, 60 * 1000)
}

export function stop() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

async function checkSession() {
  try {
    await store.dispatch('users/getProfile', true)
  } catch (e) {
    // 401 已由 request 拦截器处理跳转，无需额外逻辑
  }
}
