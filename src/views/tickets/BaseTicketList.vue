<template>
  <GenericListPage
    ref="ListPage"
    v-loading="loading"
    :get-drawer-title="getDrawerTitle"
    :create-drawer="createDrawer"
    :detail-drawer="detailDrawer"
    :header-actions="iTicketAction"
    :quick-filters="quickFilters"
    :table-config="ticketTableConfig"
  />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter, TagChoicesFormatter } from '@/components/Table/TableFormatters'
import { toSafeLocalDateStr } from '@/utils/common/time'
import { APPROVE, CLOSED, OPEN, REJECT } from './const'

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
      loading: true,
      getDrawerTitle: () => ' ',
      createDrawer: () => import('@/views/tickets/RequestAssetPerm/CreateUpdate'),
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
        columnsExclude: ['process_map', 'rel_snapshot', 'status'],
        columnsShow: {
          min: ['title', 'serial_num', 'type', 'state', 'date_created'],
          default: ['title', 'serial_num', 'type', 'state', 'date_created']
        },
        columnsMeta: {
          serial_num: {
            label: this.$t('Number'),
            sortable: 'custom'
          },
          title: {
            label: this.$t('Title'),
            formatter: DetailFormatter,
            sortable: 'custom',
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
                  action: 'detail', row: {}, col: {}, id: row.id
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
            sortable: 'custom',
            formatter: row => {
              return row['rel_snapshot'].applicant
            }
          },
          type: {
            label: this.$t('Type'),
            formatter: row => {
              return row.type.label
            }
          },
          state: {
            label: this.$t('State'),
            align: 'center',
            sortable: 'custom',
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
                return row.state.label || vm.$t('Pending')
              }
            }
          },
          date_created: {
            label: this.$t('Date'),
            sortable: 'custom',
            formatter: (row) => toSafeLocalDateStr(row.date_created)
          },
          actions: {
            has: this.$route.name !== 'AuditTicketList'
          }
        }
      },
      defaultTicketActions: {
        hasImport: false,
        hasMoreActions: false,
        hasLeftActions: true,
        canCreate: this.$hasPerm('tickets.view_ticket'),
        hasBulkDelete: false,
        searchConfig: {
          exclude: ['id', 'title', 'type', 'applicant'],
          options: [
            {
              value: 'id',
              label: 'ID'
            },
            {
              value: 'title',
              label: this.$t('Title')
            },
            {
              value: 'type',
              label: this.$t('Type'),
              type: 'choice',
              children: [
                {
                  value: 'apply_asset',
                  label: this.$t('ApplyAsset')
                },
                {
                  value: 'login_confirm',
                  label: this.$t('LoginConfirm')
                },
                {
                  value: 'command_confirm',
                  label: this.$t('CommandConfirm')
                },
                {
                  value: 'login_asset_confirm',
                  label: this.$t('LoginAssetConfirm')
                }
              ]
            },
            {
              value: 'applicant_username_name',
              label: this.$t('Applicant')
            },
            {
              value: 'relevant_asset',
              label: this.$t('RelevantAsset')
            },
            {
              value: 'relevant_command',
              label: this.$t('ApplyRunCommand')
            }
          ]
        },
        moreCreates: {},
        createTitle: this.$t('RequestTickets')
      }
    }
  },
  computed: {
    iTicketAction() {
      return Object.assign({}, this.defaultTicketActions, this.extraTicketAction)
    }
  },
  mounted() {
    setTimeout(() => {
      this.loading = false
    }, 500)
  },
  methods: {
    reloadTable() {
      this.$refs.ListPage.$refs.ListTable.$refs.ListTable.reloadTable()
    }
  }
}
</script>
