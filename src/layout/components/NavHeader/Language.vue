<template>
  <el-dropdown>
    <span class="el-dropdown-link header-lang">
      {{ currentLang.title }}<i class="el-icon-arrow-down el-icon--right" />
    </span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item v-for="item of supportLanguages" :key="item.code" @click.native="changeLangTo(item)">{{ item.title }}</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: 'Language',
  data() {
    return {
      LANG_COOKIE_NAME: 'django_language', // 后端Django需要的COOKIE KEY
      supportLanguages: [
        {
          title: '中文(简体)',
          code: 'cn',
          cookieCode: 'zh-hans' // cookie code是为了让后端知道当前语言
        },
        {
          title: '中文(繁體)',
          code: 'zh_hant',
          cookieCode: 'zh-hant' // cookie code是为了让后端知道当前语言
        },
        {
          title: 'English',
          code: 'en',
          cookieCode: 'en'
        },
        {
          title: '日本語',
          code: 'ja',
          cookieCode: 'ja' // cookie code是为了让后端知道当前语言
        }
      ]
    }
  },
  computed: {
    supportedLangMapper() {
      return this.supportLanguages.reduce((map, obj) => {
        map[obj.code] = obj
        return map
      })
    },
    currentLang() {
      const langCode = this.getLangCode()
      let lang = this.supportedLangMapper[langCode]
      if (!lang) {
        lang = this.supportLanguages[0]
      }
      return lang
    }
  },
  mounted() {
    this.changeMomentLang()
  },
  methods: {
    changeLang() {
      if (this.currentLang.code !== this.$i18n.locale) {
        this.changeLangTo(this.currentLang)
      }
    },
    changeMomentLang() {
      if (this.currentLang.code.indexOf('en') > -1) {
        this.$moment.locale('en')
      } else if (this.currentLang.code.indexOf('ja') > -1) {
        this.$moment.locale('ja')
      } else if (this.currentLang.code.indexOf('zh_hant') > -1) {
        this.$moment.locale('zh-tw')
      } else {
        this.$moment.locale('zh-cn')
      }
    },
    changeLangTo(item) {
      this.$i18n.locale = item.code
      localStorage.setItem('lang', item.code)
      this.$cookie.set(this.LANG_COOKIE_NAME, item.cookieCode)
      window.location.reload()
    },
    getLangCode() {
      let langCode = this.$cookie.get(this.LANG_COOKIE_NAME)
      if (!langCode) {
        langCode = localStorage.lang
      }
      if (!langCode) {
        langCode = navigator.language || navigator.userLanguage
      }
      if (langCode === 'zh-hant') {
        langCode = 'zh_hant'
      } else {
        langCode = langCode.slice(0, 2)
        langCode = langCode.replace('zh', 'cn')
      }
      return langCode
    }
  }
}
</script>

<style scoped>
  .header-lang {
    color: white;
  }
</style>
