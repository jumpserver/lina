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
      ticketTableConfig: {
        url: this.url,
        extraQuery: this.extraQuery,
        columnsExclude: ['process_map', 'rel_snapshot'],
        columnsShow: {
          min: ['title', 'serial_num', 'type', 'state', 'date_created'],
          default: ['title', 'serial_num', 'type', 'state', 'date_created']
        },
        columnsMeta: {
          serial_num: {
            label: this.$t('common.Number'),
            sortable: 'custom'
          },
          title: {
            label: this.$t('tickets.title'),
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
            label: this.$t('tickets.Applicant'),
            sortable: 'custom',
            formatter: row => {
              return row['rel_snapshot'].applicant
            }
          },
          type: {
            label: this.$t('tickets.type'),
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
            align: 'center',
            width: '90px',
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
                return row.state.label || vm.$t('common.Pending')
              }
            }
          },
          date_created: {
            label: this.$t('tickets.date'),
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
          exclude: ['id', 'title', 'type', 'applicant'],
          options: [
            {
              value: 'id',
              label: 'ID'
            },
            {
              value: 'title',
              label: this.$t('tickets.title')
            },
            {
              value: 'type',
              label: this.$t('assets.Type'),
              type: 'choice',
              children: [
                {
                  value: 'apply_asset',
                  label: this.$t('tickets.ApplyAsset')
                },
                {
                  value: 'login_confirm',
                  label: this.$t('tickets.LoginConfirm')
                },
                {
                  value: 'command_confirm',
                  label: this.$t('tickets.CommandConfirm')
                },
                {
                  value: 'login_asset_confirm',
                  label: this.$t('tickets.LoginAssetConfirm')
                }
              ]
            },
            {
              value: 'applicant_username_name',
              label: this.$t('tickets.Applicant')
            },
            {
              value: 'relevant_asset',
              label: this.$t('tickets.RelevantAsset')
            },
            {
              value: 'relevant_command',
              label: this.$t('tickets.RelevantSystemUser')
            }
          ]
        },
        createTitle: this.$t('common.RequestTickets')
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
