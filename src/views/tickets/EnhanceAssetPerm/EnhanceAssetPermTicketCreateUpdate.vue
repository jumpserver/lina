<template>
  <GenericCreateUpdatePage v-bind="$data" :perform-submit="performSubmit" :create-success-next-route="createSuccessNextRoute" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { DEFAULT_ORG_ID } from '@/utils/org'
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
        meta: {
          apply_date_expired: date_expired,
          apply_date_start: date_start,
          apply_actions: ['all', 'connect', 'updownload', 'upload_file', 'download_file']
        },
        org_id: DEFAULT_ORG_ID,
        type: 'enhance_asset'
      },
      fields: [
        [this.$t('common.Basic'), ['title', 'type', 'org_id', 'assignees', 'comment']],
        [this.$t('tickets.ElevatedPrivileges'), ['meta']]
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
            'apply_host', 'apply_system_users', 'apply_actions', 'apply_date_start', 'apply_date_expired'
          ],
          fieldsMeta: {
            apply_actions: {
              label: this.$t('perms.Actions'),
              component: AssetPermissionFormActionField,
              helpText: this.$t('common.actionsTips')
            },
            apply_host: {
              component: Select2,
              el: {
                multiple: false,
                value: [],
                ajax: {
                  url: `/api/v1/perms/users/assets/`,
                  transformOption: (item) => {
                    return { label: item.hostname + '(' + item.ip + ')', value: item.id }
                  }
                }
              },
              on: {
                changeOptions: ([event], updateForm) => {
                  this.fieldsMeta.meta.fieldsMeta.apply_system_users.el.ajax.url = `/api/v1/assets/system-users-assets-relations/?asset=${event[0].value}`
                }
              }
            },
            apply_system_users: {
              component: Select2,
              el: {
                multiple: true,
                value: [],
                ajax: {
                  url: ``,
                  transformOption: (item) => {
                    if (!item.username) {
                      item.username = 'dynamic'
                    }
                    return { label: item.systemuser_display, value: item.systemuser }
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
      url: '/api/v1/tickets/tickets/?type=enhance_asset&action=open',
      createSuccessNextRoute: {
        name: 'TicketList'
      }
    }
  },
  methods: {
    performSubmit(validValues) {
      return this.$axios['post'](`/api/v1/tickets/tickets/open/?type=enhance_asset`, validValues)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
