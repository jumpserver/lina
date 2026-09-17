<template>
  <div class="route-view-shell">
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

<style lang="scss" scoped>
.route-view-shell {
  height: 100%;
  min-height: 0;
  min-width: 0;
  width: 100%;

  // 业务视图常用一个无 class 根节点包住 Page 和 teleport 弹窗。
  // 这层也要传递高度，才能让 Page 精确填满右侧主区。
  > :deep(*) {
    height: 100%;
    min-height: 0;
    min-width: 0;
  }
}
</style>
