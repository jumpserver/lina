<template>
  <GenericCreateUpdatePage v-bind="$data" :perform-submit="performSubmit" :create-success-next-route="createSuccessNextRoute" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import Select2 from '@/components/Select2'
import { getDaysFuture } from '@/utils/common'
import AssetPermissionFormActionField from '@/views/perms/AssetPermission/components/AssetPermissionFormActionField'
export default {
  components: {
    GenericCreateUpdatePage
  },

  data() {
    const now = new Date()
    const date_expired = getDaysFuture(7, now).toISOString()
    const date_start = now.toISOString()
    return {
      // 工单创建 隐藏提示信息中的跳转连接
      hasDetailInMsg: false,
      initial: {
        ips_or_not: true,
        apply_date_expired: date_expired,
        apply_date_start: date_start,
        org_id: 'DEFAULT',
        type: 'apply_asset',
        apply_actions: ['all', 'connect', 'updownload', 'upload_file', 'download_file']
      },
      fields: [
        [this.$t('common.Basic'), ['title', 'type', 'org_id', 'assignees', 'comment']],
        [this.$t('tickets.RequestPerm'), ['apply_ip_group', 'apply_hostname_group', 'apply_system_user_group', 'apply_actions', 'apply_date_start', 'apply_date_expired']]

      ],
      fieldsMeta: {
        type: {
          el: {
            disabled: true
          }
        },
        apply_ip_group: {
          label: this.$t('tickets.IPGroup'),
          helpText: this.$t('tickets.helpText.ips')
        },
        apply_hostname_group: {
          label: this.$t('assets.Hostname'),
          helpText: this.$t('tickets.helpText.fuzzySearch')
        },
        apply_system_user_group: {
          label: this.$t('assets.SystemUser'),
          helpText: this.$t('tickets.helpText.fuzzySearch')
        },
        apply_actions: {
          label: this.$t('perms.Actions'),
          component: AssetPermissionFormActionField,
          helpText: this.$t('common.actionsTips')
        },
        apply_date_start: {
          label: this.$t('common.DateStart'),
          type: 'date-picker',
          el: {
            type: 'datetime'
          }
        },
        apply_date_expired: {
          label: this.$t('common.DateEnd'),
          type: 'date-picker',
          el: {
            type: 'datetime'
          }
        },
        org_id: {
          component: Select2,
          el: {
            multiple: false,
            options: this.$store.state.users.profile.user_all_orgs
          },
          on: {
            changeOptions: ([event], updateForm) => {
              this.fieldsMeta.assignees.el.ajax.url = `/api/v1/tickets/assignees/?org_id=${event[0].value}`
            }
          }
        },
        assignees: {
          el: {
            multiple: true,
            value: [],
            ajax: {
              url: `/api/v1/tickets/assignees/?org_id=DEFAULT`,
              transformOption: (item) => {
                return { label: item.name + '(' + item.username + ')', value: item.id }
              }
            }
          }
        }
      },
      url: '/api/v1/tickets/tickets/?type=apply_asset&action=open',
      createSuccessNextRoute: {
        name: 'TicketList'
      }
    }
  },
  methods: {
    performSubmit(validValues) {
      const meta = {}
      const ips = validValues.apply_ip_group
      if (ips) {
        validValues.meta.apply_ip_group = ips.split(',')
      }
      if (ips === '') {
        delete validValues['apply_ip_group']
      }
      if (validValues.apply_hostname_group) {
        meta.apply_hostname_group = validValues.apply_ip_group
        delete validValues['apply_hostname_group']
      }

      if (validValues.apply_system_user_group) {
        meta.apply_system_user_group = validValues.apply_system_user_group.split(',')
        delete validValues['apply_system_user_group']
      }

      if (validValues.apply_actions) {
        meta.apply_actions = validValues.apply_actions
        delete validValues['apply_actions']
      }
      meta.apply_date_start = validValues.apply_date_start
      delete validValues['apply_date_start']

      meta.apply_date_expired = validValues.apply_date_expired
      delete validValues['apply_date_expired']

      validValues['meta'] = meta

      return this.$axios['post'](`/api/v1/tickets/tickets/open/?type=apply_asset`, validValues)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
