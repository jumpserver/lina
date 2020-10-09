<template>
  <GenericDetailPage :object.sync="Account" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
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
    return {
      Account: {
        name: '', provider_display: '', validity_display: '', comment: '', date_created: '', created_by: '' },
      config: {
        activeMenu: 'AccountDetail',
        submenu: [
          {
            title: this.$t('xpack.Cloud.AccountDetail'),
            name: 'AccountDetail'
          }
        ],
        actions: {
          deleteSuccessRoute: 'CloudCenter'
        }
      }
    }
  }
}
</script>

<style lang='scss' scoped>

</style>

