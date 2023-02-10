<template>
  <BaseAssetCreateUpdate v-bind="$data" />
</template>

<script>
import BaseAssetCreateUpdate from './BaseAssetCreateUpdate'

export default {
  name: 'CloudCreateUpdate',
  components: { BaseAssetCreateUpdate },
  data() {
    return {
      url: '/api/v1/assets/clouds/',
      addFieldsMeta: {
        protocols: {
          hidden: (formValue) => {
            const address = formValue['address']
            if (!address) return
            let port = address.startsWith('https://') ? 443 : 80
            try {
              const url = new URL(address)
              if (url.port) { port = url.port }
            } catch (e) {
              // pass
            }
            const protocols = formValue['protocols']?.[0] || {}
            protocols.port = port
          }
        }
      }
    }
  }
}
</script>

<style>
</style>
