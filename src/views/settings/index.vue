<script>
import Layout from '@/layout'
import store from '@/store'
import { mapGetters } from 'vuex'
import { setPreOrgLocal } from '@/utils/auth'
import { GLOBAL_ORG_ID } from '@/utils/org'

export default {
  name: 'Setting',
  extends: Layout,
  computed: {
    ...mapGetters(['currentOrg'])
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (vm.currentOrg.id === GLOBAL_ORG_ID) {
        const currentUser = vm.$store.state.users.username

        setPreOrgLocal(currentUser, vm.currentOrg)
      }

      store.dispatch('users/enterSettingOrg').then(() => next())
    })
  },
  beforeRouteLeave(to, from, next) {
    store.dispatch('users/leaveSettingOrg').then(() => next())
  }
}
</script>
