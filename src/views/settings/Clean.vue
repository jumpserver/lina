<template>
  <Page>
    <IBox>
      <GenericCreateUpdateForm v-bind="$data" />
    </IBox>
  </Page>
</template>

<script>
import { IBox, CronTab } from '@/components'
import { Page, GenericCreateUpdateForm } from '@/layout/components'

export default {
  name: 'Senior',
  components: {
    IBox,
    Page,
    GenericCreateUpdateForm
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
            'FTP_LOG_KEEP_DAYS', 'TERMINAL_SESSION_KEEP_DURATION'
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
          component: CronTab,
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
