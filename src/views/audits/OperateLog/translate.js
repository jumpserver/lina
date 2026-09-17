import i18n from '@/i18n/i18n'

const RESOURCE_I18N_KEYS = {
  'accounts.tasks.push_account.push_accounts_to_assets_task': 'PushAccountsToAssets',
  'accounts.tasks.verify_account.verify_accounts_connectivity_task': 'VerifyAssetAccount',
  'celery task execution': 'CeleryTaskExecution',
  chat_ai_api_key: 'ChatAIAPIKey',
  chat_ai_base_url: 'ChatAIBaseURL',
  chat_ai_embed_url: 'ChatAIIframeURL',
  chat_ai_enabled: 'ChatAI',
  chat_ai_method: 'ChatAIMethod',
  chat_ai_model: 'ChatAIModel',
  chat_ai_proxy: 'ChatAIProxy',
  'system settings': 'SystemSetting'
}

export function translateOperateLogText(value) {
  if (typeof value !== 'string' || !value) {
    return value
  }
  const trimmed = value.trim()
  const mapped = RESOURCE_I18N_KEYS[trimmed.toLowerCase()]
  if (mapped) {
    return i18n.t(mapped)
  }
  const sep = trimmed.indexOf(': ')
  if (sep > 0) {
    const nameKey = RESOURCE_I18N_KEYS[trimmed.slice(0, sep).toLowerCase()]
    if (nameKey) {
      return `${i18n.t(nameKey)}${trimmed.slice(sep)}`
    }
  }
  return trimmed
}
