<template>
  <Base v-bind="$data" />
</template>

<script>

import Base from './Base'

export default {
  name: 'KoKo',
  components: {
    Base
  },
  data() {
    return {
      category: 'koko',
      // todo: remove this when we have a better solution
      fieldsExclude: ['basic.terminal_theme_name']
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
