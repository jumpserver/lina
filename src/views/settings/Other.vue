<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="$data" />
  </IBox>
</template>

<script>
import { IBox } from '@/components'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'

export default {
  name: 'Senior',
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    return {
      url: '/api/v1/settings/setting/?category=advanced',
      hasDetailInMsg: false,
      fields: [
        [
          this.$t('common.Other'),
          [
            'AUTH_SSO', 'AUTH_SSO_AUTHKEY_TTL', 'OTP_VALID_WINDOW', 'OTP_ISSUER_NAME',
            'SECURITY_INSECURE_COMMAND_LEVEL'
          ]
        ]
      ],
      fieldsMeta: {
        AUTH_LDAP_SYNC_CRONTAB: {
          label: this.$t('xpack.RegularlyPerform'),
          helpText: this.$t('xpack.HelpText.CrontabOfCreateUpdatePage')
        }
      },
      submitMethod() {
        return 'put'
      }
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
