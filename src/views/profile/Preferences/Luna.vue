<template>
  <Base v-bind="$data" />
</template>

<script>

import Base from './Base'

export default {
  name: 'Luna',
  components: {
    Base
  },
  data() {
    return {
      category: 'luna'
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
