<template>
  <div>
    <el-badge
      :hidden="unreadMsgCount === 0"
      :max="99"
      :value="unreadMsgCount"
      size="small"
      type="primary"
    >
      <el-link style="height: 100%" @click="toggleDrawer">
        <svg-icon icon-class="remind" />
      </el-link>
    </el-badge>
    <el-drawer
      v-model="show"
      :before-close="handleClose"
      :modal="true"
      :lock-scroll="false"
      :show-close="false"
      :size="width"
      :title="$tc('SiteMessage')"
      class="drawer"
      modal-class="site-msg-modal"
      header-class="site-msg-header"
      body-class="site-msg-body"
      @open="getMessages"
    >
      <template #header="{ close }">
        <span class="msg-header-title">{{ $t('SiteMessage') }}</span>
        <div class="msg-header-right">
          <span
            v-if="unreadMsgCount !== 0"
            class="msg-list-all-read-btn"
            @click.stop="oneClickRead(messages)"
          >
            {{ $t('AllClickRead') }}
          </span>
          <el-icon class="msg-header-close" :title="$t('Close')" @click="close">
            <Close />
          </el-icon>
        </div>
      </template>
      <div v-if="unreadMsgCount !== 0" class="msg-list">
        <div
          v-for="msg of messages"
          :key="msg.id"
          :class="msg['has_read'] ? 'msg-read' : 'msg-unread'"
          class="msg-item"
          @click="showMsgDetail(msg)"
          @mouseleave="hoverMsgId = ''"
          @mouseover="hoverMsgId = msg.id"
        >
          <el-row :gutter="10" class="msg-item-head">
            <el-col :span="15" class="msg-item-head-type">
              <i
                :class="msg['has_read'] ? 'fa-envelope-open-o' : 'fa-envelope'"
                class="fa msg-icon"
              />
              {{ msg.content.subject }}
            </el-col>
            <el-col :span="9">
              <span v-if="hoverMsgId !== msg.id || msg['has_read']" class="msg-item-head-time">
                {{ formatDate(msg.date_created) }}
              </span>
              <span v-else class="msg-item-read-btn" @click.stop="markAsRead([msg])">
                <a>{{ $t('MarkAsRead') }}</a>
              </span>
            </el-col>
          </el-row>
          <div class="msg-item-txt">
            <span v-sanitize="msg.content.message" />
          </div>
        </div>
      </div>
      <div v-else class="no-msg">
        {{ $t('NoUnreadMsg') }}
      </div>
    </el-drawer>

    <Dialog
      v-if="msgDetailVisible"
      v-model:visible="msgDetailVisible"
      :close-on-click-modal="false"
      :confirm-title="$tc('MarkAsRead')"
      :title="currentMsg.content.subject"
      @cancel="cancelRead"
      @close="markAsRead([currentMsg])"
      @confirm="markAsRead([currentMsg])"
    >
      <div class="msg-detail">
        <div class="msg-detail-head">
          <span class="msg-detail-time">{{ formatDate(currentMsg.date_created) }}</span>
        </div>
        <div class="msg-detail-txt">
          <MarkDown :value="currentMsg.content.message" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
import MarkDown from '@/components/Widgets/MarkDown'
import { toSafeLocalDateStr } from '@/composables/useDateTime'

export default {
  name: 'SiteMessages',
  components: {
    Dialog,
    MarkDown
  },
  data() {
    return {
      show: false,
      messages: [],
      hoverMsgId: '',
      msgDetailVisible: false,
      currentMsg: null,
      unreadMsgCount: 0
    }
  },
  computed: {
    width() {
      return this.$store.state.app.device === 'mobile' ? '70%' : '450px'
    }
  },
  mounted() {
    this.enablePullMsgCount()
  },
  methods: {
    handleClose() {
      this.show = false
    },
    toggleDrawer() {
      this.show = !this.show
    },
    showMsgDetail(msg) {
      this.currentMsg = msg
      this.msgDetailVisible = true
    },
    getMessages() {
      const url = '/api/v1/notifications/site-messages/?offset=0&limit=15&has_read=false'
      this.$axios.get(url).then((resp) => {
        this.messages = [...resp.results]
        this.unreadMsgCount = resp.count
      })
    },
    formatDate(s) {
      if (!s) {
        return ''
      }
      const d = new Date(s)
      const now = new Date()
      if (now.getTime() - d.getTime() > 3600 * 24 * 7 * 1000) {
        return toSafeLocalDateStr(s)
      } else {
        return this.$moment(d).fromNow()
      }
    },
    oneClickRead(msgs) {
      this.$confirm(this.$tc('OneClickReadMsg'), this.$tc('Info'), {
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        beforeClose: async (action, instance, done) => {
          if (action !== 'confirm') return done()
          this.markAsReadAll(msgs)
          done()
        }
      }).catch(() => {
        /* 取消*/
      })
    },
    markAsReadAll(msgs) {
      const url = `/api/v1/notifications/site-messages/mark-as-read-all/`
      this.$axios
        .patch(url, {})
        .then((res) => {
          this.msgDetailVisible = false
          this.getMessages()
        })
        .catch((err) => {
          this.$message(err.detail)
        })
    },
    markAsRead(msgs) {
      const url = `/api/v1/notifications/site-messages/mark-as-read/`
      const msgIds = []
      for (const item of msgs) {
        msgIds.push(item.id)
      }
      this.$axios
        .patch(url, { ids: msgIds })
        .then((res) => {
          this.msgDetailVisible = false
          this.getMessages()
        })
        .catch((err) => {
          this.$message(err.detail)
        })
    },
    cancelRead() {
      this.msgDetailVisible = false
    },
    enablePullMsgCount() {
      const scheme = document.location.protocol === 'https:' ? 'wss' : 'ws'
      const port = document.location.port ? ':' + document.location.port : ''
      const url = '/ws/notifications/site-msg/'
      const wsURL = scheme + '://' + document.location.hostname + port + url

      const ws = new WebSocket(wsURL)
      ws.onopen = (event) => {
        this.$log.debug('Websocket connected: ', event)
      }
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.$log.debug('Data: ', data)
          const unreadCount = data['unread_count']
          if (unreadCount !== undefined) {
            this.unreadMsgCount = unreadCount
          }
        } catch (e) {
          this.$log.debug('Recv site message error')
        }
      }
      ws.onerror = (error) => {
        this.$message.error(this.$tc('ConnectWebSocketError'))
        this.$log.debug('site message ws error: ', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.drawer {
  height: calc(100% - 0px);
}

.el-badge :deep(.el-badge__content.is-fixed) {
  top: 10px;
}

.msg-list {
  padding: 0 25px 20px;
}

.msg-item {
  border-bottom: solid 1px rgb(231, 234, 239);
  padding: 15px 0 10px;
  position: relative;
  border-bottom: 1px solid #ddd;
  cursor: pointer;

  &:hover {
    background-color: #f2f2f2;
    padding: 15px 20px 10px;
    margin: 0 -20px;
    border-bottom: 1px solid #fff;
  }

  .msg-icon {
    font-size: 13px !important;
    line-height: 13px;
    color: gray !important;
  }

  &.msg-unread {
    .msg-item-txt {
      font-weight: bolder;
    }
  }
}

.msg-item-head {
  line-height: 20px;
  color: #888;
  font-size: 12px;

  &:after {
    clear: both;
    content: '.';
    display: block;
    height: 0;
    overflow: hidden;
  }

  .msg-item-head-type {
    float: left;
    //width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
    white-space: nowrap;
  }

  .msg-item-head-time {
    float: right;
  }

  .msg-item-read-btn {
    float: right;
  }
}

.msg-item-txt {
  overflow: hidden;
  color: #000;
  padding: 4px 0 0;
  line-height: 25px;
  max-height: 25px;
  display: -webkit-box;
  font-size: 12px;
  display: block;

  :deep(.ticket-container) {
    .title {
      font-size: 12px;
    }
  }
}

.msg-detail {
  .msg-detail-time {
    font-weight: 400;
    line-height: 1.1;
    float: right;
    color: var(--N600, #646a73);
    text-align: right;
    font-feature-settings:
      'clig' off,
      'liga' off;
    font-size: 14px;
    font-style: normal;
  }

  .msg-detail-txt {
    line-height: 24px;

    .el-dialog__title {
      color: var(--neutral-900, #1f2329);
      font-size: 16px;
      font-style: normal;
      font-weight: 500;
      line-height: 24px;
    }

    & :deep(a) {
      color: var(--color-success) !important;
    }

    :deep(.ticket-container) {
      height: 618px;
      flex-shrink: 0;
      border-radius: 4px;
      background: #fff;
      font-style: normal;
      font-weight: 400;
      line-height: 24px; /* 150% */

      .title {
        margin-bottom: 8px;
        color: var(--neutral-900, #1f2329);
        font-size: 16px;
        font-weight: 500;
      }

      .card {
        .child_title {
          padding-top: 16px;
          margin: 0 0 12px 16px;
          display: inline-flex;
          flex-direction: column;
          align-items: flex-start;
          color: var(--neutral-900, #1f2329);
          font-size: 16px;
          font-style: normal;
          font-weight: 500;
        }

        margin-top: 16px;
        width: 100%;
        display: inline-block;
        border-radius: 4px;
        background: var(--N100, #f5f6f7);
      }

      .action_group {
        margin-top: 8px;

        .view-link {
          color: #3370ff !important;
          text-align: right;
          font-size: 14px;
          border-radius: 4px;

          &:hover {
            background: rgba(51, 112, 255, 0.2);
            display: inline-block;
            border-radius: 4px;
          }
        }
      }

      .field-group {
        font-size: 14px;
        padding-inline-start: 0;
        margin: 0;

        .field-name {
          margin: 4px 0 4px 16px;
          color: var(--N600, #646a73);
          display: inline-block;

          strong {
            font-weight: 400 !important;
          }
        }

        .field-value {
          color: var(--N900, #1f2329);
          display: inline-block;
        }
      }
    }
  }
}

.no-msg {
  padding-top: 20px;
  text-align: center;
}

:deep(:focus) {
  outline: 0;
}
</style>

<style lang="scss">
/*
 * el-drawer 默认 teleport 到 body，且 EP 2.14 无 customClass 且 inheritAttrs:false，
 * 故用 header-class/body-class/modal-class 注入真实类名，并用非 scoped 全局样式命中。
 * modal-class 设为透明遮罩：保留遮罩以支持点击外部关闭，但视觉上不变暗。
 */
.site-msg-modal {
  background-color: transparent !important;
}

.site-msg-header.el-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: solid 1px rgb(231, 234, 239);
  margin-bottom: 0;
  padding-top: 10px;
  font-size: 16px;

  .msg-header-title {
    font-size: 16px;
    color: var(--color-text-primary);
  }

  .msg-header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .msg-list-all-read-btn {
    display: inline-flex;
    align-items: center;
    font-size: 12px;
    line-height: 1;
    color: #72767b;
    cursor: pointer;

    &:hover {
      color: var(--color-primary);
    }
  }

  .msg-header-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    font-size: 16px;
    color: #909399 !important;
    cursor: pointer;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      color: var(--color-primary) !important;
    }
  }
}

.site-msg-body {
  overflow-y: auto;
}
</style>
