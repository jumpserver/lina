<template>
  <div id="app">
    <router-view v-if="isRouterAlive" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { useCommonColor } from '@/styles/commonColor'

export default {
  name: 'App',
  computed: {
    ...mapState({
      isRouterAlive: state => state.common.isRouterAlive
    })
  },
  beforeMount() {
    useCommonColor()
  }
}
</script>

<style>
</style>
