<template>
  <el-color-picker
    v-model="themeColor"
    class="u-theme-picker"
    :predefine="themeList"
    @change="handleChangeColor"
  />
</template>

<script>

export default {
  name: 'ThemePicker2',
  data() {
    return {
      themeColor: this.$store.state.settings.themeColor,
      themeList: [
        '#409EFF',
        '#3C6CFE',
        '#00AE8A',
        '#30BDF4',
        '#6772E5',
        '#FB6B01',
        '#353D64',
        '#7A40F2'
      ]
    }
  },
  methods: {
    handleChangeColor(val) {
      this.$store.commit('settings/setTheme', val)
      this.$store.dispatch('settings/changeThemeStyle')
    }
  }
}
</script>

<style lang="scss">
.u-theme-picker {
  vertical-align: middle;
}
</style>
