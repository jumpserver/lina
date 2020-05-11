<template>
  <GenericDetailPage :object.sync="DatabaseAppPermission" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners" @tab-click="TabClick">
    <component :is="config.activeMenu" :object="DatabaseAppPermission" />
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import DatabaseAppPermissionDetail from './DatabaseAppPermissionDetail'
import DatabaseAppPermissionUser from './DatabaseAppPermissionUser'
import DatabaseAppPermissionDatabaseApp from './DatabaseAppPermissionDatabaseApp'

export default {
  components: {
    DatabaseAppPermissionDatabaseApp,
    DatabaseAppPermissionDetail,
    DatabaseAppPermissionUser,
    GenericDetailPage,
    TabPage
  },
  data() {
    return {
      DatabaseAppPermission: {},
      config: {
        activeMenu: 'DatabaseAppPermissionDetail',
        submenu: [
          {
            title: this.$t('perms.DatabaseAppPermissionDetail'),
            name: 'DatabaseAppPermissionDetail'
          },
          {
            title: this.$t('perms.UsersAndUserGroups'),
            name: 'DatabaseAppPermissionUser'
          },
          {
            title: this.$t('perms.DatabaseApp'),
            name: 'DatabaseAppPermissionDatabaseApp'
          }
        ]
      }
    }
  },
  methods: {
    TabClick(tab) {
      if (tab.name !== 'DatabaseAppPermissionDetail') {
        this.$set(this.config, 'hasRightSide', false)
      } else {
        this.$set(this.config, 'hasRightSide', true)
      }
    }
  }
}
</script>

<style scoped>

</style>
