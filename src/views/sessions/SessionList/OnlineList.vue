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
          can: (row, cellValue) => {
            return row.can_terminate
          },
          callback: function({ reload, cellValue, tableData }) {
            // 终断 session reload
            const data = [cellValue]
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
          can: (row, cellValue) => {
            return row.can_join
          },
          callback: function({ cellValue, tableData }) {
            // 跳转到luna页面
            const joinUrl = '/luna/join/?shareroom=' + cellValue
            window.open(joinUrl, 'height=600, width=800, top=400, left=400, toolbar=no, menubar=no, scrollbars=no, location=no, status=no')
          }
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>
