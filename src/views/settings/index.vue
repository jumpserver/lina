<script>
import Layout from '@/layout'
import store from '@/store'

export default {
  name: 'Setting',
  extends: Layout,
  beforeRouteEnter(to, from, next) {
    store.dispatch('users/enterSettingOrg').then(() => next())
  },
  beforeRouteLeave(to, from, next) {
    store.dispatch('users/leaveSettingOrg').then(() => next())
  }
}
</script>
