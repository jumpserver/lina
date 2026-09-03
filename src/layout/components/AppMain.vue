<template>
  <section class="app-main">
    <CachedRouterView />

    <ChatAI v-if="chatAiEnabled" />
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import ChatAI from '@/components/Apps/ChatAi'
import CachedRouterView from '@/layout/components/CachedRouterView.vue'

export default {
  name: 'AppMain',
  components: {
    CachedRouterView,
    ChatAI
  },
  computed: {
    ...mapGetters(['publicSettings']),
    key() {
      // 想让创建后回来 List 页面不刷新，但是完全不刷新 table 会不对，所以创建完成后，会更新 order 和 updated
      // query 去掉这两个，如果变了再刷新
      const query = {}
      for (const [k, v] of Object.entries(this.$route.query)) {
        if (k === 'tab' || k.includes('updated') || k.includes('order') || k.startsWith('_')) {
          continue
        }
        query[k] = v
      }

      let key
      if (this.$route.query['_']) {
        key = this.$route.query['_']
      } else if (this.$route.path.startsWith('/audit/reports/')) {
        // 报表页面：只用路径作为 key，让同一路径的组件实例被复用
        // 包含 query 会导致每次 query 变化都创建新的缓存实例，积累的 deactivated 实例会同时响应路由变化形成循环
        key = _.trimEnd(this.$route.path, '/')
      } else {
        const routeName = this.$route.name?.toLowerCase?.() || ''
        const queryString = new URLSearchParams(query).toString()
        if (routeName.includes('list')) {
          key = _.trimEnd(this.$route.path, '/') + '?' + queryString
        } else {
          key = _.trimEnd(this.$route.path, '/')
          if (queryString) {
            key += '?' + queryString
          }
        }
      }
      return key
    },
    chatAiEnabled() {
      const activeTab = String(this.$route.query.tab || '').toLowerCase()
      const isChatAiSettings = this.$route.name === 'Feature' && activeTab === 'chat'
      return (
        this.publicSettings?.CHAT_AI_ENABLED === true &&
        this.$hasPerm('chat_ai.use_chatai') &&
        this.$route.name !== 'ChatAi' &&
        !isChatAiSettings
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.app-main {
  --el-card-border-color: var(--panel-border-color, var(--el-border-color));

  display: block;
  flex: 1 1 auto;
  background-color: var(--page-content-background-color, #f3f3f4);
  height: 100%;
  min-height: 0;
  min-width: 0;
  width: 100%;
  position: relative;
  overflow: auto;

  // 路由可能经过多层 EmptyLayout。每层 shell 都必须继承主区高度，
  // 否则 Page 的 100% 会退化成内容高度，外层又出现第二根滚动条。
  :deep(.route-view-shell) {
    height: 100%;
    min-height: 0;
    min-width: 0;
  }
}

.hasTagsView {
  .app-main {
    min-height: 0;
  }
}
</style>
