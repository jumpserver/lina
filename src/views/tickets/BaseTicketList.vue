<template>
  <GenericListPage
    v-loading="loading"
    :table-config="ticketTableConfig"
    :header-actions="ticketActions"
  />
</template>

<script type="text/jsx">
import { GenericListPage } from '@/layout/components'
import { DetailFormatter } from '@/components/TableFormatters'
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
    }
  },
  data() {
    return {
      loading: true,
      ticketTableConfig: {
        url: this.url,
        columns: [
          {
            prop: 'serial_num',
            label: this.$t('common.Number'),
            sortable: 'custom'
          },
          {
            prop: 'title',
            label: this.$t('tickets.title'),
            formatter: DetailFormatter,
            sortable: 'custom',
            formatterArgs: {
              getRoute: function({ row }) {
                if (row.type === 'apply_asset') {
                  return 'AssetsTicketDetail'
                } else if (row.type === 'apply_application') {
                  return 'AppsTicketDetail'
                } else if (row.type === 'login_asset_confirm') {
                  return 'LoginAssetTicketDetail'
                } else if (row.type === 'login_confirm') {
                  return 'LoginTicketDetail'
                } else if (row.type === 'command_confirm') {
                  return 'CommandConfirmDetail'
                } else {
                  return 'TicketDetail'
                }
              }
            }
          },
          {
            prop: 'applicant',
            label: this.$t('tickets.user'),
            sortable: 'custom',
            formatter: row => {
              return row.rel_snapshot.applicant
            }
          },
          {
            prop: 'type_display',
            label: this.$t('tickets.type'),
            width: '160px'
          },
          {
            prop: 'status',
            label: this.$t('tickets.status'),
            align: 'center',
            width: '90px',
            sortable: 'custom',
            formatter: row => {
              if (row.status === 'open') {
                return <el-tag type='primary' size='mini'> { this.$t('tickets.OpenStatus') }</el-tag>
              } else {
                return <el-tag type='danger' size='mini'>  { this.$t('tickets.CloseStatus') }</el-tag>
              }
            }
          },
          {
            prop: 'state',
            label: this.$t('tickets.action'),
            align: 'center',
            width: '90px',
            sortable: 'custom',
            formatter: row => {
              if (row.status === 'open') {
                return <el-tag
                  type='success'
                  size='mini'
                >
                  { this.$t('tickets.Pending') }
                </el-tag>
              }
              switch (row.state) {
                case 'approved':
                  return <el-tag type='primary' size='mini'>
                    { this.$t('tickets.Approved') }
                  </el-tag>
                case 'rejected':
                  return <el-tag type='danger' size='mini'>
                    { this.$t('tickets.Rejected') }
                  </el-tag>
                default :
                  return <el-tag type='info' size='mini'>
                    { this.$t('tickets.Closed') }
                  </el-tag>
              }
            }
          },
          {
            prop: 'date_created',
            label: this.$t('tickets.date'),
            sortable: 'custom',
            formatter: (row) => toSafeLocalDateStr(row.date_created),
            width: '160px'
          }
        ]
      },
      ticketActions: {
        hasLeftActions: this.hasMoreActions,
        hasRightActions: false,
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
          exclude: ['state', 'id', 'title'],
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
            },
            {
              name: 'RequestApplicationPerm',
              title: this.$t('tickets.RequestApplicationPerm'),
              callback: () => this.$router.push({
                name: 'RequestApplicationPermTicketCreateUpdate'
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
  methods: {
  }
}
</script>

<style scoped>

</style>
