<template>
  <GenericCreateUpdatePage v-bind="$data" :perform-submit="performSubmit" :create-success-next-route="createSuccessNextRoute" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { DEFAULT_ORG_ID } from '@/utils/org'
import Select2 from '@/components/FormFields/Select2'
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
        meta: {
          apply_date_expired: date_expired,
          apply_date_start: date_start,
          apply_actions: ['all', 'connect', 'updownload', 'upload_file', 'download_file']
        },
        org_id: DEFAULT_ORG_ID,
        type: 'apply_asset'
      },
      fields: [
        [this.$t('common.Basic'), ['title', 'type', 'org_id', 'assignees', 'comment']],
        [this.$t('tickets.RequestPerm'), ['meta']]
      ],
      fieldsMeta: {
        type: {
          hidden: () => true,
          el: {
            disabled: true
          }
        },
        meta: {
          fields: [
            'apply_ip_group', 'apply_hostname_group', 'apply_system_user_group',
            'apply_actions', 'apply_date_start', 'apply_date_expired'
          ],
          fieldsMeta: {
            apply_actions: {
              label: this.$t('perms.Actions'),
              component: AssetPermissionFormActionField,
              helpText: this.$t('common.actionsTips')
            },
            apply_ip_group: {
              helpText: this.$t('tickets.helpText.ips')
            },
            apply_hostname_group: {
              helpText: this.$t('tickets.helpText.fuzzySearch')
            },
            apply_system_user_group: {
              helpText: this.$t('tickets.helpText.fuzzySearch')
            }
          }
        },
        org_id: {
          component: Select2,
          el: {
            multiple: false,
            options: this.$store.state.users.profile.user_all_orgs.map((item) => {
              return { label: item.name, value: item.id }
            })
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
              url: `/api/v1/tickets/assignees/?org_id=${DEFAULT_ORG_ID}`,
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
      if (validValues.meta.apply_ip_group) {
        validValues.meta.apply_ip_group = validValues.meta.apply_ip_group.split(',')
      }
      if (validValues.meta.apply_hostname_group) {
        validValues.meta.apply_hostname_group = validValues.meta.apply_hostname_group.split(',')
      }
      if (validValues.meta.apply_system_user_group) {
        validValues.meta.apply_system_user_group = validValues.meta.apply_system_user_group.split(',')
      }
      return this.$axios['post'](`/api/v1/tickets/tickets/open/?type=apply_asset`, validValues)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
