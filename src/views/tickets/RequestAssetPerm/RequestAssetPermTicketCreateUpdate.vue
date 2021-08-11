<template>
  <GenericCreateUpdatePage v-if="!loading" v-bind="$data" :perform-submit="performSubmit" :create-success-next-route="createSuccessNextRoute" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import Select2 from '@/components/FormFields/Select2'
import AssetSelect from '@/components/AssetSelect'
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
      loading: true,
      initial: {
        ips_or_not: true,
        meta: {
          apply_date_expired: date_expired,
          apply_date_start: date_start,
          apply_actions: ['all', 'connect', 'updownload', 'upload_file', 'download_file']
        },
        org_id: '',
        type: 'apply_asset'
      },
      fields: [
        [this.$t('common.Basic'), ['title', 'type', 'org_id', 'comment']],
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
            'apply_assets', 'apply_system_users', 'apply_actions',
            'apply_date_start', 'apply_date_expired'
          ],
          fieldsMeta: {
            apply_actions: {
              label: this.$t('perms.Actions'),
              component: AssetPermissionFormActionField,
              helpText: this.$t('common.actionsTips')
            },
            apply_assets: {
              type: 'assetSelect',
              component: AssetSelect,
              label: this.$t('perms.Asset'),
              el: {
                value: []
              }
            },
            apply_system_users: {
              type: 'systemUserSelect',
              component: Select2,
              label: '系统用户',
              el: {
                value: [],
                ajax: {
                  url: '/api/v1/assets/system-users/?protocol__in=rdp,ssh,vnc,telnet',
                  transformOption: (item) => {
                    const username = item.username || '*'
                    return { label: item.name + '(' + username + ')', value: item.id }
                  }
                }
              }
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
        }
      },
      url: '/api/v1/tickets/tickets/?type=apply_asset&action=open',
      createSuccessNextRoute: {
        name: 'TicketList'
      }
    }
  },
  mounted() {
    if (this.$store.state.users.profile.user_all_orgs.length > 0) {
      this.initial.org_id = this.$store.state.users.profile.user_all_orgs[0].id
    }
    this.loading = false
  },
  methods: {
    performSubmit(validValues) {
      return this.$axios['post'](`/api/v1/tickets/tickets/open/?type=apply_asset`, validValues)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
