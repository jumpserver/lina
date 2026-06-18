<template>
  <Dialog
    v-bind="$attrs"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('SyncSetting')"
    top="10%"
    width="50%"
  >
    <GenericCreateUpdateForm
      v-bind="settings"
      :has-detail-in-msg="false"
      @submit-success="onSuccess"
    />
  </Dialog>
</template>

<script>
import { Dialog } from '@/components'
import { Required } from '@/components/Form/DataForm/rules'
import Select2 from '@/components/Form/FormFields/Select2.vue'
import { crontab, interval, is_periodic } from '@/components/const'
import { GenericCreateUpdateForm } from '@/layout/components'

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
        fields: [
          'AUTH_LDAP_SYNC_ORG_IDS',
          'AUTH_LDAP_SYNC_IS_PERIODIC',
          'AUTH_LDAP_SYNC_CRONTAB',
          'AUTH_LDAP_SYNC_INTERVAL',
          'AUTH_LDAP_SYNC_RECEIVERS'
        ],
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
          AUTH_LDAP_SYNC_IS_PERIODIC: is_periodic,
          AUTH_LDAP_SYNC_CRONTAB: crontab,
          AUTH_LDAP_SYNC_INTERVAL: interval,
          AUTH_LDAP_SYNC_RECEIVERS: {
            component: Select2,
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
        submitMethod: () => 'patch',
        cleanFormValue(value) {
          if (value['AUTH_LDAP_SYNC_INTERVAL'] === '') {
            value['AUTH_LDAP_SYNC_INTERVAL'] = null
          }
          return value
        }
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

<style scoped></style>
