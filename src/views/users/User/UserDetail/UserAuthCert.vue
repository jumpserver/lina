<template>
  <CertPanel mode="admin" :object="object" />
</template>

<script>
import CertPanel from '@/components/Apps/CertPanel'

export default {
  name: 'UserAuthCert',
  components: { CertPanel },
  props: {
    object: {
      type: Object,
      required: true
    }
  }
}
</script>
