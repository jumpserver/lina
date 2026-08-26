<template>
  <IBox v-loading="loading" :title="t('ChatAISettingsTitle')" class="chat-ai-settings">
    <template #header>
      <div class="chat-ai-settings__header">
        <div class="assistant-heading">
          <span class="assistant-heading__mark" aria-hidden="true"><MagicStick /></span>
          <div>
            <h5>{{ t('ChatAISettingsTitle') }}</h5>
            <p>{{ t('ChatAISettingsDescription') }}</p>
          </div>
        </div>
        <div class="enable-control">
          <span class="enable-control__dot" :class="{ active: form.CHAT_AI_ENABLED }" />
          <span :class="{ active: form.CHAT_AI_ENABLED }">
            {{ form.CHAT_AI_ENABLED ? t('ChatAIEnabled') : t('ChatAIDisabled') }}
          </span>
          <el-switch
            v-model="form.CHAT_AI_ENABLED"
            :disabled="switchingEnabled"
            :loading="switchingEnabled"
            @change="changeChatAIEnabled"
          />
        </div>
      </div>
    </template>

    <div class="settings-shell">
      <el-form class="provider-form" label-position="top" size="default">
        <section class="settings-panel connection-panel">
          <header class="section-header">
            <div class="section-heading">
              <span class="section-heading__icon" aria-hidden="true"><Connection /></span>
              <div>
                <h3>{{ t('ChatAIConnectionSection') }}</h3>
                <p>{{ t('ChatAIConnectionDescription') }}</p>
              </div>
            </div>
            <div class="provider-value">
              <span class="provider-value__status" />
              <span>{{
                iframeMode ? t('ChatAIIframeMethod') : t('ChatAICompatibleProvider')
              }}</span>
              <el-tag effect="plain" size="small" type="success">
                {{ iframeMode ? 'iframe' : 'OpenAI API' }}
              </el-tag>
            </div>
          </header>

          <div class="form-grid">
            <el-form-item class="form-field--full" :label="t('ChatAIMethod')">
              <el-radio-group v-model="form.CHAT_AI_METHOD">
                <el-radio-button value="api">{{ t('ChatAIBuiltInMethod') }}</el-radio-button>
                <el-radio-button value="iframe">{{ t('ChatAIIframeMethod') }}</el-radio-button>
              </el-radio-group>
              <div class="help-block">{{ t('ChatAIMethodHint') }}</div>
            </el-form-item>

            <el-form-item v-if="iframeMode" class="form-field--full" :label="t('ChatAIIframeURL')">
              <el-input
                v-model.trim="form.CHAT_AI_EMBED_URL"
                autocomplete="off"
                :placeholder="t('ChatAIIframeURLPlaceholder')"
              />
              <div class="help-block">{{ t('ChatAIIframeURLHint') }}</div>
            </el-form-item>

            <template v-else>
              <el-form-item class="form-field--full" :label="t('ChatAIBaseURL')">
                <el-input
                  v-model.trim="form.CHAT_AI_BASE_URL"
                  autocomplete="off"
                  :placeholder="t('ChatAIBaseURLPlaceholder')"
                />
                <div class="help-block">{{ t('ChatAIBaseURLHint') }}</div>
              </el-form-item>

              <el-form-item :label="t('ChatAIAPIKey')">
                <el-input
                  v-model="form.CHAT_AI_API_KEY"
                  autocomplete="new-password"
                  :placeholder="t('ChatAIAPIKeyPlaceholder')"
                  show-password
                  type="password"
                >
                  <template #prefix><Lock /></template>
                </el-input>
                <div class="help-block">{{ t('ChatAIAPIKeySavedHint') }}</div>
              </el-form-item>

              <el-form-item :label="t('ChatAIProxy')">
                <el-input
                  v-model.trim="form.CHAT_AI_PROXY"
                  autocomplete="off"
                  :placeholder="t('ChatAIProxyPlaceholder')"
                />
                <div class="help-block">{{ t('ChatAIProxyHint') }}</div>
              </el-form-item>

              <el-form-item class="form-field--full model-field" :label="t('ChatAIModel')">
                <div class="model-picker">
                  <el-select
                    v-model="form.CHAT_AI_MODEL"
                    allow-create
                    default-first-option
                    filterable
                    :loading="discovering"
                    :placeholder="t('ChatAIModelPlaceholder')"
                  >
                    <el-option
                      v-for="model in modelOptions"
                      :key="model.id"
                      :label="model.label"
                      :value="model.id"
                    />
                  </el-select>
                  <el-button
                    :disabled="!endpointReady"
                    :loading="discovering"
                    @click="refreshModels()"
                  >
                    <el-icon><Refresh /></el-icon>
                    {{ t('ChatAIRefreshModels') }}
                  </el-button>
                </div>
                <div class="help-block model-help">
                  <span>{{ t('ChatAIManualModelHint') }}</span>
                  <span v-if="modelsDiscovered" class="model-count">
                    {{ t('ChatAIModelsLoaded', { count: modelOptions.length }) }}
                  </span>
                </div>
              </el-form-item>

              <el-form-item
                class="form-field--full voice-field"
                :label="t('ChatAIVoiceTranscriptionMode')"
              >
                <el-radio-group v-model="form.CHAT_AI_VOICE_TRANSCRIPTION_MODE">
                  <el-radio-button value="browser">
                    {{ t('ChatAIBrowserSpeechRecognition') }}
                  </el-radio-button>
                </el-radio-group>
                <div class="help-block">{{ t('ChatAIVoiceTranscriptionModeHint') }}</div>
              </el-form-item>
            </template>
          </div>
        </section>

        <section
          v-if="!iframeMode"
          class="settings-panel web-search-panel"
          :class="{ 'is-enabled': form.CHAT_AI_WEB_SEARCH_ENABLED }"
        >
          <header class="section-header">
            <div class="section-heading">
              <span class="section-heading__icon section-heading__icon--search" aria-hidden="true">
                <Search />
              </span>
              <div>
                <h3>{{ t('ChatAIWebSearch') }}</h3>
                <p>{{ t('ChatAIWebSearchDescription') }}</p>
              </div>
            </div>
            <el-switch v-model="form.CHAT_AI_WEB_SEARCH_ENABLED" />
          </header>

          <div v-if="form.CHAT_AI_WEB_SEARCH_ENABLED" class="form-grid">
            <el-form-item :label="t('ChatAIWebSearchProvider')">
              <el-select v-model="form.CHAT_AI_WEB_SEARCH_PROVIDER">
                <el-option label="Tavily" value="tavily" />
                <el-option label="SearXNG" value="searxng" />
              </el-select>
            </el-form-item>

            <el-form-item :label="t('ChatAIWebSearchBaseURL')">
              <el-input
                v-model.trim="form.CHAT_AI_WEB_SEARCH_BASE_URL"
                autocomplete="off"
                :placeholder="t('ChatAIWebSearchBaseURLPlaceholder')"
              />
              <div class="help-block">{{ t('ChatAIWebSearchBaseURLHint') }}</div>
            </el-form-item>

            <el-form-item
              v-if="form.CHAT_AI_WEB_SEARCH_PROVIDER === 'tavily'"
              :label="t('ChatAIWebSearchAPIKey')"
            >
              <el-input
                v-model="form.CHAT_AI_WEB_SEARCH_API_KEY"
                autocomplete="new-password"
                :placeholder="t('ChatAIWebSearchAPIKeyPlaceholder')"
                show-password
                type="password"
              >
                <template #prefix><Lock /></template>
              </el-input>
              <div class="help-block">{{ t('ChatAIWebSearchAPIKeyHint') }}</div>
            </el-form-item>

            <el-form-item :label="t('ChatAIWebSearchProxy')">
              <el-input
                v-model.trim="form.CHAT_AI_WEB_SEARCH_PROXY"
                autocomplete="off"
                :placeholder="t('ChatAIProxyPlaceholder')"
              />
              <div class="help-block">{{ t('ChatAIWebSearchProxyHint') }}</div>
            </el-form-item>
          </div>
        </section>

        <div class="form-actions">
          <div class="action-status" :class="`is-${readinessState}`">
            <span class="action-status__dot" />
            <span>{{ testStatusText }}</span>
          </div>
          <div class="form-action-buttons">
            <el-button
              v-if="!iframeMode"
              :disabled="!endpointReady || !modelReady"
              :loading="testing"
              @click="testConfiguration"
            >
              {{ t('Test') }}
            </el-button>
            <el-button :loading="saving" type="primary" @click="saveConfiguration">
              {{ t('Submit') }}
            </el-button>
          </div>
        </div>
      </el-form>

      <aside class="settings-sidebar">
        <section class="configuration-status" :class="`is-${readinessState}`">
          <div class="configuration-status__header">
            <div>
              <span>{{ t('ChatAIReadiness') }}</span>
              <h3>{{ t('ChatAIConfigurationStatus') }}</h3>
            </div>
            <strong class="readiness-score">
              {{ readinessCount }}<small>/{{ readinessTotal }}</small>
            </strong>
          </div>
          <div class="readiness-progress" aria-hidden="true">
            <span :style="{ width: `${readinessPercentage}%` }" />
          </div>
          <div class="configuration-status__items">
            <div v-if="iframeMode" class="status-item" :class="{ complete: iframeReady }">
              <span class="status-item__icon"><Check /></span>
              <div>
                <strong>{{ t('ChatAIIframeURL') }}</strong>
                <span>{{ iframeReady ? t('ChatAIConfigured') : t('ChatAIWaitingIframeURL') }}</span>
              </div>
            </div>
            <template v-else>
              <div class="status-item" :class="{ complete: endpointReady }">
                <span class="status-item__icon"><Check /></span>
                <div>
                  <strong>{{ t('ChatAIEndpointReady') }}</strong>
                  <span>{{
                    endpointReady ? t('ChatAIConfigured') : t('ChatAIWaitingConfiguration')
                  }}</span>
                </div>
              </div>
              <div class="status-item" :class="{ complete: modelReady }">
                <span class="status-item__icon"><Check /></span>
                <div>
                  <strong>{{ t('ChatAIModelReady') }}</strong>
                  <span>{{ form.CHAT_AI_MODEL || t('ChatAIWaitingModel') }}</span>
                </div>
              </div>
              <div
                class="status-item"
                :class="{ complete: testState === 'success', failed: testState === 'failed' }"
              >
                <span class="status-item__icon"><Check /></span>
                <div>
                  <strong>{{ t('ChatAIToolCallingReady') }}</strong>
                  <span>{{ testStatusText }}</span>
                </div>
              </div>
            </template>
          </div>
        </section>

        <section class="capability-note">
          <span class="capability-note__icon" aria-hidden="true"><MagicStick /></span>
          <h3>{{ iframeMode ? t('ChatAIIframeMethod') : t('ChatAICapabilityTitle') }}</h3>
          <p>{{ iframeMode ? t('ChatAIIframeCapabilityHint') : t('ChatAICapabilityHint') }}</p>
          <div class="security-note">
            <Lock />
            <span>{{
              iframeMode ? t('ChatAIIframeSecurity') : t('ChatAICredentialSecurity')
            }}</span>
          </div>
        </section>
      </aside>
    </div>
  </IBox>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { Check, Connection, Lock, MagicStick, Refresh, Search } from '@element-plus/icons-vue'
import { IBox } from '@/components'
import {
  discoverChatAIModels,
  getChatAISettings,
  saveChatAISettings,
  testChatAISettings
} from '@/api/chatAiSettings'
import { encryptPassword } from '@/utils/secure'
import { message } from '@/utils/vue/message'

const { t } = useI18n()
const store = useStore()

const loading = ref(true)
const saving = ref(false)
const switchingEnabled = ref(false)
const discovering = ref(false)
const testing = ref(false)
const modelsDiscovered = ref(false)
const modelOptions = ref([])
const testState = ref('idle')
const hydrated = ref(false)

const form = reactive({
  CHAT_AI_ENABLED: false,
  CHAT_AI_METHOD: 'api',
  CHAT_AI_EMBED_URL: '',
  CHAT_AI_BASE_URL: '',
  CHAT_AI_API_KEY: '',
  CHAT_AI_PROXY: '',
  CHAT_AI_MODEL: '',
  CHAT_AI_VOICE_TRANSCRIPTION_MODE: 'browser',
  CHAT_AI_WEB_SEARCH_ENABLED: false,
  CHAT_AI_WEB_SEARCH_PROVIDER: 'tavily',
  CHAT_AI_WEB_SEARCH_BASE_URL: 'https://api.tavily.com',
  CHAT_AI_WEB_SEARCH_API_KEY: '',
  CHAT_AI_WEB_SEARCH_PROXY: ''
})

const iframeMode = computed(() => form.CHAT_AI_METHOD === 'iframe')
const iframeReady = computed(() => Boolean(form.CHAT_AI_EMBED_URL))
const endpointReady = computed(() => Boolean(form.CHAT_AI_BASE_URL))
const modelReady = computed(() => Boolean(form.CHAT_AI_MODEL))
const readinessTotal = computed(() => (iframeMode.value ? 1 : 3))
const readinessCount = computed(() => {
  if (iframeMode.value) return Number(iframeReady.value)
  return (
    Number(endpointReady.value) + Number(modelReady.value) + Number(testState.value === 'success')
  )
})
const readinessPercentage = computed(() => (readinessCount.value / readinessTotal.value) * 100)
const readinessState = computed(() => {
  if (readinessCount.value === readinessTotal.value) return 'ready'
  if (testState.value === 'failed') return 'failed'
  return 'pending'
})
const testStatusText = computed(() => {
  if (iframeMode.value) {
    return iframeReady.value ? t('ChatAIIframeReady') : t('ChatAIWaitingIframeURL')
  }
  if (testing.value) return t('ChatAITestingCapability')
  if (testState.value === 'success') return t('ChatAITestPassed')
  if (testState.value === 'failed') return t('ChatAITestFailed')
  return t('ChatAINotTested')
})

function getErrorMessage(error) {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.msg ||
    error?.message ||
    t('ChatAIRequestFailed')
  )
}

function providerPayload() {
  const payload = {
    CHAT_AI_BASE_URL: form.CHAT_AI_BASE_URL,
    CHAT_AI_PROXY: form.CHAT_AI_PROXY,
    CHAT_AI_MODEL: form.CHAT_AI_MODEL
  }
  if (form.CHAT_AI_API_KEY) {
    payload.CHAT_AI_API_KEY = encryptPassword(form.CHAT_AI_API_KEY)
  }
  return payload
}

function webSearchPayload() {
  const payload = {
    CHAT_AI_WEB_SEARCH_ENABLED: form.CHAT_AI_WEB_SEARCH_ENABLED,
    CHAT_AI_WEB_SEARCH_PROVIDER: form.CHAT_AI_WEB_SEARCH_PROVIDER,
    CHAT_AI_WEB_SEARCH_BASE_URL: form.CHAT_AI_WEB_SEARCH_BASE_URL,
    CHAT_AI_WEB_SEARCH_PROXY: form.CHAT_AI_WEB_SEARCH_PROXY
  }
  if (form.CHAT_AI_WEB_SEARCH_API_KEY) {
    payload.CHAT_AI_WEB_SEARCH_API_KEY = encryptPassword(form.CHAT_AI_WEB_SEARCH_API_KEY)
  }
  return payload
}

function updatePublicSettings(values) {
  const publicSettings = store.getters.publicSettings || {}
  return store.dispatch('settings/changeSetting', {
    key: 'publicSettings',
    value: {
      ...publicSettings,
      ...values
    }
  })
}

async function changeChatAIEnabled(enabled) {
  if (enabled && iframeMode.value && !iframeReady.value) {
    form.CHAT_AI_ENABLED = false
    message.warning(t('ChatAIIframeURLRequired'))
    return
  }
  if (enabled && !iframeMode.value && !form.CHAT_AI_MODEL) {
    form.CHAT_AI_ENABLED = false
    message.warning(t('ChatAIModelRequired'))
    return
  }

  switchingEnabled.value = true
  try {
    const payload = { CHAT_AI_ENABLED: enabled }
    const publicSettings = { CHAT_AI_ENABLED: enabled }
    if (enabled) {
      payload.CHAT_AI_METHOD = form.CHAT_AI_METHOD
      payload.CHAT_AI_EMBED_URL = form.CHAT_AI_EMBED_URL
      publicSettings.CHAT_AI_METHOD = form.CHAT_AI_METHOD
      publicSettings.CHAT_AI_EMBED_URL = form.CHAT_AI_EMBED_URL
    }
    await saveChatAISettings(payload)
    await updatePublicSettings(publicSettings)
    message.success(t('ChatAISettingsSaved'))
  } catch (error) {
    form.CHAT_AI_ENABLED = !enabled
    message.error(getErrorMessage(error))
  } finally {
    switchingEnabled.value = false
  }
}

function ensureCurrentModel(models) {
  const options = [...models]
  if (form.CHAT_AI_MODEL && !options.some((item) => item.id === form.CHAT_AI_MODEL)) {
    options.unshift({ id: form.CHAT_AI_MODEL, label: form.CHAT_AI_MODEL })
  }
  modelOptions.value = options
}

async function refreshModels(options = {}) {
  discovering.value = true
  try {
    const response = await discoverChatAIModels(providerPayload())
    const models = Array.isArray(response?.models) ? response.models : []
    ensureCurrentModel(models)
    modelsDiscovered.value = true
    if (!form.CHAT_AI_MODEL && models.length) {
      form.CHAT_AI_MODEL = models[0].id
    }
    if (!options.silent) {
      if (models.length) {
        message.success(t('ChatAIModelsLoaded', { count: models.length }))
      } else {
        message.warning(t('ChatAINoModelsFound'))
      }
    }
  } catch (error) {
    if (!options.silent) message.error(getErrorMessage(error))
  } finally {
    discovering.value = false
  }
}

async function testConfiguration() {
  if (iframeMode.value) return
  if (!form.CHAT_AI_MODEL) {
    message.warning(t('ChatAIModelRequired'))
    return
  }
  testing.value = true
  testState.value = 'idle'
  try {
    await testChatAISettings(providerPayload())
    testState.value = 'success'
    message.success(t('ChatAITestPassed'))
  } catch (error) {
    testState.value = 'failed'
    message.error(getErrorMessage(error))
  } finally {
    testing.value = false
  }
}

async function saveConfiguration() {
  if (form.CHAT_AI_ENABLED && iframeMode.value && !iframeReady.value) {
    message.warning(t('ChatAIIframeURLRequired'))
    return
  }
  if (form.CHAT_AI_ENABLED && !iframeMode.value && !form.CHAT_AI_MODEL) {
    message.warning(t('ChatAIModelRequired'))
    return
  }
  if (!iframeMode.value && form.CHAT_AI_WEB_SEARCH_ENABLED && !form.CHAT_AI_WEB_SEARCH_BASE_URL) {
    message.warning(t('ChatAIWebSearchBaseURLRequired'))
    return
  }
  saving.value = true
  try {
    await saveChatAISettings({
      CHAT_AI_ENABLED: form.CHAT_AI_ENABLED,
      CHAT_AI_METHOD: form.CHAT_AI_METHOD,
      CHAT_AI_EMBED_URL: form.CHAT_AI_EMBED_URL,
      CHAT_AI_VOICE_TRANSCRIPTION_MODE: form.CHAT_AI_VOICE_TRANSCRIPTION_MODE,
      ...webSearchPayload(),
      ...providerPayload()
    })
    await updatePublicSettings({
      CHAT_AI_ENABLED: form.CHAT_AI_ENABLED,
      CHAT_AI_METHOD: form.CHAT_AI_METHOD,
      CHAT_AI_EMBED_URL: form.CHAT_AI_EMBED_URL,
      CHAT_AI_WEB_SEARCH_ENABLED: form.CHAT_AI_WEB_SEARCH_ENABLED,
      CHAT_AI_VOICE_TRANSCRIPTION_MODE: form.CHAT_AI_VOICE_TRANSCRIPTION_MODE
    })
    hydrated.value = false
    form.CHAT_AI_API_KEY = ''
    form.CHAT_AI_WEB_SEARCH_API_KEY = ''
    hydrated.value = true
    message.success(t('ChatAISettingsSaved'))
  } catch (error) {
    message.error(getErrorMessage(error))
  } finally {
    saving.value = false
  }
}

watch(
  () => [
    form.CHAT_AI_METHOD,
    form.CHAT_AI_EMBED_URL,
    form.CHAT_AI_BASE_URL,
    form.CHAT_AI_API_KEY,
    form.CHAT_AI_PROXY,
    form.CHAT_AI_MODEL
  ],
  () => {
    if (!hydrated.value) return
    testState.value = 'idle'
  },
  { flush: 'sync' }
)

onMounted(async () => {
  try {
    const settings = await getChatAISettings()
    Object.assign(form, {
      CHAT_AI_ENABLED: Boolean(settings?.CHAT_AI_ENABLED),
      CHAT_AI_METHOD: ['embed', 'iframe'].includes(settings?.CHAT_AI_METHOD) ? 'iframe' : 'api',
      CHAT_AI_EMBED_URL: settings?.CHAT_AI_EMBED_URL || '',
      CHAT_AI_BASE_URL: settings?.CHAT_AI_BASE_URL || '',
      CHAT_AI_API_KEY: '',
      CHAT_AI_PROXY: settings?.CHAT_AI_PROXY || '',
      CHAT_AI_MODEL: settings?.CHAT_AI_MODEL || '',
      CHAT_AI_VOICE_TRANSCRIPTION_MODE: 'browser',
      CHAT_AI_WEB_SEARCH_ENABLED: Boolean(settings?.CHAT_AI_WEB_SEARCH_ENABLED),
      CHAT_AI_WEB_SEARCH_PROVIDER:
        settings?.CHAT_AI_WEB_SEARCH_PROVIDER === 'searxng' ? 'searxng' : 'tavily',
      CHAT_AI_WEB_SEARCH_BASE_URL:
        settings?.CHAT_AI_WEB_SEARCH_BASE_URL || 'https://api.tavily.com',
      CHAT_AI_WEB_SEARCH_API_KEY: '',
      CHAT_AI_WEB_SEARCH_PROXY: settings?.CHAT_AI_WEB_SEARCH_PROXY || ''
    })
    ensureCurrentModel([])
    hydrated.value = true
    if (!iframeMode.value && (form.CHAT_AI_BASE_URL || form.CHAT_AI_MODEL)) {
      await refreshModels({ silent: true })
    }
  } catch (error) {
    message.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.chat-ai-settings {
  :deep(.el-card__header) {
    padding: 16px 24px;
    background: linear-gradient(110deg, #fff 0%, #f4fbf8 100%);
  }

  :deep(.el-card__body) {
    display: block;
    padding: 24px;
    background: #f5f7f6;
  }
}

.chat-ai-settings__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;

  h5 {
    margin: 0;
    color: var(--color-text-primary);
    font-size: 16px;
    font-weight: 600;
    line-height: 22px;
  }

  p {
    max-width: 760px;
    margin: 3px 0 0;
    color: var(--color-help-text);
    font-size: 12px;
    line-height: 18px;
  }
}

.assistant-heading {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.assistant-heading__mark {
  display: grid;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  color: #fff;
  background: linear-gradient(145deg, var(--color-primary), #68c9ad);
  border-radius: 10px;
  box-shadow: 0 6px 16px rgb(46 179 144 / 20%);
  place-items: center;

  svg {
    width: 18px;
  }
}

.enable-control {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  background: rgb(255 255 255 / 76%);
  border: 1px solid #e3ebe7;
  border-radius: 999px;

  span {
    color: var(--color-help-text);
    font-size: 12px;
  }

  span.active {
    color: var(--color-primary);
  }
}

.enable-control__dot {
  width: 7px;
  height: 7px;
  background: #c1c9c5;
  border-radius: 50%;

  &.active {
    background: var(--color-primary);
    box-shadow: 0 0 0 3px rgb(46 179 144 / 12%);
  }
}

.settings-shell {
  display: grid;
  width: 100%;
  max-width: 1560px;
  margin: 0 auto;
  align-items: start;
  gap: 20px;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 320px);
}

.provider-form {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 16px;
}

.settings-panel,
.configuration-status,
.capability-note,
.form-actions {
  background: #fff;
  border: 1px solid #e5eae7;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(31 45 39 / 3%);
}

.settings-panel {
  overflow: hidden;
}

.section-header {
  display: flex;
  min-height: 70px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 20px;
}

.connection-panel .section-header,
.web-search-panel.is-enabled .section-header {
  border-bottom: 1px solid #edf0ee;
}

.section-heading {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 11px;

  h3 {
    margin: 0;
    color: var(--color-text-primary);
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
  }

  p {
    margin: 2px 0 0;
    color: var(--color-help-text);
    font-size: 12px;
    line-height: 18px;
  }
}

.section-heading__icon {
  display: grid;
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  color: var(--color-primary);
  background: rgb(46 179 144 / 10%);
  border-radius: 8px;
  place-items: center;

  svg {
    width: 16px;
  }
}

.section-heading__icon--search {
  color: #3c83d5;
  background: rgb(60 131 213 / 9%);
}

.provider-value {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 7px;
  padding: 6px 8px 6px 10px;
  color: var(--color-text-primary);
  font-size: 12px;
  background: #f7faf8;
  border: 1px solid #e5eae7;
  border-radius: 6px;
}

.provider-value__status {
  width: 7px;
  height: 7px;
  background: var(--color-primary);
  border-radius: 50%;
}

.form-grid {
  display: grid;
  padding: 20px 22px 4px;
  column-gap: 18px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-field--full {
  grid-column: 1 / -1;
}

.model-picker {
  display: flex;
  width: 100%;
  gap: 10px;

  .el-select {
    flex: 1;
  }
}

.model-help {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
}

.model-count {
  flex: 0 0 auto;
  color: var(--color-primary);
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 13px 16px;
}

.form-action-buttons {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
}

.action-status {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  color: var(--color-help-text);
  font-size: 12px;
}

.action-status__dot {
  flex: 0 0 7px;
  width: 7px;
  height: 7px;
  background: #aeb7b2;
  border-radius: 50%;
}

.action-status.is-ready .action-status__dot {
  background: var(--color-primary);
  box-shadow: 0 0 0 3px rgb(46 179 144 / 12%);
}

.action-status.is-failed .action-status__dot {
  background: var(--el-color-danger);
  box-shadow: 0 0 0 3px rgb(245 108 108 / 12%);
}

.settings-sidebar {
  position: sticky;
  top: 16px;
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 16px;
}

.configuration-status {
  padding: 18px;
}

.configuration-status__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  > div > span {
    display: block;
    margin-bottom: 3px;
    color: var(--color-primary);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
  }

  h3 {
    margin: 0;
    color: var(--color-text-primary);
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
  }
}

.readiness-score {
  color: var(--color-text-primary);
  font-size: 24px;
  font-weight: 600;
  line-height: 1;

  small {
    color: var(--color-help-text);
    font-size: 12px;
    font-weight: 400;
  }
}

.readiness-progress {
  height: 5px;
  margin: 16px 0 6px;
  overflow: hidden;
  background: #edf1ef;
  border-radius: 999px;

  span {
    display: block;
    height: 100%;
    background: var(--color-primary);
    border-radius: inherit;
    transition: width 0.25s ease;
  }
}

.configuration-status.is-failed .readiness-progress span {
  background: var(--el-color-danger);
}

.configuration-status__items {
  display: flex;
  flex-direction: column;
}

.status-item {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 11px;
  padding: 12px 0;

  & + & {
    border-top: 1px solid #edf0ee;
  }

  > div {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 2px;
  }

  strong {
    color: var(--color-text-primary);
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
  }

  div span {
    overflow: hidden;
    color: var(--color-help-text);
    font-size: 12px;
    line-height: 18px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &.complete .status-item__icon {
    color: #fff;
    background: var(--color-primary);
    border-color: var(--color-primary);
  }

  &.failed .status-item__icon {
    color: #fff;
    background: var(--el-color-danger);
    border-color: var(--el-color-danger);
  }
}

.status-item__icon {
  display: grid;
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  place-items: center;
  color: #a8b1ad;
  background: #f7f9f8;
  border: 1px solid #d8deda;
  border-radius: 50%;

  svg {
    width: 12px;
  }
}

.capability-note {
  padding: 18px;
  background: linear-gradient(145deg, #f2faf7 0%, #f7f9fd 100%);
  border-color: #dceae4;

  h3 {
    margin: 12px 0 6px;
    color: var(--color-text-primary);
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
  }

  p {
    margin: 0;
    color: var(--color-help-text);
    font-size: 12px;
    line-height: 20px;
  }
}

.capability-note__icon {
  display: grid;
  width: 34px;
  height: 34px;
  color: var(--color-primary);
  background: rgb(46 179 144 / 12%);
  border-radius: 9px;
  place-items: center;

  svg {
    width: 17px;
  }
}

.security-note {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding-top: 12px;
  margin-top: 12px;
  color: var(--color-help-text);
  font-size: 12px;
  line-height: 18px;
  border-top: 1px solid rgb(46 179 144 / 14%);

  svg {
    flex: 0 0 13px;
    width: 13px;
    margin-top: 2px;
    color: var(--color-primary);
  }
}

:deep(.provider-form .el-form-item) {
  min-width: 0;
  margin-bottom: 16px;
}

:deep(.provider-form .el-form-item__label) {
  height: auto;
  padding: 0;
  margin-bottom: 6px;
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
}

:deep(.provider-form .el-form-item__content) {
  min-width: 0;
  line-height: 32px;
}

:deep(.provider-form .el-input),
:deep(.provider-form .el-select) {
  width: 100%;
}

:deep(.provider-form .help-block) {
  width: 100%;
  margin: 4px 0 0;
  color: var(--color-help-text);
  font-size: 12px;
  line-height: 18px;
}

@media (width <= 980px) {
  .settings-shell {
    grid-template-columns: 1fr;
  }

  .settings-sidebar {
    position: static;
    display: grid;
    grid-row: 1;
    grid-template-columns: minmax(0, 1.3fr) minmax(260px, 0.7fr);
  }
}

@media (width <= 760px) {
  .settings-sidebar {
    display: contents;
  }

  .configuration-status {
    grid-row: 1;
  }

  .provider-form {
    grid-row: 2;
  }

  .capability-note {
    grid-row: 3;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-field--full {
    grid-column: auto;
  }
}

@media (width <= 620px) {
  .chat-ai-settings {
    :deep(.el-card__header),
    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .chat-ai-settings__header {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .enable-control {
    align-self: stretch;
    justify-content: flex-end;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .provider-value {
    margin-left: 43px;
  }

  .form-grid {
    padding-inline: 16px;
  }

  .form-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .model-picker {
    align-items: stretch;
    flex-direction: column;
  }

  .model-help {
    align-items: flex-start;
    flex-direction: column;
    gap: 2px;
  }

  .form-action-buttons {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    .el-button {
      width: 100%;
      margin: 0;
    }
  }
}
</style>
