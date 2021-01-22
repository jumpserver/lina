<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="selectFields"
      :url="url"
      :fields-meta="fieldsMeta"
      :get-method="getMethod"
      :has-detail-in-msg="false"
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
  data() {
    return {
      selectFields: [
        [
          this.$t('common.Basic'),
          [
            'SECURITY_COMMAND_EXECUTION', 'SECURITY_SERVICE_ACCOUNT_REGISTRATION',
            'SECURITY_MAX_IDLE_TIME'
          ]
        ],
        [
          this.$t('common.Auth'),
          [
            'SECURITY_MFA_AUTH', 'SECURITY_LOGIN_LIMIT_COUNT', 'SECURITY_LOGIN_LIMIT_TIME',
            'SECURITY_PASSWORD_EXPIRATION_TIME'
          ]
        ],
        [
          this.$t('setting.PasswordCheckRule'),
          [
            'SECURITY_PASSWORD_MIN_LENGTH', 'SECURITY_PASSWORD_UPPER_CASE',
            'SECURITY_PASSWORD_LOWER_CASE', 'SECURITY_PASSWORD_NUMBER', 'SECURITY_PASSWORD_SPECIAL_CHAR'
          ]
        ],
        [
          this.$t('setting.Insecure_Command_Alert'),
          [
            'SECURITY_INSECURE_COMMAND', 'SECURITY_INSECURE_COMMAND_EMAIL_RECEIVER'
          ]
        ]
      ],
      fieldsMeta: {
      },
      url: '/api/v1/settings/setting/?category=security'
    }
  },
  methods: {
    getMethod() {
      return 'put'
    }
  }
}
</script>

<style scoped>

</style>
