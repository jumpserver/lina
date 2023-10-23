<template>
  <BaseAssetCreateUpdate v-bind="Object.assign($data, $attrs)" v-on="$listeners" />
</template>

<script>
import BaseAssetCreateUpdate from './BaseAssetCreateDrawer.vue'

export default {
  name: 'DeviceCreateUpdate',
  components: { BaseAssetCreateUpdate },
  data() {
    return {
      url: '/api/v1/assets/devices/'
    }
  }
}
</script>

<style>
</style>
