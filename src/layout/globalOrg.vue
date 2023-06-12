<script>
import empty from './empty.vue'
import store from '@/store'

export default {
  name: 'GlobalSubmenu',
  extends: empty,
  beforeRouteEnter(to, from, next) {
    store.dispatch('users/enterGlobalOrg').then(() => next())
  },
  beforeRouteLeave(to, from, next) {
    store.dispatch('users/leaveGlobalOrg').then(() => next())
  }
}
</script>
