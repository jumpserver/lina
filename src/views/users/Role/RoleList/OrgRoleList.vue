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
      this.$refs.roleList?.reloadTable?.()
    }, 300)
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
