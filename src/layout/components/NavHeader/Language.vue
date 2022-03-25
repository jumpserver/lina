<template>
  <el-dropdown>
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
          title: 'English',
          code: 'en',
          cookieCode: 'en'
        },
        {
          title: '中文(简体)',
          code: 'cn',
          cookieCode: 'zh-hans' // cookie code是为了让后端知道当前语言
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
    this.changeLang()
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
      let langCode = localStorage.lang
      if (!langCode) {
        langCode = this.$cookie.get(this.LANG_COOKIE_NAME)
      }
      if (!langCode) {
        langCode = navigator.language || navigator.userLanguage
      }
      langCode = langCode.substr(0, 2)
      langCode = langCode.replace('zh', 'cn')
      return langCode
    }
  }
}
</script>

<style scoped>

</style>
