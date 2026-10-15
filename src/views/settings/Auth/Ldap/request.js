import i18n from '@/i18n/i18n'
import { createWsUrl } from '@/utils/common/index'

// Each LDAP command has one result. Always close the socket and settle on denial/disconnect.
export function requestLdap(category, payload) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(createWsUrl(`/ws/ldap/?category=${encodeURIComponent(category)}`))
    let settled = false
    const finish = (error, data) => {
      if (settled) return
      settled = true
      if (error) reject(error)
      else resolve(data)
      socket.close()
    }
    socket.onopen = () => {
      try {
        socket.send(JSON.stringify(payload))
      } catch (error) {
        finish(error)
      }
    }
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (!data.ok) {
          const message = data.msg === 'Permission denied' ? i18n.t('BadRoleErrorMsg') : data.msg
          throw new Error(message || i18n.t('ConnectWebSocketError'))
        }
        finish(null, data)
      } catch (error) {
        finish(error)
      }
    }
    socket.onerror = () => finish(new Error(i18n.t('ConnectWebSocketError')))
    socket.onclose = (event) => {
      const key = event.code === 1008 ? 'BadRoleErrorMsg' : 'WebSocketDisconnect'
      finish(new Error(i18n.t(key)))
    }
  })
}
