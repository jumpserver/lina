<template>
  <div v-loading="loading">
    <IBox>
      <div class="ticket-type-summary">
        {{ $t('Type') }}: <strong>{{ typeLabel(selectedPlugin) }}</strong>
        <span v-if="selectedPlugin?.execution_mode === 'approval_only'" class="ticket-type-hint">
          {{ $t('TicketApprovalOnlyHint') }}
        </span>
        <span v-else-if="plugin.summary" class="ticket-type-hint">
          {{ $t(plugin.summary) }}
        </span>
      </div>
    </IBox>
    <component :is="plugin.form" v-if="plugin.form" ref="form" />
    <el-alert
      v-else-if="selectedPlugin?.custom_form"
      :title="$t('TicketUnsupportedForm')"
      type="error"
      :closable="false"
    />
    <GenericCreateUpdatePage
      v-else-if="formReady"
      :key="selectedType"
      ref="form"
      :initial="initial"
      :fields="fields"
      :fields-meta="fieldsMeta"
      :clean-form-value="cleanFormValue"
      :perform-submit="performSubmit"
      :create-success-next-route="{ name: 'MyTicketList' }"
      :has-detail-in-msg="false"
      :has-save-continue="false"
      url="/api/v1/tickets/tickets/open/"
    />
    <el-alert v-if="availabilityFailed" type="error" :closable="false">
      {{ $t('TicketResourceLoadFailed') }}
      <el-button link type="primary" @click="retryResourceAvailability">{{
        $t('Retry')
      }}</el-button>
    </el-alert>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { GenericCreateUpdatePage } from '@/layout/components'
import IBox from '@/components/Common/IBox'
import Select2 from '@/components/Form/FormFields/Select2'
import BasicTree from '@/components/Form/FormFields/BasicTree.vue'
import { Required, RequiredChange } from '@/components/Form/DataForm/rules'
import { getTicketPlugin, configurePluginField } from './registry'
import { getTicketTypeLabel } from '../const'
import { buildRequestPayload } from './form'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import resourceAvailability from './resourceAvailability'

export default {
  mixins: [resourceAvailability],
  components: { IBox, GenericCreateUpdatePage },
  data() {
    return {
      loading: true,
      formReady: false,
      plugins: [],
      selectedType: 'apply_asset',
      flowRequest: 0,
      selectedOrgId: '',
      accountStates: {},
      fields: [],
      fieldsMeta: {},
      initial: {}
    }
  },
  computed: {
    ...mapGetters(['currentOrg']),
    ...mapState({ organizations: (state) => state.users.noRootWorkbenchOrgs }),
    plugin() {
      return getTicketPlugin(this.selectedType)
    },
    accountFields() {
      return this.selectedPlugin?.fields.filter((field) => field.resource === 'account') || []
    },
    selectedPlugin() {
      return this.plugins.find((plugin) => plugin.type === this.selectedType)
    }
  },
  async mounted() {
    try {
      const plugins = await this.$axios.get('/api/v1/tickets/ticket-types/')
      this.plugins = plugins.filter((plugin) => plugin.self_service)
      const requested = this.$route.query.type
      this.selectedType = this.plugins.some((plugin) => plugin.type === requested)
        ? requested
        : (this.plugins.find((plugin) => plugin.type === 'apply_asset') || this.plugins[0])?.type
      await this.configure()
    } finally {
      this.loading = false
    }
  },
  methods: {
    typeLabel(plugin) {
      if (!plugin) return ''
      return getTicketTypeLabel({ value: plugin.type, label: plugin.label }, this.$t)
    },
    async configure() {
      this.formReady = false
      ++this.flowRequest
      this.accountStates = {}
      if (!this.selectedPlugin || this.selectedPlugin.custom_form || this.plugin.form) return
      const orgId =
        this.organizations.find((org) => org.id === this.currentOrg.id)?.id ||
        this.organizations[0]?.id ||
        ''
      this.selectedOrgId = orgId
      this.initial = { title: '', org_id: orgId, workflow_id: '', comment: '' }
      this.fieldsMeta = {
        title: { label: this.$t('Title'), required: true, type: 'input' },
        org_id: {
          label: this.$t('Organization'),
          component: Select2,
          required: true,
          el: {
            multiple: false,
            options: this.organizations.map((org) => ({ value: org.id, label: org.name }))
          },
          on: {
            change: async ([value], updateForm) => {
              this.selectedOrgId = value
              for (const field of this.accountFields) this.loadAccountOptions(field, '', updateForm)
              const cleared = { workflow_id: '' }
              for (const field of this.selectedPlugin.fields) {
                cleared[`param_${field.name}`] = this.defaultValue(field)
              }
              updateForm(cleared)
              const flow = await this.loadFlows(value)
              if (flow !== undefined) updateForm({ workflow_id: flow?.id || '' })
            }
          }
        },
        workflow_id: {
          label: this.$t('TicketFlow'),
          component: Select2,
          required: true,
          el: { multiple: false, options: [], disabled: true }
        },
        comment: { label: this.$t('Comment'), type: 'input', el: { type: 'textarea', rows: 3 } }
      }
      for (const field of this.selectedPlugin.fields) {
        const name = `param_${field.name}`
        this.initial[name] = this.defaultValue(field)
        const meta = {
          label: field.label,
          required: field.required,
          type: 'input',
          helpText: field.help_text,
          el: {},
          rules: field.required
            ? [
                {
                  ...(field.resource ||
                  ['choice', 'multiple_choice', 'boolean'].includes(field.type)
                    ? RequiredChange
                    : Required)
                }
              ]
            : []
        }
        if (field.resource === 'asset') {
          meta.component = Select2
          meta.el = {
            multiple: false,
            ajax: {
              url: '',
              transformOption: (asset) => ({
                value: asset.id,
                label: `${asset.name} (${asset.address})`
              })
            }
          }
          meta.on = {
            change: ([assetId], updateForm) =>
              Promise.all(
                this.accountFields
                  .filter((account) => account.depends_on === field.name)
                  .map((account) => this.loadAccountOptions(account, assetId, updateForm))
              )
          }
        } else if (field.resource === 'session') {
          meta.component = Select2
          meta.label = this.$t('Session')
          meta.helpText = this.$t('TicketSelectSessionHelp')
          meta.el = {
            multiple: false,
            placeholder: this.$t('TicketSelectSession'),
            ajax: {
              url: '',
              transformOption: (session) => ({
                value: session.id,
                label: [
                  session.asset,
                  session.account,
                  session.user,
                  toSafeLocalDateStr(session.date_start)
                ]
                  .filter(Boolean)
                  .join(' · ')
              })
            }
          }
        } else if (field.resource === 'account') {
          meta.component = Select2
          meta.helpText = ''
          this.accountStates[field.name] = { hint: this.$t('TicketSelectAssetFirst') }
          meta.helpTextFormatter = () => this.accountStates[field.name]?.hint || ''
          meta.el = {
            multiple: field.type === 'list',
            multipleLimit: field.max_length || 100,
            options: [],
            disabled: true,
            noDataText: this.$t('TicketNoAssetAccounts')
          }
          meta.on = {
            'visible-change': ([visible], updateForm) => {
              const state = this.accountStates[field.name]
              if (visible && state?.failed) {
                this.loadAccountOptions(field, state.assetId, updateForm)
              }
            }
          }
        } else if (['choice', 'multiple_choice'].includes(field.type)) {
          meta.component = field.tree ? BasicTree : Select2
          meta.el = field.tree
            ? { tree: field.tree }
            : { multiple: field.type === 'multiple_choice', options: field.choices }
        } else if (field.type === 'boolean') {
          meta.type = 'switch'
        } else if (field.type === 'integer') {
          meta.type = 'input-number'
          meta.el = { min: field.min, max: field.max, precision: 0 }
        } else if (field.type === 'datetime') {
          meta.type = 'date-picker'
          meta.el = { type: 'datetime', valueFormat: 'YYYY-MM-DDTHH:mm:ssZ' }
        } else if (field.type === 'list') {
          meta.el = { type: 'textarea', rows: 3 }
          meta.helpText = this.$t('TicketOneItemPerLine')
        }
        if (this.selectedPlugin.resource_adjustment) {
          if (field.name === 'resource_description') {
            meta.hidden = () => !this.resourceAvailability?.description_allowed
            meta.label = this.$t('TicketResourceDescription')
            meta.helpText = this.$t('TicketResourceDescriptionHelp')
            meta.el = { type: 'textarea', rows: 3, maxlength: 4096 }
            meta.rules = [Required]
          } else if (['asset', 'account'].includes(field.resource)) {
            meta.rules = [
              {
                trigger: 'change',
                validator: (rule, value, done) => {
                  const empty = !value || (Array.isArray(value) && !value.length)
                  done(
                    empty && !this.resourceAvailability?.description_allowed
                      ? new Error(this.$t('TicketRequiredResource'))
                      : undefined
                  )
                }
              }
            ]
          }
        }
        configurePluginField(this.selectedPlugin, field, meta, this.$t)
        this.fieldsMeta[name] = meta
      }
      this.fields = [
        [this.$t('Basic'), ['title', 'org_id', 'workflow_id']],
        [this.$t('ApplyInfo'), this.selectedPlugin.fields.map((field) => `param_${field.name}`)],
        [this.$t('Other'), ['comment']]
      ]
      const flow = await this.loadFlows(orgId)
      if (flow === undefined) return
      this.initial.workflow_id = flow?.id || ''
      this.formReady = true
    },
    defaultValue(field) {
      if (field.default !== undefined) return field.default
      if (
        field.type === 'multiple_choice' ||
        (field.resource === 'account' && field.type === 'list')
      ) {
        return []
      }
      if (field.type === 'boolean') return false
      return field.type === 'integer' ? field.min : ''
    },
    async loadAccountOptions(field, assetId, updateForm) {
      this.accountStates[field.name] = {
        assetId,
        failed: false,
        hint: this.$t('TicketSelectAssetFirst')
      }
      const state = this.accountStates[field.name]
      const name = `param_${field.name}`
      const meta = this.fieldsMeta[name]
      updateForm({ [name]: this.defaultValue(field) })
      meta.el.options = []
      meta.el.disabled = true
      if (!assetId || !this.selectedOrgId) {
        if (this.selectedPlugin.resource_adjustment) {
          await this.loadResourceAvailability(this.selectedType, this.selectedOrgId)
        }
        return
      }
      if (this.selectedPlugin.resource_adjustment) {
        ++this.availabilityRequest
        this.resourceAvailability = null
        this.availabilityLoading = true
      }
      state.hint = this.$t('Loading')
      try {
        const accounts = await this.$axios.get(
          `/api/v1/tickets/ticket-types/${this.selectedType}/options/`,
          { params: { org_id: this.selectedOrgId, field: field.name, [field.depends_on]: assetId } }
        )
        if (this.accountStates[field.name] !== state) return
        meta.el.options = accounts.map((username) => ({ value: username, label: username }))
        state.hint = accounts.length ? '' : this.$t('TicketNoAssetAccounts')
        if (this.selectedPlugin.resource_adjustment) {
          await this.loadResourceAvailability(this.selectedType, this.selectedOrgId, {
            asset: assetId
          })
        }
      } catch {
        if (this.accountStates[field.name] !== state) return
        state.failed = true
        state.hint = this.$t('TicketAccountsLoadFailed')
        if (this.selectedPlugin.resource_adjustment) {
          this.availabilityFailed = true
          this.availabilityLoading = false
        }
      } finally {
        if (this.accountStates[field.name] === state) meta.el.disabled = false
      }
    },
    async loadFlows(orgId) {
      const requestId = ++this.flowRequest
      const type = this.selectedType
      const workflowField = this.fieldsMeta.workflow_id
      workflowField.el.options = []
      workflowField.el.disabled = true
      for (const field of this.selectedPlugin.fields) {
        if (field.resource === 'asset') {
          this.fieldsMeta[`param_${field.name}`].el.ajax.url =
            `/api/v1/tickets/apply-assets/suggestions/?oid=${orgId}`
        } else if (field.resource === 'session') {
          const meta = this.fieldsMeta[`param_${field.name}`]
          meta.el.disabled = !orgId
          meta.el.ajax.url = orgId
            ? `/api/v1/tickets/ticket-types/${type}/options/?org_id=${encodeURIComponent(orgId)}&field=${encodeURIComponent(field.name)}`
            : ''
        }
      }
      if (!orgId) return null
      if (this.selectedPlugin.resource_adjustment) {
        await this.loadResourceAvailability(type, orgId)
      }
      const flows = await this.$axios.get('/api/v1/tickets/workflows/options/', {
        params: { type, org_id: orgId }
      })
      if (requestId !== this.flowRequest) return undefined
      workflowField.el.options = flows.map((flow) => ({ value: flow.id, label: flow.name }))
      workflowField.el.disabled = flows.length <= 1
      return flows[0] || null
    },
    cleanFormValue(value) {
      if (this.selectedPlugin.resource_adjustment) this.validateAvailability()
      const payload = buildRequestPayload(this.selectedPlugin, value)
      if (!this.resourceAvailability?.description_allowed) {
        delete payload.request_data.resource_description
      }
      return payload
    },
    performSubmit(value) {
      return this.$axios.post('/api/v1/tickets/tickets/open/', value).catch((error) => {
        const data = error.response?.data
        if (
          data?.request_data &&
          typeof data.request_data === 'object' &&
          !Array.isArray(data.request_data)
        ) {
          for (const [field, errors] of Object.entries(data.request_data)) {
            data[`param_${field}`] = errors
          }
          delete data.request_data
        }
        throw error
      })
    },
    hasUnsavedChanges() {
      return this.$refs.form?.hasUnsavedChanges?.() || false
    }
  }
}
</script>

<style scoped>
.ticket-type-hint {
  display: block;
  margin-top: 4px;
  color: var(--color-text-secondary);
}
</style>
