/**
 * 全局错误处理器
 * 防止 Vue 3 中未捕获的错误导致整个应用崩溃
 * 
 * @param {Object} app - Vue 应用实例
 * @param {Object} message - 消息提示服务对象
 */
export function setupErrorHandler(app, message) {
  app.config.errorHandler = (err, instance, info) => {
    // 在开发环境下打印详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error('Global Error Handler:', err)
      console.error('Component instance:', instance)
      console.error('Error info:', info)
    } else {
      // 生产环境下只打印错误信息，不打印组件实例
      console.error('Application Error:', err?.message || err)
      console.error('Error info:', info)
    }

    // 尝试显示友好的错误提示
    try {
      // 使用传入的 message 函数
      if (message && typeof message.error === 'function') {
        message.error(err?.message || 'An error occurred. Please refresh the page.')
      } else {
        // 如果 message 不可用，至少输出到控制台
        console.error('Error details:', err)
      }
    } catch (e) {
      // 如果 message 服务不可用，忽略
      console.error('Failed to show error message:', e)
    }

    // 不重新抛出错误，防止应用完全崩溃
    // 这样即使某个组件出错，其他部分仍可正常显示
  }
}

