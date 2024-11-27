<template>
  <el-dropdown>
    <span class="el-dropdown-link header-lang">
      {{ currentLang.title }}<i class="el-icon-arrow-down el-icon--right" />
    </span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item
        v-for="item of supportLanguages"
        :key="item.code"
        @click.native="changeLangTo(item)"
      >
        {{ item.title }}
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import { getLangCode } from '@/i18n/utils'
import store from '@/store'

export default {
  name: 'Language',
  data() {
    return {
      langCookeName: 'django_language', // 后端Django需要的COOKIE KEY
      supportLanguages: [],
      currentLangCode: '',
      defaultLang: {
        title: 'English',
        code: 'en',
        cookieCode: 'en'
      }
    }
  },
  computed: {
    supportedLangMapper() {
      return this.supportLanguages.reduce((map, obj) => {
        map[obj.code] = obj
        return map
      }, {})
    },
    currentLang() {
      const lang = this.supportedLangMapper[this.currentLangCode] || this.defaultLang
      return lang
    }
  },
  mounted() {
    this.currentLangCode = getLangCode()
    this.supportLanguages = store.getters.publicSettings['LANGUAGES'].map(item => {
      let code = item.code.replace('-', '_')
      if (code !== 'zh_hant') {
        code = code.slice(0, 2)
      }
      return {
        title: item.name,
        code: code,
        cookieCode: item.code
      }
    })
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
        document.documentElement.lang = 'en'
      } else if (this.currentLang.code.indexOf('ja') > -1) {
        this.$moment.locale('ja')
        document.documentElement.lang = 'ja'
      } else if (this.currentLang.code.indexOf('zh_hant') > -1) {
        this.$moment.locale('zh-tw')
        document.documentElement.lang = 'zh-tw'
      } else {
        this.$moment.locale('zh-cn')
        document.documentElement.lang = 'zh-cn'
      }
    },
    changeLangTo(item) {
      this.$axios.get(`/core/i18n/${item.cookieCode}/`).then(() => {
        window.location.reload()
      })
    }
  }
}
</script>

<style scoped>
  .header-lang {
    color: white;
  }
</style>
