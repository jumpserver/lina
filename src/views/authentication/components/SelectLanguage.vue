<template>
  <div>
    <el-select
      v-model="selectedValue"
      class="my-select"
      @change="handleChangeLanguage"
    >
      <template slot="prefix">
        <svg-icon class="icon" icon-class="i18n" />
      </template>
      <el-option label="中文(简体)" value="zh-hans" />
      <el-option label="English" value="en" />
      <el-option label="日本語" value="ja" />
    </el-select>
  </div>
</template>

<script>
import { redirectUrl } from '@/utils/common'
import store from '@/store'

export default {
  name: 'SelectLanguage',
  data() {
    return {
      selectedValue: store.getters.publicSettings?.LOGIN_INFO?.LANGUAGE_CODE || 'zh-hans'
    }
  },
  methods: {
    handleChangeLanguage(val) {
      this.$axios.get(`/api/v1/i18n/${val}/`).then((data) => {
        redirectUrl(this.$router, data?.redirect)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-select {
    & >>> .el-input__inner {
      font-size: 10px;
      border: none;
    }
    & >>> .el-input__prefix {
      margin-top: 7px;
    }
    & >>> .el-select__caret {
      color: black;
    }
  }

</style>
