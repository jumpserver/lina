<template>
  <div id="app">
    <!-- 使用 key 而不是 v-if 来强制重新渲染 router-view，避免根节点被完全卸载导致的 DOM insertBefore 错误 -->
    <div
      v-if="sessionContentReady"
      :inert="sessionBlocked || undefined"
      class="app-session-content"
    >
      <router-view :key="isRouterAlive" />
    </div>
    <WebScreenLock />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { Watermark } from 'watermark-js-plus'
import WebScreenLock from '@/components/ScreenLock/index.vue'
import { webSessionLockState } from '@/composables/useWebSessionLock'

export default {
  name: 'App',
  components: { WebScreenLock },
  data() {
    return {
      watermark: null,
      sessionContentReady: false
    }
  },
  computed: {
    screenLockState: () => webSessionLockState,
    sessionBlocked() {
      return !this.screenLockState.ready || this.screenLockState.locked
    },
    ...mapState({
      isRouterAlive: (state) => state.common.isRouterAlive
    }),
    ...mapGetters({
      currentUser: 'currentUser',
      publicSettings: 'publicSettings'
    })
  },
  mounted() {
    this.$router.isReady().then(this.finishInitialLoading, this.finishInitialLoading)
  },
  watch: {
    'screenLockState.ready': {
      immediate: true,
      handler(ready) {
        if (ready && this.screenLockState.locked) this.finishInitialLoading()
      }
    },
    sessionBlocked: {
      immediate: true,
      handler(blocked) {
        if (!blocked && !this.sessionContentReady) {
          this.sessionContentReady = true
          this.$store.dispatch('assets/getAssetCategories').catch(() => {})
        }
      }
    },
    currentUser: {
      handler(newVal) {
        this.createWatermark()
      }
    },
    'publicSettings.SECURITY_WATERMARK_ENABLED': {
      handler(newVal) {
        if (!newVal) {
          return setTimeout(() => {
            this.watermark?.destroy()
            this.watermark = null
          })
        }

        this.createWatermark()
      }
    }
  },
  methods: {
    async finishInitialLoading() {
      await this.$nextTick()
      document.getElementById('loading')?.remove()
    },
    getWaterMarkFields() {
      const user = this.currentUser
      const userId = user?.id || ''
      const name = user?.name || ''
      const userName = user?.username || ''
      const currentTime = this.$moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      return { userId, name, userName, currentTime }
    },
    getWaterMarkContent() {
      const fields = this.getWaterMarkFields()
      const template = this.publicSettings.SECURITY_WATERMARK_CONSOLE_CONTENT || ''
      return template.replace(/\${([^}]+)}/g, (_, variableName) => {
        const key = variableName.trim()
        return fields[key] !== undefined ? fields[key] : 'N/A'
      })
    },

    createWatermark() {
      if (this.currentUser?.username && this.publicSettings?.SECURITY_WATERMARK_ENABLED) {
        this.watermark = new Watermark({
          content: this.getWaterMarkContent(),
          width: this.publicSettings?.SECURITY_WATERMARK_WIDTH,
          height: this.publicSettings?.SECURITY_WATERMARK_HEIGHT,
          rotate: this.publicSettings?.SECURITY_WATERMARK_ROTATE,
          fontWeight: 'normal',
          fontSize: this.publicSettings?.SECURITY_WATERMARK_FONT_SIZE + 'px',
          fontColor: this.publicSettings?.SECURITY_WATERMARK_COLOR,
          contentType: 'multi-line-text',
          lineHeight: this.publicSettings?.SECURITY_WATERMARK_FONT_SIZE
        })
        this.watermark.create()
      }
    }
  }
}
</script>

<style scoped>
.app-session-content {
  height: 100%;
}
</style>
