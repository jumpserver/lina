<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script type="text/jsx">
import ListTable from '@/components/ListTable'
import { timeOffset, toSafeLocalDateStr, getDaysAgo } from '@/utils/common'
import { ActionsFormatter } from '@/components/ListTable/formatters'
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
    const dateTo = now.toISOString()
    return {
      tableConfig: {
        url: this.url,
        columns: [
          'user', 'asset', 'system_user', 'remote_addr', 'protocol', 'login_from',
          'command_amount', 'date_start', 'duration', 'actions'
        ],
        columnsMeta: {
          index: {
            label: this.$t('sessions.id'),
            align: 'center',
            width: '60px',
            formatter: function(row, column, cellValue, index) {
              return <a class='detail el-link el-link--success is-underline' href= { '/terminal/sessions/' + row.id }>{ index + 1}</a>
            }
          },
          command_amount: {
            label: this.$t('sessions.command')
          },
          login_from: {
            label: this.$t('sessions.loginFrom')
          },
          protocol: {
            label: this.$t('sessions.protocol'),
            formatter: null
          },
          date_start: {
            formatter: function(row) {
              return toSafeLocalDateStr(row.date_start)
            }
          },
          duration: {
            label: this.$t('sessions.duration'),
            formatter: function(row) {
              return timeOffset(row.date_start, row.date_end)
            }
          },
          actions: {
            prop: 'id',
            label: this.$t('common.Actions'),
            formatter: ActionsFormatter,
            formatterArgs: {
              hasEdit: false,
              hasDelete: false,
              hasUpdate: false,
              extraActions: [
                {
                  name: 'replay',
                  title: this.$t('sessions.replay'),
                  type: 'warning',
                  callback: function({ cellValue, tableData }) {
                    // 跳转到luna页面
                    const replayUrl = '/luna/replay/' + cellValue
                    window.open(replayUrl)
                  }
                },
                {
                  name: 'download',
                  title: this.$t('sessions.download'),
                  type: 'primary',
                  callback: function({ cellValue, tableData }) {
                    // 跳转下载页面
                    const downloadUrl = '/terminal/session/00000000-0000-0000-0000-000000000000/replay/download/'
                      .replace('00000000-0000-0000-0000-000000000000', cellValue)
                    window.open(downloadUrl)
                  }
                }
              ]
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
          dateStart: dateTo,
          dateEnd: dateFrom
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
