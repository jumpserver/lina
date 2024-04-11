const xss = require('xss')
const excludeTags = ['iframe', 'script']

const options = {
  css: false,
  stripIgnoreTagBody: ['script'],
  onTag(tag, html, options) {
    if (excludeTags.indexOf(tag) !== -1) {
      return html.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }
  },
  // 避免把页面样式过滤掉
  onTagAttr(tag, name, value, isWhiteAttr) {
    // 过滤掉标签上的事件
    if (/^on/.test(name)) {
      return name + '=' + '.'
    }
    if (['src', 'href'].indexOf(name) !== -1) {
      return name + '=' + value.replace('javascript:', 'java:').replace('data:', 'dt:')
    }
    return name + '="' + xss.escapeAttrValue(value) + '"'
  }
}
const filter = new xss.FilterXSS(options)

export default filter
