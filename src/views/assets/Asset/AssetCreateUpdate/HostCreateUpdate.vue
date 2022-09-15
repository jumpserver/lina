<template>
  <BaseCreateUpdate v-bind="$data" />
</template>

<script>
import BaseCreateUpdate from './components/BaseCreateUpdate'

export default {
  name: 'HostCreateUpdate',
  components: { BaseCreateUpdate },
  data() {
    return {
      url: '/api/v1/assets/hosts/'
    }
  }
}
</script>

<style>
</style>
