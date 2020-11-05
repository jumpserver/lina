<template>
  <el-dropdown trigger="click">
    <span class="el-dropdown-link">
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
          title: 'English',
          code: 'en',
          cookieCode: 'en'
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
    if (this.currentLang.code !== this.$i18n.locale) {
      this.changeLangTo(this.currentLang)
    }
  },
  methods: {
    changeLangTo(item) {
      this.$i18n.locale = item.code
      localStorage.setItem('lang', item.code)
      this.$cookie.set(this.LANG_COOKIE_NAME, item.cookieCode)
      window.location.reload()
    },
    getLangCode() {
      if (localStorage.lang) {
        return localStorage.lang
      }
      let browserLang = navigator.language || navigator.userLanguage
      browserLang = browserLang.substr(0, 2)
      browserLang = browserLang.replace('zh', 'cn')
      if (browserLang) {
        return browserLang
      }

      const cookieCode = this.$cookie.get(this.LANG_COOKIE_NAME)
      const lang = this.supportLanguages.find((v) => v.cookieCode === cookieCode)
      if (lang) {
        return lang[0].code
      }
    }
  }
}
</script>

<style scoped>

</style>
