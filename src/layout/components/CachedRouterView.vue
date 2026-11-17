<template>
  <router-view v-slot="{ Component }">
    <!--
      A route shell owns another router-view and must not be kept alive. An
      inactive shell still reacts to route changes, so caching even one shell
      can make both the active and inactive router-views mount the same page.
    -->
    <component :is="Component" v-if="isRouteShellComponent(Component)" />
    <keep-alive :max="max">
      <component
        :is="Component"
        v-if="!isRouteShellComponent(Component)"
        :key="getRouteCacheKey($route)"
      />
    </keep-alive>
  </router-view>
</template>

<script>
import { getRouteCacheKey, isRouteShellComponent } from '@/utils/vue/routeView'

export default {
  name: 'CachedRouterView',
  props: {
    max: {
      type: Number,
      default: 10
    }
  },
  methods: {
    getRouteCacheKey(route) {
      const currentOrg = this.$store.getters.currentOrg
      // Some pages temporarily switch to the global org themselves. Keep the
      // same page instance during that switch, while still separating caches
      // when the user selects a different organization.
      const org =
        route.meta?.cacheByPreviousOrgOnAutoEnter && currentOrg?.autoEnter
          ? this.$store.state.users.preOrg || currentOrg
          : currentOrg
      return getRouteCacheKey(route, org?.id)
    },
    isRouteShellComponent
  }
}
</script>
