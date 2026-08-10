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
      class="site-msg-drawer"
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
          class="msg-item"
          :class="{ 'is-read': msg['has_read'] }"
          @click="showMsgDetail(msg)"
          @mouseleave="hoverMsgId = ''"
          @mouseover="hoverMsgId = msg.id"
        >
          <div class="msg-item__head">
            <span v-if="!msg['has_read']" class="msg-item__dot" />
            <span class="msg-item__subject">{{ msg.content.subject }}</span>
            <span class="msg-item__meta">
              <a
                v-if="hoverMsgId === msg.id && !msg['has_read']"
                class="msg-item__read"
                @click.stop="markAsRead([msg])"
              >
                {{ $t('MarkAsRead') }}
              </a>
              <template v-else>{{ formatDate(msg.date_created) }}</template>
            </span>
          </div>
          <div class="msg-item__preview">{{ stripMarkdown(msg.content.message) }}</div>
        </div>
      </div>
      <div v-else class="msg-empty">
        <svg-icon icon-class="remind" class="msg-empty__icon" />
        <span>{{ $t('NoUnreadMsg') }}</span>
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
        <div class="msg-detail-txt" @click.capture="handleMessageContentClick">
          <span class="msg-detail-time">{{ formatDate(currentMsg.date_created) }}</span>
          <MarkDown :html="true" :value="currentMsg.content.message" />
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
      unreadMsgCount: 0,
      markingMessageIds: []
    }
  },
  computed: {
    width() {
      return this.$store.state.app.device === 'mobile' ? '70%' : '450px'
    }
  },
  watch: {
    '$route.fullPath'() {
      this.msgDetailVisible = false
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
    // 列表预览：正文是 Markdown（工单类还含 HTML 片段），这里剥离标记语法/标签，
    // 得到干净的纯文本用于 1~2 行预览，避免像详情那样把 # / ** 直接暴露出来。
    stripMarkdown(text) {
      if (!text) return ''
      return String(text)
        .replace(/<[^>]+>/g, ' ') // HTML 标签
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // 图片
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // 链接 → 文本
        .replace(/^\s{0,3}#{1,6}\s*/gm, '') // 标题
        .replace(/\*\*([^*]+)\*\*/g, '$1') // 粗体
        .replace(/\*([^*]+)\*/g, '$1') // 斜体
        .replace(/`([^`]+)`/g, '$1') // 行内代码
        .replace(/^\s{0,3}>\s?/gm, '') // 引用
        .replace(/^\s{0,3}[-*+]\s+/gm, '') // 列表符号
        .replace(/\s+/g, ' ') // 折叠空白
        .trim()
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
    async handleMessageContentClick(event) {
      const anchor = event.composedPath().find((element) => element?.nodeName === 'A')
      if (!anchor || !this.currentMsg) return

      const href = anchor.getAttribute('href')
      if (!href) return

      let url
      try {
        url = new URL(href, window.location.href)
      } catch {
        return
      }

      const openInNewTab = anchor.target === '_blank' || event.ctrlKey || event.metaKey
      const currentMsg = this.currentMsg

      event.preventDefault()
      this.msgDetailVisible = false
      this.markAsRead([currentMsg])

      if (openInNewTab) {
        window.open(url.href, '_blank', 'noopener,noreferrer')
        return
      }

      // 先让 Dialog 完成卸载，再执行导航，避免 Hash 路由切换与弹窗关闭竞争。
      await this.$nextTick()

      const routerBase = this.$router.options.history.base.replace(/\/$/, '')
      const targetBase = url.pathname.replace(/\/$/, '')
      const isLinaRoute =
        url.origin === window.location.origin &&
        targetBase === routerBase &&
        url.hash.startsWith('#/')

      if (isLinaRoute) {
        try {
          await this.$router.push(url.hash.slice(1))
        } catch {
          window.location.assign(url.href)
        }
        return
      }

      window.location.assign(url.href)
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
      const msgIds = [...new Set(msgs.filter(Boolean).map((item) => item.id))].filter(
        (id) => !this.markingMessageIds.includes(id)
      )
      if (!msgIds.length) return

      this.markingMessageIds.push(...msgIds)
      this.$axios
        .patch(url, { ids: msgIds })
        .then((res) => {
          this.msgDetailVisible = false
          this.getMessages()
        })
        .catch((err) => {
          this.$message(err.detail)
        })
        .finally(() => {
          this.markingMessageIds = this.markingMessageIds.filter((id) => !msgIds.includes(id))
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
.el-badge :deep(.el-badge__content.is-fixed) {
  top: 10px;
}

.msg-list {
  padding: 4px 0 12px;
}

// 通知列表项：未读圆点 + 标题 + 时间/悬停操作 + 纯文本预览
.msg-item {
  padding: 12px 24px;
  cursor: pointer;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--el-fill-color-light, #f5f7fa);
  }
}

.msg-item__head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 20px;
}

.msg-item__dot {
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
}

.msg-item__subject {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary, #1f2329);
}

.msg-item__meta {
  flex: 0 0 auto;
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
  white-space: nowrap;
}

.msg-item__read {
  color: var(--color-primary);
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.msg-item__preview {
  // 预览与标题左对齐（让开圆点占位），限制两行
  margin-top: 4px;
  padding-left: 14px;
  font-size: 12px;
  line-height: 18px;
  color: var(--el-text-color-secondary, #909399);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

// 已读项（一般刷新后即从未读列表移除，此处兜底弱化展示）
.msg-item.is-read {
  .msg-item__subject {
    font-weight: 400;
    color: var(--el-text-color-regular, #606266);
  }
}

.msg-detail {
  .msg-detail-txt {
    max-height: 70vh;
    overflow-y: auto;
    font-size: 13px;
    line-height: 22px;
    color: var(--N900, #1f2329);

    // 时间浮到正文右上角，与首行标题同行，不再单独占一行
    .msg-detail-time {
      float: right;
      margin: 0 0 4px 12px;
      color: var(--el-text-color-secondary, #909399);
      font-size: 12px;
      line-height: 24px;
    }

    // 正文为 Markdown 渲染结果（标题 / 字段列表 / 链接），下面按渲染出的标签排版。
    :deep(.markdown-body) {
      padding: 0;
    }

    // 段落分节标题（# / ##）
    :deep(h1),
    :deep(h2),
    :deep(h3) {
      margin: 16px 0 4px;
      padding: 0;
      border: 0;
      color: var(--neutral-900, #1f2329);
      font-weight: 600;
      line-height: 1.4;
    }

    :deep(h1) {
      margin-top: 0;
      font-size: 15px;
    }

    :deep(h2) {
      font-size: 14px;
    }

    :deep(h3) {
      font-size: 13px;
    }

    :deep(p) {
      margin: 6px 0;
    }

    // 只把“粗体字段名开头”的列表排成信息表，普通 Markdown 列表仍保留项目符号。
    :deep(ul:has(> li > strong:first-child)) {
      margin: 6px 0 0;
      padding: 0;
      list-style: none;
    }

    :deep(ul:has(> li > strong:first-child) > li) {
      // 为字段值预留固定起始列，长文本换行后继续与值对齐，而不是退回字段名左侧。
      padding: 9px 2px 9px 90px;
      border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
      line-height: 20px;

      &:last-child {
        border-bottom: none;
      }

      strong {
        display: inline-block;
        min-width: 72px;
        margin-left: -88px;
        margin-right: 16px;
        color: var(--el-text-color-secondary, #8a9099);
        font-weight: 400;
        vertical-align: top;
      }
    }

    // 消息内容里的链接（资产地址、查看详情等）用统一的链接色，而非 --color-success
    // （在 Deep black 等主题下是绿色，语义也不对）。--color-link 各主题都是蓝色，稳定一致。
    :deep(a) {
      color: var(--color-link) !important;
      word-break: break-all;
    }
  }
}

.msg-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 80px 20px;
  color: var(--el-text-color-secondary, #909399);
  font-size: 13px;

  .msg-empty__icon {
    width: 40px;
    height: 40px;
    font-size: 40px;
    opacity: 0.3;
  }
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

/*
 * 站内信不是通用 Drawer 组件，避免复用 `.drawer` 后误命中全局抽屉的
 * `overflow: hidden` 规则。抽屉根节点锁定视口高度，body 作为唯一滚动容器。
 */
.site-msg-drawer {
  height: 100%;
  max-height: 100vh;
  overflow: hidden;
}

.site-msg-header.el-drawer__header {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  border-bottom: solid 1px rgb(231, 234, 239);
  margin-bottom: 0;
  padding: 10px 20px;
  box-sizing: border-box;
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
  flex: 1 1 auto;
  min-height: 0;
  padding: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}
</style>
