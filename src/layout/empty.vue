<template>
  <div>
    <CachedRouterView />
  </div>
</template>

<script>
import CachedRouterView from '@/layout/components/CachedRouterView.vue'

export default {
  name: 'EmptyLayout',
  routeViewShell: true,
  components: {
    CachedRouterView
  }
}
</script>

<style lang="scss" scoped></style>
