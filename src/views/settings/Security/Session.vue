<template>
  <IBox>
    <GenericCreateUpdateForm
      submit-method="patch"
      v-bind="config"
      @afterGenerateColumns="onColumnsGenerated"
      @input="onFormInput"
    />
    <WatermarkHelpDialog :variables="sessionVariables" :visible.sync="showSessionHelpDialog" />
    <WatermarkHelpDialog :variables="consoleVariables" :visible.sync="showConsoleHelpDialog" />
  </IBox>
</template>

<script>
import IBox from '@/components/Common/IBox/index.vue'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index.vue'
import WatermarkHelpDialog from '@/components/Apps/VariablesHelpTextDialog'

export default {
  name: 'SessionSecurity',
  components: { GenericCreateUpdateForm, IBox, WatermarkHelpDialog },
  data() {
    const lifetimeField = () => ({
      helpTextAsTip: true,
      helpTextAsPlaceholder: false
    })
    return {
      reusableExpirationField: null,
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
              'OAUTH2_PROVIDER_REFRESH_TOKEN_EXPIRE_SECONDS'
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
          CONNECTION_TOKEN_ONETIME_EXPIRATION: lifetimeField(),
          CONNECTION_TOKEN_REUSABLE_EXPIRATION: lifetimeField(),
          OAUTH2_PROVIDER_ACCESS_TOKEN_EXPIRE_SECONDS: lifetimeField(),
          OAUTH2_PROVIDER_REFRESH_TOKEN_EXPIRE_SECONDS: lifetimeField(),
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
        onSubmit: async (validValues) => {
          const url = '/api/v1/settings/setting/?category=security_session'

          try {
            const res = await this.$axios.patch(url, validValues)

            if (res) {
              this.$message.success(this.$t('UpdateSuccessMsg'))
              this.$store.commit('settings/SET_SECURITY_WATERMARK_ENABLED', res['SECURITY_WATERMARK_ENABLED'])
              this.$store.commit('settings/SET_PUBLIC_SETTINGS', {
                ...this.$store.getters.publicSettings,
                CONNECTION_TOKEN_REUSABLE: res.CONNECTION_TOKEN_REUSABLE
              })
            }
          } catch (error) {
            throw new Error(error)
          }
        }
      }
    }
  },
  methods: {
    onColumnsGenerated(fields) {
      this.reusableExpirationField = fields.find(field => field.id === 'CONNECTION_TOKEN_REUSABLE_EXPIRATION')
      this.$set(this.reusableExpirationField.el, 'disabled', true)
    },
    onFormInput(values) {
      if (this.reusableExpirationField) {
        this.reusableExpirationField.el.disabled = !values.CONNECTION_TOKEN_REUSABLE
      }
    }
  }
}
</script>
