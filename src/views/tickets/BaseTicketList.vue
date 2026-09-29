<template>
  <div>
    <GenericListPage
      ref="ListPage"
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
import { GenericListPage } from '@/layout/components'
import { DetailFormatter, TagChoicesFormatter } from '@/components/Table/TableFormatters'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { APPROVE, CLOSED, OPEN, REJECT, getTicketStateLabel, getTicketTypeLabel } from './const'

export default {
  name: 'TicketListTable',
  components: {
    GenericListPage
  },
  props: {
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
      quickFilters: [
        {
          label: this.$t('Type'),
          options: [
            {
              label: this.$t('ApplyAsset'),
              filter: {
                type: 'apply_asset'
              }
            },
            {
              label: this.$t('LoginConfirm'),
              filter: {
                type: 'login_confirm'
              }
            },
            {
              label: this.$t('CommandConfirm'),
              filter: {
                type: 'command_confirm'
              }
            },
            {
              label: this.$t('LoginAssetConfirm'),
              filter: {
                type: 'login_asset_confirm'
              }
            }
          ]
        },
        {
          label: this.$t('State'),
          options: [
            {
              label: this.$t('All'),
              filter: {
                state: 'all'
              }
            },
            {
              label: this.$t('Open'),
              filter: {
                state: 'pending'
              }
            },
            {
              label: this.$t('Cancel'),
              filter: {
                state: 'closed'
              }
            },
            {
              label: this.$t('Approved'),
              filter: {
                state: 'approved'
              }
            },
            {
              label: this.$t('Rejected'),
              filter: {
                state: 'rejected'
              }
            }
          ]
        }
      ],
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
          'available_actions',
          'secret_access_status',
          'approval_step'
        ],
        columnsShow: {
          min: ['title', 'serial_num', 'type', 'state', 'date_created'],
          default: ['title', 'serial_num', 'type', 'org_name', 'state', 'date_created']
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
                const routeMap = {
                  apply_asset: 'AssetsTicketDetail',
                  login_asset_confirm: 'LoginAssetTicketDetail',
                  login_confirm: 'LoginTicketDetail',
                  command_confirm: 'CommandConfirmDetail'
                }

                this.$store.dispatch('common/setDrawerActionMeta', {
                  action: 'detail',
                  row: {},
                  col: {},
                  id: row.id
                })

                return {
                  name: routeMap[type] || 'TicketDetail',
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
            label: this.$t('State'),
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
                return getTicketStateLabel(row.state, vm.$t) || vm.$t('Pending')
              }
            }
          },
          date_created: {
            label: this.$t('Date'),
            formatter: (row) => toSafeLocalDateStr(row.date_created)
          },
          actions: {
            has: this.$route.name !== 'AuditTicketList'
          }
        }
      },
      defaultTicketActions: {
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
    this.$axios.get('/api/v1/tickets/ticket-types/').then((types) => {
      this.quickFilters[0].options = types.map((type) => ({
        label: getTicketTypeLabel({ value: type.type, label: type.label }, this.$t),
        filter: { type: type.type }
      }))
    })
  },
  methods: {
    reloadTable() {
      this.$refs.ListPage.$refs.ListTable.$refs.ListTable.reloadTable()
    }
  }
}
</script>
