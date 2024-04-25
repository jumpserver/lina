
export let ws = null
let globalUrl = null
let timeoutNum = null
let globalCallback = null
let heartbeatInterval = null
const timeout = 20 * 1000
let lockReconnect = false

/**
 * @param {String} url
 * @param {Function} callback
 */
export function createWebSocket(url = globalUrl, callback = globalCallback) {
  globalUrl = url
  globalCallback = callback

  ws = new WebSocket(url)
  ws.onopen = () => {
    start()
  }
  ws.onmessage = onMessage
  ws.onerror = onError
  ws.onclose = onClose
  ws.onsend = onSend
}

// 发送消息
export function onSend(message) {
  if (typeof message !== 'string') {
    message = JSON.stringify(message)
  }
  ws?.send(message)
}

// 接受服务端消息
export function onMessage(res) {
  const { data: msgData } = res
  if (typeof msgData === 'object') {
    return
  }

  try {
    let data = msgData.replace(/\ufeff/g, '')
    data = JSON.parse(data)
    if (data.type === 'PONG' || data.type === 'PING') {
      return
    }
    data.message = JSON.parse(data.data)
    if (globalCallback) {
      globalCallback(data)
    }
  } catch (error) {
    this.$log.error('socket onMessage error', error)
  }
}

export function start() {
  if (heartbeatInterval) clearInterval(heartbeatInterval)

  heartbeatInterval = setInterval(() => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send('{"type": "PING"}')
    }
  }, timeout)
}

export function reset() {
  if (heartbeatInterval) clearInterval(heartbeatInterval)
  start()
}

export function reconnect() {
  if (lockReconnect) {
    return
  }
  lockReconnect = true
  // 设置延迟避免请求过多
  timeoutNum && clearTimeout(timeoutNum)
  timeoutNum = setTimeout(function() {
    createWebSocket()
    lockReconnect = false
  }, 10000)
}

export function onError() {
  reconnect()
}

export function onClose() {
}

export function closeWebSocket() {
  ws?.close()
  ws = null
  lockReconnect = false
}
