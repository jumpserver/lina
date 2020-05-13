import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import enLocale from 'element-ui/lib/locale/lang/en'
import _ from 'lodash'

function loadLangFromContext(context) {
  const langs = {}
  context.keys().forEach(module => {
    // module = './cn/assets.json'
    const moduleName = module.replace('./', '').replace('.json', '')
    const [lang, app] = moduleName.split('/')
    if (lang && app) {
      if (!langs[lang]) {
        langs[lang] = {}
      }
      langs[lang][app] = context(module)
    }
  })
  return langs
}

const loadCustomLang = function() {
  const requireContext = require.context('.', true, /\.json$/)
  return loadLangFromContext(requireContext)
}

const sysLang = {
  cn: {
    ...zhLocale
  },
  en: {
    ...enLocale
  }
}

const customLang = loadCustomLang()

const lang = _.merge(sysLang, customLang)

export default lang
