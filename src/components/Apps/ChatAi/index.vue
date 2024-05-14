<template>
  <DrawerPanel ref="drawer" :expanded="expanded" :height="height" :icon="robotUrl" :modal="false" @toggle="onToggle">
    <div class="chat">
      <div class="container">
        <div ref="header" class="header" @mousedown="handleMoveMouseDown" @mouseup="handleMouseMoveUp">
          <div class="left">
            <img :src="robotUrl" alt="">
            <span class="title">{{ title }}</span>
          </div>
          <span class="new" @click="onNewChat">
            <i class="el-icon-plus" />
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
          :active.sync="active"
          :expanded="expanded"
          v-bind="$attrs"
          @close="onClose"
          @compress="compress"
          @expand="expandFull"
          v-on="$listeners"
        />
      </div>
    </div>
  </DrawerPanel>
</template>

<script>
import Sidebar from './components/Sidebar/index.vue'
import Chat from './components/ChitChat/index.vue'
import { getInputFocus } from './useChat.js'
import { ws } from '@/utils/socket'
import DrawerPanel from '@/components/Apps/DrawerPanel/index.vue'

export default {
  components: {
    DrawerPanel,
    Chat,
    Sidebar
  },
  props: {
    title: {
      type: String,
      default: function() {
        return this.$t('ChatAI')
      }
    },
    drawerPanelVisible: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      active: 'chat',
      robotUrl: require('@/assets/img/robot-assistant.png'),
      height: '400px',
      expanded: false,
      clientOffset: {}
    }
  },
  watch: {
  },
  mounted() {
  },
  methods: {
    handleMoveMouseDown(event) {
      this.$refs.drawer.handleHeaderMoveDown(event)
    },
    handleMouseMoveUp(event) {
      this.$refs.drawer.handleHeaderMoveUp(event)
    },
    initWebSocket() {
      if (!ws) {
        this.$refs.component?.init()
      }
    },
    onClose() {
      this.$refs.drawer.show = false
    },
    expandFull() {
      this.height = '100%'
      this.expanded = true
    },
    compress() {
      this.height = '400px'
      this.expanded = false
    },
    onNewChat() {
      this.active = 'chat'
      this.$nextTick(() => {
        this.$refs.component?.onNewChat()
        getInputFocus()
      })
    },
    onToggle(status) {
      this.initWebSocket()
      if (status) {
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
      background: linear-gradient(90deg, #ebf1ff 24.34%, #e5fbf8 56.18%, #f2ebfe 90.18%);;
      display: flex;
      justify-content: space-between;
      height: 48px;
      line-height: 48px;
      padding: 0 16px;
      overflow: hidden;
      border-bottom: 1px solid #ececec;
      .left {
        img {
          width: 22px;
          height: 22px;
          vertical-align: sub;
        }
        .title {
          display: inline-block;
          font-size: 18px;
          color: black;
        }
      }
      .new {
        display: inline-block;
        height: 28px;
        line-height: 28px;
        border-radius: 16px;
        padding: 0 10px;
        transform: translateY(32%);
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
