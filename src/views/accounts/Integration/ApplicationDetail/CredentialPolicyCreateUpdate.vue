<template>
  <GenericCreateUpdatePage v-bind="config" />
</template>

<script>
import { AutomationParams } from '@/components'
import { RequiredChange } from '@/components/Form/DataForm/rules'
import { PasswordRule, Select2 } from '@/components/Form/FormFields'
import InputWithUnit from '@/components/Form/FormFields/InputWithUnit.vue'
import { GenericCreateUpdatePage } from '@/layout/components'

const BASE_URL = '/api/v1/accounts/credential-policies/'
const DEFAULT_USERNAME_TEMPLATE = 'jms_{application}_{policy}_{random}'

export default {
  name: 'CredentialPolicyCreateUpdate',
  components: { GenericCreateUpdatePage },
  props: {
    application: {
      type: Object,
      required: true
    },
    drawerContext: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const assetIds = []
    const isUpdate = this.drawerContext?.action === 'update'
    const relatedOption = (item) => ({
      label: item.username ? `${item.name} (${item.username})` : item.name,
      value: item.id
    })
    const fieldsMeta = {
      name: {
        on: {
          input: ([value]) => {
            this.policyName = value
            this.config.fieldsMeta.username_template.helpText = this.usernameTemplateHelp(
              this.usernameTemplate
            )
          }
        }
      },
      mode: {
        el: { disabled: isUpdate },
        helpText: this.$t('CredentialModeChangeHelp'),
        tips: {
          static: this.$t('RotatingAccountHelp'),
          dynamic: this.$t('TemporaryAccountHelp')
        },
        on: {
          change: ([value], updateForm) => this.handleModeChange(value, updateForm)
        }
      },
      asset: {
        component: Select2,
        el: {
          url: this.assetUrl('static'),
          multiple: false,
          clearable: false,
          disabled: isUpdate,
          ajax: {
            transformOption: (item) => ({
              label: `${item.name} (${item.address})`,
              value: item.id
            })
          }
        },
        on: {
          change: ([value], updateForm) => this.handleAssetChange(value, updateForm)
        }
      },
      account: {
        component: Select2,
        hidden: ({ mode }) => mode !== 'static',
        rules: [RequiredChange],
        el: {
          url: this.accountUrl(''),
          multiple: false,
          clearable: false,
          disabled: true,
          ajax: { transformOption: relatedOption }
        }
      },
      account_template: {
        component: Select2,
        hidden: ({ mode }) => mode !== 'dynamic',
        rules: [RequiredChange],
        el: {
          url: '/api/v1/accounts/account-templates/',
          multiple: false,
          clearable: false,
          disabled: true,
          ajax: { transformOption: relatedOption }
        }
      },
      management_account: {
        component: Select2,
        helpText: this.$t('ManagementAccountHelp'),
        el: {
          url: this.accountUrl(''),
          multiple: false,
          clearable: true,
          disabled: true,
          ajax: { transformOption: relatedOption }
        }
      },
      rotation_period: {
        component: InputWithUnit,
        hidden: ({ mode }) => mode !== 'static',
        el: { unit: 'second' }
      },
      password_rules: {
        component: PasswordRule,
        hidden: ({ mode }) => mode !== 'static'
      },
      username_template: {
        hidden: ({ mode }) => mode !== 'dynamic',
        helpText: this.usernameTemplateHelp(DEFAULT_USERNAME_TEMPLATE),
        on: {
          input: ([value]) => {
            this.usernameTemplate = value
            this.config.fieldsMeta.username_template.helpText = this.usernameTemplateHelp(value)
          }
        }
      },
      default_ttl: {
        component: InputWithUnit,
        hidden: ({ mode }) => mode !== 'dynamic',
        el: { unit: 'second' }
      },
      max_ttl: {
        component: InputWithUnit,
        hidden: ({ mode }) => mode !== 'dynamic',
        el: { unit: 'second' }
      },
      max_active_leases: {
        hidden: ({ mode }) => mode !== 'dynamic',
        type: 'input-number',
        el: { min: 1 }
      },
      show_advanced: {
        label: this.$t('ConfigurePlatformParams'),
        type: 'switch'
      },
      platform_params: {
        component: AutomationParams,
        hidden: ({ show_advanced }) => !show_advanced,
        helpText: this.$t('CredentialPlatformParamsHelp'),
        el: {
          assets: assetIds,
          method: 'change_secret_method',
          title: this.$t('PlatformParams')
        }
      }
    }

    return {
      assetIds,
      isUpdate,
      policyName: '',
      usernameTemplate: DEFAULT_USERNAME_TEMPLATE,
      config: {
        url: BASE_URL,
        initial: {
          application: this.application.id,
          mode: 'static',
          rotation_period: 86400,
          password_rules: { length: 36 },
          username_template: DEFAULT_USERNAME_TEMPLATE,
          default_ttl: 3600,
          max_ttl: 86400,
          max_active_leases: 10,
          show_advanced: false,
          platform_params: {}
        },
        fields: [
          [this.$t('Basic'), ['name', 'mode']],
          [
            this.$t('CredentialBinding'),
            ['asset', 'account', 'account_template', 'management_account']
          ],
          [this.$t('RotationSettings'), ['rotation_period', 'password_rules']],
          [
            this.$t('TemporaryCredentialSettings'),
            ['username_template', 'default_ttl', 'max_ttl', 'max_active_leases']
          ],
          [this.$t('AdvancedSettings'), ['show_advanced', 'platform_params']],
          [this.$t('Other'), ['comment']]
        ],
        fieldsMeta,
        hasSaveContinue: false,
        hasDetailInMsg: false,
        afterGetFormValue: (value) => this.normalizeForm(value),
        cleanFormValue: (value) => this.cleanPayload(value)
      }
    }
  },
  methods: {
    valueOf(value) {
      return value && typeof value === 'object' ? (value.value ?? value.id) : value
    },
    usernamePart(value) {
      return String(value || '')
        .replace(/[^A-Za-z0-9_.-]+/g, '_')
        .replace(/^_+|_+$/g, '')
    },
    usernameTemplateHelp(template) {
      const placeholders = {
        application: '{application}',
        policy: '{policy}',
        random: '{random}',
        timestamp: '{timestamp}'
      }
      const values = {
        '{application}': this.usernamePart(this.application.name) || 'application',
        '{policy}': this.usernamePart(this.policyName) || 'policy',
        '{random}': 'abcdef1234567890',
        '{timestamp}': '20260827123456'
      }
      let preview = String(template || DEFAULT_USERNAME_TEMPLATE)
      Object.entries(values).forEach(([placeholder, value]) => {
        preview = preview.split(placeholder).join(value)
      })
      preview = this.usernamePart(preview)
      return `${this.$t('UsernameTemplateHelp', placeholders)} ${this.$t(
        'UsernameTemplatePreview',
        { username: preview }
      )}`
    },
    assetUrl(mode) {
      const capability = mode === 'dynamic' ? 'push_account_enabled' : 'change_secret_enabled'
      return `/api/v1/assets/assets/?${capability}=true&fields_size=mini`
    },
    accountUrl(assetId) {
      const query = assetId ? `asset=${encodeURIComponent(assetId)}&` : ''
      return `/api/v1/accounts/accounts/?${query}is_active=true`
    },
    updateAssetState(assetId) {
      this.assetIds.splice(0, this.assetIds.length, ...(assetId ? [assetId] : []))
      const url = this.accountUrl(assetId)
      this.config.fieldsMeta.account.el.url = url
      this.config.fieldsMeta.management_account.el.url = url
      this.config.fieldsMeta.account.el.disabled = this.isUpdate || !assetId
      this.config.fieldsMeta.account_template.el.disabled = this.isUpdate || !assetId
      this.config.fieldsMeta.management_account.el.disabled = !assetId
    },
    handleModeChange(value, updateForm) {
      const mode = this.valueOf(value)
      this.updateAssetState('')
      this.config.fieldsMeta.asset.el.url = this.assetUrl(mode)
      this.config.fieldsMeta.platform_params.el.method =
        mode === 'dynamic' ? 'push_account_method' : 'change_secret_method'
      updateForm?.({
        asset: '',
        account: null,
        account_template: null,
        management_account: null,
        show_advanced: false,
        platform_params: {}
      })
    },
    handleAssetChange(value, updateForm) {
      const assetId = this.valueOf(value)
      this.updateAssetState(assetId)
      updateForm?.({ account: null, management_account: null, platform_params: {} })
    },
    normalizeForm(value) {
      const form = { ...value }
      const relatedFields = [
        'application',
        'asset',
        'account',
        'account_template',
        'management_account'
      ]
      relatedFields.forEach((name) => {
        form[name] = this.valueOf(form[name]) || null
      })
      form.mode = this.valueOf(form.mode)
      this.policyName = form.name || ''
      this.usernameTemplate = form.username_template || DEFAULT_USERNAME_TEMPLATE
      form.show_advanced = Boolean(Object.keys(form.platform_params || {}).length)
      this.config.fieldsMeta.asset.el.url = this.assetUrl(form.mode)
      this.config.fieldsMeta.platform_params.el.method =
        form.mode === 'dynamic' ? 'push_account_method' : 'change_secret_method'
      this.config.fieldsMeta.username_template.helpText = this.usernameTemplateHelp(
        form.username_template
      )
      this.updateAssetState(form.asset)
      return form
    },
    cleanPayload(value) {
      const payload = { ...value }
      const relatedFields = ['asset', 'account', 'account_template', 'management_account']
      relatedFields.forEach((name) => {
        payload[name] = this.valueOf(payload[name]) || null
      })
      payload.application = this.application.id
      payload.mode = this.valueOf(payload.mode)
      delete payload.show_advanced

      const readOnlyFields = [
        'status',
        'current_version',
        'date_last_rotated',
        'next_rotation_at',
        'last_execution',
        'last_task_id',
        'operation_task_id',
        'last_error',
        'created_by',
        'date_created',
        'date_updated'
      ]
      readOnlyFields.forEach((name) => delete payload[name])

      if (payload.mode === 'static') {
        payload.account_template = null
        payload.default_ttl = null
        payload.max_ttl = null
        payload.max_active_leases = null
      } else {
        payload.account = null
        payload.rotation_period = null
        payload.password_rules = {}
        if (!Object.keys(payload.platform_params || {}).length) {
          delete payload.platform_params
        }
      }
      return payload
    }
  }
}
</script>
