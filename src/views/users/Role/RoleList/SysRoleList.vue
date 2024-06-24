<template>
  <div>
    <BaseRoleList ref="roleList" scope="system" />
  </div>
</template>

<script>
import BaseRoleList from './BaseRoleList'

export default {
  name: 'SysRoleList',
  components: {
    BaseRoleList
  },
  activated() {
    this.$refs.roleList.reloadTable()
  }
}
</script>
