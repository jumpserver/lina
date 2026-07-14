<template>
  <div v-loading="loading" class="ai-settings-page">
    <section class="ai-hero">
      <div class="ai-hero__glow" />
      <div class="ai-hero__content">
        <div class="ai-hero__mark" aria-hidden="true">
          <MagicStick />
        </div>
        <div>
          <div class="ai-hero__eyebrow">AI ASSISTANT</div>
          <h1>{{ t('ChatAISettingsTitle') }}</h1>
          <p>{{ t('ChatAISettingsDescription') }}</p>
        </div>
      </div>
      <div class="ai-hero__toggle">
        <span :class="{ active: form.CHAT_AI_ENABLED }">
          {{ form.CHAT_AI_ENABLED ? t('ChatAIEnabled') : t('ChatAIDisabled') }}
        </span>
        <el-switch v-model="form.CHAT_AI_ENABLED" size="large" />
      </div>
    </section>

    <div class="ai-settings-grid">
      <section class="settings-card settings-card--main">
        <header class="settings-card__header">
          <div class="section-icon"><Connection /></div>
          <div>
            <h2>{{ t('ChatAIConnectionSection') }}</h2>
            <p>{{ t('ChatAIConnectionDescription') }}</p>
          </div>
        </header>

        <el-form class="provider-form" label-position="top" size="large">
          <div class="provider-badge">
            <span class="provider-badge__pulse" />
            <div>
              <span class="provider-badge__label">{{ t('ChatAIProvider') }}</span>
              <strong>{{ t('ChatAICompatibleProvider') }}</strong>
            </div>
            <span class="provider-badge__protocol">OpenAI API</span>
          </div>

          <el-form-item :label="t('ChatAIBaseURL')">
            <el-input
              v-model.trim="form.CHAT_AI_BASE_URL"
              autocomplete="off"
              :placeholder="t('ChatAIBaseURLPlaceholder')"
            />
            <div class="field-help">{{ t('ChatAIBaseURLHint') }}</div>
          </el-form-item>

          <div class="form-columns">
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
              <div class="field-help">{{ t('ChatAIAPIKeySavedHint') }}</div>
            </el-form-item>

            <el-form-item :label="t('ChatAIProxy')">
              <el-input
                v-model.trim="form.CHAT_AI_PROXY"
                autocomplete="off"
                :placeholder="t('ChatAIProxyPlaceholder')"
              />
              <div class="field-help">{{ t('ChatAIProxyHint') }}</div>
            </el-form-item>
          </div>

          <el-form-item class="model-field" :label="t('ChatAIModel')">
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
              <el-button :loading="discovering" plain @click="refreshModels()">
                <el-icon><Refresh /></el-icon>
                {{ t('ChatAIRefreshModels') }}
              </el-button>
            </div>
            <div class="field-help model-help">
              <span>{{ t('ChatAIManualModelHint') }}</span>
              <span v-if="modelsDiscovered" class="model-count">
                {{ t('ChatAIModelsLoaded', { count: modelOptions.length }) }}
              </span>
            </div>
          </el-form-item>

          <el-form-item :label="t('ChatAIVoiceTranscriptionMode')">
            <el-radio-group v-model="form.CHAT_AI_VOICE_TRANSCRIPTION_MODE">
              <el-radio-button value="browser">
                {{ t('ChatAIBrowserSpeechRecognition') }}
              </el-radio-button>
              <el-radio-button value="server">
                {{ t('ChatAIServerTranscription') }}
              </el-radio-button>
            </el-radio-group>
            <div class="field-help">{{ t('ChatAIVoiceTranscriptionModeHint') }}</div>
          </el-form-item>

          <div class="web-search-panel">
            <div class="web-search-panel__header">
              <div>
                <strong>{{ t('ChatAIWebSearch') }}</strong>
                <span>{{ t('ChatAIWebSearchDescription') }}</span>
              </div>
              <el-switch v-model="form.CHAT_AI_WEB_SEARCH_ENABLED" />
            </div>

            <template v-if="form.CHAT_AI_WEB_SEARCH_ENABLED">
              <div class="form-columns">
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
                  <div class="field-help">{{ t('ChatAIWebSearchBaseURLHint') }}</div>
                </el-form-item>
              </div>

              <div class="form-columns">
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
                  <div class="field-help">{{ t('ChatAIWebSearchAPIKeyHint') }}</div>
                </el-form-item>

                <el-form-item :label="t('ChatAIWebSearchProxy')">
                  <el-input
                    v-model.trim="form.CHAT_AI_WEB_SEARCH_PROXY"
                    autocomplete="off"
                    :placeholder="t('ChatAIProxyPlaceholder')"
                  />
                  <div class="field-help">{{ t('ChatAIWebSearchProxyHint') }}</div>
                </el-form-item>
              </div>
            </template>
          </div>
        </el-form>

        <footer class="settings-card__footer">
          <el-button :loading="testing" size="large" @click="testConfiguration">
            <el-icon><Connection /></el-icon>
            {{ t('ChatAITestConfiguration') }}
          </el-button>
          <el-button :loading="saving" size="large" type="primary" @click="saveConfiguration">
            <el-icon><Check /></el-icon>
            {{ t('ChatAISaveConfiguration') }}
          </el-button>
        </footer>
      </section>

      <aside class="settings-sidebar">
        <section class="settings-card readiness-card">
          <div class="readiness-card__header">
            <div>
              <span class="sidebar-eyebrow">{{ t('ChatAIReadiness') }}</span>
              <h2>{{ t('ChatAIConfigurationStatus') }}</h2>
            </div>
            <div class="readiness-score" :class="`is-${readinessState}`">
              {{ readinessCount }}/3
            </div>
          </div>

          <div class="readiness-list">
            <div class="readiness-item" :class="{ complete: endpointReady }">
              <span class="readiness-item__icon"><Check /></span>
              <div>
                <strong>{{ t('ChatAIEndpointReady') }}</strong>
                <span>{{
                  endpointReady ? t('ChatAIConfigured') : t('ChatAIWaitingConfiguration')
                }}</span>
              </div>
            </div>
            <div class="readiness-item" :class="{ complete: modelReady }">
              <span class="readiness-item__icon"><Check /></span>
              <div>
                <strong>{{ t('ChatAIModelReady') }}</strong>
                <span>{{ form.CHAT_AI_MODEL || t('ChatAIWaitingModel') }}</span>
              </div>
            </div>
            <div
              class="readiness-item"
              :class="{ complete: testState === 'success', failed: testState === 'failed' }"
            >
              <span class="readiness-item__icon"><Check /></span>
              <div>
                <strong>{{ t('ChatAIToolCallingReady') }}</strong>
                <span>{{ testStatusText }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="capability-card">
          <div class="capability-card__icon"><MagicStick /></div>
          <h3>{{ t('ChatAICapabilityTitle') }}</h3>
          <p>{{ t('ChatAICapabilityHint') }}</p>
          <div class="security-note">
            <Lock />
            <span>{{ t('ChatAICredentialSecurity') }}</span>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { Check, Connection, Lock, MagicStick, Refresh } from '@element-plus/icons-vue'
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
const discovering = ref(false)
const testing = ref(false)
const modelsDiscovered = ref(false)
const modelOptions = ref([])
const testState = ref('idle')
const hydrated = ref(false)

const form = reactive({
  CHAT_AI_ENABLED: false,
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

const endpointReady = computed(() => Boolean(form.CHAT_AI_BASE_URL))
const modelReady = computed(() => Boolean(form.CHAT_AI_MODEL))
const readinessCount = computed(
  () =>
    Number(endpointReady.value) + Number(modelReady.value) + Number(testState.value === 'success')
)
const readinessState = computed(() => {
  if (readinessCount.value === 3) return 'ready'
  if (testState.value === 'failed') return 'failed'
  return 'pending'
})
const testStatusText = computed(() => {
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
  if (form.CHAT_AI_ENABLED && !form.CHAT_AI_MODEL) {
    message.warning(t('ChatAIModelRequired'))
    return
  }
  if (form.CHAT_AI_WEB_SEARCH_ENABLED && !form.CHAT_AI_WEB_SEARCH_BASE_URL) {
    message.warning(t('ChatAIWebSearchBaseURLRequired'))
    return
  }
  saving.value = true
  try {
    await saveChatAISettings({
      CHAT_AI_ENABLED: form.CHAT_AI_ENABLED,
      CHAT_AI_VOICE_TRANSCRIPTION_MODE: form.CHAT_AI_VOICE_TRANSCRIPTION_MODE,
      ...webSearchPayload(),
      ...providerPayload()
    })
    const publicSettings = store.getters.publicSettings || {}
    await store.dispatch('settings/changeSetting', {
      key: 'publicSettings',
      value: {
        ...publicSettings,
        CHAT_AI_ENABLED: form.CHAT_AI_ENABLED,
        CHAT_AI_WEB_SEARCH_ENABLED: form.CHAT_AI_WEB_SEARCH_ENABLED,
        CHAT_AI_VOICE_TRANSCRIPTION_MODE: form.CHAT_AI_VOICE_TRANSCRIPTION_MODE
      }
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
  () => [form.CHAT_AI_BASE_URL, form.CHAT_AI_API_KEY, form.CHAT_AI_PROXY, form.CHAT_AI_MODEL],
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
      CHAT_AI_BASE_URL: settings?.CHAT_AI_BASE_URL || '',
      CHAT_AI_API_KEY: '',
      CHAT_AI_PROXY: settings?.CHAT_AI_PROXY || '',
      CHAT_AI_MODEL: settings?.CHAT_AI_MODEL || '',
      CHAT_AI_VOICE_TRANSCRIPTION_MODE:
        settings?.CHAT_AI_VOICE_TRANSCRIPTION_MODE === 'server' ? 'server' : 'browser',
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
    if (form.CHAT_AI_BASE_URL || form.CHAT_AI_MODEL) {
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
.ai-settings-page {
  min-height: 100%;
  padding: 24px;
  background: radial-gradient(circle at 92% 0, rgb(50 190 143 / 9%), transparent 25%), #f5f7f9;
}

.ai-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 164px;
  padding: 30px 34px;
  overflow: hidden;
  color: #fff;
  background: linear-gradient(125deg, #112b2b 0%, #16443c 55%, #156b58 100%);
  border-radius: 18px;
  box-shadow: 0 18px 42px rgb(17 56 49 / 16%);
}

.ai-hero__glow {
  position: absolute;
  top: -130px;
  right: 10%;
  width: 360px;
  height: 360px;
  background: radial-gradient(circle, rgb(63 222 167 / 24%), transparent 65%);
}

.ai-hero__content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  max-width: 760px;

  h1 {
    margin: 3px 0 8px;
    font-size: 27px;
    font-weight: 650;
    letter-spacing: -0.5px;
  }

  p {
    max-width: 670px;
    margin: 0;
    color: rgb(230 255 247 / 74%);
    font-size: 14px;
    line-height: 1.7;
  }
}

.ai-hero__mark {
  display: grid;
  flex: 0 0 58px;
  width: 58px;
  height: 58px;
  place-items: center;
  padding: 15px;
  color: #143f36;
  background: linear-gradient(145deg, #b3ffe5, #54d6aa);
  border: 1px solid rgb(255 255 255 / 45%);
  border-radius: 18px;
  box-shadow: 0 12px 28px rgb(10 34 29 / 30%);
}

.ai-hero__eyebrow,
.sidebar-eyebrow {
  color: #69ddb5;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.8px;
}

.ai-hero__toggle {
  position: relative;
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 12px;
  margin-left: 28px;
  padding: 10px 13px 10px 16px;
  background: rgb(255 255 255 / 9%);
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 999px;

  span {
    color: rgb(255 255 255 / 58%);
    font-size: 12px;
    font-weight: 600;
  }

  span.active {
    color: #baffdf;
  }
}

.ai-settings-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(270px, 0.72fr);
  gap: 20px;
  margin-top: 20px;
}

.settings-card {
  background: #fff;
  border: 1px solid #e6ebe9;
  border-radius: 16px;
  box-shadow: 0 8px 28px rgb(35 63 56 / 5%);
}

.settings-card--main {
  overflow: hidden;
}

.settings-card__header {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 24px 26px 20px;
  border-bottom: 1px solid #edf1ef;

  h2 {
    margin: 0 0 4px;
    color: #172620;
    font-size: 17px;
  }

  p {
    margin: 0;
    color: #829089;
    font-size: 12px;
  }
}

.section-icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  padding: 10px;
  color: #1ca579;
  background: #e9f8f2;
  border-radius: 11px;
}

.provider-form {
  padding: 24px 26px 8px;
}

.provider-badge {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 22px;
  padding: 13px 15px;
  background: linear-gradient(90deg, #f0faf6, #f9fcfb);
  border: 1px solid #d9eee6;
  border-radius: 11px;

  div {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 1px;
  }

  strong {
    color: #284038;
    font-size: 13px;
  }
}

.provider-badge__pulse {
  width: 9px;
  height: 9px;
  background: #25b887;
  border: 3px solid #c9f2e4;
  border-radius: 50%;
  box-sizing: content-box;
}

.provider-badge__label {
  color: #83928c;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.7px;
}

.provider-badge__protocol {
  padding: 4px 8px;
  color: #35806a;
  background: #fff;
  border: 1px solid #dcebe6;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
}

.form-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.field-help {
  margin-top: 7px;
  color: #98a39e;
  font-size: 11px;
  line-height: 1.5;
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
}

.model-count {
  color: #1a9d74;
  font-weight: 600;
}

.web-search-panel {
  margin-top: 8px;
  padding: 17px 18px 1px;
  background: #f8fbfa;
  border: 1px solid #e1ebe7;
  border-radius: 11px;
}

.web-search-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 16px;

  div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  strong {
    color: #344942;
    font-size: 13px;
  }

  span {
    color: #8b9994;
    font-size: 11px;
    line-height: 1.5;
  }
}

.settings-card__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 17px 26px;
  background: #fafcfb;
  border-top: 1px solid #edf1ef;
}

.settings-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.readiness-card {
  padding: 22px;
}

.readiness-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 23px;

  h2 {
    margin: 4px 0 0;
    color: #1d2d27;
    font-size: 16px;
  }
}

.readiness-score {
  min-width: 47px;
  padding: 7px 9px;
  color: #8a9691;
  text-align: center;
  background: #f1f4f3;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 700;

  &.is-ready {
    color: #137d5d;
    background: #e5f7f0;
  }

  &.is-failed {
    color: #c24545;
    background: #fff0f0;
  }
}

.readiness-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.readiness-item {
  display: flex;
  align-items: flex-start;
  gap: 11px;

  div {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 4px;
  }

  strong {
    color: #45534e;
    font-size: 12px;
  }

  div span {
    overflow: hidden;
    color: #a0aaa6;
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &.complete .readiness-item__icon {
    color: #fff;
    background: #26ad80;
    border-color: #26ad80;
  }

  &.failed .readiness-item__icon {
    color: #fff;
    background: #e65c5c;
    border-color: #e65c5c;
  }
}

.readiness-item__icon {
  display: grid;
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  place-items: center;
  padding: 5px;
  color: #b8c1bd;
  border: 1px solid #dce2df;
  border-radius: 50%;
}

.capability-card {
  padding: 23px;
  color: #ddf7ed;
  background: linear-gradient(145deg, #18352f, #214d42);
  border-radius: 16px;
  box-shadow: 0 12px 30px rgb(20 58 49 / 14%);

  h3 {
    margin: 14px 0 8px;
    color: #fff;
    font-size: 15px;
  }

  p {
    margin: 0;
    color: rgb(225 249 241 / 66%);
    font-size: 11px;
    line-height: 1.7;
  }
}

.capability-card__icon {
  width: 34px;
  height: 34px;
  padding: 8px;
  color: #183d33;
  background: #6fe0b8;
  border-radius: 10px;
}

.security-note {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin-top: 18px;
  padding-top: 15px;
  color: #88d9bc;
  border-top: 1px solid rgb(255 255 255 / 10%);
  font-size: 10px;
  line-height: 1.5;

  svg {
    flex: 0 0 12px;
    width: 12px;
    margin-top: 1px;
  }
}

:deep(.el-form-item__label) {
  color: #45534e;
  font-size: 12px;
  font-weight: 600;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #dfe6e3 inset;
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #27aa7e inset;
}

@media (width <= 980px) {
  .ai-settings-grid {
    grid-template-columns: 1fr;
  }

  .settings-sidebar {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (width <= 680px) {
  .ai-settings-page {
    padding: 14px;
  }

  .ai-hero {
    align-items: flex-start;
    flex-direction: column;
    gap: 22px;
    padding: 24px;
  }

  .ai-hero__toggle {
    margin-left: 0;
  }

  .form-columns,
  .settings-sidebar {
    grid-template-columns: 1fr;
  }

  .model-picker {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
