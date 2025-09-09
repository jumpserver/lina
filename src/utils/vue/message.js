import { Message as elMessage } from 'element-ui'
import { toSentenceCase } from '@/utils/common/index'

let messageDom = null
const DEFAULT_Z_INDEX = 20000

const message = options => {
  if (messageDom) messageDom.close()

  if (typeof options === 'string') {
    options = { message: options }
  }

  options.zIndex = options.zIndex || DEFAULT_Z_INDEX

  messageDom = elMessage(options)
}

const typeArray = ['success', 'error', 'warning', 'info']
typeArray.forEach(type => {
  message[type] = options => {
    if (typeof options === 'string') options = { message: options }
    options.type = type
    options.message = toSentenceCase(options.message)
    return message(options)
  }
})

export { message }
