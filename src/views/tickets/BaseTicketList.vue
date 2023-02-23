<template>
  <GenericListPage
    v-loading="loading"
    :header-actions="ticketActions"
    :table-config="ticketTableConfig"
  />
</template>

<script type="text/jsx">
import { GenericListPage } from '@/layout/components'
import { DetailFormatter, TagChoicesFormatter } from '@/components/TableFormatters'
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
    hasMoreActions: {
      type: Boolean,
      default: false
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
            label: this.$t('tickets.user'),
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
                if (row.status.value === 'open') {
                  return vm.$t('tickets.OpenStatus')
                } else {
                  return vm.$t('tickets.CloseStatus')
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
            label: this.$t('tickets.action'),
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
      ticketActions: {
        hasExport: false,
        hasLeftActions: this.hasMoreActions,
        canCreate: this.$hasPerm('tickets.view_ticket'),
        hasBulkDelete: false,
        searchConfig: {
          default: {
            state: {
              key: 'state',
              label: this.$t('tickets.action'),
              value: 'pending',
              valueLabel: this.$t('tickets.Pending')
            }
          },
          exclude: ['state', 'id', 'title', 'type'],
          options: [
            {
              value: 'state',
              label: this.$t('tickets.action'),
              type: 'choice',
              children: [
                {
                  default: true,
                  value: 'pending',
                  label: this.$t('tickets.Pending')
                },
                {
                  value: APPROVE,
                  label: this.$t('tickets.Approved')
                },
                {
                  value: REJECT,
                  label: this.$t('tickets.Rejected')
                }
              ]
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
              value: 'id',
              label: 'ID'
            },
            {
              value: 'title',
              label: this.$t('tickets.title')
            },
            {
              value: 'relevant_app',
              label: this.$t('tickets.RelevantApp')
            },
            {
              value: 'relevant_asset',
              label: this.$t('tickets.RelevantAsset')
            },
            {
              value: 'relevant_system_user',
              label: this.$t('tickets.RelevantCommand')
            },
            {
              value: 'relevant_command',
              label: this.$t('tickets.RelevantSystemUser')
            }
          ]
        },
        createTitle: this.$t('common.RequestTickets'),
        hasMoreActions: false,
        moreCreates: {
          dropdown: [
            {
              name: 'RequestAssetPerm',
              title: this.$t('tickets.RequestAssetPerm'),
              callback: () => this.$router.push({
                name: 'RequestAssetPermTicketCreateUpdate'
              })
            }
          ]
        }
      }
    }
  },
  mounted() {
    setTimeout(() => {
      this.loading = false
    }, 500)
  },
  methods: {}
}
</script>

<style scoped>

</style>
