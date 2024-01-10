<template>
  <GenericListPage
    ref="ListPage"
    v-loading="loading"
    :header-actions="iTicketAction"
    :table-config="ticketTableConfig"
  />
</template>

<script type="text/jsx">
import { GenericListPage } from '@/layout/components'
import { DetailFormatter, TagChoicesFormatter } from '@/components/Table/TableFormatters'
import { toSafeLocalDateStr } from '@/utils/common'
import { APPROVE, REJECT } from './const'

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
      ticketTableConfig: {
        url: this.url,
        extraQuery: this.extraQuery,
        columnsExclude: ['process_map', 'rel_snapshot'],
        columnsShow: {
          min: ['title', 'serial_num', 'type', 'state', 'date_created'],
          default: ['title', 'serial_num', 'type', 'state', 'status', 'date_created']
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
              getRoute: function({ row }) {
                const type = row.type.value
                if (type === 'apply_asset') {
                  return 'AssetsTicketDetail'
                } else if (type === 'login_asset_confirm') {
                  return 'LoginAssetTicketDetail'
                } else if (type === 'login_confirm') {
                  return 'LoginTicketDetail'
                } else if (type === 'command_confirm') {
                  return 'CommandConfirmDetail'
                } else {
                  return 'TicketDetail'
                }
              }
            }
          },
          applicant: {
            label: this.$t('User'),
            sortable: 'custom',
            formatter: row => {
              return row['rel_snapshot'].applicant
            }
          },
          type: {
            label: this.$t('Type'),
            width: '160px',
            formatter: row => {
              return row.type.label
            }
          },
          status: {
            align: 'center',
            width: '90px',
            sortable: 'custom',
            formatter: TagChoicesFormatter,
            formatterArgs: {
              getTagLabel({ row }) {
                if (row.status.value === 'open') {
                  return vm.$t('OpenStatus')
                } else {
                  return vm.$t('CloseStatus')
                }
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
            label: this.$t('Action'),
            align: 'center',
            width: '90px',
            sortable: 'custom',
            formatter: TagChoicesFormatter,
            formatterArgs: {
              getTagType({ row }) {
                const mapper = {
                  [APPROVE]: 'success',
                  [REJECT]: 'danger'
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
            formatter: (row) => toSafeLocalDateStr(row.date_created),
            width: '160px'
          }
        }
      },
      defaultTicketActions: {
        hasExport: false,
        hasMoreActions: false,
        hasLeftActions: true,
        canCreate: this.$hasPerm('tickets.view_ticket'),
        hasBulkDelete: false,
        searchConfig: {
          default: {
            state: {
              key: 'state',
              label: this.$t('Action'),
              value: 'pending',
              valueLabel: this.$t('Pending')
            }
          },
          exclude: ['state', 'id', 'title', 'type'],
          options: [
            {
              value: 'state',
              label: this.$t('Action'),
              type: 'choice',
              children: [
                {
                  default: true,
                  value: 'pending',
                  label: this.$t('Pending')
                },
                {
                  value: APPROVE,
                  label: this.$t('Approved')
                },
                {
                  value: REJECT,
                  label: this.$t('Rejected')
                }
              ]
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
              value: 'id',
              label: 'ID'
            },
            {
              value: 'title',
              label: this.$t('Title')
            },
            {
              value: 'relevant_app',
              label: this.$t('RelevantApp')
            },
            {
              value: 'relevant_asset',
              label: this.$t('RelevantAsset')
            },
            {
              value: 'relevant_system_user',
              label: this.$t('RelevantCommand')
            },
            {
              value: 'relevant_command',
              label: this.$t('RelevantSystemUser')
            }
          ]
        },
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

<style scoped>

</style>
