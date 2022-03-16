<template>
  <GenericCreateUpdatePage v-if="!loading" v-bind="$data" :perform-submit="performSubmit" :create-success-next-route="createSuccessNextRoute" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import Select2 from '@/components/FormFields/Select2'
import { getDaysFuture } from '@/utils/common'
import PermissionFormActionField from '@/views/perms/components/PermissionFormActionField'
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
          apply_actions: ['all', 'connect', 'updownload', 'upload_file', 'download_file'],
          apply_assets: []
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
            'apply_nodes', 'apply_assets', 'apply_system_users', 'apply_actions',
            'apply_date_start', 'apply_date_expired'
          ],
          fieldsMeta: {
            apply_actions: {
              label: this.$t('perms.Actions'),
              component: PermissionFormActionField,
              helpText: this.$t('common.actionsTips')
            },
            apply_nodes: {
              component: Select2,
              el: {
                value: [],
                ajax: {
                  url: '',
                  transformOption: (item) => {
                    return { label: `${item.full_value}`, value: item.id }
                  }
                },
                clearable: true
              }
            },
            apply_assets: {
              type: 'assetSelect',
              label: this.$t('perms.Asset'),
              component: Select2,
              el: {
                value: [],
                ajax: {
                  url: '',
                  transformOption: (item) => {
                    return { label: item.hostname + '(' + item.protocols + ')', value: item.id }
                  }
                }
              }
            },
            apply_system_users: {
              type: 'systemUserSelect',
              component: Select2,
              label: this.$t('assets.SystemUser'),
              el: {
                value: [],
                ajax: {
                  url: '',
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
            options: this.$store.state.users.profile['myorgs']?.map((item) => {
              return { label: item.name, value: item.id }
            })
          },
          hidden: (form) => {
            const fieldsMeta = this.fieldsMeta.meta.fieldsMeta
            fieldsMeta.apply_system_users.el.ajax.url = `/api/v1/assets/system-users/suggestions/?oid=${form['org_id']}&protocol__in=rdp,ssh,vnc,telnet`
            fieldsMeta.apply_assets.el.ajax.url = `/api/v1/assets/assets/suggestions/?oid=${form['org_id']}`
            fieldsMeta.apply_nodes.el.ajax.url = `/api/v1/assets/nodes/suggestions/?oid=${form['org_id']}`
          }
        }
      },
      cleanFormValue(value) {
        Object.keys(value.meta).forEach((item, index, arr) => {
          if (['apply_system_users'].includes(item)) {
            if (value.meta[item].length < 1) {
              delete value.meta[item]
            }
          }
        })
        return value
      },
      url: '/api/v1/tickets/tickets/?type=apply_asset&action=open',
      createSuccessNextRoute: {
        name: 'TicketList'
      }
    }
  },
  mounted() {
    let userAllOrgIds = this.$store.state.users.profile['myorgs']
    const currentOrgId = this.$store.getters.currentOrg ? this.$store.getters.currentOrg.id : null
    userAllOrgIds = userAllOrgIds ? userAllOrgIds.map(i => i.id) : []
    if (userAllOrgIds.length > 0) {
      if (userAllOrgIds.includes(currentOrgId)) {
        this.initial.org_id = currentOrgId
      } else {
        this.initial.org_id = userAllOrgIds[0]
      }
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
