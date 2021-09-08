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
      url: '/api/v1/settings/setting/?category=other',
      hasDetailInMsg: false,
      fields: [
        [
          this.$t('setting.OTP'),
          [
            'OTP_ISSUER_NAME', 'OTP_VALID_WINDOW'
          ]
        ],
        [
          this.$t('setting.Ops'),
          [
            'PERIOD_TASK_ENABLED', 'WINDOWS_SSH_DEFAULT_SHELL'
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
