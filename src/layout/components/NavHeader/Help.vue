<template>
  <el-dropdown trigger="click">
    <span class="el-dropdown-link">
      {{ $t('common.nav.Help') }}<i class="el-icon-arrow-down el-icon--right" />
    </span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item icon="el-icon-plus">{{ $t('common.nav.Docs') }}</el-dropdown-item>
      <el-dropdown-item icon="el-icon-circle-plus">{{ $t('common.nav.Support') }}</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: 'Help'
}
</script>

<style scoped>

</style>
