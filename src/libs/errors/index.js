import { IS_DEV } from '@/utils/env'

/**
 * 全局错误处理器
 * 防止 Vue 3 中未捕获的错误导致整个应用崩溃
 *
 * @param {Object} app - Vue 应用实例
 */
export function setupErrorHandler(app) {
  app.config.errorHandler = (err, instance, info) => {
    // 在开发环境下打印详细错误信息
    if (IS_DEV) {
      console.error('Global Error Handler:', err)
      console.error('Component instance:', instance)
      console.error('Error info:', info)
    } else {
      // 生产环境下只打印错误信息，不打印组件实例
      console.error('Application Error:', err?.message || err)
      console.error('Error info:', info)
    }

    // Do not render an Element Plus message from the global handler. If the
    // exception came from ElMessage itself, doing so recursively creates new
    // message instances and floods the console. Expected request/action errors
    // already show contextual messages at their call sites.
  }
}
