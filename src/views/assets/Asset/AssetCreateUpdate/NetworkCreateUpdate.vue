<template>
  <BaseCreateUpdate v-bind="$data" />
</template>

<script>
import BaseCreateUpdate from './components/BaseCreateUpdate'

export default {
  name: 'NetworkingCreateUpdate',
  components: { BaseCreateUpdate },
  data() {
    return {
      url: '/api/v1/assets//assets/networks/'
    }
  }
}
</script>

<style>
</style>
