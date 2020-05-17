<template>
  <GenericDetailPage :object.sync="DatabaseAppPermission" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners" @tab-click="TabClick">
    <keep-alive>
      <component :is="config.activeMenu" :object="DatabaseAppPermission" />
    </keep-alive>
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
            title: this.$t('perms.databaseAppPermissionDetail'),
            name: 'DatabaseAppPermissionDetail'
          },
          {
            title: this.$t('perms.usersAndUserGroups'),
            name: 'DatabaseAppPermissionUser'
          },
          {
            title: this.$t('perms.databaseApp'),
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
