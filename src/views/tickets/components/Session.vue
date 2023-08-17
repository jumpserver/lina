<template>
  <IBox v-if="session.id" v-loading="loading" class="box">
    <div slot="header" class="clearfix ibox-title">
      <i class="fa fa-rocket" />
      {{ $t('sessions.session') }}
    </div>
    <div class="content">
      <el-row class="item">
        <el-col>
          <span class="item-label">{{ $t('sessions.SessionID') }}：</span>
          <span class="item-value">{{ session.id }}</span>
        </el-col>
        <el-col>
          <span class="item-label">{{ $t('sessions.TargetResources') }}：</span>
          <span class="item-value">{{ session.asset }}</span>
        </el-col>
        <el-col>
          <span class="item-label">{{ $t('assets.Account') }}：</span>
          <span class="item-value">{{ session.account }}</span>
        </el-col>
        <el-col>
          <span class="item-label">{{ $t('sessions.UseProtocol') }}：</span>
          <span class="item-value">{{ session.protocol }}</span>
        </el-col>
        <el-col>
          <span class="item-label">{{ $t('sessions.remoteAddr') }}：</span>
          <span class="item-value">{{ session.remote_addr }}</span>
        </el-col>
        <el-col>
          <span class="item-label">{{ $t('sessions.SessionState') }}：</span>
          <span class="item-value cur-color" :style="{ 'background': session.is_finished ? '#ed5565' : '#1ab394' }" />
        </el-col>
      </el-row>
    </div>
    <el-divider />
    <div class="bottom-btn">
      <el-button
        type="danger"
        size="small"
        :disabled="!session.can_terminate"
        @click="onConnect"
      >
        {{ $t('sessions.terminate') }}
      </el-button>
      <el-button
        type="warning"
        size="small"
        :disabled="!supportedLock"
        @click="onToggleLock"
      >
        <template v-if="session.is_locked">
          {{ $t('sessions.resume') }}
        </template>
        <template v-else>
          {{ $t('sessions.pause') }}
        </template>
      </el-button>
      <el-button
        type="primary"
        size="small"
        :disabled="!session.can_join"
        @click="onMonitor"
      >
        {{ $t('sessions.Monitor') }}
      </el-button>
    </div>
  </IBox>
</template>

<script>
import IBox from '@/components/IBox'
import { IsSupportPauseSessionType } from '@/utils/jms'

export default {
  components: { IBox },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      session: {},
      curTimer: null,
      loading: false,
      supportedLock: false
    }
  },

  created() {
    if (this.object.state.value === 'approved' && this.object.type.value === 'login_asset_confirm') {
      this.init()
    }
  },
  beforeDestroy() {
    clearTimeout(this.curTimer)
    this.curTimer = null
  },
  methods: {
    init() {
      this.loading = true
      const url = `/api/v1/tickets/tickets/${this.object.id}/session/`
      this.$axios({
        url,
        method: 'get',
        disableFlashErrorMsg: true
      }).then(res => {
        this.session = res || {}
        const terminalType = res['terminal']['type']
        const isNormalSession = res['type']['value'] === 'normal'
        this.supportedLock = IsSupportPauseSessionType(terminalType) && isNormalSession
      }).catch(err => {
        this.curTimer = setTimeout(() => {
          this.init()
        }, 1400)
        this.$log.debug('error', err)
      }).finally(() => {
        this.loading = false
      })
    },
    onConnect() {
      const url = '/api/v1/terminal/tasks/kill-session-for-ticket/'
      const data = [this.session.id] || []
      this.$axios.post(url, data).then(res => {
        this.$message.success(this.$tc('sessions.TerminateTaskSendSuccessMsg'))
        this.curTimer = setTimeout(() => {
          this.init()
        }, 50000)
      }).catch(err => {
        this.$message.error(err)
      })
    },
    onMonitor() {
      const joinUrl = `/luna/monitor/${this.session.id}?ticket_id=${this.object.id}`
      window.open(joinUrl, 'height=600, width=850, top=400, left=400, toolbar=no, menubar=no, scrollbars=no, location=no, status=no')
    },
    onToggleLock() {
      const url = '/api/v1/terminal/tasks/toggle-lock-session-for-ticket/'
      const task_name = this.session.is_locked ? 'unlock_session' : 'lock_session'
      const data = {
        'session_id': this.session.id,
        'task_name': task_name
      }
      const resumeMsg = this.$tc('sessions.ResumeTaskSendSuccessMsg')
      const pauseMsg = this.$tc('sessions.PauseTaskSendSuccessMsg')
      const msg = this.session.is_locked ? resumeMsg : pauseMsg
      this.$axios.post(url, data).then(res => {
        this.$message.success(msg)
        this.session.is_locked = !this.session.is_locked
      }).catch(err => {
        this.$message.error(err)
      })
    }
  }

}
</script>

<style lang='scss' scoped>
  .box {
    margin-top: 15px;
    margin-bottom: 15px;

    & >>> .el-divider--horizontal {
      margin: 10px 0;
    }
  }

  .content {
    line-height: 2.5;
    font-size: 13px;
    color: #676A6C;

    .item-label {
      font-weight: 700;
    }

    .item-value {
      color: #676A6C;
    }

    & >>> .el-col {
      line-height: 24px;
    }
  }

  .bottom-btn {
    text-align: right;
  }

  .cur-color {
    display: inline-block;
    width: 12px;
    height: 12px;
    vertical-align: text-top;
    border-radius: 50%;
  }
</style>
