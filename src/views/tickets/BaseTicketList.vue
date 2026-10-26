<template>
  <div class="ticket-list-page">
    <GenericListPage
      ref="ListPage"
      activation-refresh="always"
      :get-drawer-title="getDrawerTitle"
      :detail-drawer="detailDrawer"
      :header-actions="iTicketAction"
      :quick-filters="quickFilters"
      :table-config="ticketTableConfig"
    >
      <template #tableBefore>
        <slot name="tableBefore" />
      </template>
    </GenericListPage>
  </div>
</template>

<script>
import { getTicketDetailRoute } from './plugins/registry'
import { GenericListPage } from '@/layout/components'
import {
  ActionsFormatter,
  DetailFormatter,
  TagChoicesFormatter
} from '@/components/Table/TableFormatters'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import {
  APPROVE,
  CLOSED,
  OPEN,
  REJECT,
  TICKET_TYPE_I18N_KEYS,
  getTicketStateLabel,
  getTicketTypeLabel
} from './const'

export default {
  name: 'TicketListTable',
  components: {
    GenericListPage
  },
  props: {
    pendingOnly: { type: Boolean, default: false },
    url: {
      type: String,
      default: '/api/v1/tickets/tickets/'
    },
    extraTicketAction: {
      type: Object,
      default: () => ({})
    },
    extraQuery: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const vm = this
    return {
      getDrawerTitle: () => ' ',
      ticketTypes: Object.keys(TICKET_TYPE_I18N_KEYS).map((type) => ({
        label: getTicketTypeLabel({ value: type }, this.$t),
        filter: { type }
      })),
      detailDrawer: null,
      ticketTableConfig: {
        url: this.url,
        extraQuery: this.extraQuery,
        columnsExclude: [
          'process_map',
          'rel_snapshot',
          'cc_users',
          'my_tasks',
          'workflow_instance',
          'request_data',
          'request_items',
          'execution_mode',
          'result',
          'source_ticket',
          'reapply_action',
          'approval_step'
        ],
        columnsShow: {
          min: ['title', 'serial_num', 'type', 'state', 'date_created', 'actions'],
          default: ['title', 'serial_num', 'type', 'org_name', 'state', 'date_created', 'actions']
        },
        columnsMeta: {
          org_name: {
            label: this.$t('Organization')
          },
          serial_num: {
            label: this.$t('Number')
          },
          title: {
            label: this.$t('Title'),
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: true,
              getRoute: ({ row }) => {
                const type = row.type.value
                this.$store.dispatch('common/setDrawerActionMeta', {
                  action: 'detail',
                  row: {},
                  col: {},
                  id: row.id
                })

                return {
                  name: getTicketDetailRoute(type),
                  params: { id: row.id }
                }
              }
            }
          },
          applicant: {
            label: this.$t('Applicant'),
            formatter: (row) => {
              return row['rel_snapshot'].applicant
            }
          },
          type: {
            label: this.$t('Type'),
            formatter: (row) => {
              return getTicketTypeLabel(row.type, vm.$t)
            }
          },
          status: {
            align: 'center',
            formatter: TagChoicesFormatter,
            formatterArgs: {
              getTagLabel({ row }) {
                return row.status.label
              },
              getTagType({ row }) {
                if (row.status.value === 'open') {
                  return 'primary'
                } else {
                  return 'danger'
                }
              }
            }
          },
          state: {
            label: this.$t('TicketApprovalStatus'),
            align: 'center',
            formatter: TagChoicesFormatter,
            formatterArgs: {
              getTagType({ row }) {
                const mapper = {
                  [OPEN]: 'success',
                  [APPROVE]: 'primary',
                  [REJECT]: 'danger',
                  [CLOSED]: 'info'
                }
                return mapper[row.state.value] || 'warning'
              },
              getTagLabel({ row }) {
                if (row.state.value === 'pending') return vm.$t('TicketPendingApproval')
                if (row.state.value === 'approved') return vm.$t('TicketApprovalApproved')
                return getTicketStateLabel(row.state, vm.$t)
              }
            }
          },
          date_created: {
            label: this.$t('Date'),
            formatter: (row) => toSafeLocalDateStr(row.date_created)
          },
          actions: {
            has: this.$route.name !== 'AuditTicketList',
            width: '80px',
            align: 'center',
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'reapply',
                  icon: 'fa-solid fa-rotate',
                  type: 'primary',
                  has: true,
                  can: ({ row }) => ['renew', 'reapply'].includes(row.reapply_action),
                  title: ({ row }) =>
                    this.$t(
                      row.reapply_action === 'renew' ? 'TicketApplyRenewal' : 'TicketReapply'
                    ),
                  callback: ({ row }) =>
                    this.$router.push({
                      name: 'RequestAssetPermTicketCreateUpdate',
                      query: { source_ticket: row.id, oid: row.org_id }
                    })
                }
              ]
            }
          }
        }
      },
      defaultTicketActions: {
        searchConfig: { excludeFields: ['type', 'state', 'status'] },
        hasImport: false,
        hasReportExport: true,
        hasMoreActions: false,
        hasLeftActions: true,
        canCreate: this.$hasPerm('tickets.view_ticket'),
        hasBulkDelete: false,
        createTitle: this.$t('RequestTickets')
      }
    }
  },
  computed: {
    quickFilters() {
      const filters = [
        {
          label: this.$t('Type'),
          options: [
            { label: this.$t('All'), filter: { type: '' }, active: true },
            ...this.ticketTypes
          ]
        }
      ]
      if (!this.pendingOnly) {
        filters.push({
          label: this.$t('TicketApprovalStatus'),
          options: [
            { label: this.$t('All'), filter: { state: 'all', status: '' }, active: true },
            { label: this.$t('TicketPendingApproval'), filter: { state: 'pending', status: '' } },
            {
              label: this.$t('TicketApprovalFinished'),
              filter: { state: 'all', status: 'closed' }
            },
            { label: this.$t('TicketApprovalApproved'), filter: { state: 'approved', status: '' } },
            { label: this.$t('Rejected'), filter: { state: 'rejected', status: '' } },
            { label: this.$t('StateClosed'), filter: { state: 'closed', status: '' } },
            { label: this.$t('WFExpired'), filter: { state: 'expired', status: '' } },
            { label: this.$t('WFError'), filter: { state: 'error', status: '' } }
          ]
        })
      }
      return filters
    },
    iTicketAction() {
      return Object.assign({}, this.defaultTicketActions, this.extraTicketAction)
    }
  },
  watch: {
    url(url) {
      this.$refs.ListPage?.$refs.ListTable?.$refs.ListTable?.dataTable?.$refs.table?.clearSelection()
      this.ticketTableConfig.url = url
    }
  },
  mounted() {
    this.loadTypes()
  },
  methods: {
    async loadTypes() {
      try {
        const types = await this.$axios.get('/api/v1/tickets/ticket-types/')
        this.ticketTypes = types.map((type) => ({
          label: getTicketTypeLabel({ value: type.type, label: type.label }, this.$t),
          filter: { type: type.type }
        }))
      } catch {
        // The request layer reports errors; keep the built-in types available.
      }
    },
    reloadTable() {
      this.$refs.ListPage.$refs.ListTable.$refs.ListTable.reloadTable()
    }
  }
}
</script>

<style scoped lang="scss">
.ticket-list-page :deep(.quick-filter .quick-filter-wrap .quick-filter-zone .item) {
  min-height: 26px;
  margin-right: 6px;
  padding: 2px 6px;
  border-radius: 3px;
  line-height: 22px;

  &::after {
    display: none;
  }

  &.active {
    color: var(--el-color-primary);
    background-color: var(--el-color-primary-light-9);
    text-decoration: none;
  }
}
</style>
