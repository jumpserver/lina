<template>
  <Page v-if="isPage" v-bind="$attrs">
    <CommandList v-bind="$attrs" />
  </Page>
  <div v-else>
    <CommandList v-bind="$attrs" />
  </div>
</template>

<script>
import { Page } from '@/layout/components'
import CommandList from './BaseList.vue'

export default {
  name: 'BaseList',
  components: {
    Page,
    CommandList
  },
  props: {
    isPage: {
      type: Boolean,
      default: () => true
    }
  }
}
</script>
