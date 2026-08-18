import { createTaskExecutionWatcher } from '@/utils/jms/task'

export default {
  data() {
    return {
      taskPollingTimers: {}
    }
  },
  methods: {
    startTaskPolling(taskId) {
      if (this._isDestroyed) {
        return
      }

      const key = `task:${taskId}`
      this.stopTaskPolling(taskId)

      const watcher = createTaskExecutionWatcher({
        axios: this.$axios,
        taskId,
        onFinished: () => {
          this.$delete(this.taskPollingTimers, key)
          if (!this._isDestroyed) {
            this.reloadTable()
          }
        },
        onError: (errorInfo) => {
          if (errorInfo.code === 'TIMEOUT' || errorInfo.code === 'AUTH_ERROR') {
            this.$delete(this.taskPollingTimers, key)
          }
          this.$log.debug('Task execution polling error', errorInfo)
        }
      })

      this.$set(this.taskPollingTimers, key, watcher)
    },
    stopTaskPolling(taskId) {
      const key = `task:${taskId}`
      const watcher = this.taskPollingTimers[key]
      if (!watcher) {
        return
      }
      watcher.stop()
      this.$delete(this.taskPollingTimers, key)
    },
    pauseTaskPolling() {
      Object.keys(this.taskPollingTimers).forEach(key => {
        this.taskPollingTimers[key].pause()
      })
    },
    resumeTaskPolling() {
      Object.keys(this.taskPollingTimers).forEach(key => {
        this.taskPollingTimers[key].resume()
      })
    },
    stopAllTaskPolling() {
      Object.keys(this.taskPollingTimers).forEach(key => {
        this.taskPollingTimers[key].stop()
      })
      this.taskPollingTimers = {}
    }
  },
  beforeDestroy() {
    this.stopAllTaskPolling()
  },
  deactivated() {
    this.pauseTaskPolling()
  },
  activated() {
    this.resumeTaskPolling()
  }
}
