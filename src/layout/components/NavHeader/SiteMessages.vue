<template>
  <div>
    <el-badge :hidden="unreadMsgCount === 0" :max="99" :value="unreadMsgCount" size="mini" type="primary">
      <el-link style="height: 100%" @click="toggleDrawer">
        <svg-icon icon-class="remind" />
      </el-link>
    </el-badge>
    <el-drawer
      :before-close="handleClose"
      :modal="false"
      :size="width"
      :title="$tc('SiteMessage')"
      :visible.sync="show"
      class="drawer"
      custom-class="site-msg"
      @open="getMessages"
    >
      <div slot="title">
        <span>{{ $t('SiteMessage') }}</span>
        <div v-if="unreadMsgCount !== 0" class="msg-list-all-read-btn" @click.stop="oneClickRead(messages)">
          <a style="vertical-align: sub;"> {{ $t('AllClickRead') }}</a>
        </div>
      </div>
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
              <i :class="msg['has_read'] ? 'fa-envelope-open-o' : 'fa-envelope'" class="fa msg-icon" />
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
      v-if="msgDialogVisible && hasDialogContent"
      :close-on-click-modal="false"
      :confirm-title="$tc('MarkAsRead')"
      :title="currentDialogTitle"
      :visible.sync="msgDialogVisible"
      @cancel="cancelRead"
      @close="handleDialogClose"
      @confirm="confirmRead"
    >
      <div v-if="isPopupDialog" class="msg-popup-detail">
        <div class="msg-popup-board">
          <el-collapse v-model="activePopupNames" class="msg-popup-collapse">
            <el-collapse-item
              v-for="msg in currentPopupMessages"
              :key="msg.dialogKey"
              :name="msg.dialogKey"
              class="msg-popup-item"
            >
              <template #title>
                <div class="popup-collapse-title">
                  <span class="popup-collapse-subject">{{ msg.content.subject }}</span>
                  <span class="popup-collapse-time">{{ formatDate(msg.date_created) }}</span>
                </div>
              </template>
              <div class="msg-detail-txt msg-popup-content">
                <MarkDown :value="msg.content.message" />
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
      <div v-else class="msg-detail">
        <div v-if="currentMsg.date_created" class="msg-detail-head">
          <span class="msg-detail-time">{{ formatDate(currentMsg.date_created) }}</span>
        </div>
        <div class="msg-detail-txt">
          <MarkDown :value="currentDialogMessage" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
import MarkDown from '@/components/Widgets/MarkDown'
import { createWsUrl } from '@/utils/common/index'
import { toSafeLocalDateStr } from '@/utils/common/time'

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
      msgDialogVisible: false,
      currentDialogType: '',
      dialogAction: '',
      isClosingDialog: false,
      currentMsg: null,
      currentPopupMessages: [],
      activePopupNames: [],
      popupMessages: [],
      unreadMsgCount: 0
    }
  },
  computed: {
    width() {
      return this.$store.state.app.device === 'mobile' ? '70%' : '450px'
    },
    currentDialogTitle() {
      if (this.currentDialogType === 'popup') {
        return this.$tc('Tip')
      }
      return this.currentMsg?.content?.subject || this.$tc('SiteMessage')
    },
    currentDialogMessage() {
      return this.currentMsg?.content?.message || ''
    },
    hasDialogContent() {
      return this.isPopupDialog ? this.currentPopupMessages.length > 0 : Boolean(this.currentMsg)
    },
    isPopupDialog() {
      return this.currentDialogType === 'popup'
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
      this.currentDialogType = 'siteMessage'
      this.dialogAction = ''
      this.msgDialogVisible = true
    },
    getMessages() {
      const url = '/api/v1/notifications/site-messages/?offset=0&limit=15&has_read=false'
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
      this.$axios.patch(url, {}).then(res => {
        if (this.currentDialogType === 'popup') {
          this.closeCurrentDialog()
        } else {
          this.msgDialogVisible = false
        }
        this.getMessages()
      }).catch(err => {
        this.$message(err.detail)
      })
    },
    markAsRead(msgs) {
      const url = `/api/v1/notifications/site-messages/mark-as-read/`
      const msgIds = msgs.filter(Boolean).map(item => item.id).filter(Boolean)
      if (msgIds.length === 0) {
        this.closeCurrentDialog()
        return
      }
      this.$axios.patch(url, { ids: msgIds }).then(res => {
        this.closeCurrentDialog()
        this.getMessages()
      }).catch(err => {
        this.$message(err.detail)
      })
    },
    confirmRead() {
      this.dialogAction = 'confirm'
      if (this.currentDialogType === 'popup') {
        this.markAsRead(this.currentPopupMessages)
        return
      }
      this.markAsRead([this.currentMsg])
    },
    cancelRead() {
      this.dialogAction = 'cancel'
      this.closeCurrentDialog()
    },
    handleDialogClose() {
      if (this.isClosingDialog) {
        return
      }
      if (this.dialogAction === 'confirm') {
        return
      }
      if (this.currentDialogType === 'siteMessage') {
        this.dialogAction = 'confirm'
        this.markAsRead([this.currentMsg])
        return
      }
      this.dialogAction = 'cancel'
      this.closeCurrentDialog()
    },
    closeCurrentDialog() {
      if (this.isClosingDialog) {
        return
      }
      const shouldShowNextPopup = this.popupMessages.length > 0

      this.isClosingDialog = true
      this.msgDialogVisible = false
      this.currentMsg = null
      this.currentPopupMessages = []
      this.activePopupNames = []
      this.currentDialogType = ''

      this.$nextTick(() => {
        this.dialogAction = ''
        this.isClosingDialog = false
        if (shouldShowNextPopup) {
          this.showNextPopupMessage()
        }
      })
    },
    isPopupMessage(data) {
      const siteMsg = data?.site_meg || data?.site_msg
      const content = siteMsg?.content || siteMsg
      return data?.type === 'display' && content?.display_mode === 'popup'
    },
    normalizePopupMessage(data) {
      const siteMsg = data.site_meg || data.site_msg
      const content = siteMsg.content || siteMsg
      const dateCreated = siteMsg.date_created || content.date_created || ''
      const subject = content.subject || this.$tc('SiteMessage')
      const message = content.message || ''
      return {
        id: siteMsg.id,
        dialogKey: String(siteMsg.id || [subject, dateCreated, message].filter(Boolean).join('-')),
        content: {
          subject,
          message
        },
        date_created: dateCreated,
        has_read: false
      }
    },
    enqueuePopupMessage(data) {
      const msg = this.normalizePopupMessage(data)
      const isCurrentMsg = this.currentDialogType === 'popup' && this.currentPopupMessages.some(item => item.dialogKey === msg.dialogKey)
      const isQueuedMsg = this.popupMessages.some(item => item.id === msg.id)

      if ((msg.id && isQueuedMsg) || isCurrentMsg) {
        return
      }

      if (this.currentDialogType === 'popup' && this.msgDialogVisible) {
        this.currentPopupMessages.push(msg)
        this.activePopupNames = this.currentPopupMessages.map(item => item.dialogKey)
        return
      }

      this.popupMessages.push(msg)
      this.showNextPopupMessage()
    },
    showNextPopupMessage() {
      if (this.msgDialogVisible || this.popupMessages.length === 0) {
        return
      }

      this.currentMsg = null
      this.currentPopupMessages = [...this.popupMessages]
      this.activePopupNames = this.currentPopupMessages.map(item => item.dialogKey)
      this.popupMessages = []
      this.currentDialogType = 'popup'
      this.dialogAction = ''
      this.msgDialogVisible = true
    },
    enablePullMsgCount() {
      const wsURL = createWsUrl('/ws/notifications/site-msg/')

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
          if (this.isPopupMessage(data)) {
            this.enqueuePopupMessage(data)
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

.el-badge ::v-deep .el-badge__content.is-fixed {
  top: 10px;
}

.msg-list {
  padding: 0 25px 20px;
}

::v-deep .site-msg {
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
    content: ".";
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

  ::v-deep .ticket-container {
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
    color: var(--N600, #646A73);
    text-align: right;
    font-feature-settings: 'clig' off, 'liga' off;
    font-size: 14px;
    font-style: normal;
  }

  .msg-detail-txt {
    line-height: 24px;

    .el-dialog__title {
      color: var(--neutral-900, #1F2329);
      font-size: 16px;
      font-style: normal;
      font-weight: 500;
      line-height: 24px;
    }

    & ::v-deep a {
      color: var(--color-success) !important;
    }

    ::v-deep .ticket-container {
      height: 618px;
      flex-shrink: 0;
      border-radius: 4px;
      background: #FFF;
      font-style: normal;
      font-weight: 400;
      line-height: 24px; /* 150% */

      .title {
        margin-bottom: 8px;
        color: var(--neutral-900, #1F2329);
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
          color: var(--neutral-900, #1F2329);
          font-size: 16px;
          font-style: normal;
          font-weight: 500;
        }

        margin-top: 16px;
        width: 100%;
        display: inline-block;
        border-radius: 4px;
        background: var(--N100, #F5F6F7);
      }

      .action_group {
        margin-top: 8px;

        .view-link {
          color: #3370FF !important;
          text-align: right;
          font-size: 14px;
          border-radius: 4px;

          &:hover {
            background: rgba(51, 112, 255, 0.20);
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
          color: var(--N600, #646A73);
          display: inline-block;

          strong {
            font-weight: 400 !important;
          }
        }

        .field-value {
          color: var(--N900, #1F2329);
          display: inline-block;
        }
      }
    }
  }
}

.msg-popup-detail {
  max-height: min(65vh, 720px);
  overflow-y: auto;
  padding-right: 4px;
}

.msg-popup-board {
  padding: 12px;
  // border: 1px solid var(--menu-border, #E9ECEF);
  border-radius: 12px;
  background: linear-gradient(180deg, #FCFCFD 0%, #F7F8FA 100%);
  box-shadow: 0 10px 24px rgba(31, 35, 41, 0.06);
}

.popup-collapse-title {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 12px;
}

.popup-collapse-subject {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--neutral-900, #1F2329);
  font-size: 14px;
  font-weight: 500;
}

.popup-collapse-time {
  flex-shrink: 0;
  color: var(--N600, #646A73);
  font-size: 12px;
  line-height: 20px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(100, 106, 115, 0.08);
}

.msg-popup-content {
  padding: 16px 18px 18px;
  background: #fff;
}

.msg-popup-detail ::v-deep .el-collapse {
  border-top: 0;
  border-bottom: 0;
  background: transparent;
}

.msg-popup-detail ::v-deep .el-collapse-item__header {
  align-items: center;
  line-height: 22px;
  height: auto;
  min-height: 56px;
  padding: 0 18px;
  border-bottom: 0;
  background: #fff;
}

.msg-popup-detail ::v-deep .el-collapse-item__wrap {
  overflow: visible;
  border-bottom: 0;
  background: transparent;
}

.msg-popup-detail ::v-deep .el-collapse-item__content {
  padding-bottom: 0;
}

.msg-popup-detail ::v-deep .msg-popup-collapse {
  border-top: 0;
  border-bottom: 0;
}

.msg-popup-detail ::v-deep .msg-popup-item {
  margin-bottom: 12px;
  border: 1px solid rgba(31, 35, 41, 0.08);
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 14px rgba(31, 35, 41, 0.05);
}

.msg-popup-detail ::v-deep .msg-popup-item:last-child {
  margin-bottom: 0;
}

.msg-popup-detail ::v-deep .msg-popup-item.is-active {
  border-color: rgba(38, 122, 58, 0.24);
  box-shadow: 0 8px 20px rgba(38, 122, 58, 0.08);
}

.msg-popup-detail ::v-deep .msg-popup-item .el-collapse-item__arrow {
  color: var(--N600, #646A73);
}

.no-msg {
  padding-top: 20px;
  text-align: center;
}

::v-deep :focus {
  outline: 0;
}
</style>
