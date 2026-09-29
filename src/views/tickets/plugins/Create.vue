<template>
  <div v-loading="loading">
    <IBox>
      <div class="ticket-type-summary">
        {{ $t('Type') }}: <strong>{{ typeLabel(selectedPlugin) }}</strong>
        <span v-if="selectedPlugin?.execution_mode === 'approval_only'" class="ticket-type-hint">
          {{ $t('TicketApprovalOnlyHint') }}
        </span>
      </div>
    </IBox>
    <AssetRequest v-if="selectedType === 'apply_asset'" ref="form" />
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
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { GenericCreateUpdatePage } from '@/layout/components'
import IBox from '@/components/Common/IBox'
import Select2 from '@/components/Form/FormFields/Select2'
import { Required, RequiredChange } from '@/components/Form/DataForm/rules'
import AssetRequest from '../RequestAssetPerm/CreateUpdate'
import { getTicketTypeLabel } from '../const'
import { buildRequestPayload } from './form'

export default {
  components: { IBox, GenericCreateUpdatePage, AssetRequest },
  data() {
    return {
      loading: true,
      formReady: false,
      plugins: [],
      selectedType: 'apply_asset',
      flowRequest: 0,
      accountRequest: 0,
      selectedOrgId: '',
      selectedAssetId: '',
      accountsFailed: false,
      accountHint: '',
      fields: [],
      fieldsMeta: {},
      initial: {}
    }
  },
  computed: {
    ...mapGetters(['currentOrg']),
    ...mapState({ organizations: (state) => state.users.noRootWorkbenchOrgs }),
    accountField() {
      return this.selectedPlugin?.fields.find((field) => field.resource === 'account')
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
      if (!this.selectedPlugin || this.selectedType === 'apply_asset') return
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
              this.loadAccountOptions('', updateForm)
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
            ? [{ ...(field.resource || field.type === 'choice' ? RequiredChange : Required) }]
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
            change: ([assetId], updateForm) => this.loadAccountOptions(assetId, updateForm)
          }
        } else if (field.resource === 'account') {
          meta.component = Select2
          meta.helpText = ''
          this.accountHint = this.$t('TicketSelectAssetFirst')
          meta.helpTextFormatter = () => this.accountHint
          meta.el = {
            multiple: true,
            multipleLimit: 100,
            options: [],
            disabled: true,
            noDataText: this.$t('TicketNoAssetAccounts')
          }
          meta.on = {
            'visible-change': ([visible], updateForm) => {
              if (visible && this.accountsFailed) {
                this.loadAccountOptions(this.selectedAssetId, updateForm)
              }
            }
          }
        } else if (field.type === 'choice') {
          meta.component = Select2
          meta.el = { multiple: false, options: field.choices }
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
        if (this.selectedType === 'view_secret' && field.name === 'duration') {
          meta.label = this.$t('TicketSecretDuration')
          meta.helpText = this.$t('TicketSecretDurationHelp')
        }
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
      if (field.resource === 'account') return []
      return field.default ?? (field.type === 'integer' ? field.min : '')
    },
    async loadAccountOptions(assetId, updateForm) {
      const requestId = ++this.accountRequest
      this.selectedAssetId = assetId
      this.accountsFailed = false
      if (!this.accountField) return
      const name = `param_${this.accountField.name}`
      const meta = this.fieldsMeta[name]
      updateForm({ [name]: [] })
      meta.el.options = []
      meta.el.disabled = true
      this.accountHint = this.$t('TicketSelectAssetFirst')
      if (!assetId || !this.selectedOrgId) return
      this.accountHint = this.$t('Loading')
      try {
        const accounts = await this.$axios.get(
          `/api/v1/tickets/ticket-types/${this.selectedType}/options/`,
          { params: { org_id: this.selectedOrgId, asset: assetId } }
        )
        if (requestId !== this.accountRequest) return
        meta.el.options = accounts.map((username) => ({ value: username, label: username }))
        this.accountHint = accounts.length ? '' : this.$t('TicketNoAssetAccounts')
      } catch {
        if (requestId !== this.accountRequest) return
        this.accountsFailed = true
        this.accountHint = this.$t('TicketAccountsLoadFailed')
      } finally {
        if (requestId === this.accountRequest) meta.el.disabled = false
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
        }
      }
      if (!orgId) return null
      const flows = await this.$axios.get('/api/v1/tickets/workflows/options/', {
        params: { type, org_id: orgId }
      })
      if (requestId !== this.flowRequest) return undefined
      workflowField.el.options = flows.map((flow) => ({ value: flow.id, label: flow.name }))
      workflowField.el.disabled = flows.length <= 1
      return flows[0] || null
    },
    cleanFormValue(value) {
      return buildRequestPayload(this.selectedPlugin, value)
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
