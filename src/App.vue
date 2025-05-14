<template>
  <div id="app">
    <router-view v-if="isRouterAlive" />
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
      isRouterAlive: state => state.common.isRouterAlive
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

      // 找出模板中所有的变量占位符 ${xxx}
      const placeholders = template.match(/\${([^}]+)}/g) || []
      const allVariables = {}

      // 为模板中的每个变量准备值
      placeholders.forEach(placeholder => {
        const varName = placeholder.slice(2, -1) // 提取变量名，去掉 ${ 和 }
        allVariables[varName] = fields[varName] !== undefined ? fields[varName] : 'N/A'
      })

      // 合并用户现有的字段和模板中可能缺失的字段
      const safeFields = { ...fields, ...allVariables }

      // 安全解析模板
      return new Function(...Object.keys(safeFields), `return \`${template}\`;`)(...Object.values(safeFields))
    },

    createWatermark() {
      if (this.currentUser?.username && this.publicSettings?.SECURITY_WATERMARK_ENABLED && this.$store.getters.hasValidLicense) {
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
