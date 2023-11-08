<template>
  <BaseAssetCreateUpdate v-bind="Object.assign($data, $attrs)" v-on="$listeners" />
</template>

<script>
import BaseAssetCreateUpdate from './BaseAssetCreateDrawer.vue'

export default {
  name: 'HostCreateUpdate',
  components: { BaseAssetCreateUpdate },
  data() {
    return {
      url: '/api/v1/assets/hosts/'
    }
  }
}
</script>

<style>
</style>
