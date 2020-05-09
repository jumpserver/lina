import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import enLocale from 'element-ui/lib/locale/lang/en'
import customCN from './cn.json'
import customEN from './en.json'

const cn = {
  ...customCN,
  ...zhLocale
}
const en = {
  ...customEN,
  ...enLocale
}
export default {
  en,
  cn
}
