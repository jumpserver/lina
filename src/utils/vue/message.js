import { ElMessage as elMessage } from 'element-plus'
import { toSentenceCase } from '@/utils/common/string'
import { toPlainTextMessage } from '@/utils/common/message'

let messageDom = null
const DEFAULT_Z_INDEX = 20000

const message = (options) => {
  if (messageDom) messageDom.close()

  if (typeof options === 'string') {
    options = { message: options }
  }

  if (typeof options.message === 'string') {
    options.message = toPlainTextMessage(options.message)
  }

  options.zIndex = options.zIndex || DEFAULT_Z_INDEX

  messageDom = elMessage(options)
}

const typeArray = ['success', 'error', 'warning', 'info']
typeArray.forEach((type) => {
  message[type] = (options) => {
    if (typeof options === 'string') options = { message: options }
    options.type = type
    options.message = toSentenceCase(options.message)
    return message(options)
  }
})

export { message }
