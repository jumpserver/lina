<template>
  <div>
    <el-badge :value="unreadMsgCount" :hidden="unreadMsgCount === 0" :max="99" size="mini" type="primary">
      <a style="color: #606266 !important; width: 30px" @click="toggleDrawer">
        <i class="el-icon-message" style="font-size: 18px" />
      </a>
    </el-badge>
    <el-drawer
      :visible.sync="show"
      :before-close="handleClose"
      :modal="false"
      :title="$t('notifications.SiteMessage')"
      custom-class="site-msg"
      size="25%"
      @open="getMessages"
    >
      <div v-if="unreadMsgCount !== 0" class="msg-list">
        <div
          v-for="msg of messages"
          :key="msg.id"
          class="msg-item"
          @mouseover="hoverMsgId = msg.id"
          @mouseleave="hoverMsgId = ''"
          @click="showMsgDetail(msg)"
        >
          <div class="msg-item-head">
            <span class="msg-item-head-type">{{ msg.subject }}</span>
            <span v-if="hoverMsgId !== msg.id" class="msg-item-head-time">
              {{ formatDate(msg.date_created) }}
            </span>
            <div v-else class="msg-item-read-btn" @click.stop="markAsRead(msg)">
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
      @confirm="markAsRead(currentMsg)"
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
    markAsRead(msg) {
      console.log(`${msg}`)
      const url = `/api/v1/notifications/site-message/mark-as-read/`
      this.$axios.patch(url, { ids: [msg.id] }).then(res => {
        this.msgDetailVisible = false
        this.getMessages()
      }).catch(err => {
        this.$message(err.detail)
      })
    },
    cancelRead() {
      this.msgDetailVisible = false
    },
    pullMsgCount() {
      const url = '/api/v1/notifications/site-message/unread-total/'
      this.$axios.get(url).then(res => {
        this.unreadMsgCount = res.total
      }).catch(err => {
        this.$message(err.detail)
      })
    },
    enablePullMsgCount() {
      this.pullMsgCount()
      setInterval(() => {
        this.pullMsgCount()
      }, 10000)
    }
  }
}
</script>

<style lang="scss" scoped>
.el-badge ::v-deep .el-badge__content.is-fixed{
  top:10px;
}

.msg-list {
  padding: 0 20px 20px;
}

>>> .site-msg .el-drawer__header {
  border-bottom: solid 1px rgb(231, 234, 239);
  margin-bottom: 0;
  padding-top: 10px;
  font-size: 16px;
}

>>> .site-msg {
  margin-top: 50px;
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
    width: 120px;
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
  line-height: 21px;
  max-height: 21px;
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
