<template>
  <div id="app">
    <!-- 使用 key 而不是 v-if 来强制重新渲染 router-view，避免根节点被完全卸载导致的 DOM insertBefore 错误 -->
    <router-view :key="isRouterAlive" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { Watermark } from 'watermark-js-plus'

export default {
  name: 'App',
  data() {
    return {
      watermark: null
    }
  },
  computed: {
    ...mapState({
      isRouterAlive: (state) => state.common.isRouterAlive
    }),
    ...mapGetters({
      currentUser: 'currentUser',
      publicSettings: 'publicSettings'
    })
  },
  watch: {
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
