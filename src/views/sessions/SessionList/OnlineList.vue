<template>
  <BaseList :url="url" :extra-actions="extraActions" />
</template>

<script>
import BaseList from './BaseList'
import { terminateSession, toggleLockSession } from '@/api/sessions'
import { IsSupportPauseSessionType } from '@/utils/jms'
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
          name: 'pause',
          title: this.$t('sessions.pause'),
          type: 'warning',
          can: ({ row }) => {
            const terminalType = row['terminal']['type']
            const isNormalSession = row['type']['value'] === 'normal'
            const supportedType = IsSupportPauseSessionType(terminalType) && isNormalSession
            return supportedType && vm.$hasPerm('terminal.terminate_session')
          },
          has: ({ row }) => !row['is_locked'],
          callback: function({ reload, row }) {
            const data = {
              'session_id': row.id,
              'task_name': 'lock_session'
            }
            toggleLockSession(data).then(res => {
              const msg = vm.$t('sessions.PauseTaskSendSuccessMsg')
              this.$message.success(msg)
              row['is_locked'] = !row['is_locked']
            }
            )
          }
        },
        {
          name: 'resume',
          title: this.$t('sessions.resume'),
          type: 'warning',
          can: ({ row }) => {
            const terminalType = row['terminal']['type']
            const isNormalSession = row['type']['value'] === 'normal'
            const supportedType = IsSupportPauseSessionType(terminalType) && isNormalSession
            return supportedType && vm.$hasPerm('terminal.terminate_session')
          },
          has: ({ row }) => row['is_locked'],
          callback: function({ reload, row }) {
            const data = {
              'session_id': row.id,
              'task_name': 'unlock_session'
            }
            toggleLockSession(data).then(res => {
              const msg = vm.$t('sessions.ResumeTaskSendSuccessMsg')
              this.$message.success(msg)
              row['is_locked'] = !row['is_locked']
            })
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
              return this.$t('sessions.RazorNotSupport')
            }
            return ''
          },
          callback: function({ row, tableData }) {
            const monitorUrl = '/luna/monitor/' + row.id
            window.open(monitorUrl, '_blank', 'height=600, width=850, top=400, left=400, toolbar=no, menubar=no, scrollbars=no, location=no, status=no')
          }
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>
