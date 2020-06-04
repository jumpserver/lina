<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <span class="el-dropdown-link">
      {{ $t('common.nav.Help') }}<i class="el-icon-arrow-down el-icon--right" />
    </span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item icon="el-icon-plus" command="docs">{{ $t('common.nav.Docs') }}</el-dropdown-item>
      <el-dropdown-item icon="el-icon-circle-plus" command="support">{{ $t('common.nav.Support') }}</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: 'Help',
  methods: {
    handleCommand(command) {
      switch (command) {
        case 'support':
          window.open('http://www.jumpserver.org/support/', '_blank')
          break
        default:
          window.open('http://docs.jumpserver.org', '_blank')
          break
      }
    }
  }
}
</script>

<style scoped>

</style>
