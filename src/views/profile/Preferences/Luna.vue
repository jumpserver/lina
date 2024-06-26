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
      category: 'luna',
      // todo: remove this when we have a better solution
      fieldsExclude: ['command_line.terminal_theme_name']
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
