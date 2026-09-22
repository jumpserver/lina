<template>
  <div class="webhook-notification">
    <IBox v-if="loading" class="webhook-card">
      <el-skeleton :rows="9" animated />
    </IBox>

    <IBox v-else-if="loadError" class="webhook-card">
      <el-result icon="error" :sub-title="$t('WebhookLoadFailed')" :title="$t('LoadFailed')">
        <template #extra>
          <el-button type="primary" @click="loadConfig">
            {{ $t('Retry') }}
          </el-button>
        </template>
      </el-result>
    </IBox>

    <IBox v-else :title="$t('EventNotificationRule')" class="webhook-card">
      <p class="page-description">
        {{ $t('WebhookNotificationHelp') }}
      </p>

      <el-form
        ref="configForm"
        :model="form"
        :rules="rules"
        class="webhook-form"
        label-position="top"
      >
        <div class="form-grid">
          <el-form-item :label="$t('Name')" class="form-field--full" prop="name">
            <el-input v-model.trim="form.name" :disabled="!canChange" />
          </el-form-item>

          <el-form-item :label="$t('Applications')" class="form-field--full" prop="application_ids">
            <el-select v-model="form.application_ids" :disabled="!canChange" multiple filterable>
              <el-option
                v-for="application in applicationOptions"
                :key="application.id"
                :label="application.name"
                :value="application.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item :label="$t('EnableStatus')" prop="is_active">
            <el-switch v-model="form.is_active" :disabled="!canChange" />
          </el-form-item>

          <el-form-item :label="$t('WebhookMethod')" prop="method">
            <el-select v-model="form.method" :disabled="!canChange">
              <el-option v-for="method in methods" :key="method" :label="method" :value="method" />
            </el-select>
          </el-form-item>

          <el-form-item class="form-field--full" prop="url">
            <template #label>
              <span>{{ $t('WebhookURL') }}</span>
            </template>

            <div v-if="hasUrl && !urlEditing" class="configured-value">
              <code>{{ urlDisplay }}</code>
              <el-button
                v-if="canChange"
                :aria-label="$t('WebhookUpdateURL')"
                :title="$t('WebhookUpdateURL')"
                class="configured-value__edit primary-link-button"
                link
                @click="startUrlEdit"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
            </div>
            <template v-else-if="canChange">
              <el-input
                ref="urlInput"
                v-model.trim="form.url"
                :aria-label="$t('WebhookURL')"
                :placeholder="$t('WebhookURLPlaceholder')"
                autocomplete="off"
              />
              <el-button v-if="hasUrl" class="cancel-edit" link @click="cancelUrlEdit">
                {{ $t('Cancel') }}
              </el-button>
            </template>
            <div v-else class="configured-value">
              <span>—</span>
            </div>
            <div class="field-help">{{ $t('WebhookURLHelp') }}</div>
          </el-form-item>

          <el-form-item class="form-field--full">
            <template #label>
              <span>{{ $t('WebhookHeaders') }}</span>
            </template>

            <div v-if="!canChange || (hasHeaders && !headersEditing)" class="configured-value">
              <div v-if="headerNames.length" class="header-names">
                <el-tag v-for="name in headerNames" :key="name" effect="plain" size="small">
                  {{ name }}
                </el-tag>
              </div>
              <span v-else>—</span>
              <el-button
                v-if="canChange"
                :aria-label="$t('WebhookUpdateHeaders')"
                :title="$t('WebhookUpdateHeaders')"
                class="configured-value__edit primary-link-button"
                link
                @click="startHeadersEdit"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
            </div>
            <template v-else>
              <JsonEditor
                ref="headersEditor"
                :value="form.headers"
                class="headers-editor"
                @change="handleHeadersChange"
              />
              <el-button v-if="hasHeaders" class="cancel-edit" link @click="cancelHeadersEdit">
                {{ $t('Cancel') }}
              </el-button>
            </template>
            <div class="field-help">{{ $t('WebhookHeadersHelp') }}</div>
          </el-form-item>

          <el-form-item
            :label="$t('WebhookSubscribedEvents')"
            class="form-field--full"
            prop="events"
          >
            <el-select
              v-model="form.events"
              :disabled="!canChange"
              :placeholder="$t('WebhookEventsPlaceholder')"
              multiple
              @change="syncTestEvent"
            >
              <el-option
                v-for="option in eventOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <div class="field-help">{{ $t('WebhookSubscribedEventsHelp') }}</div>
          </el-form-item>

          <el-form-item class="form-field--full">
            <template #label>
              <span class="label-with-action">
                <span>{{ $t('WebhookBodyTemplate') }}</span>
                <el-button class="primary-link-button" link @click="showVariables = true">
                  {{ $t('WebhookTemplateVariables') }}
                </el-button>
              </span>
            </template>

            <JsonEditor
              v-if="canChange"
              ref="bodyEditor"
              :value="form.body_template"
              class="template-editor"
              line-wrapping
              @change="handleBodyChange"
            />
            <pre v-else class="readonly-json">{{ formattedBodyTemplate }}</pre>
            <div class="field-help">{{ $t('WebhookBodyTemplateHelp') }}</div>
          </el-form-item>

          <el-form-item :label="$t('WebhookTestEvent')" class="form-field--full test-event-field">
            <el-select
              v-model="testEvent"
              :placeholder="$t('WebhookEventsPlaceholder')"
              class="test-event-select"
            >
              <el-option
                v-for="option in selectedEventOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <div class="field-help">{{ $t('WebhookTestEventHelp') }}</div>
          </el-form-item>
        </div>

        <div class="form-actions">
          <el-button v-if="canChange" :loading="saving" type="primary" @click="save">
            {{ $t('Save') }}
          </el-button>
          <el-button v-if="rule?.id" :loading="previewing" @click="preview">
            {{ $t('WebhookPreview') }}
          </el-button>
          <el-button v-if="canChange && rule?.id" :loading="testing" @click="testWebhook">
            {{ $t('WebhookTestSend') }}
          </el-button>
          <el-button @click="$emit('cancel')">{{ $t('Cancel') }}</el-button>
        </div>
      </el-form>

      <section v-if="hasPreview" class="preview-section" aria-live="polite">
        <h3>{{ $t('WebhookPreviewResult') }}</h3>
        <pre tabindex="0">{{ previewText }}</pre>
      </section>
    </IBox>

    <VariablesHelpTextDialog
      v-model:visible="showVariables"
      :variables="templateVariables"
      variables-help-text="WebhookTemplateVariablesHelp"
      width="960px"
    />
  </div>
</template>

<script>
import { IBox, VariablesHelpTextDialog } from '@/components'
import { JsonEditor } from '@/components/Form/FormFields'

const METHODS = ['POST', 'PUT', 'PATCH']

function emptyForm() {
  return {
    name: '',
    application_ids: [],
    is_active: false,
    method: 'POST',
    url: '',
    headers: {},
    events: [],
    body_template: {}
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export default {
  name: 'ApplicationWebhookRuleForm',
  components: {
    IBox,
    JsonEditor,
    VariablesHelpTextDialog
  },
  props: {
    rule: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['cancel', 'saved'],
  data() {
    const vm = this
    return {
      methods: METHODS,
      applicationOptions: [],
      form: emptyForm(),
      loading: true,
      loadError: false,
      saving: false,
      previewing: false,
      testing: false,
      hasUrl: false,
      urlDisplay: '',
      urlEditing: false,
      headerNames: [],
      headersEditing: false,
      eventOptions: [],
      templateVariables: [],
      testEvent: '',
      showVariables: false,
      hasPreview: false,
      previewBody: null,
      rules: {
        name: [{ required: true, message: this.$t('Required'), trigger: 'blur' }],
        application_ids: [{ required: true, message: this.$t('Required'), trigger: 'change' }],
        method: [{ required: true, message: this.$t('Required'), trigger: 'change' }],
        url: [
          {
            trigger: 'blur',
            validator(rule, value, callback) {
              const configured = vm.hasUrl && !vm.urlEditing
              if (vm.form.is_active && !configured && !value) {
                callback(new Error(vm.$t('WebhookURLRequired')))
                return
              }
              callback()
            }
          }
        ],
        events: [
          {
            trigger: 'change',
            validator(rule, value, callback) {
              if (vm.form.is_active && !value.length) {
                callback(new Error(vm.$t('WebhookEventsRequired')))
                return
              }
              callback()
            }
          }
        ]
      }
    }
  },
  computed: {
    canChange() {
      return this.$hasPerm(
        this.rule?.id ? 'accounts.change_applicationwebhook' : 'accounts.add_applicationwebhook'
      )
    },
    hasHeaders() {
      return this.headerNames.length > 0
    },
    selectedEventOptions() {
      const selected = new Set(this.form.events)
      return this.eventOptions.filter((option) => selected.has(option.value))
    },
    formattedBodyTemplate() {
      return JSON.stringify(this.form.body_template, null, 2)
    },
    previewText() {
      return typeof this.previewBody === 'string'
        ? this.previewBody
        : JSON.stringify(this.previewBody, null, 2)
    },
    endpoint() {
      const base = '/api/v1/accounts/application-webhooks/'
      return this.rule?.id ? `${base}${this.rule.id}/` : base
    }
  },
  watch: {
    'rule.id'(value, oldValue) {
      if (value && value !== oldValue) {
        this.loadConfig()
      }
    }
  },
  created() {
    this.loadConfig()
  },
  methods: {
    async loadConfig() {
      this.loading = true
      this.loadError = false
      try {
        const [metadata, applications, data] = await Promise.all([
          this.$axios.get('/api/v1/accounts/application-webhooks/metadata/'),
          this.$axios.get(
            '/api/v1/accounts/integration-applications/?fields_size=mini&limit=1000&is_active=true'
          ),
          this.rule?.id
            ? this.$axios.get(this.endpoint, { disableFlashErrorMsg: true })
            : Promise.resolve({})
        ])
        this.applicationOptions = applications.results || applications
        this.applyConfig({ ...metadata, ...data })
      } catch (error) {
        this.loadError = true
      } finally {
        this.loading = false
      }
    },
    applyConfig(data) {
      this.eventOptions = data.event_options || []
      this.templateVariables = (data.template_variables || []).map((item) => ({
        name: this.formatVariableName(item.name),
        label: item.label,
        default: this.formatExample(item.default)
      }))

      this.hasUrl = typeof data.has_url === 'boolean' ? data.has_url : Boolean(data.url_display)
      this.urlDisplay = data.url_display || ''
      this.urlEditing = !this.hasUrl && this.canChange
      this.headerNames = data.header_names || []
      this.headersEditing = !this.headerNames.length && this.canChange

      this.form = {
        ...emptyForm(),
        name: data.name || '',
        application_ids: (data.applications || []).map((application) => application.id),
        is_active: Boolean(data.is_active),
        method: data.method || 'POST',
        events: Array.isArray(data.events) ? [...data.events] : [],
        body_template: data.body_template ?? data.default_template ?? {}
      }
      this.syncTestEvent()
      this.hasPreview = false
      this.previewBody = null
    },
    formatVariableName(value) {
      if (!value) {
        return ''
      }
      return String(value).includes('{{') ? String(value) : `{{ ${value} }}`
    },
    formatExample(value) {
      if (typeof value === 'string') {
        return value
      }
      if (typeof value === 'undefined') {
        return ''
      }
      return JSON.stringify(value)
    },
    startUrlEdit() {
      this.urlEditing = true
      this.form.url = ''
      this.$nextTick(() => this.$refs.urlInput?.focus())
    },
    cancelUrlEdit() {
      this.urlEditing = false
      this.form.url = ''
      this.$refs.configForm?.clearValidate('url')
    },
    startHeadersEdit() {
      this.headersEditing = true
      this.form.headers = {}
    },
    cancelHeadersEdit() {
      this.headersEditing = false
      this.form.headers = {}
    },
    handleHeadersChange(value) {
      this.form.headers = value
    },
    handleBodyChange(value) {
      this.form.body_template = value
      this.hasPreview = false
    },
    syncTestEvent() {
      const available = this.selectedEventOptions.map((option) => option.value)
      if (!available.includes(this.testEvent)) {
        this.testEvent = available[0] || ''
      }
      this.hasPreview = false
    },
    readJsonEditor(refName, fallback) {
      const editor = this.$refs[refName]
      return editor ? editor.parseEditorValue() : fallback
    },
    readBodyTemplate() {
      const value = this.readJsonEditor('bodyEditor', this.form.body_template)
      if (!isPlainObject(value)) {
        throw new Error(this.$t('WebhookInvalidJSONObject'))
      }
      return value
    },
    readHeaders() {
      const value = this.readJsonEditor('headersEditor', this.form.headers)
      if (!isPlainObject(value)) {
        throw new Error(this.$t('WebhookInvalidJSONObject'))
      }
      return value
    },
    async validateForSend() {
      await this.$refs.configForm.validate()
      const bodyTemplate = this.readBodyTemplate()
      const headers = this.headersEditing ? this.readHeaders() : undefined
      return { bodyTemplate, headers }
    },
    buildPayload(bodyTemplate, headers) {
      const payload = {
        name: this.form.name,
        applications: this.form.application_ids,
        is_active: this.form.is_active,
        method: this.form.method,
        events: this.form.events,
        body_template: bodyTemplate
      }
      if (!this.hasUrl || this.urlEditing) {
        payload.url = this.form.url
      }
      if (!this.hasHeaders || this.headersEditing) {
        payload.headers = headers || {}
      }
      return payload
    },
    async save() {
      this.saving = true
      try {
        const { bodyTemplate, headers } = await this.validateForSend()
        const method = this.rule?.id ? 'patch' : 'post'
        const saved = await this.$axios[method](
          this.endpoint,
          this.buildPayload(bodyTemplate, headers),
          {
            disableFlashErrorMsg: true
          }
        )
        this.$message.success(this.$t('WebhookSaved'))
        this.$emit('saved', saved)
      } catch (error) {
        if (!error?.fields) {
          this.showLocalError(error)
        }
      } finally {
        this.saving = false
      }
    },
    async preview() {
      if (!this.testEvent) {
        this.$message.error(this.$t('WebhookSelectTestEvent'))
        return
      }
      this.previewing = true
      try {
        const bodyTemplate = this.readBodyTemplate()
        const data = await this.$axios.post(
          `${this.endpoint}preview/`,
          { body_template: bodyTemplate, event: this.testEvent },
          { disableFlashErrorMsg: true }
        )
        this.previewBody = data.body
        this.hasPreview = true
      } catch (error) {
        this.showLocalError(error)
      } finally {
        this.previewing = false
      }
    },
    async testWebhook() {
      if (!this.testEvent) {
        this.$message.error(this.$t('WebhookSelectTestEvent'))
        return
      }
      this.testing = true
      try {
        const { bodyTemplate, headers } = await this.validateForSend()
        const data = await this.$axios.post(
          `${this.endpoint}test/`,
          { ...this.buildPayload(bodyTemplate, headers), event: this.testEvent },
          { disableFlashErrorMsg: true }
        )
        if (data.success) {
          this.$message.success(
            this.$t('WebhookTestSuccess', { status: data.status_code || '2xx' })
          )
        } else {
          this.$message.error(
            this.$t('WebhookTestFailed', {
              status: data.status_code || '—',
              reason: data.reason || '—'
            })
          )
        }
      } catch (error) {
        this.showLocalError(error)
      } finally {
        this.testing = false
      }
    },
    showLocalError(error) {
      if (!error) {
        return
      }
      if (error instanceof Error && !error.response) {
        this.$message.error(error.message)
        return
      }
      const data = error.response?.data
      const firstFieldError =
        data && typeof data === 'object' ? Object.values(data).flat()[0] : data
      const message = data?.detail || data?.reason || firstFieldError
      if (message) {
        this.$message.error(message)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.webhook-card {
  width: 100%;
}

.page-description {
  max-width: 72ch;
  margin: 0 0 20px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.65;
}

.webhook-form {
  width: 100%;
  max-width: 1080px;
}

.form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 320px);
  column-gap: 24px;
}

.form-field--full {
  grid-column: 1 / -1;
}

.webhook-form :deep(.el-form-item__label) {
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.webhook-form :deep(.el-select) {
  width: 100%;
}

.label-with-action {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.primary-link-button {
  --el-button-text-color: var(--color-primary);
  --el-button-hover-link-text-color: var(--el-color-primary-dark-2);
  --el-button-active-color: var(--el-color-primary-dark-2);
}

.configured-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  min-height: 32px;
  padding: 5px 10px;
  box-sizing: border-box;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

.configured-value code {
  min-width: 0;
  overflow-wrap: anywhere;
  font-family: Monaco, Menlo, Consolas, 'Courier New', monospace;
  font-size: 12px;
}

.configured-value__edit {
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  font-size: 14px;
}

.header-names {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.field-help {
  width: 100%;
  margin-top: 6px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.55;
}

.cancel-edit {
  margin-top: 6px;
}

.headers-editor :deep(.cm-editor) {
  height: 160px;
}

.readonly-json,
.preview-section pre {
  width: 100%;
  margin: 0;
  padding: 14px 16px;
  box-sizing: border-box;
  overflow: auto;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  font-family: Monaco, Menlo, Consolas, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.65;
  white-space: pre;
}

.readonly-json {
  min-height: 160px;
}

.test-event-select {
  max-width: 420px;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 2px;
}

.form-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

.preview-section {
  width: 100%;
  max-width: 1080px;
  margin-top: 28px;
  padding-top: 22px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.preview-section h3 {
  margin: 0 0 12px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
}

.preview-section pre {
  max-height: 360px;
}

.preview-section pre:focus-visible {
  outline: 2px solid var(--el-color-primary-light-5);
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .form-field--full {
    grid-column: 1;
  }

  .configured-value {
    align-items: flex-start;
    flex-direction: column;
  }

  .form-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .form-actions :deep(.el-button) {
    width: 100%;
  }
}
</style>
