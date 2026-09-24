<template>
  <div>
    <el-alert :title="providerHelp" type="info" :closable="false" />
    <el-alert v-if="draftProvider && !vendorCompatible" :title="$t('UKeyVendorIncompatible')" type="warning" :closable="false" />
    <BaseAuth :config="settings" enable-field="AUTH_UKEY" @reset="resetDraft" v-on="$listeners" />
  </div>
</template>

<script>
import BaseAuth from './Base'
import { UploadKey } from '@/components'
import TextReadonly from '@/components/Form/FormFields/TextReadonly.vue'
import { Required } from '@/components/Form/DataForm/rules'
import { encryptPassword } from '@/utils/session-encrypt'

const BASIC_FIELDS = ['AUTH_UKEY', 'AUTH_UKEY_VENDOR', 'AUTH_UKEY_CA_PROVIDER', 'AUTH_UKEY_CHALLENGE_TTL']
const ENROLLMENT_FIELDS = [
  'AUTH_UKEY_CA_CERT_CONTENT', 'AUTH_UKEY_CA_CERT_ALGORITHM',
  'AUTH_UKEY_CA_KEY_CONTENT', 'AUTH_UKEY_CA_KEY_PASS', 'AUTH_UKEY_ENROLL_VALIDITY_DAYS'
]
const READONLY_FIELDS = ['AUTH_UKEY_CA_CERT_ALGORITHM']
const SSL_FIELD = 'AUTH_UKEY_XJCA_USE_SSL'

export default {
  name: 'UKey',
  components: { BaseAuth },
  data() {
    const vm = this
    return {
      revision: '0',
      savedProvider: '',
      savedVendor: '',
      draftVendor: '',
      draftProvider: '',
      draftServiceURL: '',
      initialDraft: { provider: '', vendor: '', serviceURL: '' },
      providers: [],
      settings: {
        url: '/api/v1/settings/setting/?category=ukey',
        hasDetailInMsg: false,
        encryptedFields: [],
        fields: [[this.$t('Basic'), BASIC_FIELDS]],
        fieldsMeta: {
          AUTH_UKEY_VENDOR: {
            label: this.$t('UKeyVendor'),
            on: { input: ([value], updateForm) => vm.changeVendor(value, updateForm) }
          },
          AUTH_UKEY_CA_PROVIDER: {
            label: this.$t('UKeyCAProvider'),
            on: { input: ([value]) => { vm.draftProvider = value } },
            options: [],
            rules: [],
            component: {
              functional: true,
              render: (h, { data }) => h('el-radio-group', data, vm.availableProviders.map(provider => (
                h('el-radio', { key: provider.id, props: { label: provider.id } }, provider.label)
              )))
            }
          },
          AUTH_UKEY_DEFAULT_PIN: { label: 'PIN' },
          AUTH_UKEY_CA_CERT_CONTENT: { component: UploadKey, label: this.$t('UKeyCACert') },
          AUTH_UKEY_CA_CERT_ALGORITHM: { component: TextReadonly, el: { bolder: false } },
          AUTH_UKEY_CA_KEY_CONTENT: { component: UploadKey, label: this.$t('UKeyCAKey') },
          AUTH_UKEY_CA_KEY_PASS: { label: this.$t('UKeyCAKeyPassword') },
          AUTH_UKEY_XJCA_SVS_URL: {
            label: this.$t('UKeySVSURL'),
            rules: [Required],
            el: { placeholder: 'https://svs.example.com:443' },
            on: {
              input: ([value], updateForm) => vm.changeServiceURL(value, updateForm),
              change: ([value], updateForm) => vm.changeServiceURL(value, updateForm)
            }
          },
          [SSL_FIELD]: {
            label: this.$t('UKeyUseSSL'),
            component: 'el-switch',
            helpTip: this.$t('UKeyUseSSLHelp'),
            hidden: () => vm.draftProvider !== 'xjca',
            on: { change: ([value], updateForm) => vm.changeSSL(value, updateForm) }
          },
          AUTH_UKEY_XJCA_TLS_VERIFY: {
            options: [
              { value: 'custom', label: this.$t('UKeyTLSCustomCA') },
              { value: 'insecure', label: this.$t('UKeyTLSInsecure') }
            ],
            tips: false
          },
          AUTH_UKEY_XJCA_TLS_CA_CERT: { component: UploadKey, label: this.$t('CACertificate') }
        },
        submitMethod: () => 'patch',
        afterGetFormValue(obj) {
          obj.AUTH_UKEY_CA_PROVIDER = obj.AUTH_UKEY_CA_PROVIDER || 'builtin'
          vm.captureSettings(obj)
          vm.initialDraft = {
            provider: obj.AUTH_UKEY_CA_PROVIDER, vendor: obj.AUTH_UKEY_VENDOR,
            serviceURL: vm.draftServiceURL
          }
          obj[SSL_FIELD] = !/^http:\/\//i.test(vm.draftServiceURL)
          if (!['custom', 'insecure'].includes(obj.AUTH_UKEY_XJCA_TLS_VERIFY)) {
            obj.AUTH_UKEY_XJCA_TLS_VERIFY = 'custom'
          }
          return obj
        },
        cleanFormValue: this.cleanSettings,
        onSubmit(values, formName, addContinue) {
          if (this.isSubmitting) return
          if (!vm.isVendorCompatible(values.AUTH_UKEY_CA_PROVIDER, values.AUTH_UKEY_VENDOR)) {
            vm.$message.warning(vm.$t('UKeyVendorIncompatible'))
            return
          }
          this.defaultOnSubmit(values, formName, addContinue)
        },
        async performSubmit(values) {
          const res = await this.$axios.patch(this.iUrl, values, this.getFieldErrorConfig())
          vm.captureSettings(res)
          const refreshed = Object.fromEntries(vm.secretFields.map(key => [key, '']))
          for (const key of READONLY_FIELDS) refreshed[key] = res[key]
          this.$refs.form?.updateFormFields?.(refreshed)
          return res
        },
        moreButtons: [{
          title: this.$t('UKeyTestConnection'),
          loading: false,
          hidden: () => !vm.activeProvider.supports_connection_test,
          callback: this.testConnection
        }]
      }
    }
  },
  computed: {
    providerHelp() {
      return this.$t(this.draftProvider === 'xjca' ? 'UKeyXJCAHelp' : 'UKeyProviderHelp')
    },
    availableProviders() {
      return this.providers.filter(provider => this.isVendorCompatible(provider.id, this.draftVendor))
    },
    vendorCompatible() {
      return this.isVendorCompatible(this.draftProvider, this.draftVendor)
    },
    activeProvider() {
      return this.getProvider(this.draftProvider)
    },
    secretFields() {
      return [...new Set(this.providers.flatMap(provider => provider.secret_fields || []))]
    }
  },
  watch: {
    draftProvider(value) {
      this.settings.moreButtons[0].title = this.$t(value === 'xjca' ? 'UKeyTestFishermanConnection' : 'UKeyTestConnection')
    }
  },
  methods: {
    changeServiceURL(value, updateForm) {
      this.draftServiceURL = value
      if (/^https?:\/\//i.test(value)) {
        updateForm({ [SSL_FIELD]: /^https:\/\//i.test(value) })
      }
    },
    changeSSL(value, updateForm) {
      // The URL is the only persisted protocol setting.
      this.draftServiceURL = (value ? 'https://' : 'http://') + this.draftServiceURL.replace(/^https?:\/\//i, '')
      updateForm({ AUTH_UKEY_XJCA_SVS_URL: this.draftServiceURL })
    },
    changeVendor(value, updateForm) {
      this.draftVendor = value
      if (!this.vendorCompatible) {
        this.draftProvider = this.isVendorCompatible('builtin', value) ? 'builtin' : ''
        updateForm({ AUTH_UKEY_CA_PROVIDER: this.draftProvider })
      }
    },
    isVendorCompatible(providerId, vendor) {
      const provider = this.getProvider(providerId)
      return !!provider.id && (!provider.supported_vendors || provider.supported_vendors.includes(vendor))
    },
    getProvider(id) {
      return this.providers.find(provider => provider.id === id) || {}
    },
    configureProviders(providers) {
      this.providers = providers
      this.settings.encryptedFields = this.secretFields
      this.settings.fields = [
        [this.$t('Basic'), BASIC_FIELDS],
        ...providers.map(provider => [
          provider.label,
          provider.id === 'xjca'
            ? provider.fields.flatMap(field => field === 'AUTH_UKEY_XJCA_SVS_URL' ? [field, SSL_FIELD] : [field])
            : provider.fields
        ])
      ]
      const fieldsMeta = { ...this.settings.fieldsMeta }
      for (const key of new Set(providers.flatMap(provider => provider.fields))) {
        fieldsMeta[key] = {
          ...fieldsMeta[key],
          hidden: form => {
            // Group headers receive the initial form; use the current selection for both.
            const provider = this.activeProvider
            if (!(provider.fields || []).includes(key)) return true
            if (key === 'AUTH_UKEY_XJCA_TLS_VERIFY') return !form[SSL_FIELD]
            if (key === 'AUTH_UKEY_XJCA_TLS_CA_CERT') {
              return !form[SSL_FIELD] || form.AUTH_UKEY_XJCA_TLS_VERIFY !== 'custom'
            }
            if (key === 'AUTH_UKEY_ENROLL_ENABLED') return !provider.supports_enrollment
            if (key === 'AUTH_UKEY_DEFAULT_PIN') return !provider.expose_default_pin
            return ENROLLMENT_FIELDS.includes(key) && (!provider.supports_enrollment || !form.AUTH_UKEY_ENROLL_ENABLED)
          }
        }
      }
      this.settings.fieldsMeta = fieldsMeta
    },
    cleanSettings(data) {
      const provider = this.getProvider(data.AUTH_UKEY_CA_PROVIDER)
      const allowed = new Set([...BASIC_FIELDS, ...(provider.fields || [])])
      const values = Object.fromEntries(Object.entries(data).filter(([key]) => allowed.has(key)))
      if (provider.id !== 'builtin' || this.savedProvider !== 'builtin' || data.AUTH_UKEY_VENDOR !== this.savedVendor) {
        values.AUTH_UKEY_CONFIG_REVISION = this.revision
      }
      for (const key of READONLY_FIELDS) delete values[key]
      for (const key of this.secretFields) {
        if (!values[key]) delete values[key]
      }
      return values
    },
    async testConnection(value, form, button) {
      if (button.loading) return
      if (!this.isVendorCompatible(value.AUTH_UKEY_CA_PROVIDER, value.AUTH_UKEY_VENDOR)) {
        this.$message.warning(this.$t('UKeyVendorIncompatible'))
        return
      }
      const provider = this.getProvider(value.AUTH_UKEY_CA_PROVIDER)
      const draft = Object.fromEntries((provider.connection_fields || []).map(key => [key, value[key]]))
      draft.AUTH_UKEY_CA_PROVIDER = provider.id
      draft.AUTH_UKEY_VENDOR = value.AUTH_UKEY_VENDOR
      button.loading = true
      try {
        for (const key of provider.secret_fields || []) {
          if (!(key in draft)) continue
          if (draft[key]) draft[key] = encryptPassword(draft[key])
          else delete draft[key]
        }
        await this.$axios.post('/api/v1/settings/ukey/testing/', draft)
        this.$message.success(this.$t('UKeyConnectionPassed'))
      } finally {
        button.loading = false
      }
    },
    resetDraft() {
      this.draftProvider = this.initialDraft.provider
      this.draftVendor = this.initialDraft.vendor
      this.draftServiceURL = this.initialDraft.serviceURL
    },
    captureSettings(value) {
      this.configureProviders(value.AUTH_UKEY_CA_PROVIDERS || [])
      this.revision = value.AUTH_UKEY_CONFIG_REVISION
      this.savedProvider = value.AUTH_UKEY_CA_PROVIDER
      this.draftProvider = value.AUTH_UKEY_CA_PROVIDER
      this.savedVendor = value.AUTH_UKEY_VENDOR
      this.draftVendor = value.AUTH_UKEY_VENDOR
      this.draftServiceURL = value.AUTH_UKEY_XJCA_SVS_URL || ''
    }
  }
}
</script>
