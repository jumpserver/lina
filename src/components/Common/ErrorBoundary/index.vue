<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-boundary-content">
      <h2 class="error-title">{{ $t('ComponentError') || '组件加载出错' }}</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <div class="error-actions">
        <el-button type="primary" @click="handleRetry">{{ $t('Retry') || '重试' }}</el-button>
        <el-button @click="handleGoHome">{{ $t('GoHomePage') || '返回首页' }}</el-button>
      </div>
      <details v-if="showDetails" class="error-details">
        <summary>错误详情 (开发环境)</summary>
        <pre>{{ errorDetails }}</pre>
      </details>
    </div>
  </div>
  <slot v-else />
</template>

<script>
export default {
  name: 'ErrorBoundary',
  data() {
    return {
      hasError: false,
      error: null,
      errorInfo: null
    }
  },
  computed: {
    errorMessage() {
      if (this.error) {
        return this.error.message || String(this.error)
      }
      return '未知错误'
    },
    errorDetails() {
      if (!this.error) return ''
      return JSON.stringify({
        message: this.error.message,
        stack: this.error.stack,
        info: this.errorInfo
      }, null, 2)
    },
    showDetails() {
      return process.env.NODE_ENV === 'development' && this.error
    }
  },
  errorCaptured(err, instance, info) {
    // 捕获子组件错误
    this.hasError = true
    this.error = err
    this.errorInfo = info

    // 在开发环境下打印错误
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught error:', err)
      console.error('Component instance:', instance)
      console.error('Error info:', info)
    }

    // 返回 false 阻止错误继续向上传播
    return false
  },
  methods: {
    handleRetry() {
      // 重置错误状态，重新渲染子组件
      this.hasError = false
      this.error = null
      this.errorInfo = null
      this.$forceUpdate()
    },
    handleGoHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style lang="scss" scoped>
.error-boundary {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 20px;
}

.error-boundary-content {
  text-align: center;
  max-width: 600px;
}

.error-title {
  font-size: 24px;
  color: #f56c6c;
  margin-bottom: 16px;
}

.error-message {
  font-size: 16px;
  color: #606266;
  margin-bottom: 24px;
  word-break: break-word;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.error-details {
  margin-top: 24px;
  text-align: left;

  summary {
    cursor: pointer;
    color: #909399;
    margin-bottom: 8px;

    &:hover {
      color: #606266;
    }
  }

  pre {
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12px;
    color: #606266;
    max-height: 300px;
    overflow-y: auto;
  }
}
</style>
