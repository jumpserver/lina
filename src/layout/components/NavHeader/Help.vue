<template>
  <el-dropdown :show-timeout="50" @command="handleCommand">
    <span class="el-dropdown-link">
      {{ $t('common.nav.Help') }}<i class="el-icon-arrow-down el-icon--right" />
    </span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="docs">{{ $t('common.nav.Docs') }}</el-dropdown-item>
      <el-dropdown-item command="support">{{ $t('common.nav.Support') }}</el-dropdown-item>
      <el-dropdown-item command="EnterpriseEdition">{{ $t('common.nav.EnterpriseEdition') }}</el-dropdown-item>
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
        case 'EnterpriseEdition':
          window.open('https://jumpserver.org/enterprise.html', '_blank')
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
