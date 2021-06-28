<template>
  <component :is="systemUserProtocolComponent" />
</template>

<script>
import SSH from './ssh'

export default {
  name: 'AdminUserCreate',
  computed: {
    systemUserProtocolComponent() {
      return SSH
    }
  }
}
</script>

<style scoped>

</style>
