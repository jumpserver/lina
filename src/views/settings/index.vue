<template>
  <Layout />
</template>

<script>
import Layout from '@/layout'
import store from '@/store'

export default {
  name: 'Setting',
  routeViewShell: true,
  components: {
    Layout
  },
  async beforeRouteEnter() {
    await store.dispatch('users/enterSettingOrg')
    return true
  },
  async beforeRouteLeave() {
    await store.dispatch('users/leaveSettingOrg')
    return true
  }
}
</script>
