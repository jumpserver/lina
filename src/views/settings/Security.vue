<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="selectFields"
      :url="url"
      :initial="object"
      :update-success-next-route="successUrl"
      :clean-form-value="cleanFormValue"
      :object="object"
      :fields-meta="fieldsMeta"
      :get-method="getMethod"
    />
  </IBox>
</template>
<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { IBox } from '@/components'
export default {
  name: 'Security',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  props: {
    object: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      selectFields: [
        [this.$t('setting.SecuritySetting'), ['SECURITY_MFA_AUTH', 'SECURITY_COMMAND_EXECUTION', 'SECURITY_SERVICE_ACCOUNT_REGISTRATION',
          'SECURITY_LOGIN_LIMIT_COUNT', 'SECURITY_LOGIN_LIMIT_TIME', 'SECURITY_MAX_IDLE_TIME',
          'SECURITY_PASSWORD_EXPIRATION_TIME']],
        [this.$t('setting.PasswordCheckRule'), ['SECURITY_PASSWORD_MIN_LENGTH', 'SECURITY_PASSWORD_UPPER_CASE',
          'SECURITY_PASSWORD_LOWER_CASE', 'SECURITY_PASSWORD_NUMBER', 'SECURITY_PASSWORD_SPECIAL_CHAR']]
      ],
      successUrl: { name: 'Settings', params: { activeMenu: 'Security' }},
      fieldsMeta: {
        SECURITY_MFA_AUTH: {
          label: this.$t('setting.securityMfaAuth'),
          type: 'checkbox',
          helpTips: this.$t('setting.helpTip.securityMfaAuth')
        },
        SECURITY_COMMAND_EXECUTION: {
          label: this.$t('setting.securityCommandExecution'),
          type: 'checkbox',
          helpTips: this.$t('setting.helpTip.securityCommandExecution')
        },
        SECURITY_SERVICE_ACCOUNT_REGISTRATION: {
          label: this.$t('setting.securityServiceAccountRegistration'),
          type: 'checkbox',
          helpTips: this.$t('setting.helpTip.securityServiceAccountRegistration')
        },
        SECURITY_LOGIN_LIMIT_COUNT: {
          label: this.$t('setting.securityLoginLimitCount'),
          rules: [
            { required: true }
          ]
        },
        SECURITY_LOGIN_LIMIT_TIME: {
          label: this.$t('setting.securityLoginLimitTime'),
          rules: [
            { required: true }
          ],
          helpText: this.$t('setting.helpText.securityLoginLimitTime')
        },
        SECURITY_MAX_IDLE_TIME: {
          label: this.$t('setting.securityMaxIdleTime'),
          helpText: this.$t('setting.helpText.securityMaxIdleTime')
        },
        SECURITY_PASSWORD_EXPIRATION_TIME: {
          label: this.$t('setting.securityPasswordExpirationTime'),
          rules: [
            { required: true }
          ],
          helpText: this.$t('setting.helpText.securityPasswordExpirationTime')
        },
        SECURITY_PASSWORD_MIN_LENGTH: {
          label: this.$t('setting.securityPasswordMinLength'),
          rules: [
            { required: true }
          ]
        },
        SECURITY_PASSWORD_UPPER_CASE: {
          label: this.$t('setting.securityPasswordUpperCase'),
          type: 'checkbox',
          helpTips: this.$t('setting.helpTip.securityPasswordUpperCase')
        },
        SECURITY_PASSWORD_LOWER_CASE: {
          label: this.$t('setting.securityPasswordLowerCase'),
          type: 'checkbox',
          helpTips: this.$t('setting.helpTip.securityPasswordLowerCase')
        },
        SECURITY_PASSWORD_NUMBER: {
          label: this.$t('setting.securityPasswordNumber'),
          type: 'checkbox',
          helpTips: this.$t('setting.helpTip.securityPasswordNumber')
        },
        SECURITY_PASSWORD_SPECIAL_CHAR: {
          label: this.$t('setting.securityPasswordSpecialChar'),
          type: 'checkbox',
          helpTips: this.$t('setting.helpTip.securityPasswordSpecialChar')
        }
      },
      url: '/api/v1/settings/setting/'
    }
  },
  methods: {
    cleanFormValue(data) {
      return {
        security: data
      }
    },
    getMethod() {
      return 'put'
    }
  }
}
</script>

<style scoped>

</style>
