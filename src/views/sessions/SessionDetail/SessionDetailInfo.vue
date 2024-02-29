<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard v-if="object" :items="detailItems" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions v-if="object" :actions="quickActions" type="primary" />
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/Cards/DetailCard/index'
import QuickActions from '@/components/QuickActions'
import { terminateSession } from '@/api/sessions'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'SessionDetailInfo',
  components: {
    DetailCard,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      session: this.object
    }
  },
  computed: {
    onlineSessionActions() {
      const vm = this
      return [
        {
          title: this.$t('sessions.sessionTerminate'),
          attrs: {
            type: 'danger',
            label: this.$t('sessions.terminate'),
            disabled: !this.session['can_terminate'] || !vm.$hasPerm('terminal.terminate_session')
          },
          callbacks: {
            click: function() {
              // 终断 session reload
              terminateSession(vm.session.id).then(res => {
                const msg = vm.$t('sessions.TerminateTaskSendSuccessMsg')
                vm.$message.success(msg)
                window.setTimeout(function() {
                  window.location.reload()
                }, 50000)
              })
            }
          }
        },
        {
          title: this.$t('sessions.sessionMonitor'),
          attrs: {
            type: 'primary',
            label: this.$t('sessions.Monitor'),
            disabled: !this.session['can_join'] || !vm.$hasPerm('terminal.monitor_session') ||
                vm.session.type.value === 'sftp'
          },
          callbacks: {
            click: function() {
              // 跳转到luna页面
              const joinUrl = '/luna/monitor/' + vm.session.id
              window.open(joinUrl, 'height=600, width=800, top=400, left=400, toolbar=no, menubar=no, scrollbars=no, location=no, status=no')
            }
          }
        }
      ]
    },
    offlineSessionActions() {
      const vm = this
      return [
        {
          title: this.$t('sessions.replaySession'),
          attrs: {
            type: 'primary',
            label: this.$t('sessions.replay'),
            disabled: !this.session['can_replay'] || !vm.$hasPerm('terminal.view_sessionreplay')
          },
          callbacks: {
            click: function() {
              const replayUrl = '/luna/replay/' + vm.session.id
              window.open(replayUrl)
            }
          }
        },
        {
          title: this.$t('sessions.downloadReplay'),
          attrs: {
            type: 'primary',
            label: this.$t('sessions.download'),
            disabled: !this.session['can_replay'] || !vm.$hasPerm('terminal.download_sessionreplay')
          },
          callbacks: {
            click: function() {
              const oid = vm.session.org_id || ''
              const downloadUrl = `/api/v1/terminal/sessions/${vm.session.id}/replay/download/${oid ? '?oid=' + oid : ''}`
              window.open(downloadUrl)
            }
          }
        }
      ]
    },
    detailItems() {
      return [
        {
          key: this.$t('sessions.user'),
          value: this.session.user
        },
        {
          key: this.$t('sessions.host'),
          value: this.session.asset
        },
        {
          key: this.$t('assets.Account'),
          value: this.session.account

        },
        {
          key: this.$t('sessions.protocol'),
          value: this.session.protocol
        },
        {
          key: this.$t('sessions.loginFrom'),
          value: this.session.login_from?.label || '-'
        },
        {
          key: this.$t('sessions.remoteAddr'),
          value: this.session.remote_addr
        },
        {
          key: this.$t('common.DateStart'),
          value: toSafeLocalDateStr(this.session.date_start)
        },
        {
          key: this.$t('sessions.dateEnd'),
          value: this.session.date_end ? toSafeLocalDateStr(this.session.date_end) : ''
        }
      ]
    },
    quickActions() {
      const vm = this
      if (vm.session.is_finished) {
        return this.offlineSessionActions
      } else {
        return this.onlineSessionActions
      }
    }
  }
}
</script>

<style scoped>

</style>
