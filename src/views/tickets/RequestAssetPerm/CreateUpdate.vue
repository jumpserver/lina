<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    v-if="!loading"
    :create-success-next-route="createSuccessNextRoute"
    :perform-submit="performSubmit"
  />
</template>

<script>
import Select2 from '@/components/Form/FormFields/Select2'
import { GenericCreateUpdatePage } from '@/layout/components'
import store from '@/store'
import { getDaysFuture } from '@/utils/common/time'
import AccountFormatter from '@/views/perms/AssetPermission/components/AccountFormatter'
import ExpireNoticePolicy from '@/views/perms/AssetPermission/components/ExpireNoticePolicy.vue'
import ExpireSoonNoticeMinutes from '@/views/perms/AssetPermission/components/ExpireSoonNoticeMinutes.vue'
import {
  getDefaultExpireSoonNoticeMinutes,
  hydrateExpireNoticeFormValue,
  isExpireSoonNoticeAtFuture,
  isPositiveInteger,
  normalizeExpireNoticePayload
} from '@/views/perms/AssetPermission/expireSoonNotice'
import { getTicketFlowLabel } from '@/views/tickets/const'
import { mapGetters, mapState } from 'vuex'

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
    const defaultExpireSoonNoticeMinutes = getDefaultExpireSoonNoticeMinutes(
      store.getters.publicSettings
    )
    return {
      // 工单创建 隐藏提示信息中的跳转连接
      hasDetailInMsg: false,
      loading: true,
      flowOptions: [],
      flowRequest: 0,
      initial: {
        ips_or_not: true,
        apply_date_expired: date_expired,
        apply_date_start: date_start,
        apply_expire_notice_policy: '',
        apply_expire_soon_notice_switch: false,
        apply_expire_soon_notice_minutes: null,
        apply_assets: [],
        apply_users: [store.getters.currentUser.id],
        org_id: '',
        workflow_id: '',
        apply_actions: [this.$t('All')]
      },
      fields: [
        [this.$t('Basic'), ['title', 'org_id', 'workflow_id']],
        [
          this.$t('RequestPerm'),
          ['apply_users', 'apply_nodes', 'apply_assets', 'apply_accounts', 'apply_actions']
        ],
        [
          this.$t('ValidityPeriod'),
          [
            'apply_date_start',
            'apply_date_expired',
            'apply_expire_notice_policy',
            'apply_expire_soon_notice_switch',
            'apply_expire_soon_notice_minutes'
          ]
        ],
        [this.$t('Other'), ['comment']]
      ],
      fieldsMeta: {
        apply_users: {
          label: this.$t('TicketAuthorizedUsers'),
          component: Select2,
          required: true,
          el: {
            multiple: true,
            options: [
              { value: store.getters.currentUser.id, label: store.getters.currentUser.name }
            ],
            ajax: {
              url: '',
              transformOption: (item) => ({
                label: `${item.name} (${item.username})`,
                value: item.id
              })
            }
          }
        },
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
          label: this.$t('Actions'),
          helpText: this.$t('ActionsTips')
        },
        apply_nodes: {
          label: this.$t('Node'),
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
          label: this.$t('Asset'),
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
        apply_expire_notice_policy: {
          component: ExpireNoticePolicy,
          label: this.$t('SystemExpireNotice')
        },
        apply_expire_soon_notice_switch: {
          type: 'switch',
          label: this.$t('ExpireSoonNotice'),
          helpTip: this.$t('ExpireSoonNoticeHelpText'),
          el: {
            style: { marginTop: '4px' }
          }
        },
        apply_expire_soon_notice_minutes: {
          component: ExpireSoonNoticeMinutes,
          label: this.$t('ExpireSoonNoticeMinutes'),
          el: {},
          hidden: (formValue, field) => {
            field.el.dateExpired = formValue.apply_date_expired
            field.el.disabled = !formValue.apply_expire_soon_notice_switch
            return false
          },
          rules: [
            {
              validator: (rule, value, callback, source) => {
                if (
                  source.apply_expire_soon_notice_switch &&
                  (!isPositiveInteger(value) ||
                    !isExpireSoonNoticeAtFuture(source.apply_date_expired, value))
                ) {
                  callback(new Error(this.$t('ExpireSoonNoticeFutureError')))
                  return
                }
                callback()
              },
              trigger: ['blur', 'change']
            }
          ]
        },
        org_id: {
          label: this.$t('Organization'),
          component: Select2,
          el: {
            multiple: false,
            disabled: false,
            options: []
          },
          hidden: (form) => {
            const fieldsMeta = this.fieldsMeta
            fieldsMeta.apply_users.el.ajax.url = `/api/v1/tickets/ticket-types/apply_asset/options/?org_id=${form['org_id']}`
            fieldsMeta.apply_assets.el.ajax.url = `/api/v1/tickets/apply-assets/suggestions/?oid=${form['org_id']}`
            fieldsMeta.apply_nodes.el.ajax.url = `/api/v1/tickets/apply-nodes/suggestions/?oid=${form['org_id']}`
            fieldsMeta.apply_accounts.el.oid = form['org_id']
          },
          on: {
            change: async ([event], updateForm) => {
              updateForm({
                workflow_id: '',
                apply_nodes: [],
                apply_assets: [],
                apply_accounts: [],
                apply_users: [store.getters.currentUser.id]
              })
              const flow = await this.loadFlowOptions(event)
              if (flow === undefined) return
              updateForm({ workflow_id: flow?.id || '' })
            }
          }
        },
        workflow_id: {
          component: Select2,
          label: this.$t('TicketFlow'),
          el: {
            multiple: false,
            clearable: false,
            disabled: true,
            options: []
          }
        }
      },
      afterGetFormValue(value) {
        return hydrateExpireNoticeFormValue(value, 'apply_', defaultExpireSoonNoticeMinutes)
      },
      cleanFormValue(value) {
        const apply_actions = value['apply_actions'] || []
        apply_actions.forEach((item, index) => {
          if (item === this.$t('All')) {
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
        if (!value.workflow_id) {
          delete value.workflow_id
        }
        return normalizeExpireNoticePayload(value, 'apply_')
      },
      url: '/api/v1/tickets/tickets/?type=apply_asset',
      createSuccessNextRoute: {
        name: 'MyTicketList'
      }
    }
  },
  computed: {
    ...mapState({
      workbenchOrgs: (state) => state.users.noRootWorkbenchOrgs
    }),
    ...mapGetters(['currentOrg'])
  },
  async mounted() {
    this.fieldsMeta.org_id.el.options = this.workbenchOrgs.map((item) => ({
      label: item.name,
      value: item.id
    }))

    const currentOrgId = this.currentOrg.id || ''
    const userAllOrgIds = this.workbenchOrgs.map((i) => i.id) || []
    if (userAllOrgIds.includes(currentOrgId)) {
      this.initial.org_id = currentOrgId
    } else {
      this.initial.org_id = userAllOrgIds[0]
    }

    const flow = await this.loadFlowOptions(this.initial.org_id)
    this.initial.workflow_id = flow?.id || ''

    this.loading = false
  },
  methods: {
    async loadFlowOptions(orgId) {
      const requestId = ++this.flowRequest
      this.flowOptions = []
      this.fieldsMeta.workflow_id.el.options = []
      this.fieldsMeta.workflow_id.el.disabled = true
      if (!orgId) {
        return null
      }
      try {
        const flows = await this.$axios.get('/api/v1/tickets/workflows/options/', {
          params: { type: 'apply_asset', org_id: orgId }
        })
        if (requestId !== this.flowRequest) return undefined
        this.flowOptions = flows
        this.fieldsMeta.workflow_id.el.options = flows.map((flow) => ({
          label: getTicketFlowLabel(flow, this.$t),
          value: flow.id
        }))
        this.fieldsMeta.workflow_id.el.disabled = flows.length <= 1
        return flows[0] || null
      } catch (error) {
        return null
      }
    },
    performSubmit(validValues) {
      const { title, org_id, workflow_id, comment } = validValues
      const request_data = Object.fromEntries(
        Object.entries(validValues).filter(([key]) => key.startsWith('apply_'))
      )
      return this.$axios.post('/api/v1/tickets/tickets/open/', {
        type: 'apply_asset',
        title,
        org_id,
        workflow_id,
        comment,
        request_data
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
