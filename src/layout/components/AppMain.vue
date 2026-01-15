<template>
  <section class="app-main">
    <transition mode="out-in" name="fade-transform">
      <keep-alive :max="10">
        <router-view :key="key" />
      </keep-alive>
    </transition>
    <ChatGPT v-if="chatAiEnabled" />
  </section>
</template>

<script>
import ChatGPT from '@/components/Apps/ChatAi'
import { mapGetters } from 'vuex'

export default {
  name: 'AppMain',
  components: {
    ChatGPT
  },
  computed: {
    ...mapGetters(['publicSettings']),
    key() {
      // 想让创建后回来 List 页面不刷新，但是完全不刷新 table 会不对，所以创建完成后，会更新 order 和 updated
      // query 去掉这两个，如果变了再刷新
      const query = {}
      for (const [k, v] of Object.entries(this.$route.query)) {
        if (k.includes('updated') || k.includes('order') || k.startsWith('_')) {
          continue
        }
        query[k] = v
      }

      let key
      if (this.$route.query['_']) {
        key = this.$route.query['_']
      } else if (this.$route.name.toLowerCase().includes('list')) {
        key = _.trimEnd(this.$route.path, '/') + '?' + new URLSearchParams(query).toString()
      } else {
        key = new Date().getTime()
        // key = this.$route.fullPath
      }
      return key
    },
    chatAiEnabled() {
      return this.publicSettings?.CHAT_AI_ENABLED
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.app-main {
  background-color: #eef1f6;
  height: 100%;
  //height: 100vh !important;
  width: 100%;
  position: relative;
  overflow: auto;
  /*padding: 10px 20px 10px;*/
}

.fixed-header + .app-main {
  padding-top: 50px;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    min-height: calc(100vh - 84px);
  }

  .fixed-header + .app-main {
    padding-top: 84px;
  }
}
</style>
