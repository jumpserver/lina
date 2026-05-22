<template>
  <CertPanel mode="user" :object="object" />
</template>

<script>
import CertPanel from '@/components/Apps/CertPanel'

export default {
  name: 'Cert',
  components: { CertPanel },
  props: {
    object: {
      type: Object,
      default: null
    }
  }
}
</script>
