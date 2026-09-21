export function getLinaEnv() {
  const baseURL = (process.env.LINA_BASE_URL || '').replace(/\/$/, '')
  const username = process.env.LINA_USERNAME || ''
  const password = process.env.LINA_PASSWORD || ''
  return {
    baseURL,
    username,
    password,
    ready: Boolean(baseURL)
  }
}

export function hasLiveConsole() {
  return getLinaEnv().ready
}
