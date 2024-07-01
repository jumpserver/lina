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
    setTimeout(() => {
      this.$refs.roleList.reloadTable()
    }, 300)
  }
}
</script>
