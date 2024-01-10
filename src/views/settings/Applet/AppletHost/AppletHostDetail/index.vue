<template>
  <GenericDetailPage
    :active-menu.sync="config.activeMenu"
    :object.sync="host"
    v-bind="config"
    v-on="$listeners"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="host" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import Detail from './Detail'
import Applets from './Applets'
import Accounts from './Accounts'
import Developments from './Devployments'

export default {
  name: 'AssetHostDetail',
  components: {
    GenericDetailPage,
    Applets,
    TabPage,
    Detail,
    Accounts,
    Developments
  },
  data() {
    return {
      host: {},
      config: {
        // 发布机也是资产，通过资产的api获取，可以与资产详情显示保持一致
        url: '/api/v1/assets/assets',
        activeMenu: 'Detail',
        submenu: [
          {
            'title': this.$t('Detail'),
            'name': 'Detail'
          },
          {
            title: this.$t('Accounts'),
            name: 'Accounts'
          },
          {
            'title': this.$t('Applets'),
            'name': 'Applets'
          },
          {
            'title': this.$t('HostDeployment'),
            'name': 'Developments'
          }
        ],
        hasRightSide: true,
        actions: {
          canDelete: this.$hasPerm('terminal.delete_applethost'),
          canUpdate: this.$hasPerm('terminal.change_applethost'),
          deleteSuccessRoute: 'Applets',
          updateCallback: () => {
            this.$router.push({
              name: 'AppletHostUpdate',
              params: { id: this.$route.params.id },
              query: { platform: this.host.platform.id }
            })
          }
        }
      }
    }
  },
  mounted() {
  }
}
</script>

<style scoped>

</style>
