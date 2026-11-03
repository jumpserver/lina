<template>
  <TabPage v-model:active-menu="activeMenu" :submenu="submenu">
    <keep-alive>
      <component :is="activeMenu" v-if="contentReady" :key="activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import TabPage from '@/layout/components/TabPage/index.vue'
import Chat from './Chat.vue'
import MCP from './MCP.vue'

export default {
  name: 'ChatAISettings',
  components: { Chat, MCP, TabPage },
  data() {
    return {
      activeMenu: this.$hasPerm('settings.change_chatai') ? 'Chat' : 'MCP'
    }
  },
  computed: {
    submenu() {
      return [
        {
          title: this.$t('ChatAIConfiguration'),
          name: 'Chat',
          hidden: !this.$hasPerm('settings.change_chatai')
        },
        {
          title: this.$t('AgentMCP'),
          name: 'MCP',
          hidden: !this.$hasPerm('settings.change_auth')
        }
      ]
    },
    contentReady() {
      const selected = String(this.$route.query.tab || '').toLowerCase()
      const visible = this.submenu.filter((item) => !item.hidden)
      const tab = visible.find((item) => item.name.toLowerCase() === selected)
      return (
        visible.some((item) => item.name === this.activeMenu) &&
        (!tab || tab.name === this.activeMenu)
      )
    }
  },
  watch: {
    submenu(items) {
      if (!items.some((item) => item.name === this.activeMenu && !item.hidden)) {
        this.activeMenu = items.find((item) => !item.hidden)?.name || ''
      }
    }
  }
}
</script>
