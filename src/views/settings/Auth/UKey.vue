<template>
  <div>
    <el-alert :title="providerHelp" type="info" :closable="false" />
    <el-alert v-if="draftProvider && !vendorCompatible" :title="$t('UKeyVendorIncompatible')" type="warning" :closable="false" />
    <BaseAuth :config="formSettings" enable-field="AUTH_UKEY" @reset="resetDraft" v-on="$listeners" />
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
const VCTKS_SSL_FIELD = 'AUTH_UKEY_VCTK_S_USE_SSL'
const VCTKS_AUTH_FIELDS = ['AUTH_UKEY_VCTK_S_USERNAME', 'AUTH_UKEY_VCTK_S_PASSWORD']
const VCTKS_CONNECTION_FIELDS = [
  'AUTH_UKEY_VCTK_S_SVS_URL', 'AUTH_UKEY_VCTK_S_TLS_VERIFY', 'AUTH_UKEY_VCTK_S_TLS_CA_CERT',
  ...VCTKS_AUTH_FIELDS
]
const VCTKS_FIELDS = [...VCTKS_CONNECTION_FIELDS, 'AUTH_UKEY_VCTK_S_ISSUING_CA']

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
      draftVCTKSServiceURL: '',
      issuingCAConfigured: null,
      initialDraft: { provider: '', vendor: '', serviceURL: '', vctksServiceURL: '' },
      providers: [],
      connectionButton: {
        title: this.$t('UKeyTestConnection'),
        loading: false,
        callback: this.testConnection
      },
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
          AUTH_UKEY_VCTK_S_USERNAME: {
            label: this.$t('UKeyVCTKSAuthorizationUsername'),
            helpText: this.$t('UKeyVCTKSAuthorizationHelp'),
            el: { autocomplete: 'off' }
          },
          AUTH_UKEY_VCTK_S_PASSWORD: {
            label: this.$t('UKeyVCTKSAuthorizationPassword'),
            helpText: this.$t('UKeyVCTKSAuthorizationPasswordHelp'),
            el: { type: 'password', showPassword: true, autocomplete: 'new-password' }
          },
          AUTH_UKEY_VCTK_S_SVS_URL: {
            label: this.$t('UKeyVCTKSServerURL'),
            rules: [Required],
            el: { placeholder: 'https://vctks.example.com:45680' },
            helpText: this.$t('UKeyVCTKSServerHelp'),
            on: {
              input: ([value], updateForm) => vm.changeVCTKSServiceURL(value, updateForm),
              change: ([value], updateForm) => vm.changeVCTKSServiceURL(value, updateForm)
            }
          },
          [VCTKS_SSL_FIELD]: {
            label: this.$t('UKeyUseSSL'),
            component: 'el-switch',
            helpTip: this.$t('UKeyUseSSLHelp'),
            hidden: () => vm.draftProvider !== 'vctk_s',
            on: { change: ([value], updateForm) => vm.changeVCTKSSSL(value, updateForm) }
          },
          AUTH_UKEY_VCTK_S_ISSUING_CA: {
            component: UploadKey,
            label: this.$t('UKeyVCTKSIssuingCA'),
            helpText: this.$t('UKeyVCTKSIssuingCAHelp'),
            helpTextFormatter: () => vm.$createElement('span', {
              class: 'ukey-issuing-ca-status'
            }, vm.issuingCAConfigured === null ? '' : vm.$t(
              vm.issuingCAConfigured ? 'UKeyVCTKSIssuingCAConfigured' : 'UKeyVCTKSIssuingCANotConfigured'
            ))
          },
          AUTH_UKEY_VCTK_S_TLS_VERIFY: {
            options: [
              { value: 'custom', label: this.$t('UKeyTLSCustomCA') },
              { value: 'insecure', label: this.$t('UKeyTLSInsecure') }
            ],
            tips: false
          },
          AUTH_UKEY_VCTK_S_TLS_CA_CERT: { component: UploadKey, label: this.$t('CACertificate') },
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
            serviceURL: vm.draftServiceURL, vctksServiceURL: vm.draftVCTKSServiceURL
          }
          obj[SSL_FIELD] = !/^http:\/\//i.test(vm.draftServiceURL)
          obj[VCTKS_SSL_FIELD] = !/^http:\/\//i.test(vm.draftVCTKSServiceURL)
          if (!['custom', 'insecure'].includes(obj.AUTH_UKEY_VCTK_S_TLS_VERIFY)) {
            obj.AUTH_UKEY_VCTK_S_TLS_VERIFY = 'custom'
          }
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
          if (res.AUTH_UKEY_CA_PROVIDER === 'vctk_s') {
            refreshed.AUTH_UKEY_VCTK_S_SVS_URL = vm.draftVCTKSServiceURL
            refreshed[VCTKS_SSL_FIELD] = !/^http:\/\//i.test(vm.draftVCTKSServiceURL)
          }
          this.$refs.form?.updateFormFields?.(refreshed)
          return res
        }
      }
    }
  },
  computed: {
    formSettings() {
      return {
        ...this.settings,
        moreButtons: this.activeProvider.supports_connection_test ? [this.connectionButton] : []
      }
    },
    providerHelp() {
      const keys = { xjca: 'UKeyXJCAHelp', vctk_s: 'UKeyVCTKSHelp' }
      return this.$t(keys[this.draftProvider] || 'UKeyProviderHelp')
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
      this.connectionButton.title = this.$t(value === 'xjca' ? 'UKeyTestFishermanConnection' : 'UKeyTestConnection')
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
    changeVCTKSServiceURL(value, updateForm) {
      this.draftVCTKSServiceURL = value
      if (/^https?:\/\//i.test(value)) {
        updateForm({ [VCTKS_SSL_FIELD]: /^https:\/\//i.test(value) })
      }
    },
    changeVCTKSSSL(value, updateForm) {
      this.draftVCTKSServiceURL = (value ? 'https://' : 'http://') + this.draftVCTKSServiceURL.replace(/^https?:\/\//i, '')
      updateForm({ AUTH_UKEY_VCTK_S_SVS_URL: this.draftVCTKSServiceURL })
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
    getProviderFields(provider) {
      return provider.id === 'vctk_s' ? VCTKS_FIELDS : provider.fields || []
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
            : this.getProviderFields(provider).filter(field => !VCTKS_AUTH_FIELDS.includes(field)).flatMap(field => (
              field === 'AUTH_UKEY_VCTK_S_SVS_URL' ? [field, VCTKS_SSL_FIELD] : [field]
            ))
        ]),
        [this.$t('UKeyVCTKSAuthorizationAdvanced'), VCTKS_AUTH_FIELDS]
      ]
      const fieldsMeta = { ...this.settings.fieldsMeta }
      for (const key of new Set(providers.flatMap(provider => this.getProviderFields(provider)))) {
        fieldsMeta[key] = {
          ...fieldsMeta[key],
          hidden: form => {
            // Group headers receive the initial form; use the current selection for both.
            const provider = this.activeProvider
            if (!this.getProviderFields(provider).includes(key)) return true
            if (key === 'AUTH_UKEY_XJCA_TLS_VERIFY') return !form[SSL_FIELD]
            if (key === 'AUTH_UKEY_XJCA_TLS_CA_CERT') {
              return !form[SSL_FIELD] || form.AUTH_UKEY_XJCA_TLS_VERIFY !== 'custom'
            }
            if (key === 'AUTH_UKEY_VCTK_S_TLS_VERIFY') return !form[VCTKS_SSL_FIELD]
            if (key === 'AUTH_UKEY_VCTK_S_TLS_CA_CERT') {
              return !form[VCTKS_SSL_FIELD] || form.AUTH_UKEY_VCTK_S_TLS_VERIFY !== 'custom'
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
      const allowed = new Set([...BASIC_FIELDS, ...this.getProviderFields(provider)])
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
      const connectionFields = provider.id === 'vctk_s' ? VCTKS_CONNECTION_FIELDS : provider.connection_fields || []
      const draft = Object.fromEntries(connectionFields.map(key => [key, value[key]]))
      draft.AUTH_UKEY_CA_PROVIDER = provider.id
      draft.AUTH_UKEY_VENDOR = value.AUTH_UKEY_VENDOR
      button.loading = true
      try {
        for (const key of provider.secret_fields || []) {
          if (!(key in draft)) continue
          if (draft[key]) draft[key] = encryptPassword(draft[key])
          else delete draft[key]
        }
        const result = await this.$axios.post('/api/v1/settings/ukey/testing/', draft)
        this.$message.success(result.msg || this.$t(
          provider.id === 'vctk_s' ? 'UKeyVCTKSConnectionPassed' : 'UKeyConnectionPassed'
        ))
      } finally {
        button.loading = false
      }
    },
    resetDraft() {
      this.draftProvider = this.initialDraft.provider
      this.draftVendor = this.initialDraft.vendor
      this.draftServiceURL = this.initialDraft.serviceURL
      this.draftVCTKSServiceURL = this.initialDraft.vctksServiceURL
    },
    captureSettings(value) {
      this.configureProviders(value.AUTH_UKEY_CA_PROVIDERS || [])
      this.revision = value.AUTH_UKEY_CONFIG_REVISION
      this.savedProvider = value.AUTH_UKEY_CA_PROVIDER
      this.draftProvider = value.AUTH_UKEY_CA_PROVIDER
      this.savedVendor = value.AUTH_UKEY_VENDOR
      this.draftVendor = value.AUTH_UKEY_VENDOR
      this.draftServiceURL = value.AUTH_UKEY_XJCA_SVS_URL || ''
      this.draftVCTKSServiceURL = value.AUTH_UKEY_VCTK_S_SVS_URL || ''
      const configured = value.AUTH_UKEY_VCTK_S_ISSUING_CA_CONFIGURED
      this.issuingCAConfigured = typeof configured === 'boolean' ? configured : null
    }
  }
}
</script>
