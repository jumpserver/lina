<template>
  <section class="app-main">
    <CachedRouterView />

    <ChatGPT v-if="chatAiEnabled" />
  </section>
</template>

<script>
import ChatGPT from '@/components/Apps/ChatAi'
import { mapGetters } from 'vuex'
import CachedRouterView from '@/layout/components/CachedRouterView.vue'

export default {
  name: 'AppMain',
  components: {
    CachedRouterView,
    ChatGPT
  },
  computed: {
    ...mapGetters(['publicSettings']),
    chatAiEnabled() {
      return this.publicSettings?.CHAT_AI_ENABLED
    }
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.app-main {
  background-color: #f3f3f4;
  height: 100%;
  //height: 100vh !important;
  width: 100%;
  position: relative;
  overflow: auto;
  /*padding: 10px 20px 10px;*/
}

// 注意：.main-container 已通过 `position: relative; top: $headerHeight` 整体下移避开固定头部
// （见 styles/sidebar.scss），因此这里 **不能** 再加 padding-top，否则会双重下移 $headerHeight，
// 在头部下方留出一条空白（点右键只会命中 app-wrapper，因为那是 app-main padding 区）。
.fixed-header + .app-main {
  padding-top: 0;
}

.hasTagsView {
  .app-main {
    /* navbar + tags-view = $headerHeight + 34 */
    min-height: calc(100vh - #{$headerHeight} - 34px);
  }

  // tags-view 高 34px，main-container 已偏移 $headerHeight，这里只需再补 tags-view 高度
  .fixed-header + .app-main {
    padding-top: 34px;
  }
}
</style>
