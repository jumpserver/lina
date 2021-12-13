<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script type="text/jsx">
import ListTable from '@/components/ListTable'
import { timeOffset, getDaysAgo, getDayEnd } from '@/utils/common'
import { ActionsFormatter } from '@/components/TableFormatters'
export default {
  name: 'BaseList',
  components: {
    ListTable
  },
  props: {
    url: {
      type: String,
      default: () => '/api/v1/terminal/sessions/'
    },
    extraActions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    const now = new Date()
    const dateFrom = getDaysAgo(2, now).toISOString()
    const dateTo = getDayEnd(now).toISOString()
    return {
      tableConfig: {
        url: this.url,
        columns: [
          'index', 'user', 'asset', 'system_user', 'remote_addr', 'protocol', 'login_from',
          'command_amount', 'date_start', 'date_end', 'duration',
          'org_name', 'actions'
        ],
        columnsShow: {
          min: ['index', 'actions'],
          default: [
            'index', 'user', 'asset', 'system_user', 'remote_addr', 'protocol', 'login_from',
            'command_amount', 'date_start', 'duration', 'actions'
          ]
        },
        columnsMeta: {
          index: {
            prop: 'index',
            label: this.$t('sessions.id'),
            align: 'center',
            width: '40px',
            formatter: function(row, column, cellValue, index) {
              const label = index + 1
              const route = { to: { name: 'SessionDetail', params: { id: row.id }}}
              return <router-link {...{ attrs: route }}>{ label }</router-link>
            }
          },
          user: {
            showOverflowTooltip: true
          },
          asset: {
            label: this.$t('sessions.target'),
            showOverflowTooltip: true
          },
          command_amount: {
            label: this.$t('sessions.command'),
            width: '90px'
          },
          system_user: {
            showOverflowTooltip: true,
            width: '100px'
          },
          login_from: {
            label: this.$t('sessions.loginFrom'),
            width: '115px',
            showOverflowTooltip: true
          },
          remote_addr: {
            width: '140px'
          },
          protocol: {
            label: this.$t('sessions.protocol'),
            width: '80px',
            sortable: false,
            formatter: null
          },
          date_start: {
            width: '100px'
          },
          date_end: {
            width: '100px'
          },
          duration: {
            label: this.$t('sessions.duration'),
            formatter: function(row) {
              return timeOffset(row.date_start, row.date_end)
            },
            width: '80px'
          },
          actions: {
            prop: 'actions',
            label: this.$t('common.Actions'),
            width: '160px',
            formatter: ActionsFormatter,
            formatterArgs: {
              hasEdit: false,
              hasClone: false,
              hasDelete: false,
              hasUpdate: false,
              extraActions: this.extraActions
            }
          }
        },
        extraQuery: {
          date_to: dateTo,
          date_from: dateFrom
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasDatePicker: true,
        datePicker: {
          dateEnd: dateTo,
          dateStart: dateFrom
        },
        searchConfig: {
          getUrlQuery: false
        }
      }
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
