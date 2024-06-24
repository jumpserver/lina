<template>
  <div>
    <BaseRoleList ref="roleList" scope="org" />
  </div>
</template>

<script>
import BaseRoleList from './BaseRoleList'

export default {
  name: 'OrgRoleList',
  components: {
    BaseRoleList
  },
  activated() {
    this.$refs.roleList.reloadTable()
  }
}
</script>
