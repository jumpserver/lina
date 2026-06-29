<script>
import empty from './empty.vue'
import store from '@/store'

export default {
  name: 'GlobalSubmenu',
  extends: empty,
  async beforeRouteEnter() {
    await store.dispatch('users/enterGlobalOrg')
    return true
  },
  async beforeRouteLeave() {
    await store.dispatch('users/leaveGlobalOrg')
    return true
  }
}
</script>
