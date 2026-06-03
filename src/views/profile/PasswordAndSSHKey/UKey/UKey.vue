<template>
  <UKeyPanel mode="user" :object="object" />
</template>

<script>
import UKeyPanel from '@/components/Apps/UKeyPanel'

export default {
  name: 'UKey',
  components: { UKeyPanel },
  props: {
    object: {
      type: Object,
      default: null
    }
  }
}
</script>
