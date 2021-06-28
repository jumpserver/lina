<template>
  <component :is="systemUserTypeComponent" />
</template>

<script>
import CommonUser from './CommonUser/index'
import AdminUser from './AdminUser/index'

export default {
  name: 'SystemUserCreateUpdate',
  components: { CommonUser, AdminUser },
  computed: {
    systemUserTypeComponent() {
      const query = this.$route.query
      const type = query.type || 'common'
      if (type === 'admin') {
        return AdminUser
      } else {
        return CommonUser
      }
    }
  }
}
</script>

<style lang='less' scoped>

</style>
