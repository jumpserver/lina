<template>
  <div>
    <el-badge :value="unreadMsgCount" :hidden="unreadMsgCount === 0" :max="99" size="mini" type="primary">
      <el-link style="height: 100%" @click="toggleDrawer">
        <svg-icon icon-class="email-fill" />
      </el-link>
    </el-badge>
    <el-drawer
      :visible.sync="show"
      :before-close="handleClose"
      :modal="false"
      :title="$t('notifications.SiteMessage')"
      custom-class="site-msg"
      :size="width"
      @open="getMessages"
    >
      <div slot="title">
        <span>{{ $t('notifications.SiteMessage') }}</span>
        <div v-if="unreadMsgCount !== 0" class="msg-list-all-read-btn" @click.stop="oneClickRead(messages)">
          <a> {{ $t('notifications.OneClickRead') }}</a>
        </div>
      </div>
      <div v-if="unreadMsgCount !== 0" class="msg-list">
        <div
          v-for="msg of messages"
          :key="msg.id"
          class="msg-item"
          :class="msg['has_read'] ? 'msg-read' : 'msg-unread'"
          @mouseover="hoverMsgId = msg.id"
          @mouseleave="hoverMsgId = ''"
          @click="showMsgDetail(msg)"
        >
          <div class="msg-item-head">
            <span class="msg-item-head-type">
              <i :class="msg['has_read'] ? 'fa-envelope-open-o' : 'fa-envelope'" class="fa msg-icon" />
              {{ msg.subject }}
            </span>
            <span v-if="hoverMsgId !== msg.id || msg['has_read']" class="msg-item-head-time">
              {{ formatDate(msg.date_created) }}
            </span>
            <div v-else class="msg-item-read-btn" @click.stop="markAsRead([msg])">
              <a>{{ $t('notifications.MarkAsRead') }}</a>
            </div>
          </div>
          <div class="msg-item-txt">
            <span v-html="msg.message" />
          </div>
        </div>
      </div>
      <div v-else class="no-msg">
        {{ $t('notifications.NoUnreadMsg') }}
      </div>
    </el-drawer>

    <Dialog
      v-if="msgDetailVisible"
      :visible.sync="msgDetailVisible"
      :title="''"
      :close-on-click-modal="false"
      :confirm-title="$t('notifications.MarkAsRead')"
      @confirm="markAsRead([currentMsg])"
      @cancel="cancelRead"
    >
      <div class="msg-detail">
        <div class="msg-detail-head">
          <h3>{{ currentMsg.subject }}</h3>
          <h5>
            <span class="msg-detail-time">{{ formatDate(currentMsg.date_created) }}</span>
          </h5>
        </div>
        <div class="msg-detail-txt">
          <span v-html="currentMsg.message" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import { toSafeLocalDateStr } from '@/utils/common'
import Dialog from '@/components/Dialog'

export default {
  name: 'SiteMessages',
  components: { Dialog },
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
      return this.$store.state.app.device === 'mobile' ? '70%' : '20%'
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
      const url = '/api/v1/notifications/site-message/?offset=0&limit=15&has_read=false'
      this.$axios.get(url).then(resp => {
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
      if (now.getTime() - d.getTime() > (3600 * 24 * 7) * 1000) {
        return toSafeLocalDateStr(s)
      } else {
        return this.$moment(d).fromNow()
      }
    },
    oneClickRead(msgs) {
      this.$confirm(this.$t('notifications.OneClickReadMsg'), this.$t('common.Info'), {
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        beforeClose: async(action, instance, done) => {
          if (action !== 'confirm') return done()
          this.markAsReadAll(msgs)
          done()
        }
      }).catch(() => {
        /* 取消*/
      })
    },
    markAsReadAll(msgs) {
      const url = `/api/v1/notifications/site-message/mark-as-read-all/`
      this.$axios.patch(url, {}).then(res => {
        this.msgDetailVisible = false
        this.getMessages()
      }).catch(err => {
        this.$message(err.detail)
      })
    },
    markAsRead(msgs) {
      const url = `/api/v1/notifications/site-message/mark-as-read/`
      const msgIds = []
      for (const item of msgs) {
        msgIds.push(item.id)
      }
      this.$axios.patch(url, { ids: msgIds }).then(res => {
        this.msgDetailVisible = false
        this.getMessages()
      }).catch(err => {
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
        this.$message.error(this.$t('common.ConnectWebSocketError'))
        this.$log.debug('site message ws error: ', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-badge ::v-deep .el-badge__content.is-fixed{
  top:10px;
}

.msg-list {
  padding: 0 25px 20px;
}

>>> .site-msg {
  .el-drawer__header {
    border-bottom: solid 1px rgb(231, 234, 239);
    margin-bottom: 0;
    padding-top: 10px;
    font-size: 16px;
    .msg-list-all-read-btn {
      font-size: 12px;
      float: right;
    }
  }

  .el-drawer__body {
    overflow-y: auto;
  }
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
    font-size: 13px;
    line-height: 13px;
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
    content: ".";
    display: block;
    height: 0;
    overflow: hidden;
  }

  .msg-item-head-type {
    float: left;
    width: 220px;
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
}

.msg-detail {
  padding-left: 20px;

  .msg-detail-time {
    font-weight: 400;
    font-size: 12px;
    line-height: 1.1;
  }

  .msg-detail-txt {
    margin-bottom: 20px;
    line-height: 25px;
  }
}

.no-msg {
  padding-top: 20px;
  text-align: center;
}

>>> :focus{ outline:0; }
</style>
