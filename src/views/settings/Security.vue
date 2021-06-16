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
import { Link } from '@/components/FormFields'

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
            'SECURITY_PASSWORD_EXPIRATION_TIME', 'OLD_PASSWORD_HISTORY_LIMIT_COUNT'
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
          this.$t('setting.InsecureCommandAlert'),
          [
            'SECURITY_INSECURE_COMMAND_EMAIL_RECEIVER'
          ]
        ]
      ],
      fieldsMeta: {
        'SECURITY_INSECURE_COMMAND_EMAIL_RECEIVER': {
          component: Link,
          helpText: this.$t('setting.InsecureCommandNotifyToSubscription'),
          label: this.$t('common.Receivers'),
          el: {
            href: '/ui/#/settings?activeTab=SystemMessageSubscription',
            title: this.$t('setting.insecureCommandEmailUpdate')
          }
        }
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
