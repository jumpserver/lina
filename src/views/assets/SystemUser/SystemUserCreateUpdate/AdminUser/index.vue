<template>
  <component :is="systemUserProtocolComponent" :title="iTitle" />
</template>

<script>
import SSH from './ssh'

export default {
  name: 'AdminUserCreate',
  data() {
    return {
    }
  },
  computed: {
    iTitle() {
      const params = this.$route.params
      let title = ''
      if (params.id) {
        title = this.$t('route.SystemUserUpdate')
      } else {
        title = this.$t('route.SystemUserCreate')
      }
      return title + '-' + this.$t('assets.AdminUser')
    },
    systemUserProtocolComponent() {
      return SSH
    }
  }
}
</script>

<style scoped>

</style>
