<template>
  <BaseAssetCreateUpdate v-bind="$data" />
</template>

<script>
import BaseAssetCreateUpdate from './BaseAssetCreateUpdate'

export default {
  name: 'WebCreateUpdate',
  components: { BaseAssetCreateUpdate },
  data() {
    return {
      url: '/api/v1/assets/webs/',
      addFields: [
        [this.$t('common.Selector'), [
          'autofill', 'username_selector',
          'password_selector', 'submit_selector',
          'script'
        ], 1]
      ],
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
        },
        username_selector: {
          hidden: (formValue) => formValue['autofill'] !== 'basic'
        },
        password_selector: {
          hidden: (formValue) => formValue['autofill'] !== 'basic'
        },
        submit_selector: {
          hidden: (formValue) => formValue['autofill'] !== 'basic'
        },
        script: {
          hidden: (formValue) => formValue['autofill'] !== 'script'
        }
      }
    }
  }
}
</script>

<style>
</style>
