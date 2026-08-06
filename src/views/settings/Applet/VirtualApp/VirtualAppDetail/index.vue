<template>
  <GenericDetailPage
    v-bind="config"
    v-model:active-menu="config.activeMenu"
    v-model:object="applet"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="applet" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import Detail from './Detail'
import Publications from './Publications'

export default {
  name: 'VirtualAppDetail',
  components: {
    GenericDetailPage,
    TabPage,
    Detail,
    Publications
  },
  data() {
    return {
      applet: {},
      config: {
        url: '/api/v1/terminal/virtual-apps',
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'Detail'
          },
          {
            title: this.$t('AppProvider'),
            name: 'Publications'
          }
        ],
        hasRightSide: true,
        actions: {
          hasUpdate: true,
          canUpdate: () => this.$hasPerm('terminal.change_virtualapp'),
          canDelete: () => {
            return this.$hasPerm('terminal.delete_virtualapp')
          },
          updateRoute: 'VirtualAppUpdate',
          deleteSuccessRoute: 'Applets'
        },
        titlePrefix: this.$tc('VirtualAppDetail')
      }
    }
  },
  mounted() {}
}
</script>

<style scoped></style>
