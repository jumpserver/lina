<template>
  <div class="chat">
    <div class="container">
      <div class="header">
        <span class="title">{{ title }}</span>
        <span class="new" @click="onNewChat">
          <i class="el-icon-plus" />
          <span>{{ $tc('common.NewChat') }}</span>
        </span>
      </div>
      <div class="content">
        <keep-alive>
          <component :is="active" ref="component" />
        </keep-alive>
      </div>
    </div>
    <div class="sidebar">
      <Sidebar :active.sync="active" :submenu="submenu" />
    </div>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar/index.vue'
import Chat from './components/ChitChat/index.vue'

export default {
  components: {
    Chat,
    Sidebar
  },
  props: {
    title: {
      type: String,
      default: 'Chat'
    }
  },
  data() {
    return {
      active: 'chat',
      submenu: [
        {
          name: 'chat',
          label: 'chat',
          icon: 'chat'
        }
      ]
    }
  },
  methods: {
    onClose() {
      this.$parent.show = false
    },
    onNewChat() {
      this.active = 'chat'
      this.$nextTick(() => {
        this.$refs.component.initWebSocket()
        this.$refs.component.initChatMessage()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.chat {
  display: flex;
  width: 100%;
  height: 100%;
  .container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .header {
      display: flex;
      justify-content: space-between;
      height: 48px;
      line-height: 48px;
      padding: 0 16px;
      overflow: hidden;
      border-bottom: 1px solid #ececec;
      .title {
        display: inline-block;
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
      overflow: hidden;
    }
  }
  .sidebar {
    height: 100%;
    width: 42px;
  }
}
</style>
