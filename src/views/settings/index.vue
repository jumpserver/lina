<script>
import Layout from '@/layout'
import orgUtil from '@/utils/org'
import store from '@/store'

export default {
  name: 'Setting',
  extends: Layout,
  beforeRouteEnter(to, from, next) {
    const systemOrg = { id: orgUtil.SYSTEM_ORG_ID, name: 'System' }
    store.dispatch('users/setCurrentOrg', systemOrg).then(() => next())
  },
  beforeRouteLeave(to, from, next) {
    const preOrg = store.state.users.preOrg
    store.dispatch('users/setCurrentOrg', preOrg).then(() => next())
  }
}
</script>
