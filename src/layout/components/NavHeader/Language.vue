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
      const lang = getLangCode(true)
      return this.supportedLangMapper[lang] || this.defaultLang
    }
  },
  mounted() {
    this.supportLanguages = store.getters.publicSettings['LANGUAGES'].map(item => {
      return {
        title: item.name,
        code: item.code,
        cookieCode: item.code
      }
    })
    this.changeMomentLang()
  },
  methods: {
    changeMomentLang() {
      const lang = getLangCode()
      this.$moment.locale(lang)
      document.documentElement.lang = lang
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
