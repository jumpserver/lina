<template>
  <Dialog
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('setting.SyncSetting')"
    top="10%"
    v-bind="$attrs"
    width="50%"
    v-on="$listeners"
  >
    <GenericCreateUpdateForm
      :has-detail-in-msg="false"
      v-bind="settings"
      @submitSuccess="onSuccess"
    />
  </Dialog>
</template>

<script>
import { GenericCreateUpdateForm } from '@/layout/components'
import { CronTab, Dialog } from '@/components'
import Select2 from '@/components/Form/FormFields/Select2.vue'
import { Required } from '@/components/Form/DataForm/rules'

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
        fields: ['AUTH_LDAP_SYNC_ORG_IDS', 'AUTH_LDAP_SYNC_IS_PERIODIC', 'AUTH_LDAP_SYNC_CRONTAB', 'AUTH_LDAP_SYNC_INTERVAL', 'AUTH_LDAP_SYNC_RECEIVERS'],
        fieldsMeta: {
          AUTH_LDAP_SYNC_ORG_IDS: {
            component: Select2,
            rules: [Required],
            el: {
              popperClass: 'sync-setting-org',
              multiple: true,
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
          },
          AUTH_LDAP_SYNC_RECEIVERS: {
            component: Select2,
            label: this.$t('accounts.AccountChangeSecret.Addressee'),
            el: {
              value: [],
              multiple: true,
              ajax: {
                url: '/api/v1/users/users/?fields_size=mini&oid=ROOT',
                transformOption: (item) => {
                  return { label: item.name + '(' + item.username + ')', value: item.id }
                }
              }
            }
          }
        },
        submitMethod: () => 'patch'
      }
    }
  },
  methods: {
    onSuccess() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped>

</style>
