<template>
  <ListTable :table-config="ticketTableConfig" :header-actions="ticketActions" />
</template>
<script type="text/jsx">
import ListTable from '@/components/ListTable'
import { DetailFormatter } from '@/components/ListTable/formatters'
import { toSafeLocalDateStr } from '@/utils/common'
export default {
  name: 'TicketListTable',
  components: {
    ListTable
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
      ticketTableConfig: {
        url: this.url,
        columns: [
          {
            prop: 'title',
            label: this.$t('tickets.title'),
            formatter: DetailFormatter,
            sortable: 'custom',
            formatterArgs: {
              getRoute: function({ row }) {
                if (row.type === 'request_asset') {
                  return 'AssetsTicketDetail'
                } else {
                  return 'TicketDetail'
                }
              }
            }
          },
          {
            prop: 'user_display',
            label: this.$t('tickets.user'),
            sortable: 'custom'
          },
          {
            prop: 'type_display',
            label: this.$t('tickets.type'),
            width: '110px'
          },
          {
            prop: 'status',
            label: this.$t('tickets.status'),
            align: 'center',
            width: '90px',
            sortable: 'custom',
            formatter: row => {
              if (row.status === 'open') {
                return <el-tag type='success' size='mini'style='align-items:center; display: flex; justify-content:center;'> { this.$t('tickets.Pending') }</el-tag>
              }
              if (row.status === 'closed') {
                return <el-tag type='info' size='mini' style='align-items:center; display: flex; justify-content:center;'> { this.$t('tickets.Closed') }</el-tag>
              }
              switch (row.action) {
                case 'approve':
                  return <el-tag type='primary' size='mini' style='align-items:center; display: flex; justify-content:center;'> { this.$t('tickets.Approved') }</el-tag>
                case 'reject':
                  return <el-tag type='danger' size='mini' style='align-items:center; display: flex; justify-content:center;'> { this.$t('tickets.Rejected') }</el-tag>
                case '':
                  return <el-tag type='info' size='mini' style='align-items:center; display: flex; justify-content:center;'> { this.$t('tickets.Closed') }</el-tag>
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
        hasCreate: false,
        hasBulkDelete: false,
        searchConfig: {
          default: {
            status: {
              key: 'status',
              label: this.$t('tickets.Status'),
              value: 'open',
              valueLabel: this.$t('tickets.Open')
            }
          }
        },
        moreActionsTitle: this.$t('common.RequestTickets'),
        moreActionsType: 'primary',
        extraMoreActions: this.genExtraMoreActions()
      }
    }
  },
  methods: {
    genExtraMoreActions() {
      return [
        {
          name: '',
          title: this.$t('tickets.RequestAssetPerm'),
          type: 'primary',
          can: true,
          callback: this.onCallback
        }
      ]
    },
    onCallback() {
      this.$router.push({ name: 'RequestAssetPermTicketCreateUpdate' })
    }
  }
}
</script>

<style scoped>

</style>
