<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'

export default {
  name: 'Senior',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      url: '/api/v1/settings/setting/?category=clean',
      hasDetailInMsg: false,
      fields: [
        [
          this.$t('common.Logging'),
          [
            'LOGIN_LOG_KEEP_DAYS', 'TASK_LOG_KEEP_DAYS', 'OPERATE_LOG_KEEP_DAYS',
            'FTP_LOG_KEEP_DAYS'
          ]
        ],
        [
          this.$t('common.Database'),
          [
            'CLOUD_SYNC_TASK_EXECUTION_KEEP_DAYS'
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
        return 'patch'
      }
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
