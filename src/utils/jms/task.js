const DEFAULT_INTERVAL = 5000
const DEFAULT_TIMEOUT = 5 * 60 * 1000

export function createTaskExecutionWatcher(options) {
  const {
    axios,
    taskId,
    interval = DEFAULT_INTERVAL,
    timeout = DEFAULT_TIMEOUT,
    onFinished,
    onError
  } = options

  let timer = null
  let controller = null
  let stopped = false
  let paused = false
  let deadline = Date.now() + timeout

  function clearTimer() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  function finish(data) {
    if (stopped) {
      return
    }
    stopped = true
    clearTimer()
    if (onFinished) {
      onFinished(taskId, data)
    }
  }

  function stop() {
    if (stopped) {
      return
    }
    stopped = true
    clearTimer()
    if (controller) {
      controller.abort()
      controller = null
    }
  }

  function handleError(error) {
    const status = error && error.response && error.response.status
    if (status === 401 || status === 403) {
      stop()
      if (onError) {
        onError({ code: 'AUTH_ERROR', taskId, status, error })
      }
      return
    }

    // 404 可能是任务执行记录延迟创建，继续重试直到超时
    if (onError) {
      onError({ code: 'REQUEST_ERROR', taskId, status, error })
    }
    scheduleNext()
  }

  function scheduleNext() {
    if (stopped || paused) {
      return
    }

    const wait = Math.min(interval, Math.max(deadline - Date.now(), 0))
    if (wait <= 0) {
      stop()
      if (onError) {
        onError({ code: 'TIMEOUT', taskId })
      }
      return
    }

    timer = setTimeout(poll, wait)
  }

  async function poll() {
    if (stopped || paused) {
      return
    }

    controller = new AbortController()
    try {
      const response = await axios.get(`/api/v1/ops/task-executions/${taskId}/`, {
        signal: controller.signal,
        raw: 1
      })
      if (stopped || paused) {
        return
      }

      const data = response && response.data
      if (data && data.is_finished) {
        finish(data)
        return
      }

      scheduleNext()
    } catch (error) {
      if (stopped || paused) {
        return
      }
      if (error && (error.name === 'AbortError' || error.code === 'ERR_CANCELED')) {
        return
      }
      handleError(error)
    }
  }

  function pause() {
    if (stopped || paused) {
      return
    }
    paused = true
    clearTimer()
    if (controller) {
      controller.abort()
      controller = null
    }
  }

  function resume() {
    if (!paused || stopped) {
      return
    }
    paused = false
    deadline = Date.now() + Math.max(deadline - Date.now(), 0)
    scheduleNext()
  }

  scheduleNext()

  return {
    stop,
    pause,
    resume
  }
}
