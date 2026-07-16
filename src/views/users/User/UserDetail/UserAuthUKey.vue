<template>
  <UKeyPanel mode="admin" :object="object" />
</template>

<script>
import UKeyPanel from '@/components/Apps/UKeyPanel'

export default {
  name: 'UserAuthUKey',
  components: { UKeyPanel },
  props: {
    object: {
      type: Object,
      required: true
    }
  }
}
</script>
