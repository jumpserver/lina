<template>
  <TabPage v-model:active-menu="activeMenu" :submenu="submenu">
    <keep-alive>
      <component :is="activeMenu" />
    </keep-alive>
  </TabPage>
</template>

<script>
import TabPage from '@/layout/components/TabPage/index.vue'
import Chat from '@/views/settings/Feature/Chat.vue'

export default {
  name: 'ChatAISettings',
  components: { Chat, TabPage },
  data() {
    return {
      activeMenu: 'Chat',
      submenu: [
        {
          title: this.$t('ChatAI'),
          name: 'Chat'
        }
      ]
    }
  }
}
</script>
