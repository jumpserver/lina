// 重置message，防止重复点击重复弹出message弹框
import { Message as elMessage } from 'element-ui'

let messageDom = null
const message = (options) => {
  // 判断弹窗是否已存在, 若存在则关闭
  if (messageDom) messageDom.close()
  messageDom = elMessage(options)
}

const typeArray = ['success', 'error', 'warning', 'info']
typeArray.forEach(type => {
  message[type] = options => {
    if (typeof options === 'string') options = { message: options }
    options.type = type
    return message(options)
  }
})

export { message }
