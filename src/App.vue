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
  // Vue 3 错误捕获钩子 - 捕获子组件错误，防止整个应用崩溃
  errorCaptured(err, instance, info) {
    // 在开发环境下打印详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Captured in App:', err)
      console.error('Component instance:', instance)
      console.error('Error info:', info)
    } else {
      console.error('Component Error:', err?.message || err)
    }

    // 尝试显示友好的错误提示
    try {
      if (this.$message && typeof this.$message.error === 'function') {
        this.$message.error(err?.message || '组件加载出错，请刷新页面重试')
      }
    } catch (e) {
      // 如果 message 服务不可用，忽略
    }

    // 返回 false 可以阻止错误继续向上传播
    // 但这里返回 true，让全局错误处理器也能处理
    return true
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
