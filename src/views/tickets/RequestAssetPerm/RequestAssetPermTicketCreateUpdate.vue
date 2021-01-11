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
        date_expired: date_expired,
        date_start: date_start,
        org_id: 'DEFAULT',
        actions: ['all', 'connect', 'updownload', 'upload_file', 'download_file']
      },
      fields: [
        [this.$t('common.Basic'), ['title', 'org_id', 'assignees', 'comment']],
        [this.$t('tickets.RequestPerm'), ['ips', 'hostname', 'system_user', 'actions', 'date_start', 'date_expired']]

      ],
      fieldsMeta: {
        ips: {
          helpText: this.$t('tickets.helpText.ips')
        },
        hostname: {
          helpText: this.$t('tickets.helpText.fuzzySearch')
        },
        system_user: {
          helpText: this.$t('tickets.helpText.fuzzySearch')
        },
        actions: {
          label: this.$t('perms.Actions'),
          component: AssetPermissionFormActionField,
          helpText: this.$t('common.actionsTips')
        },
        org_id: {
          component: Select2,
          el: {
            multiple: false,
            options: this.$store.state.users.profile.user_all_orgs
          },
          on: {
            changeOptions: ([event], updateForm) => {
              // console.log(event[0].value) // output: input value
              this.fieldsMeta.assignees.el.ajax.url = `/api/v1/tickets/tickets/request-asset-perm/assignees/?org_id=${event[0].value}`
            }
          }
        },
        assignees: {
          el: {
            multiple: true,
            value: [],
            ajax: {
              url: '/api/v1/tickets/tickets/request-asset-perm/assignees/',
              transformOption: (item) => {
                return { label: item.name + '(' + item.username + ')', value: item.id }
              }
            }
          }
        }
      },
      url: '/api/v1/tickets/tickets/request-asset-perm/',
      createSuccessNextRoute: {
        name: 'TicketList'
      }
    }
  },
  methods: {
    performSubmit(validValues) {
      const ips = validValues.ips
      if (ips) {
        validValues.ips = ips.split(',')
      }
      if (ips === '') {
        delete validValues['ips']
      }
      return this.$axios['post'](this.url, validValues)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
