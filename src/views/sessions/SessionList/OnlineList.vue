<template>
  <BaseList
    :extra-actions="extraActions"
    :extra-more-actions="extraMoreActions"
    :url="url"
    :columns-meta="columnsMeta"
    :columns-exclude="columnsExclude"
  />
</template>

<script>
import BaseList from './BaseList'
import { terminateSession, toggleLockSession } from '@/api/sessions'
import { IsSupportPauseSessionType } from '@/utils/jms/index'

export default {
  name: 'OnlineList',
  components: {
    BaseList
  },
  data() {
    const vm = this
    return {
      url: '/api/v1/terminal/sessions/?is_finished=0',
      isTerminating: false,
      reloadTimer: null,
      extraMoreActions: [
        {
          name: 'terminateSelected',
          title: this.$t('TerminateSelected'),
          icon: 'fa-solid fa-stop',
          type: 'danger',
          can: ({ selectedRows }) => vm.canTerminateSessions(selectedRows),
          callback: ({ selectedRows, reloadTable }) =>
            vm.terminateSessions(selectedRows, reloadTable)
        }
      ],
      extraActions: [
        {
          name: 'terminate',
          title: this.$t('Terminate'),
          icon: 'fa-solid fa-stop',
          type: 'danger',
          can: ({ row }) => vm.canTerminateSessions([row]),
          callback: ({ reload, row }) => vm.terminateSessions([row], reload)
        },
        {
          name: 'pause',
          title: this.$t('Pause'),
          icon: 'fa-solid fa-pause',
          type: 'warning',
          can: ({ row }) => {
            const terminalType = row['terminal']['type']
            const isNormalSession = row['type']['value'] === 'normal'
            const supportedType = IsSupportPauseSessionType(terminalType) && isNormalSession
            return supportedType && vm.$hasPerm('terminal.terminate_session')
          },
          has: ({ row }) => !row['is_locked'],
          callback: function ({ reload, row }) {
            const data = {
              session_id: row.id,
              task_name: 'lock_session'
            }
            toggleLockSession(data).then((res) => {
              const msg = vm.$t('PauseTaskSendSuccessMsg')
              this.$message.success(msg)
              row['is_locked'] = !row['is_locked']
            })
          }
        },
        {
          name: 'resume',
          title: this.$t('Resume'),
          icon: 'fa-solid fa-unlock',
          type: 'warning',
          can: ({ row }) => {
            const terminalType = row['terminal']['type']
            const isNormalSession = row['type']['value'] === 'normal'
            const supportedType = IsSupportPauseSessionType(terminalType) && isNormalSession
            return supportedType && vm.$hasPerm('terminal.terminate_session')
          },
          has: ({ row }) => row['is_locked'],
          callback: function ({ reload, row }) {
            const data = {
              session_id: row.id,
              task_name: 'unlock_session'
            }
            toggleLockSession(data).then((res) => {
              const msg = vm.$t('ResumeTaskSendSuccessMsg')
              this.$message.success(msg)
              row['is_locked'] = !row['is_locked']
            })
          }
        },
        {
          name: 'join',
          title: this.$t('Monitor'),
          icon: 'fa-eye',
          type: 'primary',
          can: ({ row, cellValue }) => {
            return row['can_join'] && this.$hasPerm('terminal.monitor_session')
          },
          tip: ({ row }) => {
            if (row.login_from === 'RT') {
              return this.$t('RazorNotSupport')
            }
            return ''
          },
          callback: function ({ row, tableData }) {
            const monitorUrl = '/luna/monitor/' + row.id
            window.open(
              monitorUrl,
              '_blank',
              'height=600, width=850, top=400, left=400, toolbar=no, menubar=no, scrollbars=no, location=no, status=no'
            )
          }
        }
      ],
      columnsExclude: ['has_command'],
      columnsMeta: {
        command_amount: {
          label: this.$t('CommandsTotal')
        }
      }
    }
  },
  beforeUnmount() {
    window.clearTimeout(this.reloadTimer)
  },
  methods: {
    canTerminateSessions(rows) {
      return (
        !this.isTerminating &&
        this.$hasPerm('terminal.terminate_session') &&
        rows.length > 0 &&
        rows.every((row) => row.can_terminate)
      )
    },
    async terminateSessions(rows, reloadTable) {
      if (!this.canTerminateSessions(rows)) return
      const ids = rows.map((row) => row.id)
      this.isTerminating = true
      try {
        await this.$confirm(
          this.$t('TerminateSessionConfirmMsg', { count: ids.length }),
          this.$t('SessionTerminate'),
          {
            type: 'warning',
            confirmButtonText: this.$t('Terminate'),
            cancelButtonText: this.$t('Cancel'),
            confirmButtonClass: 'el-button--danger'
          }
        )
        const result = await terminateSession(ids)
        const accepted = new Set(result.ok)
        const count = ids.filter((id) => accepted.has(id)).length
        if (count === ids.length) {
          this.$message.success(this.$t('TerminateTaskSendSuccessMsg'))
        } else {
          this.$message.warning(
            this.$t('TerminateTaskSendPartialMsg', { count, total: ids.length })
          )
        }
        reloadTable()
        if (count > 0) {
          // Task dispatch is asynchronous; refresh again after a component heartbeat.
          window.clearTimeout(this.reloadTimer)
          this.reloadTimer = window.setTimeout(reloadTable, 50000)
        }
      } catch (error) {
        // HTTP errors are displayed by the request interceptor.
        if (error !== 'cancel' && error !== 'close' && !error?.response) {
          this.$message.error(error?.message || this.$t('ErrorMsg'))
        }
      } finally {
        this.isTerminating = false
      }
    }
  }
}
</script>
