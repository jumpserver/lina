import { MessageBox } from 'element-ui'

export const useConfirm = (tipMessage, callback, onCancel) => {
  // 将能够显示控制的文本单独拿出
  const {
    msg,
    title = '提示',
    type = 'warning',
    customOptions = {}
  } = tipMessage

  return new Promise((resolve, reject) => {
    MessageBox.confirm(msg, title, {
      type,
      ...customOptions
    }).then(() => {
      callback && callback()
    }).catch(() => {
      onCancel && onCancel()
    })
  })
}
