<template>
  <Page :help-message="helpText">
    <IBox>
      <GenericCreateUpdateForm v-bind="$data" />
    </IBox>
  </Page>
</template>

<script>
import { CronTab, IBox } from '@/components'
import { GenericCreateUpdateForm, Page } from '@/layout/components'

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
      helpText: this.$t('setting.CleanHelpText'),
      fields: [
        [
          this.$t('common.Logging'),
          [
            'LOGIN_LOG_KEEP_DAYS', 'TASK_LOG_KEEP_DAYS', 'OPERATE_LOG_KEEP_DAYS',
            'FTP_LOG_KEEP_DAYS', 'TERMINAL_SESSION_KEEP_DURATION', 'ACTIVITY_LOG_KEEP_DAYS'
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
