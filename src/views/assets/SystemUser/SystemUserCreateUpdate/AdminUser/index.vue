<template>
  <component :is="systemUserProtocolComponent" :title="title" />
</template>

<script>
import SSH from './ssh'

export default {
  name: 'AdminUserCreate',
  data() {
    return {
      title: this.$t('route.SystemUserCreate') + ' - ' + this.$t('assets.AdminUser')
    }
  },
  computed: {
    systemUserProtocolComponent() {
      return SSH
    }
  }
}
</script>

<style scoped>

</style>
