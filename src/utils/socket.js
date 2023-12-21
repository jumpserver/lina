
export let ws = null
let lockReconnect = false
const timeout = 10 * 1000
let timeoutObj = null // 心跳心跳倒计时
let serverTimeoutObj = null // 心跳倒计时
let timeoutNum = null // 断开、重连倒计时
let globalCallback = null // 监听服务端消息
let globalUrl = null

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
  const msgData = res.data
  if (typeof msgData !== 'object' && msgData !== 'Connect success' && msgData !== 'pong') {
    let data = msgData.replace(/\ufeff/g, '')
    try {
      data = JSON.parse(data)
      globalCallback(data)
    } catch (error) {
      console.log('返回心跳')
    }
    reset()
  }
}

// 连接失败
export function onError() {
  reconnect()
}

// 连接关闭
export function onClose() {
}

// 断开关闭
export function closeWebSocket() {
  ws?.close()
  ws = null
  lockReconnect = false
}

// 发送心跳
export function start() {
  timeoutObj && clearTimeout(timeoutObj)
  serverTimeoutObj && clearTimeout(serverTimeoutObj)
  timeoutObj = setTimeout(function() {
    if (ws?.readyState === 1) {
      ws.send('ping')
    } else {
      // reconnect()
    }
    serverTimeoutObj = setTimeout(function() {
      // 连接超时
      // ws.close()
    }, timeout)
  }, timeout)
}

// 重置心跳
export function reset() {
  clearTimeout(timeoutObj)
  clearTimeout(serverTimeoutObj)
  start()
}

// 重新连接
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
