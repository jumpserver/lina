<script>
import Layout from '@/layout'
import store from '@/store'
import { useResizeHandler } from '@/utils/vue/useResizeHandler'

export default {
  name: 'Setting',
  extends: Layout,
  setup() {
    useResizeHandler()
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
