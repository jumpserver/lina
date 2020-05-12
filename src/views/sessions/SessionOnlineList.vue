<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { toSafeLocalDateStr } from '@/utils/common'
import { terminateSession } from '@/api/sessions'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/terminal/sessions/?is_finished=0',
        columns: [
          'index', 'user', 'asset', 'system_user', 'remote_addr', 'protocol', 'login_from',
          'command_amount', 'date_start', 'duration', 'actions'
        ],
        columnsMeta: {
          index: {
            label: this.$t('sessions.id'),
            formatter: function(row, column, cellValue, index) {
              return <a class='detail el-link el-link--success is-underline' href= { '/terminal/sessions/' + row.id }>{ index + 1}</a>
            }
          },
          command_amount: {
            label: this.$t('sessions.command')
          },
          login_from: {
            label: this.$t('sessions.loginForm')
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
            formatter: null
          },
          actions: {
            prop: 'id',
            hasEdit: false,
            hasDelete: false,
            hasUpdate: false,
            extraActions: [
              {
                name: 'terminate',
                title: this.$t('sessions.terminate'),
                type: 'danger',
                callback: function({ reload, cellValue, tableData }) {
                  // 终断 session reload
                  const data = [cellValue]
                  terminateSession(data).then(res => {
                    window.setTimeout(function() {
                      reload()
                    }, 50000)
                  }
                  )
                }
              },
              {
                name: 'join',
                title: this.$t('sessions.join'),
                type: 'primary',
                callback: function({ cellValue, tableData }) {
                  // 跳转到luna页面
                  const joinUrl = '/luna/join/?shareroom=' + cellValue
                  window.open(joinUrl, 'height=600, width=800, top=400, left=400, toolbar=no, menubar=no, scrollbars=no, location=no, status=no')
                }
              }
            ]
          }
        }
      },
      headerActions: {
        hasCreate: false,
        hasBulkDelete: false
      }
    }
  }
}
</script>

<style>

</style>
