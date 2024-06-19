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
    ...mapGetters([
      'publicSettings'
    ]),
    key() {
      if (this.$route.name.toLowerCase().includes('list')) {
        return this.$route.path
      } else {
        return new Date().getTime()
      }
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
  background-color: #f3f3f4;
  height: 100% !important;
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

<style lang="scss">
</style>
