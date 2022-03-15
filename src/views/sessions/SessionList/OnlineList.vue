<template>
  <BaseList :url="url" :extra-actions="extraActions" />
</template>

<script>
import BaseList from './BaseList'
import { terminateSession } from '@/api/sessions'
export default {
  name: 'OnlineList',
  components: {
    BaseList
  },
  data() {
    const vm = this
    return {
      url: '/api/v1/terminal/sessions/?is_finished=0',
      extraActions: [
        {
          name: 'terminate',
          title: this.$t('sessions.terminate'),
          type: 'danger',
          can: ({ row }) => row['can_terminate'] && vm.$hasPerm('terminal.terminate_session'),
          callback: function({ reload, row }) {
            // 终断 session reload
            const data = [row.id]
            terminateSession(data).then(res => {
              const msg = vm.$t('sessions.TerminateTaskSendSuccessMsg')
              this.$message.success(msg)
              window.setTimeout(function() {
                reload()
              }, 50000)
            }
            )
          }
        },
        {
          name: 'join',
          title: this.$t('sessions.Monitor'),
          type: 'primary',
          can: ({ row, cellValue }) => {
            return row['can_join'] && this.$hasPerm('terminal.monitor_session')
          },
          tip: ({ row }) => {
            if (row.login_from === 'RT') {
              return this.$t('sessions.XRDPNotSupport')
            }
            return ''
          },
          callback: function({ row, tableData }) {
            const monitorUrl = '/luna/monitor/' + row.id
            window.open(monitorUrl, '_blank', 'height=600, width=800, top=400, left=400, toolbar=no, menubar=no, scrollbars=no, location=no, status=no')
          }
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>
