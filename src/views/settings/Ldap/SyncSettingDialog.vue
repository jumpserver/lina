<template>
  <Dialog
    :title="$t('setting.SyncSetting')"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    width="50%"
    top="10%"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <GenericCreateUpdateForm
      v-bind="settings"
      :has-detail-in-msg="false"
    />
  </Dialog>
</template>

<script>
import { GenericCreateUpdateForm } from '@/layout/components'
import { Dialog } from '@/components'
import Select2 from '@/components/FormFields/Select2'
import { Required } from '@/components/DataForm/rules'
import { CronTab } from '@/components'
export default {
  name: 'SyncSettingDialog',
  components: {
    GenericCreateUpdateForm,
    Dialog
  },
  data() {
    return {
      settings: {
        visible: false,
        url: '/api/v1/settings/setting/?category=ldap',
        fields: ['AUTH_LDAP_SYNC_ORG_ID', 'AUTH_LDAP_SYNC_IS_PERIODIC', 'AUTH_LDAP_SYNC_CRONTAB', 'AUTH_LDAP_SYNC_INTERVAL'],
        fieldsMeta: {
          AUTH_LDAP_SYNC_ORG_ID: {
            component: Select2,
            rules: [Required],
            el: {
              multiple: false,
              ajax: {
                url: '/api/v1/orgs/orgs/',
                transformOption: (item) => {
                  return { label: item.name, value: item.id }
                }
              }
            },
            hidden: (formValue) => {
              return !this.$hasLicense()
            }
          },
          AUTH_LDAP_SYNC_IS_PERIODIC: {
            type: 'switch'
          },
          AUTH_LDAP_SYNC_CRONTAB: {
            component: CronTab,
            helpText: this.$t('xpack.HelpText.CrontabOfCreateUpdatePage')
          },
          AUTH_LDAP_SYNC_INTERVAL: {
            rules: [Required],
            helpText: this.$t('xpack.HelpText.IntervalOfCreateUpdatePage')
          }
        },
        submitMethod: () => 'patch'
      }
    }
  }
}
</script>

<style scoped>

</style>
