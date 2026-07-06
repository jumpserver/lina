<script>
import Layout from '@/layout'
import store from '@/store'

export default {
  name: 'Setting',
  extends: Layout,
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
