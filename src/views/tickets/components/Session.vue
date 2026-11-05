<template>
  <div v-if="session">
    <IBox title="Session" class="session-card">
      <template #header>
        <div class="session-toolbar">
          <div class="session-heading">
            <strong>{{ $t('Session') }}</strong>
            <el-tag size="small" :type="session.is_finished ? 'info' : 'success'">
              {{ $t(session.is_finished ? 'SessionOffline' : 'SessionOnline') }}
            </el-tag>
          </div>
          <el-select
            v-if="sessions.length > 1"
            :model-value="session.id"
            :aria-label="$t('Session')"
            filterable
            class="session-select"
            @update:model-value="selectedId = $event"
          >
            <el-option
              v-for="item in sessions"
              :key="item.id"
              :value="item.id"
              :label="sessionLabel(item)"
            />
          </el-select>
          <div v-if="!isAuditRoute" class="session-actions">
            <el-button :disabled="!session.can_join" size="small" type="primary" @click="onMonitor">
              {{ $t('Monitor') }}
            </el-button>
            <el-button
              :disabled="busy || !supportedLock"
              size="small"
              @click="sendTask(session.is_locked ? 'unlock_session' : 'lock_session')"
            >
              {{ $t(session.is_locked ? 'Resume' : 'Pause') }}
            </el-button>
            <el-button
              :disabled="busy || !session.can_terminate"
              size="small"
              type="danger"
              plain
              @click="sendTask('kill_session')"
            >
              {{ $t('Terminate') }}
            </el-button>
          </div>
        </div>
      </template>
      <dl class="session-fields">
        <div>
          <dt>{{ $t('TargetResources') }}</dt>
          <dd>{{ session.asset }}</dd>
        </div>
        <div>
          <dt>{{ $t('Account') }}</dt>
          <dd>{{ session.account }}</dd>
        </div>
        <div>
          <dt>{{ $t('UseProtocol') }}</dt>
          <dd>{{ session.protocol }}</dd>
        </div>
        <div>
          <dt>{{ $t('RemoteAddr') }}</dt>
          <dd>{{ session.remote_addr }}</dd>
        </div>
        <div class="session-id">
          <dt>{{ $t('SessionID') }}</dt>
          <dd>
            <el-link
              v-if="$hasPerm('terminal.view_session')"
              type="primary"
              @click="onOpenSessionDetail"
            >
              {{ session.id }}
            </el-link>
            <template v-else>{{ session.id }}</template>
          </dd>
        </div>
      </dl>
    </IBox>
    <Drawer
      v-model:visible="drawerVisible"
      :title="$t('Session')"
      :has-footer="false"
      :component="SessionDetail"
    />
  </div>
</template>

<script>
import IBox from '@/components/Common/IBox'
import Drawer from '@/components/Drawer/index.vue'
import { IsSupportPauseSessionType } from '@/utils/jms/index'

export default {
  components: { IBox, Drawer },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      sessions: [],
      selectedId: null,
      timer: null,
      controller: new AbortController(),
      busy: false,
      drawerVisible: false,
      SessionDetail: () => import('@/views/sessions/SessionDetail')
    }
  },
  computed: {
    session() {
      return this.sessions.find((item) => item.id === this.selectedId) || this.sessions[0]
    },
    supportedLock() {
      const session = this.session
      return (
        !session.is_finished &&
        session.type === 'normal' &&
        IsSupportPauseSessionType(session.terminal_type)
      )
    },
    isAuditRoute() {
      return this.$route.name === 'AuditTicketList'
    }
  },
  created() {
    this.loadSessions()
  },
  beforeUnmount() {
    clearTimeout(this.timer)
    this.controller.abort()
  },
  methods: {
    sessionLabel(item) {
      const status = this.$t(item.is_finished ? 'SessionOffline' : 'SessionOnline')
      return `${item.asset} · ${item.account} · ${item.id.slice(0, 8)} · ${status}`
    },
    onOpenSessionDetail() {
      this.$store.dispatch('common/setDrawerActionMeta', {
        action: 'detail',
        row: {},
        col: {},
        id: this.session.id
      })
      this.$nextTick(() => {
        this.drawerVisible = true
      })
    },
    async loadSessions() {
      const { signal } = this.controller
      try {
        const sessions = await this.$axios.get(
          `/api/v1/tickets/tickets/${this.object.id}/sessions/`,
          {
            params: { oid: this.object.org_id },
            signal,
            disableFlashErrorMsg: true
          }
        )
        if (!signal.aborted) this.sessions = sessions
      } catch (err) {
        if (signal.aborted) return
        if ([401, 403, 404].includes(err.response?.status)) {
          this.sessions = []
          return
        }
        this.$log.debug('Error loading ticket sessions', err)
      }
      if (!signal.aborted) {
        const delay =
          this.sessions.length && this.sessions.every((item) => item.is_finished) ? 15000 : 3000
        this.timer = setTimeout(() => this.loadSessions(), delay)
      }
    },
    onMonitor() {
      const query = new URLSearchParams({ ticket_id: this.object.id, oid: this.session.org_id })
      const joinUrl = `/luna/monitor/${this.session.id}?${query}`
      window.open(
        joinUrl,
        '_blank',
        'height=600, width=850, top=400, left=400, toolbar=no, menubar=no, scrollbars=no, location=no, status=no'
      )
    },
    async sendTask(task) {
      if (this.busy) return
      const { id, org_id } = this.session
      const terminate = task === 'kill_session'
      const action = terminate ? 'kill-session-for-ticket' : 'toggle-lock-session-for-ticket'
      const body = terminate ? [id] : { session_id: id, task_name: task }
      this.busy = true
      try {
        const result = await this.$axios.post(`/api/v1/terminal/tasks/${action}/`, body, {
          params: { oid: org_id }
        })
        if (!result.ok.includes(id)) {
          this.$message.warning(this.$t('Failed'))
          return
        }
        const messages = {
          kill_session: 'TerminateTaskSendSuccessMsg',
          lock_session: 'PauseTaskSendSuccessMsg',
          unlock_session: 'ResumeTaskSendSuccessMsg'
        }
        this.$message.success(this.$t(messages[task]))
      } finally {
        this.busy = false
      }
    }
  }
}
</script>

<style scoped>
.session-card {
  margin-bottom: 16px;
}
.session-toolbar,
.session-heading,
.session-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.session-toolbar {
  gap: 12px;
}
.session-heading {
  color: var(--el-text-color-primary);
}
.session-select {
  flex: 1 1 240px;
  max-width: 440px;
  min-width: 0;
}
.session-actions {
  margin-inline-start: auto;
}
.session-actions :deep(.el-button + .el-button) {
  margin-inline-start: 0;
}
.session-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(185px, 100%), 1fr));
  gap: 10px 20px;
  margin: 0;
  font-size: 13px;
}
.session-fields > div {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 8px;
}
.session-fields dt {
  color: var(--el-text-color-secondary);
}
.session-fields dd {
  margin: 0;
  color: var(--el-text-color-primary);
  overflow-wrap: anywhere;
}
.session-id {
  grid-column: 1 / -1;
}
@media (max-width: 640px) {
  .session-select {
    flex-basis: 100%;
    max-width: none;
  }
  .session-actions {
    margin-inline-start: 0;
  }
}
</style>
