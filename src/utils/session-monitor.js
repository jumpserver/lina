/*
 * 会话过期监听器
 *
 * 当 publicSettings.AUTO_RELOGIN_AT_SESSION_EXPIRE 开启时，
 * 周期性调用 profile 接口检测 session 状态。
 * 如果返回 401，由 request 拦截器统一处理跳转登录页。
 */
let timer = null
let inflight = null

export function start() {
  if (timer) {
    return
  }
  timer = setInterval(checkSession, 60 * 1000)
  setTimeout(checkSession, 0)
}

export function stop() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function checkSession() {
  if (inflight) {
    return inflight
  }
  inflight = (async () => {
    try {
      const { default: request } = await import('@/utils/request')
      await request({
        url: '/api/v1/users/profile/',
        method: 'get'
      })
    } catch (e) {
      console.warn(e)
      // 401 已由 request 拦截器处理跳转，无需额外逻辑
    } finally {
      inflight = null
    }
  })()
  return inflight
}
