/**
 * 动态检测应用基础路径，支持部署在任意二级目录下
 * 例如: /ui/ 、/prefix/ui/ 、/org1/ui/ 等
 *
 * 检测逻辑：从当前 URL 路径中查找 /ui/ 的位置，
 * 截取到 /ui/（含）作为基础路径
 */
function detectBasePath() {
  const path = window.location.pathname
  const idx = path.indexOf('/ui/')
  if (idx !== -1) {
    return path.substring(0, idx + 4)
  }
  if (path.endsWith('/ui')) {
    return path + '/'
  }
  // 回退默认值
  return '/ui/'
}

export const BASE_PATH = detectBasePath()

/**
 * 站点根路径，支持二级目录部署
 * 例如: BASE_PATH = /prefix/ui/ => SITE_BASE = /prefix/
 *       BASE_PATH = /ui/        => SITE_BASE = /
 */
export const SITE_BASE = BASE_PATH.replace(/ui\/$/, '')

export const LOGIN_PATH = SITE_BASE + 'core/auth/login/'
export const LOGOUT_PATH = SITE_BASE + 'core/auth/logout/'
