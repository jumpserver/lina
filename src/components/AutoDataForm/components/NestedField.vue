<template>
  <DataForm
    :fields="fields"
    :form="value"
    style="margin-left: -26%;margin-right: -6%"
    v-bind="kwargs"
    v-on="$listeners"
  />
</template>

<script>
import { DataForm } from '@/components'

export default {
  name: 'NestedField',
  components: {
    DataForm
  },
  props: {
    fields: {
      type: Array,
      default: () => []
    },
    value: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      kwargs: {
        hasReset: false,
        hasSaveContinue: false,
        defaultButton: false
      }
    }
  }
}
</script>

<style scoped>

</style>
