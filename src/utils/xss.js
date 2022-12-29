const xss = require('xss')

const options = {
  css: false,
  stripIgnoreTagBody: ['script'],
  onTag(tag, html, options) {
    if (tag === 'iframe') {
      return html.replace(/javascript:?/, '')
    }
  },
  // 避免把页面样式过滤掉
  onIgnoreTagAttr(tag, name, value, isWhiteAttr) {
    // 过滤掉标签上的事件
    if (/^[^on]/.test(name)) {
      return name + '="' + xss.escapeAttrValue(value) + '"'
    } else {
      if (tag === 'a') {
        return name + '="' + xss.escapeAttrValue(value) + '"'
      }
    }
  }
}
const filter = new xss.FilterXSS(options)

export default filter
