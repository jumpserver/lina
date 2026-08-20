<template>
  <DrawerPanel
    v-if="visible"
    ref="drawer"
    :default-show-panel="!!defaultShowPanel"
    :expanded="expanded"
    :height="height"
    :icon="robotUrl"
    :modal="false"
    @toggle="onToggle"
  >
    <div class="chat">
      <div class="container">
        <div
          ref="header"
          class="header"
          @mousedown="handleMoveMouseDown"
          @mouseup="handleMouseMoveUp"
        >
          <div class="left">
            <img :src="robotUrl" alt="" />
            <span class="title">{{ title }}</span>
          </div>
          <span class="new" @click="onNewChat">
            <el-icon><Plus /></el-icon>
            <span>{{ $tc('NewChat') }}</span>
          </span>
        </div>
        <div class="content">
          <keep-alive>
            <component :is="active" ref="component" :expanded="expanded" />
          </keep-alive>
        </div>
      </div>
      <div class="sidebar">
        <Sidebar
          v-bind="$attrs"
          v-model:active="active"
          :expanded="expanded"
          @close="onClose"
          @compress="compress"
          @expand="expandFull"
        />
      </div>
    </div>
  </DrawerPanel>
</template>

<script>
import Sidebar from './components/Sidebar/index.vue'
import Chat from './components/ChitChat/index.vue'
import { getInputFocus } from './useChat.js'
import DrawerPanel from '@/components/Apps/DrawerPanel/index.vue'
import { ObjectLocalStorage } from '@/utils/common/objectLocalStorage'
import i18n from '@/i18n/i18n'
import { getAssetUrl } from '@/utils/assets'
import { mapGetters } from 'vuex'

const aiPannelLocalStorage = new ObjectLocalStorage('ai_panel_settings')
export default {
  components: {
    DrawerPanel,
    Chat,
    Sidebar
  },
  props: {
    title: {
      type: String,
      default: function () {
        return i18n.global.t('ChatAI')
      }
    },
    defaultShowPanel: {
      type: Boolean,
      default: false
    },
    drawerPanelVisible: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      visible: false,
      active: 'chat',
      robotUrl: getAssetUrl('img/robot-assistant.png'),
      height: '400px',
      expanded: false,
      clientOffset: {},
      currentTerminalContent: {},
      initialized: false,
      messageListenerAttached: false,
      pendingPanelVisibility: null,
      iframeReadyPosted: false
    }
  },
  computed: {
    ...mapGetters(['publicSettings'])
  },
  watch: {
    'publicSettings.CHAT_AI_METHOD': {
      handler(newVal) {
        if (newVal === 'api') {
          this.startApiMode()
          return
        }

        this.visible = false
        this.iframeReadyPosted = false
        this.pendingPanelVisibility = null
        this.initialized = false
      }
    }
  },
  mounted() {
    this.handleStartChat()
  },
  beforeUnmount() {
    if (this.messageListenerAttached) {
      window.removeEventListener('message', this.onWindowMessage)
      this.messageListenerAttached = false
    }
  },
  methods: {
    handleStartChat() {
      if (this.publicSettings.CHAT_AI_METHOD === 'api') {
        this.startApiMode()
      } else if (this.publicSettings.CHAT_AI_METHOD === 'embed') {
        const embedScriptId = 'chat-ai-embed-id'
        if (document.getElementById(embedScriptId)) {
          return
        }
        const script = document.createElement('script')
        script.id = embedScriptId
        script.src = this.publicSettings.CHAT_AI_EMBED_URL
        script.async = true
        script.onload = () => {
          const loadEvent = new Event('load', {
            bubbles: false,
            cancelable: false
          })
          window.dispatchEvent(loadEvent)
        }
        document.body.appendChild(script)
      }
    },
    startApiMode() {
      this.visible = true
      const expanded = aiPannelLocalStorage.get('expanded')
      this.updateExpandedState(expanded, false)
      this.handlePostMessage()
      this.ensureApiModeReady()
    },
    ensureApiModeReady(attempt = 0) {
      if (this.publicSettings.CHAT_AI_METHOD !== 'api' || !this.visible) return

      this.$nextTick(() => {
        const drawer = this.$refs.drawer
        const component = this.$refs.component

        if (!drawer || !component) {
          if (attempt < 20) {
            this.ensureApiModeReady(attempt + 1)
          }
          return
        }

        if (this.pendingPanelVisibility !== null && drawer.show !== this.pendingPanelVisibility) {
          drawer.show = this.pendingPanelVisibility
        }

        if (!this.iframeReadyPosted) {
          window.parent.postMessage(
            {
              name: 'CHAT_IFRAME_READY'
            },
            window.location.origin
          )
          this.iframeReadyPosted = true
        }

        if (this.currentTerminalContent && Object.keys(this.currentTerminalContent).length > 0) {
          component.onTerminalContext?.(this.currentTerminalContent)
        }

        if (drawer.show) {
          this.initAssistant()
        }

        this.pendingPanelVisibility = null
      })
    },
    initAssistant() {
      if (this.initialized) return
      this.$nextTick(() => {
        if (this.initialized) return
        const component = this.$refs.component
        if (!component) return
        this.initialized = true
        component.init()
      })
    },
    handlePostMessage() {
      if (this.messageListenerAttached) return
      window.addEventListener('message', this.onWindowMessage)
      this.messageListenerAttached = true
    },
    isTrustedParentMessage(event) {
      const trustedSource = event.source === window.parent || event.source === window
      return trustedSource && event.origin === window.location.origin
    },
    onWindowMessage(event) {
      if (!this.isTrustedParentMessage(event)) return

      const msg = event.data
      if (msg === 'show-chat-panel') {
        this.setPanelVisibility(true)
        return
      }
      if (msg === 'hide-chat-panel') {
        this.setPanelVisibility(false)
        return
      }
      if (!msg || typeof msg !== 'object') return

      switch (msg.name) {
        case 'CHAT_PANEL_COMMAND':
          if (msg.data?.action === 'open') {
            this.setPanelVisibility(true)
          } else if (msg.data?.action === 'close') {
            this.setPanelVisibility(false)
          }
          break
        case 'current_terminal_content':
          // {content: '...', terminalId: '',sessionId: '',viewId: '',viewName: ''}
          this.$log.debug('current_terminal_content', msg)
          this.currentTerminalContent = msg.data
          this.$refs.component?.onTerminalContext(msg.data)
          break
      }
    },
    setPanelVisibility(show) {
      const drawer = this.$refs.drawer
      if (!drawer) {
        this.pendingPanelVisibility = show
        this.ensureApiModeReady()
        return
      }

      if (drawer.show === show) {
        this.postPanelState(show)
        if (show) {
          this.initAssistant()
          getInputFocus()
        }
        return
      }

      drawer.show = show
    },
    postPanelState(open) {
      window.parent.postMessage(
        {
          name: 'CHAT_PANEL_STATE',
          data: {
            open,
            mode: this.expanded ? 'expanded' : 'compact'
          }
        },
        window.location.origin
      )
    },
    handleMoveMouseDown(event) {
      this.$refs.drawer.handleHeaderMoveDown(event)
    },
    handleMouseMoveUp(event) {
      // Prevent the new chat button from triggering the header move up
      const newButton = event.target.closest('.new')
      if (newButton) {
        return
      }
      this.$refs.drawer.handleHeaderMoveUp(event)
    },
    onClose() {
      this.setPanelVisibility(false)
    },
    expandFull() {
      this.updateExpandedState(true)
      this.savePanelSettings()
    },
    compress() {
      this.updateExpandedState(false)
      this.savePanelSettings()
    },
    savePanelSettings() {
      aiPannelLocalStorage.set('expanded', this.expanded)
    },
    updateExpandedState(expanded, notify = true) {
      this.expanded = !!expanded
      this.height = this.expanded ? '100%' : '400px'
      if (notify) {
        this.postPanelState(this.$refs.drawer?.show ?? false)
      }
    },
    onNewChat() {
      this.active = 'chat'
      this.$nextTick(() => {
        this.$refs.component?.onNewChat()
        getInputFocus()
      })
    },
    onToggle(status) {
      this.postPanelState(status)
      if (status) {
        this.initAssistant()
        getInputFocus()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.chat {
  display: flex;
  width: 100%;
  height: 100%;
  pointer-events: auto;

  .container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .header {
      background: linear-gradient(90deg, #ebf1ff 24.34%, #e5fbf8 56.18%, #f2ebfe 90.18%);
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 48px;
      padding: 0 16px;
      overflow: hidden;
      border-bottom: 1px solid #ececec;
      .left {
        display: flex;
        align-items: center;
        img {
          width: 22px;
          height: 22px;
        }
        .title {
          display: inline-block;
          font-size: 18px;
          color: black;
        }
      }
      .new {
        display: inline-flex;
        align-items: center;
        height: 28px;
        line-height: 28px;
        border-radius: 16px;
        padding: 0 10px;
        color: var(--color-primary);
        background-color: #f7f7f8;
        cursor: pointer;
        font-size: 13px;
        &:hover {
          background-color: #ededed;
        }
      }
    }
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  }
  .sidebar {
    height: 100%;
    width: 42px;
  }
}
</style>
