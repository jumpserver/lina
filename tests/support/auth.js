import { getLinaEnv } from './env.js'

/**
 * Conservative console login helper for Playwright Page.
 * Refine selectors against your JumpServer build / i18n.
 */
export async function loginAsConsoleAdmin(page) {
  const { baseURL, username, password } = getLinaEnv()
  if (!baseURL) throw new Error('LINA_BASE_URL is required')
  if (!username || !password) throw new Error('LINA_USERNAME / LINA_PASSWORD are required')

  await page.goto(`${baseURL}/ui/`, { waitUntil: 'domcontentloaded' })
  const user = page.getByPlaceholder(/用户名|Username|Email|邮箱/i).first()
  const pass = page.getByPlaceholder(/密码|Password/i).first()
  await user.fill(username)
  await pass.fill(password)
  await page.getByRole('button', { name: /登录|Login|Sign in/i }).first().click()
}
