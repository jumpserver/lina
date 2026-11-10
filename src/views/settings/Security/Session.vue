<template>
  <IBox>
    <GenericCreateUpdateForm
      :key="formRevision"
      submit-method="patch"
      v-bind="config"
      @afterGenerateColumns="onColumnsGenerated"
      @input="onFormInput"
      @submitSuccess="submitSuccess"
    />
    <WatermarkHelpDialog :variables="sessionVariables" :visible.sync="showSessionHelpDialog" />
    <WatermarkHelpDialog :variables="consoleVariables" :visible.sync="showConsoleHelpDialog" />
  </IBox>
</template>

<script>
import IBox from '@/components/Common/IBox/index.vue'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index.vue'
import WatermarkHelpDialog from '@/components/Apps/VariablesHelpTextDialog'
import { UploadKey } from '@/components'

export default {
  name: 'SessionSecurity',
  components: { GenericCreateUpdateForm, IBox, WatermarkHelpDialog },
  data() {
    const lifetimeField = (min = 300, max = 86400) => ({
      helpTextAsTip: true,
      helpTextAsPlaceholder: false,
      rules: [{
        validator: (rule, value, callback) => {
          if (!this.isSangfor || (rule.field === 'CONNECTION_TOKEN_REUSABLE_EXPIRATION' && !this.connectionTokenReusable)) {
            return callback()
          }
          const text = typeof value === 'string' ? value.trim() : String(value)
          const seconds = Number(text)
          if (!/^\d+$/.test(text) || !Number.isInteger(seconds) || seconds < min || seconds > max) {
            const message = max === 86400 ? 'LoginLifetimeRangeError' : 'CredentialLifetimeRangeError'
            return callback(new Error(this.$t(message, { min, max })))
          }
          callback()
        },
        trigger: 'blur'
      }]
    })
    return {
      formRevision: 0,
      rdpSignCertificateValid: null,
      reusableExpirationField: null,
      connectionTokenReusable: false,
      showSessionHelpDialog: false,
      showConsoleHelpDialog: false,
      sessionVariables: [
        { name: 'userId', label: this.$t('userId'), default: '00000000-0000-0000-0000-000000000001' },
        { name: 'name', label: this.$t('name'), default: '张三' },
        { name: 'userName', label: this.$t('userName'), default: 'zhangsan' },
        { name: 'currentTime', label: this.$t('currentTime'), default: '2025-06-01 12:00:00' },
        { name: 'assetId', label: this.$t('assetId'), default: '00000000-0000-0000-0000-000000000001' },
        { name: 'assetName', label: this.$t('assetName'), default: '服务器01' },
        { name: 'assetAddress', label: this.$t('assetAddress'), default: '192.168.1.1' }
      ],
      consoleVariables: [
        { name: 'userId', label: this.$t('userId'), default: '00000000-0000-0000-0000-000000000001' },
        { name: 'name', label: this.$t('name'), default: '张三' },
        { name: 'userName', label: this.$t('userName'), default: 'zhangsan' },
        { name: 'currentTime', label: this.$t('currentTime'), default: '2025-06-01 12:00:00' }
      ],
      config: {
        url: '/api/v1/settings/setting/?category=security_session',
        hasDetailInMsg: false,
        afterGetFormValue: (values) => {
          this.rdpSignCertificateValid = values.RDP_SIGN_CERT_VALID
          this.onFormInput(values)
          return values
        },
        fields: [
          [
            this.$t('Basic'),
            [
              'SECURITY_SESSION_SHARE',
              'SESSION_EXPIRE_AT_BROWSER_CLOSE',
              'SESSION_COOKIE_AGE',
              'VIEW_ASSET_ONLINE_SESSION_INFO',
              'SECURITY_MAX_IDLE_TIME',
              'SECURITY_MAX_SESSION_TIME'
            ]
          ],
          [
            this.$t('ConnectionCredentials'),
            [
              'CONNECTION_TOKEN_REUSABLE',
              'CONNECTION_TOKEN_ONETIME_EXPIRATION',
              'CONNECTION_TOKEN_REUSABLE_EXPIRATION'
            ]
          ],
          [
            this.$t('ClientLogin'),
            [
              'OAUTH2_PROVIDER_ACCESS_TOKEN_EXPIRE_SECONDS',
              'OAUTH2_PROVIDER_REFRESH_TOKEN_EXPIRE_SECONDS',
              'RDP_SIGN_ENABLED',
              'RDP_SIGN_CERT_CONTENT',
              'RDP_SIGN_KEY_CONTENT'
            ]
          ],
          [
            this.$t('Watermark'),
            this.$store.getters.hasValidLicense ? [
              'SECURITY_WATERMARK_ENABLED',
              'SECURITY_WATERMARK_SESSION_CONTENT',
              'SECURITY_WATERMARK_CONSOLE_CONTENT',
              'SECURITY_WATERMARK_COLOR',
              'SECURITY_WATERMARK_FONT_SIZE',
              'SECURITY_WATERMARK_HEIGHT',
              'SECURITY_WATERMARK_WIDTH',
              'SECURITY_WATERMARK_ROTATE'
            ] : ['SECURITY_WATERMARK_ENABLED']
          ]
        ],
        fieldsMeta: {
          SESSION_COOKIE_AGE: lifetimeField(),
          CONNECTION_TOKEN_REUSABLE: {
            helpTextAsTip: true,
            helpTextAsPlaceholder: false
          },
          CONNECTION_TOKEN_ONETIME_EXPIRATION: lifetimeField(300, 2147483647),
          CONNECTION_TOKEN_REUSABLE_EXPIRATION: lifetimeField(1, 2147483647),
          OAUTH2_PROVIDER_ACCESS_TOKEN_EXPIRE_SECONDS: lifetimeField(),
          OAUTH2_PROVIDER_REFRESH_TOKEN_EXPIRE_SECONDS: lifetimeField(),
          RDP_SIGN_ENABLED: {
            label: this.$t('RDPSignEnabled'),
            helpText: this.$t('RDPSignEnabledHelp'),
            helpTextAsTip: false,
            helpTextAsPlaceholder: false
          },
          RDP_SIGN_CERT_CONTENT: {
            component: UploadKey,
            hidden: form => !form.RDP_SIGN_ENABLED,
            label: this.$t('RDPSignCertificate'),
            helpText: this.$t('RDPSignCertificateHelp'),
            helpTextAsTip: false,
            helpTextAsPlaceholder: false,
            helpTextFormatter: () => {
              if (this.rdpSignCertificateValid !== false) {
                return null
              }
              return (
                <span role='status' style='color: var(--color-warning)'>
                  <i class='el-icon-warning-outline' aria-hidden='true' /> {this.$t('RDPSignCertificateInvalid')}
                </span>
              )
            }
          },
          RDP_SIGN_KEY_CONTENT: {
            component: UploadKey,
            hidden: form => !form.RDP_SIGN_ENABLED,
            label: this.$t('RDPSignPrivateKey'),
            helpText: this.$t('RDPSignPrivateKeyHelp'),
            helpTextAsTip: false,
            helpTextAsPlaceholder: false
          },
          SECURITY_WATERMARK_SESSION_CONTENT: {
            helpTextFormatter: () => {
              const handleClick = () => {
                this.showSessionHelpDialog = true
              }
              return (
                <i onClick={handleClick} class='fa fa-question-circle' style='cursor: pointer'>{this.$t('Help')}</i>
              )
            }
          },
          SECURITY_WATERMARK_CONSOLE_CONTENT: {
            helpTextFormatter: () => {
              const handleClick = () => {
                this.showConsoleHelpDialog = true
              }
              return (
                <i onClick={handleClick} class='fa fa-question-circle' style='cursor: pointer'>{this.$t('Help')}</i>
              )
            }
          },
          SECURITY_WATERMARK_COLOR: {
            component: 'el-color-picker',
            el: {
              size: 'small',
              'show-alpha': true,
              predefine: [
                'rgba(128, 128, 128, 0.25)',
                'rgba(0, 0, 0, 0.15)',
                'rgba(255, 255, 255, 0.2)',
                'rgba(176, 176, 176, 0.3)',
                'rgba(91, 155, 213, 0.25)',
                'rgba(192, 80, 77, 0.2)',
                'rgba(112, 173, 71, 0.2)',
                'rgba(255, 192, 0, 0.18)'
              ]
            }
          }
        },
        cleanFormValue: (values) => {
          const result = { ...values }
          delete result.RDP_SIGN_CERT_INFO
          delete result.RDP_SIGN_CERT_VALID
          for (const name of ['RDP_SIGN_CERT_CONTENT', 'RDP_SIGN_KEY_CONTENT']) {
            if (!result.RDP_SIGN_ENABLED || !result[name]) {
              delete result[name]
            }
          }
          if (this.isSangfor && !values.CONNECTION_TOKEN_REUSABLE) {
            delete result.CONNECTION_TOKEN_REUSABLE_EXPIRATION
          }
          return result
        }
      }
    }
  },
  computed: {
    isSangfor() {
      return String(this.$store.getters.publicSettings?.VENDOR || '').trim().toLowerCase() === 'sangfor'
    }
  },
  methods: {
    submitSuccess(res) {
      this.$store.commit('settings/SET_SECURITY_WATERMARK_ENABLED', res.SECURITY_WATERMARK_ENABLED)
      this.$store.commit('settings/SET_PUBLIC_SETTINGS', {
        ...this.$store.getters.publicSettings,
        CONNECTION_TOKEN_REUSABLE: res.CONNECTION_TOKEN_REUSABLE
      })
      this.formRevision += 1
    },
    onColumnsGenerated(fields) {
      this.reusableExpirationField = fields.find(field => field.id === 'CONNECTION_TOKEN_REUSABLE_EXPIRATION')
      this.$set(this.reusableExpirationField.el, 'disabled', !this.connectionTokenReusable)
    },
    onFormInput(values) {
      this.connectionTokenReusable = !!values.CONNECTION_TOKEN_REUSABLE
      if (this.reusableExpirationField) {
        this.reusableExpirationField.el.disabled = !this.connectionTokenReusable
      }
    }
  }
}
</script>
