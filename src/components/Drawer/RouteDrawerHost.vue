<template>
  <Drawer
    v-if="drawerComponent"
    v-model:visible="drawerVisible"
    :component="drawerComponent"
    :component-key="drawerGeneration"
    :component-props="mergedDrawerProps"
    :component-listeners="drawerListeners"
    :tab-navigation="tabNavigation"
    :title="drawerTitle"
    :action="action"
    :class="[action]"
    class="page-drawer"
  />
  <Drawer
    v-else-if="invalidLink"
    :visible="true"
    :title="$t('Detail')"
    @update:visible="closeInvalidLink"
  >
    <el-result icon="warning" :title="$t('NoPermissionVew')" />
  </Drawer>
</template>

<script>
import Drawer from './index.vue'
import drawerPageMixin from './pageMixin'
import { closeDetailDrawer, drawerRouteKey, readDrawerRoute } from './route'
import { TAB_NAVIGATION_SCOPE } from './context'
import { eventBus } from '@/utils/vue/eventbus'

export default {
  name: 'RouteDrawerHost',
  components: { Drawer },
  mixins: [drawerPageMixin],
  data() {
    return { routeManaged: true, openedRouteKey: '', invalidLink: false }
  },
  computed: {
    routeKey() {
      return drawerRouteKey(this.$route)
    },
    tabNavigation() {
      if (this.action !== 'detail') return { scope: TAB_NAVIGATION_SCOPE.LOCAL }
      const key = this.openedRouteKey
      return {
        scope: TAB_NAVIGATION_SCOPE.DRAWER,
        setTab: (tab) => {
          if (
            !this.drawerVisible ||
            this.action !== 'detail' ||
            this.routeKey !== key ||
            this.$route.query.drawerTab === tab
          ) {
            return
          }
          this.$router.replace({
            path: this.$route.path,
            hash: this.$route.hash,
            query: { ...this.$route.query, drawerTab: tab }
          })
        }
      }
    }
  },
  watch: {
    routeKey() {
      this.syncRoute()
    }
  },
  created() {
    this.syncRoute()
  },
  methods: {
    syncRoute() {
      const descriptor = readDrawerRoute(this.$router, this.$route)
      this.invalidLink = !!descriptor?.invalid
      if (!descriptor || descriptor.invalid) {
        this.openedRouteKey = ''
        this.drawerVisible = false
        this.clearDrawerRuntime()
        return
      }
      const { location, component } = descriptor
      this.restoreLegacyRouteState()
      this.openedRouteKey = this.routeKey
      const key = this.openedRouteKey
      this.setDrawerRuntime(
        { action: 'detail', id: location.params.id },
        {
          route: location,
          query: location.query,
          params: location.params,
          handlers: {
            close: this.handleDrawerRequestClose,
            update: this.handleDrawerRequestUpdate,
            reload: this.reloadTable,
            loaded: (object) => {
              if (this.openedRouteKey !== key || this.action !== 'detail') return
              this.drawerTitle = `${this.$t(location.meta.title || 'Detail')}: ${object.name || object.display_name || object.username || object.id || location.params.id}`
            }
          }
        }
      )
      this.showDrawer('detail', {
        row: { id: location.params.id },
        cellValue: location.params.id,
        payload: { component, detailRoute: location }
      })
    },
    onDrawerClosed() {
      if (this.openedRouteKey && this.openedRouteKey === this.routeKey) {
        this.openedRouteKey = ''
        closeDetailDrawer(this.$router)
      }
    },
    closeInvalidLink(visible) {
      if (!visible) closeDetailDrawer(this.$router)
    },
    getDefaultDrawer(action) {
      const name = String(this.$route.query.drawer || '').replace(
        /Detail$/,
        action === 'update' ? 'Update' : 'Detail'
      )
      return this.getRouteNameComponent(name, action)
    },
    handleDetailDeleteSuccess() {
      this.reloadTable()
    },
    handleDrawerSubmitSuccess() {
      this.reloadTable()
    },
    reloadTable() {
      eventBus.emit('drawer-resource-change', { path: this.$route.path })
    }
  }
}
</script>
