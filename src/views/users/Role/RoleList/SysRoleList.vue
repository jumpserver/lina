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
  data() {
    return {
      activatedReloadTimer: null,
      hasBeenDeactivated: false
    }
  },
  activated() {
    if (!this.hasBeenDeactivated) {
      return
    }
    clearTimeout(this.activatedReloadTimer)
    this.activatedReloadTimer = setTimeout(() => {
      this.$refs.roleList?.reloadTable()
    })
  },
  deactivated() {
    this.hasBeenDeactivated = true
    clearTimeout(this.activatedReloadTimer)
    this.activatedReloadTimer = null
  },
  beforeUnmount() {
    clearTimeout(this.activatedReloadTimer)
    this.activatedReloadTimer = null
  }
}
</script>
