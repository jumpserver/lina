<template>
  <div>
    <el-select
      v-model="selectedValue"
      class="my-select"
    >
      <template slot="prefix">
        <svg-icon class="icon" icon-class="i18n" />
      </template>
      <el-option label="中文(简体)" value="zh" />
      <el-option label="英文" value="en" />
      <el-option label="日文" value="ja" />
    </el-select>
  </div>
</template>

<script>

export default {
  name: 'SelectLanguage',
  data() {
    return {
      selectedValue: 'zh'
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
