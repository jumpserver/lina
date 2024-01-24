<template>
  <GenericCreateUpdatePage
    v-if="!loading"
    v-bind="$data"
    :perform-submit="performSubmit"
    :create-success-next-route="createSuccessNextRoute"
  />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import AccountFormatter from '@/views/perms/AssetPermission/components/AccountFormatter'
import Select2 from '@/components/Form/FormFields/Select2'
import { getDaysFuture } from '@/utils/common'
import { mapGetters, mapState } from 'vuex'
import store from '@/store'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const now = new Date()
    const time = store.getters.publicSettings['TICKET_AUTHORIZE_DEFAULT_TIME']
    const unit = store.getters.publicSettings['TICKET_AUTHORIZE_DEFAULT_TIME_UNIT']
    const dividend = unit === 'hour' ? 24 : 1
    const date_expired = getDaysFuture(time / dividend, new Date()).toISOString()
    const date_start = now.toISOString()
    return {
      // 工单创建 隐藏提示信息中的跳转连接
      hasDetailInMsg: false,
      loading: true,
      initial: {
        ips_or_not: true,
        apply_date_expired: date_expired,
        apply_date_start: date_start,
        apply_assets: [],
        org_id: '',
        apply_actions: [this.$t('perms.all')]
      },
      fields: [
        [this.$t('common.Basic'), ['title', 'org_id']],
        [this.$t('tickets.RequestPerm'), [
          'apply_nodes', 'apply_assets', 'apply_accounts',
          'apply_actions', 'apply_date_start', 'apply_date_expired'
        ]],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        title: {
          el: {
            type: 'input'
          }
        },
        type: {
          hidden: () => true,
          el: {
            disabled: true
          }
        },
        apply_actions: {
          label: this.$t('perms.Actions'),
          helpText: this.$t('common.actionsTips')
        },
        apply_nodes: {
          label: this.$t('perms.Node'),
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
                return { label: item.name + '(' + item.address + ')', value: item.id }
              }
            }
          }
        },
        apply_accounts: {
          component: AccountFormatter,
          el: {
            nodes: [],
            assets: [],
            showAddTemplate: false
          },
          hidden: (formValue) => {
            this.fieldsMeta.apply_accounts.el.assets = formValue.apply_assets
            this.fieldsMeta.apply_accounts.el.nodes = formValue.apply_nodes
          }
        },
        org_id: {
          component: Select2,
          el: {
            multiple: false,
            options: this.$store.state.users.noRootWorkbenchOrgs?.map((item) => {
              return { label: item.name, value: item.id }
            })
          },
          hidden: (form) => {
            const fieldsMeta = this.fieldsMeta
            fieldsMeta.apply_assets.el.ajax.url = `/api/v1/tickets/apply-assets/suggestions/?oid=${form['org_id']}`
            fieldsMeta.apply_nodes.el.ajax.url = `/api/v1/tickets/apply-nodes/suggestions/?oid=${form['org_id']}`
            fieldsMeta.apply_accounts.el.oid = form['org_id']
          },
          on: {
            change: ([event], updateForm) => {
              updateForm({
                apply_nodes: [],
                apply_assets: [],
                apply_system_users: []
              })
            }
          }
        }
      },
      cleanFormValue(value) {
        const apply_actions = value['apply_actions'] || []
        apply_actions.forEach((item, index) => {
          if (item === this.$t('perms.all')) {
            apply_actions[index] = 'all'
          }
        })

        Object.keys(value).forEach((item, index, arr) => {
          if (['apply_accounts', 'apply_assets', 'apply_nodes'].includes(item)) {
            if (value[item].length < 1) {
              delete value[item]
            }
          }
        })
        return value
      },
      url: '/api/v1/tickets/apply-asset-tickets/?state=pending',
      createSuccessNextRoute: {
        name: 'MyTicketList'
      }
    }
  },
  computed: {
    ...mapState({
      workbenchOrgs: state => state.users.noRootWorkbenchOrgs
    }),
    ...mapGetters(['currentOrg'])
  },
  mounted() {
    const currentOrgId = this.currentOrg.id || ''
    const userAllOrgIds = this.workbenchOrgs.map(i => i.id) || []
    if (userAllOrgIds.includes(currentOrgId)) {
      this.initial.org_id = currentOrgId
    } else {
      this.initial.org_id = userAllOrgIds[0]
    }

    this.loading = false
  },
  methods: {
    performSubmit(validValues) {
      return this.$axios['post'](`/api/v1/tickets/apply-asset-tickets/open/`, validValues)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
