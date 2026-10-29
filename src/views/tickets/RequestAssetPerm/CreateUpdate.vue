<template>
  <div>
    <el-alert v-if="loadError" type="error" :closable="false" show-icon class="reapply-notice">
      {{ $t('TicketReapplyLoadFailed') }}
      <el-button link type="primary" @click="initialize">{{ $t('Retry') }}</el-button>
    </el-alert>
    <GenericCreateUpdatePage
      v-bind="$data"
      v-if="!loading && !loadError"
      ref="form"
      :create-success-next-route="createSuccessNextRoute"
      :perform-submit="performSubmit"
      :can-submit="workflowReady"
      :has-save-continue="sourceTicket || !workflowReady ? false : null"
    >
      <template #form-header>
        <el-alert
          v-if="sourceTicket"
          type="info"
          :closable="false"
          show-icon
          class="reapply-notice"
        >
          <template #title>
            {{ $t(isRenewal ? 'TicketRenewalTitle' : 'TicketReapplyTitle') }}
            <el-link :href="sourceTicketUrl" target="_blank" rel="noopener" type="primary">
              {{ sourceTicket.serial_num }}
            </el-link>
          </template>
          <p>{{ $t('TicketReapplyHelp') }}</p>
        </el-alert>
        <el-alert
          v-if="warningMessages.length"
          type="warning"
          :closable="false"
          show-icon
          class="reapply-notice"
        >
          <p v-for="message in warningMessages" :key="message">{{ message }}</p>
        </el-alert>
      </template>
    </GenericCreateUpdatePage>
    <el-alert v-if="availabilityFailed" type="error" :closable="false">
      {{ $t('TicketResourceLoadFailed') }}
      <el-button link type="primary" @click="retryResourceAvailability">{{
        $t('Retry')
      }}</el-button>
    </el-alert>
  </div>
</template>

<script>
import Select2 from '@/components/Form/FormFields/Select2'
import TicketWorkflowSelect from '../components/TicketWorkflowSelect.vue'
import { GenericCreateUpdatePage } from '@/layout/components'
import store from '@/store'
import { getDaysFuture } from '@/utils/common/time'
import AccountFormatter from '@/views/perms/AssetPermission/components/AccountFormatter'
import ExpireNoticePolicy from '@/views/perms/AssetPermission/components/ExpireNoticePolicy.vue'
import ExpireSoonNoticeMinutes from '@/views/perms/AssetPermission/components/ExpireSoonNoticeMinutes.vue'
import {
  hydrateExpireNoticeFormValue,
  isExpireSoonNoticeAtFuture,
  isPositiveInteger,
  normalizeExpireNoticePayload
} from '@/views/perms/AssetPermission/expireSoonNotice'
import { getTicketFlowLabel } from '@/views/tickets/const'
import { mapGetters, mapState } from 'vuex'
import resourceAvailability from '../plugins/resourceAvailability'

export default {
  mixins: [resourceAvailability],
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
      loadError: false,
      sourceTicket: null,
      prefillWarnings: {},
      submitted: false,
      flowOptions: [],
      flowRequest: 0,
      flowBeneficiary: '',
      selectedOrgId: '',
      initial: {
        ips_or_not: true,
        apply_date_expired: date_expired,
        apply_date_start: date_start,
        apply_expire_notice_policy: '',
        apply_expire_soon_notice_switch: false,
        apply_expire_soon_notice_minutes: null,
        apply_assets: [],
        resource_description: '',
        apply_users: store.getters.currentUser.id,
        org_id: '',
        workflow_id: '',
        apply_actions: [this.$t('All')]
      },
      fields: [
        [this.$t('Basic'), ['title', 'org_id', 'workflow_id']],
        [
          this.$t('RequestPerm'),
          [
            'apply_users',
            'apply_nodes',
            'apply_assets',
            'apply_accounts',
            'resource_description',
            'apply_actions'
          ]
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
        resource_description: {
          label: this.$t('TicketResourceDescription'),
          helpText: this.$t('TicketResourceDescriptionHelp'),
          el: { type: 'textarea', rows: 3, maxlength: 4096 },
          hidden: () => !this.resourceAvailability?.description_allowed,
          rules: [{ required: true, message: this.$t('TicketRequiredResource'), trigger: 'blur' }]
        },
        apply_users: {
          label: this.$t('TicketAuthorizedUser'),
          component: Select2,
          required: true,
          el: {
            multiple: false,
            clearable: false,
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
          },
          on: {
            change: async ([userId], updateForm) => {
              updateForm({ workflow_id: '' })
              const flow = await this.loadFlowOptions(this.selectedOrgId, userId)
              if (flow === undefined) return
              updateForm({ workflow_id: flow?.id || '' })
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
          on: { change: ([value]) => this.resourceSelectionChanged('apply_nodes', value) },
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
          rules: [
            {
              trigger: 'change',
              validator: (rule, value, done) => {
                done(
                  !value?.length &&
                    !this.availabilityParams.selection?.apply_nodes &&
                    !this.resourceAvailability?.description_allowed
                    ? new Error(this.$t('RequiredAssetOrNode'))
                    : undefined
                )
              }
            }
          ],
          on: { change: ([value]) => this.resourceSelectionChanged('apply_assets', value) },
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
          rules: [
            {
              trigger: 'change',
              validator: (rule, value, done) => {
                done(
                  !value?.length && !this.resourceAvailability?.description_allowed
                    ? new Error(this.$t('TicketRequiredResource'))
                    : undefined
                )
              }
            }
          ],
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
            return !formValue.apply_expire_soon_notice_switch
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
              this.selectedOrgId = event
              this.loadResourceAvailability('apply_asset', event)
              updateForm({
                workflow_id: '',
                apply_nodes: [],
                apply_assets: [],
                apply_accounts: [],
                apply_users: store.getters.currentUser.id
              })
              const flow = await this.loadFlowOptions(event, store.getters.currentUser.id)
              if (flow === undefined) return
              updateForm({ workflow_id: flow?.id || '' })
            }
          }
        },
        workflow_id: {
          component: TicketWorkflowSelect,
          required: true,
          rules: [{ required: true, message: this.$t('FieldRequiredError'), trigger: 'blur' }],
          label: this.$t('TicketFlow'),
          on: {
            retry: async (_, updateForm) => {
              const flow = await this.loadFlowOptions(this.selectedOrgId, this.flowBeneficiary)
              if (flow !== undefined) updateForm({ workflow_id: flow?.id || '' })
            }
          },
          el: {
            loading: false,
            failed: false,
            multiple: false,
            clearable: false,
            disabled: true,
            options: []
          }
        }
      },
      afterGetFormValue(value) {
        return hydrateExpireNoticeFormValue(value, 'apply_')
      },
      cleanFormValue: (value) => {
        this.validateAvailability()
        if (!this.resourceAvailability?.description_allowed) delete value.resource_description
        value.apply_actions = (value.apply_actions || []).map((item) =>
          item === this.$t('All') ? 'all' : item
        )

        Object.keys(value).forEach((item, index, arr) => {
          if (['apply_accounts', 'apply_assets', 'apply_nodes'].includes(item)) {
            if (!value[item]?.length) {
              delete value[item]
            }
          }
        })
        if (!value.workflow_id) {
          delete value.workflow_id
        }
        value.apply_users = value.apply_users ? [value.apply_users] : []
        return normalizeExpireNoticePayload(value, 'apply_')
      },
      url: '/api/v1/tickets/tickets/?type=apply_asset',
      createSuccessNextRoute: {
        name: 'MyTicketList'
      }
    }
  },
  computed: {
    workflowReady() {
      const field = this.fieldsMeta.workflow_id.el
      return field.options.length > 0 && !field.loading && !field.failed
    },
    isRenewal() {
      return this.sourceTicket?.kind === 'renew' && this.selectedOrgId === this.sourceTicket.org_id
    },
    sourceTicketUrl() {
      if (!this.sourceTicket) return ''
      return this.$router.resolve({
        name: 'AssetsTicketDetail',
        params: { id: this.sourceTicket.id },
        query: { oid: this.sourceTicket.org_id }
      }).href
    },
    warningMessages() {
      const keys = {
        assets: 'TicketReapplyInvalidAssets',
        accounts: 'TicketReapplyInvalidAccounts',
        nodes: 'TicketReapplyNodes',
        beneficiary: 'TicketReapplyBeneficiary',
        workflow: 'TicketReapplyWorkflow'
      }
      return Object.keys(this.prefillWarnings)
        .filter((key) => keys[key])
        .map((key) =>
          this.$t(keys[key], {
            count: this.prefillWarnings[key],
            accounts: Array.isArray(this.prefillWarnings[key])
              ? this.prefillWarnings[key].join(', ')
              : ''
          })
        )
    },
    ...mapState({
      workbenchOrgs: (state) => state.users.noRootWorkbenchOrgs
    }),
    ...mapGetters(['currentOrg'])
  },
  async mounted() {
    await this.initialize()
  },
  activated() {
    if (this.submitted) this.initialize()
  },
  methods: {
    async initialize() {
      this.loading = true
      this.loadError = false
      this.submitted = false
      this.sourceTicket = null
      this.prefillWarnings = {}
      this.fieldsMeta.apply_assets.el.options = []
      this.fieldsMeta.org_id.el.options = this.workbenchOrgs.map((item) => ({
        label: item.name,
        value: item.id
      }))
      try {
        const orgId =
          this.workbenchOrgs.find((org) => org.id === this.currentOrg.id)?.id ||
          this.workbenchOrgs[0]?.id ||
          ''
        let data = null
        if (this.$route.query.source_ticket) {
          data = await this.$axios.get(
            `/api/v1/tickets/tickets/${encodeURIComponent(this.$route.query.source_ticket)}/actions/reapply/`,
            { params: { oid: this.$route.query.oid || orgId } }
          )
          this.sourceTicket = data.source_ticket
          this.prefillWarnings = data.warnings || {}
          this.initial = {
            ...this.initial,
            resource_description: '',
            ...data.request_data,
            title: data.title,
            comment: data.comment,
            org_id: data.org_id,
            apply_users: data.request_data.apply_users[0] || ''
          }
          this.fieldsMeta.apply_users.el.options = data.users.map((user) => ({
            value: user.id,
            label: `${user.name} (${user.username})`
          }))
          this.fieldsMeta.apply_assets.el.options = (data.assets || []).map((asset) => ({
            value: asset.id,
            label: `${asset.name} (${asset.address})`
          }))
        } else {
          this.initial.org_id = orgId
        }
        this.selectedOrgId = this.initial.org_id
        this.fieldsMeta.apply_assets.el.ajax.url = `/api/v1/tickets/apply-assets/suggestions/?oid=${this.selectedOrgId}`
        await this.loadResourceAvailability('apply_asset', this.selectedOrgId, {
          apply_assets: (this.initial.apply_assets || []).join(','),
          apply_nodes: (this.initial.apply_nodes || []).join(',')
        })
        const flow = await this.loadFlowOptions(this.selectedOrgId, this.initial.apply_users)
        const original = data && this.flowOptions.find((item) => item.id === data.workflow_id)
        this.initial.workflow_id = original?.id || flow?.id || ''
        if (data?.workflow_id && !original) this.prefillWarnings.workflow = true
      } catch {
        this.loadError = true
      } finally {
        this.loading = false
      }
    },
    hasUnsavedChanges() {
      return this.$refs.form?.hasUnsavedChanges() || false
    },
    async resourceSelectionChanged(field, values) {
      const selection = {
        ...this.availabilityParams.selection,
        [field]: (values || []).map((value) => value.id || value).join(',')
      }
      await this.loadResourceAvailability('apply_asset', this.selectedOrgId, selection)
      this.$refs.form?.$refs.createUpdateForm?.validateField('apply_assets', () => {})
    },
    async loadFlowOptions(orgId, beneficiary) {
      const requestId = ++this.flowRequest
      this.flowOptions = []
      this.flowBeneficiary = beneficiary
      const field = this.fieldsMeta.workflow_id.el
      Object.assign(field, { options: [], disabled: true, loading: Boolean(orgId), failed: false })
      if (!orgId) {
        return null
      }
      try {
        const flows = await this.$axios.get('/api/v1/tickets/workflows/options/', {
          params: { type: 'apply_asset', org_id: orgId, beneficiary },
          disableFlashErrorMsg: true
        })
        if (requestId !== this.flowRequest) return undefined
        this.flowOptions = flows
        if (this.sourceTicket) {
          if (flows.length) delete this.prefillWarnings.no_workflow
          else this.prefillWarnings.no_workflow = true
        }
        field.options = flows.map((flow) => ({
          label: getTicketFlowLabel(flow, this.$t),
          value: flow.id
        }))
        field.disabled = flows.length <= 1
        return flows[0] || null
      } catch {
        if (requestId !== this.flowRequest) return undefined
        field.failed = true
        return null
      } finally {
        if (requestId === this.flowRequest) field.loading = false
      }
    },
    performSubmit(validValues) {
      const { title, org_id, workflow_id, comment } = validValues
      const request_data = Object.fromEntries(
        Object.entries(validValues).filter(
          ([key]) => key.startsWith('apply_') || key === 'resource_description'
        )
      )
      return this.$axios
        .post('/api/v1/tickets/tickets/open/', {
          type: 'apply_asset',
          title,
          org_id,
          workflow_id,
          comment,
          request_data,
          ...(this.sourceTicket ? { source_ticket_id: this.sourceTicket.id } : {})
        })
        .then((ticket) => {
          this.submitted = true
          return ticket
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.reapply-notice {
  margin: 16px 0;

  p {
    margin: 4px 0;
  }
  .el-link {
    margin-left: 6px;
    vertical-align: baseline;
  }
}
</style>
