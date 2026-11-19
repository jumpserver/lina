<template>
  <div class="resource-adjustment">
    <p>{{ $t('TicketAdjustResourcesHelp') }}</p>
    <DataForm
      ref="form"
      v-model:form="initial"
      :fields="formFields"
      :has-buttons="false"
      :disabled="disabled"
      :server-errors="errors"
      label-position="top"
      @submit="submit"
    />
    <div class="resource-buttons">
      <el-button type="primary" :loading="disabled" :disabled="disabled" @click="validate">
        {{ $t('TicketSaveAdjustment') }}
      </el-button>
      <el-button :disabled="disabled" @click="$emit('cancel')">{{ $t('Cancel') }}</el-button>
    </div>
  </div>
</template>

<script>
import DataForm from '@/components/Form/DataForm'
import Select2 from '@/components/Form/FormFields/Select2'
import BasicTree from '@/components/Form/FormFields/BasicTree.vue'
import AccountFormatter from '@/views/perms/AssetPermission/components/AccountFormatter'
import { RequiredChange } from '@/components/Form/DataForm/rules'
import { configurePluginField } from '../plugins/registry'

export default {
  components: { DataForm },
  props: {
    taskId: { type: String, required: true },
    orgId: { type: String, required: true },
    ticketType: { type: String, required: true },
    fields: { type: Array, required: true },
    values: { type: Object, required: true },
    snapshot: { type: Object, required: true },
    disabled: { type: Boolean, default: false }
  },
  emits: ['save', 'cancel'],
  data: () => ({ initial: {}, formFields: [], accountRequests: {}, disposed: false, errors: {} }),
  mounted() {
    this.configure()
  },
  beforeUnmount() {
    this.disposed = true
  },
  methods: {
    optionsUrl(resource) {
      return `/api/v1/tickets/approval-tasks/${this.taskId}/resource-options/?oid=${encodeURIComponent(this.orgId)}&resource=${resource}`
    },
    configure() {
      this.initial = JSON.parse(JSON.stringify(this.values))
      this.formFields = this.fields.map((field) => {
        const item = {
          id: field.name,
          label: field.label,
          helpText: field.help_text,
          type: 'input',
          rules: field.required ? [RequiredChange] : [],
          el: {}
        }
        const value = this.values[field.name]
        this.initial[field.name] =
          value ??
          field.default ??
          (field.allow_null ? null : ['list', 'multiple_choice'].includes(field.type) ? [] : '')
        if (['asset', 'node'].includes(field.resource)) {
          item.component = Select2
          const snapshots = this.snapshot[field.resource === 'asset' ? 'assets' : 'nodes'] || []
          item.el = {
            multiple: field.type === 'list',
            multipleLimit: field.max_length || 100,
            options: snapshots.map((resource) => ({
              value: resource.id,
              label: resource.address ? `${resource.name} (${resource.address})` : resource.name
            })),
            ajax: {
              url: this.optionsUrl(field.resource),
              transformOption: (resource) => ({
                value: resource.id,
                label: resource.address
                  ? `${resource.name} (${resource.address})`
                  : resource.full_value
              })
            }
          }
          item.on = {
            change: ([value], updateForm) => {
              for (const account of this.fields.filter((f) => f.depends_on === field.name)) {
                this.loadAccounts(account, value, updateForm)
              }
            }
          }
        } else if (field.resource === 'account_selector') {
          item.component = AccountFormatter
          item.el = { oid: this.orgId, showAddTemplate: false }
          item.hidden = () => {
            item.el.assets = this.initial.apply_assets || []
            item.el.nodes = this.initial.apply_nodes || []
            return false
          }
        } else if (field.resource === 'account') {
          item.component = Select2
          item.el = {
            multiple: true,
            multipleLimit: field.max_length || 100,
            options: (value || []).map((name) => ({ value: name, label: name }))
          }
          item.helpTextFormatter = () => this.accountRequests[field.name]?.hint || ''
          item.on = {
            'visible-change': ([visible], updateForm) => {
              if (visible) {
                this.loadAccounts(field, this.initial[field.depends_on], updateForm, false)
              }
            }
          }
        } else if (field.type === 'multiple_choice') {
          item.component = field.tree ? BasicTree : Select2
          item.el = field.tree ? { tree: field.tree } : { multiple: true, options: field.choices }
          this.initial[field.name] = (value || []).map((choice) => choice.value || choice)
        } else if (field.type === 'integer') {
          item.type = 'input-number'
          item.el = { min: field.min, max: field.max, precision: 0 }
        } else if (field.type === 'datetime') {
          item.type = 'date-picker'
          item.el = { type: 'datetime', valueFormat: 'YYYY-MM-DDTHH:mm:ssZ' }
        }
        configurePluginField({ type: this.ticketType }, field, item, this.$t)
        return item
      })
      this.initial.adjustment_reason = ''
      this.formFields.push({
        id: 'adjustment_reason',
        label: this.$t('TicketAdjustmentReason'),
        type: 'input',
        el: { type: 'textarea', rows: 2, maxlength: 4096 },
        rules: [RequiredChange]
      })
    },
    async loadAccounts(field, asset, updateForm, clear = true) {
      this.accountRequests[field.name] = { hint: this.$t('Loading') }
      const state = this.accountRequests[field.name]
      const item = this.formFields.find((f) => f.id === field.name)
      if (clear) updateForm({ [field.name]: [] })
      item.el.disabled = true
      try {
        const accounts = asset
          ? await this.$axios.get(this.optionsUrl('account'), {
              params: { assets: asset }
            })
          : []
        if (this.disposed || this.accountRequests[field.name] !== state) return
        item.el.options = accounts.map((name) => ({ value: name, label: name }))
        state.hint = accounts.length ? '' : this.$t('TicketNoAssetAccounts')
      } catch {
        if (this.disposed || this.accountRequests[field.name] !== state) return
        state.hint = this.$t('TicketAccountsLoadFailed')
      } finally {
        if (!this.disposed && this.accountRequests[field.name] === state) item.el.disabled = false
      }
    },
    validate() {
      this.errors = {}
      return this.$refs.form.submitForm('form')
    },
    setErrors(errors) {
      this.errors = errors || {}
    },
    submit(values) {
      this.$emit('save', {
        resources: Object.fromEntries(this.fields.map((field) => [field.name, values[field.name]])),
        reason: values.adjustment_reason
      })
    }
  }
}
</script>

<style scoped>
.resource-adjustment {
  margin: 16px 0;
}
.resource-adjustment > p {
  color: var(--el-text-color-regular);
  line-height: 1.7;
}
.resource-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}
.resource-buttons .el-button + .el-button {
  margin-left: 0;
}
</style>
