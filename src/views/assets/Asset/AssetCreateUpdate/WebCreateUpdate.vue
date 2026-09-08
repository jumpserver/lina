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
        [this.$t('Basic'), ['allowed_urls']],
        [
          this.$t('Selector'),
          [
            'autofill',
            'username_selector',
            'password_selector',
            'submit_selector',
            'success_selector',
            'interactive_selector',
            'script'
          ],
          1
        ]
      ],
      addFieldsMeta: {
        allowed_urls: {
          label: this.$t('WebAllowedSites'),
          helpText: this.$t('WebAllowedSitesHelp'),
          required: false,
          default: []
        },
        protocols: {
          hidden: (formValue) => {
            const address = formValue['address']
            if (!address) return
            let port = address.startsWith('https://') ? 443 : 80
            try {
              const url = new URL(address)
              if (url.port) {
                port = url.port
              }
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
        interactive_selector: {
          required: false,
          rules: [],
          hidden: (formValue) => formValue['autofill'] !== 'basic'
        },
        success_selector: {
          required: false,
          rules: [],
          hidden: (formValue) => formValue['autofill'] !== 'basic'
        },
        script: {
          helpText: this.$t('WebScriptStepsHelp'),
          hidden: (formValue) => formValue['autofill'] !== 'script'
        }
      }
    }
  }
}
</script>

<style></style>
