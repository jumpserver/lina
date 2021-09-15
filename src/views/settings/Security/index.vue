<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="fields"
      :url="url"
      :fields-meta="fieldsMeta"
      :submit-method="submitMethod"
      :has-detail-in-msg="false"
    />
  </IBox>
</template>
<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import PasswordRule from './PasswordRule'
import AuthLimit from './AuthLimit'
import { IBox } from '@/components'
import { Link } from '@/components/FormFields'

export default {
  name: 'Security',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  data() {
    return {
      fields: [
        [
          this.$t('common.Basic'),
          [
            'SECURITY_COMMAND_EXECUTION',
            'SECURITY_SERVICE_ACCOUNT_REGISTRATION',
            'SECURITY_MAX_IDLE_TIME',
            // 'SECURITY_WATERMARK_ENABLED',
            'SECURITY_SESSION_SHARE'
          ]
        ],
        [
          this.$t('common.Auth'),
          [
            'SECURITY_MFA_AUTH',
            'SECURITY_PASSWORD_EXPIRATION_TIME',
            'OLD_PASSWORD_HISTORY_LIMIT_COUNT',
            'SECURITY_MFA_VERIFY_TTL',
            'SECURITY_LOGIN_CAPTCHA_ENABLED',
            'LOGIN_CONFIRM_ENABLE',
            'AuthLimit',
            'PasswordRule'
          ]
        ],
        [
          this.$t('setting.InsecureCommandAlert'),
          [
            'SECURITY_INSECURE_COMMAND_EMAIL_RECEIVER'
          ]
        ]
      ],
      fieldsMeta: {
        SECURITY_INSECURE_COMMAND_EMAIL_RECEIVER: {
          component: Link,
          helpText: this.$t('setting.InsecureCommandNotifyToSubscription'),
          label: this.$t('common.Receivers'),
          el: {
            href: '/ui/#/settings?activeTab=SysMessageSub',
            title: this.$t('setting.insecureCommandEmailUpdate')
          }
        },
        PasswordRule: {
          label: this.$t('setting.PasswordCheckRule'),
          component: PasswordRule
        },
        AuthLimit: {
          label: this.$t('setting.AuthLimit'),
          component: AuthLimit
        }
      },
      url: '/api/v1/settings/setting/?category=security'
    }
  },
  mounted() {
    if (this.$store.getters.hasValidLicense) {
      const securityWatermarkEnabled = 'SECURITY_WATERMARK_ENABLED'
      this.fields[0][1].splice(3, 0, securityWatermarkEnabled)
    }
  },
  methods: {
    submitMethod() {
      return 'patch'
    }
  }
}
</script>

<style scoped>

</style>
