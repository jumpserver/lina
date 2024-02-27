<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="Account" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="Account" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import AccountDetail from './AccountDetail'

export default {
  components: {
    GenericDetailPage,
    AccountDetail,
    TabPage
  },
  data() {
    const vm = this
    return {
      Account: {
        name: '', provider: '', provider_display: '', validity_display: '', comment: '', date_created: '', created_by: ''
      },
      config: {
        url: `/api/v1/xpack/cloud/accounts`,
        activeMenu: 'AccountDetail',
        submenu: [
          {
            title: this.$t('Detail'),
            name: 'AccountDetail'
          }
        ],
        actions: {
          deleteSuccessRoute: 'CloudCenter',
          updateCallback: () => {
            const id = this.$route.params.id
            const routeName = 'AccountUpdate'
            this.$router.push({
              name: routeName,
              params: { id: id },
              query: { provider: vm.Account.provider.value }
            })
          }
        }
      }
    }
  }
}
</script>

<style lang='scss' scoped>

</style>

