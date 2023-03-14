<template>
  <div id="app">
    <router-view v-if="isRouterAlive" />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'App',
  computed: {
    ...mapState({
      isRouterAlive: state => state.common.isRouterAlive
    })
  }
}
</script>

<style>
</style>
