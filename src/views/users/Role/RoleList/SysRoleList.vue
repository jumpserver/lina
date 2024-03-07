<template>
  <div>
    <el-alert type="success">{{ $t('SystemRoleHelpMsg') }}</el-alert>
    <BaseRoleList scope="system" />
  </div>
</template>

<script>
import BaseRoleList from './BaseRoleList'

export default {
  name: 'SysRoleList',
  components: {
    BaseRoleList
  },
  data() {
    return {
    }
  }
}
</script>

<style>

</style>
