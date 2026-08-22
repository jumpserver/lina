<template>
  <IBox v-loading="loading" :title="t('ChatAISettingsTitle')" class="chat-ai-settings">
    <template #header>
      <div class="chat-ai-settings__header">
        <div>
          <h5>{{ t('ChatAISettingsTitle') }}</h5>
          <p>{{ t('ChatAISettingsDescription') }}</p>
        </div>
        <div class="enable-control">
          <span :class="{ active: form.CHAT_AI_ENABLED }">
            {{ form.CHAT_AI_ENABLED ? t('ChatAIEnabled') : t('ChatAIDisabled') }}
          </span>
          <el-switch v-model="form.CHAT_AI_ENABLED" />
        </div>
      </div>
    </template>

    <div class="configuration-status" :class="`is-${readinessState}`">
      <div class="configuration-status__title">
        <strong>{{ t('ChatAIConfigurationStatus') }}</strong>
        <el-tag
          effect="plain"
          size="small"
          :type="
            readinessState === 'ready' ? 'success' : readinessState === 'failed' ? 'danger' : 'info'
          "
        >
          {{ readinessCount }}/3
        </el-tag>
      </div>
      <div class="configuration-status__items">
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
      </div>
    </div>

    <el-form class="provider-form" label-position="right" label-width="160px">
      <div class="form-section-heading">
        <div>
          <h3>{{ t('ChatAIConnectionSection') }}</h3>
          <p>{{ t('ChatAIConnectionDescription') }}</p>
        </div>
      </div>

      <el-form-item :label="t('ChatAIProvider')">
        <div class="provider-value">
          <span class="provider-value__status" />
          <strong>{{ t('ChatAICompatibleProvider') }}</strong>
          <el-tag effect="plain" size="small" type="success">OpenAI API</el-tag>
        </div>
      </el-form-item>

      <el-form-item :label="t('ChatAIBaseURL')">
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
          <el-button :loading="discovering" @click="refreshModels()">
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

      <el-form-item :label="t('ChatAIVoiceTranscriptionMode')">
        <el-radio-group v-model="form.CHAT_AI_VOICE_TRANSCRIPTION_MODE">
          <el-radio-button value="browser">
            {{ t('ChatAIBrowserSpeechRecognition') }}
          </el-radio-button>
          <el-radio-button value="server">
            {{ t('ChatAIServerTranscription') }}
          </el-radio-button>
        </el-radio-group>
        <div class="help-block">{{ t('ChatAIVoiceTranscriptionModeHint') }}</div>
      </el-form-item>

      <div class="form-section-heading form-section-heading--divided">
        <div>
          <h3>{{ t('ChatAIWebSearch') }}</h3>
          <p>{{ t('ChatAIWebSearchDescription') }}</p>
        </div>
        <el-switch v-model="form.CHAT_AI_WEB_SEARCH_ENABLED" />
      </div>

      <template v-if="form.CHAT_AI_WEB_SEARCH_ENABLED">
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
      </template>

      <div class="form-actions">
        <el-button :loading="saving" type="primary" @click="saveConfiguration">
          {{ t('ChatAISaveConfiguration') }}
        </el-button>
        <el-button :loading="testing" @click="testConfiguration">
          {{ t('ChatAITestConfiguration') }}
        </el-button>
      </div>
    </el-form>

    <el-alert class="capability-note" :closable="false" show-icon type="info">
      <template #title>{{ t('ChatAICapabilityTitle') }}</template>
      <p>{{ t('ChatAICapabilityHint') }}</p>
      <div class="security-note">
        <Lock />
        <span>{{ t('ChatAICredentialSecurity') }}</span>
      </div>
    </el-alert>
  </IBox>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { Check, Lock, Refresh } from '@element-plus/icons-vue'
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
.chat-ai-settings {
  :deep(.el-card__body) {
    gap: 22px;
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
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
  }

  p {
    margin: 2px 0 0;
    color: var(--color-help-text);
    font-size: 12px;
    line-height: 18px;
  }
}

.enable-control {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;

  span {
    color: var(--color-help-text);
    font-size: 12px;
  }

  span.active {
    color: var(--color-primary);
  }
}

.configuration-status {
  display: grid;
  grid-template-columns: 144px minmax(0, 1fr);
  overflow: hidden;
  background: #f8faf9;
  border: 1px solid #e7ebe9;
  border-radius: 4px;
}

.configuration-status__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 14px 16px;
  border-right: 1px solid #e7ebe9;

  strong {
    color: var(--color-text-primary);
    font-size: 13px;
    font-weight: 500;
  }
}

.configuration-status__items {
  display: grid;
  min-width: 0;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.status-item {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;

  & + & {
    border-left: 1px solid #e7ebe9;
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
    font-weight: 500;
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
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  place-items: center;
  padding: 4px;
  color: #a8b1ad;
  background: #fff;
  border: 1px solid #d8deda;
  border-radius: 50%;
}

.provider-form {
  width: 100%;
}

.form-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 0 20px 18px;

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

.form-section-heading--divided {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px dashed #e7eaec;
}

.provider-value {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;

  strong {
    color: var(--color-text-primary);
    font-size: 13px;
    font-weight: 400;
  }
}

.provider-value__status {
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border-radius: 50%;
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
  gap: 10px;
  padding-left: 160px;
  margin-top: 24px;
}

.capability-note {
  p {
    margin: 3px 0 0;
    font-size: 12px;
    line-height: 18px;
  }
}

.security-note {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  color: var(--color-help-text);
  font-size: 12px;
  line-height: 18px;

  svg {
    flex: 0 0 13px;
    width: 13px;
  }
}

:deep(.provider-form .el-form-item) {
  margin-bottom: 18px;
}

:deep(.provider-form .el-form-item__label) {
  color: var(--color-text-primary);
  font-size: 13px;
  line-height: 30px;
}

:deep(.provider-form .el-form-item__content) {
  min-width: 0;
  max-width: 960px;
  line-height: 30px;
}

:deep(.provider-form .el-input),
:deep(.provider-form .el-select) {
  width: 100%;
}

:deep(.provider-form .help-block) {
  width: 100%;
  margin: 2px 0 0;
}

@media (width <= 900px) {
  .configuration-status {
    grid-template-columns: 1fr;
  }

  .configuration-status__title {
    border-right: 0;
    border-bottom: 1px solid #e7ebe9;
  }

  .configuration-status__items {
    grid-template-columns: 1fr;
  }

  .status-item + .status-item {
    border-top: 1px solid #e7ebe9;
    border-left: 0;
  }
}

@media (width <= 680px) {
  .chat-ai-settings__header {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .form-section-heading {
    margin-inline: 0;
  }

  :deep(.provider-form .el-form-item) {
    display: block;
  }

  :deep(.provider-form .el-form-item__label) {
    width: 100% !important;
    justify-content: flex-start;
    text-align: left;
  }

  :deep(.provider-form .el-form-item__content) {
    margin-left: 0 !important;
  }

  .form-actions {
    padding-left: 0;
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
}
</style>
