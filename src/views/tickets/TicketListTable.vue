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
            sortable: 'custom'
          },
          {
            prop: 'status',
            label: this.$t('tickets.status'),
            align: 'center',
            width: '100px',
            sortable: 'custom',
            formatter: row => {
              if (row.status === 'open') {
                return <i class='fa fa-check-circle-o text-primary'/>
              }
              return <i class='fa fa-times-circle-o text-danger'/>
            }
          },
          {
            prop: 'date_created',
            label: this.$t('tickets.date'),
            sortable: 'custom',
            formatter: (row) => toSafeLocalDateStr(row.date_created)
          }
        ]
      },
      ticketActions: {
        hasLeftActions: true,
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
        moreActionsTitle: this.$t('common.MoreActions'),
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
