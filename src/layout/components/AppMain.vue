<template>
  <section class="app-main">
    <transition mode="out-in" name="fade-transform">
      <keep-alive :include="cachedViews">
        <router-view :key="key" />
      </keep-alive>
    </transition>
    <DrawerPanel v-if="chatAiEnabled" :icon="robotUrl" :modal="false" @toggle="onToggle">
      <template scope="panelData">
        <ChatGPT :drawer-panel-visible="panelData.drawerPanelVisible" />
      </template>
    </DrawerPanel>
  </section>
</template>

<script>
import DrawerPanel from '@/components/Apps/DrawerPanel'
import ChatGPT from '@/components/Apps/ChatAi'
import { mapGetters } from 'vuex'
import { getInputFocus } from '@/components/Apps/ChatAi/useChat'

export default {
  name: 'AppMain',
  components: {
    ChatGPT,
    DrawerPanel
  },
  computed: {
    ...mapGetters([
      'publicSettings'
    ]),
    robotUrl() {
      return require('../../assets/img/robot-assistant.png')
    },
    chatAiEnabled() {
      return this.publicSettings?.CHAT_AI_ENABLED
    },
    key() {
      return this.$route.path
    },
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    }
  },
  methods: {
    onToggle(status) {
      if (status) {
        getInputFocus()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-main {
  background-color: #f3f3f4;
  height: 100%!important;
  width: 100%;
  position: relative;
  overflow: auto;
  /*padding: 10px 20px 10px;*/
}
.fixed-header+.app-main {
  padding-top: 50px;
}
.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    min-height: calc(100vh - 84px);
  }
  .fixed-header+.app-main {
    padding-top: 84px;
  }
}
</style>

<style lang="scss">
</style>
