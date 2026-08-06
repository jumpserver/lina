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
    getRouteCacheKey,
    isRouteShellComponent
  }
}
</script>
