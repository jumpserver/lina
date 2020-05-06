<template>
  <IBox fa="fa-edit" :title="title" v-bind="$attrs" />
</template>

<script>
import { IBox } from '@/components'

export default {
  name: 'QuickActions',
  components: {
    IBox
  },
  props: {
    title: {
      type: String,
      default() {
        return this.$tc('Quick update')
      }
    }
  }
}
</script>

<style scoped>

</style>
