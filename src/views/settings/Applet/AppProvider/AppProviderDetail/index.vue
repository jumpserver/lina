<template>
  <GenericDetailPage v-bind="config" v-model:active-menu="config.activeMenu" v-model:object="host">
    <keep-alive>
      <component :is="config.activeMenu" :object="host" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import Apps from './Apps.vue'
import Accounts from './Accounts.vue'
import Containers from './Containers'
import Detail from './Detail'
import Deployments from './Deployments'

export default {
  name: 'AppProviderDetail',
  components: {
    GenericDetailPage,
    Detail,
    Apps,
    Accounts,
    TabPage,
    Containers,
    Deployments
  },
  props: {
    initialActiveMenu: {
      type: String,
      default: 'Detail'
    }
  },
  data() {
    return {
      host: {},
      config: {
        url: '/api/v1/terminal/app-providers',
        activeMenu: this.initialActiveMenu,
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'Detail'
          },
          {
            title: this.$t('Accounts'),
            name: 'Accounts',
            hidden: () => !this.$hasPerm('accounts.view_account')
          },
          {
            title: this.$t('VirtualApps'),
            name: 'Apps'
          },
          {
            title: this.$t('Containers'),
            name: 'Containers'
          },
          {
            title: this.$t('HostDeployment'),
            name: 'Deployments'
          }
        ],
        hasRightSide: true,
        actions: {
          hasDelete: true,
          hasUpdate: true,
          canDelete: this.$hasPerm('terminal.delete_appprovider'),
          canUpdate: this.$hasPerm('terminal.change_appprovider'),
          updateRoute: 'AppProviderUpdate',
          deleteSuccessRoute: 'Applets'
          // updateCallback: () => {
          //   this.$router.push({
          //     name: 'VirtualHostUpdate',
          //     params: { id: this.$route.params.id }
          //   })
          // }
        }
      }
    }
  },
  mounted() {}
}
</script>

<style scoped></style>
